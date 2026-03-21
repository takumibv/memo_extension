import ContentApp from '@/content/App';
import contentStyles from '@/content/content.css?inline';
import { isToContentMessage } from '@/message/types';
import { createRoot } from 'react-dom/client';
import type { ToContentMessage } from '@/message/types';

const ROOT_DOM_ID = 'react-container-for-note-extension';

// Queue messages received before React mounts
const pendingMessages: ToContentMessage[] = [];
let onMessageCallback: ((msg: ToContentMessage) => void) | null = null;

const handleMessages = (
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean => {
  if (!isToContentMessage(message)) return false;

  const msg = message as ToContentMessage;
  if (onMessageCallback) {
    // React is mounted, dispatch directly
    onMessageCallback(msg);
  } else {
    // React not yet mounted, queue
    pendingMessages.push(msg);
  }
  sendResponse();
  return true;
};

/**
 * Called by ContentApp on mount to register its handler
 * and replay any queued messages.
 */
export const registerContentHandler = (handler: (msg: ToContentMessage) => void) => {
  onMessageCallback = handler;
  // Replay queued messages
  while (pendingMessages.length > 0) {
    const msg = pendingMessages.shift();
    if (msg) handler(msg);
  }
};

export const unregisterContentHandler = () => {
  onMessageCallback = null;
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

    // Prevent keyboard events from leaking to host page
    // Fixes: YouTube space=pause, f=fullscreen, Notion backspace, etc.
    const stopKeyboardPropagation = (e: Event) => {
      e.stopPropagation();
    };
    shadowWrapper.addEventListener('keydown', stopKeyboardPropagation);
    shadowWrapper.addEventListener('keyup', stopKeyboardPropagation);
    shadowWrapper.addEventListener('keypress', stopKeyboardPropagation);

    // 3. Render React
    const root = createRoot(shadowWrapper);
    root.render(<ContentApp />);

    // 4. Notify background AFTER listener is registered
    chrome.runtime.sendMessage({ type: 'content:ready' }).catch(() => {});
  },
});
