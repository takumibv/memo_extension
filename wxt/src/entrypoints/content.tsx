import ContentApp from '@/content/App';
import contentStyles from '@/content/content.css?inline';
import { createRoot } from 'react-dom/client';

const ROOT_DOM_ID = 'react-container-for-note-extension';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  cssInjectionMode: 'manual',

  main() {
    if (window.top !== window) return;

    const rootElement = document.createElement('div');
    rootElement.id = ROOT_DOM_ID;
    document.body.appendChild(rootElement);
    const shadowRoot = rootElement.attachShadow({ mode: 'open' });

    // Inject Tailwind CSS + reset styles into Shadow DOM
    const style = document.createElement('style');
    style.textContent = contentStyles;
    shadowRoot.appendChild(style);

    const shadowWrapper = document.createElement('div');
    shadowRoot.appendChild(shadowWrapper);

    const root = createRoot(shadowWrapper);
    root.render(<ContentApp />);

    // Notify background that content script is ready
    chrome.runtime.sendMessage({ type: 'content:ready' }).catch(() => {});
  },
});
