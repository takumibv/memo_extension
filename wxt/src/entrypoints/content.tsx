import ContentApp from '@/content/App';
import contentStyles from '@/content/content.css?inline';
import { isToContentMessage } from '@/message/types';
import { createRoot } from 'react-dom/client';
import type { ToContentMessage } from '@/message/types';
import type { Note } from '@/shared/types/Note';

const ROOT_DOM_ID = 'react-container-for-note-extension';

// Content script state (shared between React and message handler)
type ContentState = {
  setNotes: ((notes: Note[]) => void) | null;
  setDefaultColor: ((color: string) => void) | null;
};

const state: ContentState = {
  setNotes: null,
  setDefaultColor: null,
};

// Message listener registered BEFORE React renders
const handleMessages = (
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean => {
  if (!isToContentMessage(message)) return false;

  const msg = message as ToContentMessage;
  switch (msg.type) {
    case 'bg:setupPage':
      if (msg.payload.notes) state.setNotes?.(msg.payload.notes);
      if (msg.payload.defaultColor) state.setDefaultColor?.(msg.payload.defaultColor);
      break;
    case 'bg:setVisibility':
      // TODO: handle visibility toggle
      break;
  }
  sendResponse();
  return true;
};

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  cssInjectionMode: 'manual',
  registration: 'runtime',

  main() {
    if (window.top !== window) return;

    // 1. Register message listener FIRST
    chrome.runtime.onMessage.addListener(handleMessages);

    // 2. Create Shadow DOM
    const rootElement = document.createElement('div');
    rootElement.id = ROOT_DOM_ID;
    document.body.appendChild(rootElement);
    const shadowRoot = rootElement.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = contentStyles;
    shadowRoot.appendChild(style);

    const shadowWrapper = document.createElement('div');
    shadowRoot.appendChild(shadowWrapper);

    // 3. Render React (passes state binding to ContentApp)
    const root = createRoot(shadowWrapper);
    root.render(<ContentApp stateRef={state} />);

    // 4. Notify background AFTER listener is registered
    chrome.runtime.sendMessage({ type: 'content:ready' }).catch(() => {});
  },
});
