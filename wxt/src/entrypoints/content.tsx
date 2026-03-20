import ContentApp from '@/content/App';
import { createRoot } from 'react-dom/client';

const ROOT_DOM_ID = 'react-container-for-note-extension';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  cssInjectionMode: 'ui',

  main() {
    if (window.top !== window) return;

    const rootElement = document.createElement('div');
    rootElement.id = ROOT_DOM_ID;
    document.body.appendChild(rootElement);
    const shadowRoot = rootElement.attachShadow({ mode: 'open' });
    const shadowWrapper = document.createElement('div');
    shadowRoot.append(shadowWrapper);

    const root = createRoot(shadowWrapper);
    root.render(<ContentApp />);

    // Notify background that content script is ready
    chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' }).catch(() => {});
  },
});
