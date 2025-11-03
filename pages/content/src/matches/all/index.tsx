import App from '../../App.js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';

const ROOT_DOM_ID = 'react-container-for-note-extension';

/** ----------------------------------------
 * Initial Setup
 * ----------------------------------------- */
const initialize = () => {
  // DOMを挿入
  injectDomElements();
};

/** ----------------------------------------
 * DOMを挿入
 * ページ上にメモを配置する
 * ----------------------------------------- */
const injectDomElements = () => {
  const currentRoot = document.getElementById(ROOT_DOM_ID);
  if (currentRoot) currentRoot.remove();

  const rootElement = document.createElement('div');
  rootElement.id = ROOT_DOM_ID;
  document.body.appendChild(rootElement);
  const shadowRoot = rootElement.attachShadow({ mode: 'open' });
  const shadowWrapper = document.createElement('div');
  shadowRoot.append(shadowWrapper);

  const theme = createTheme({
    components: {
      MuiPopover: {
        defaultProps: {
          container: shadowWrapper,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: shadowWrapper,
        },
      },
      MuiModal: {
        defaultProps: {
          container: shadowWrapper,
        },
      },
    },
  });

  const root = createRoot(shadowWrapper);
  root.render(
    <StyleSheetManager target={shadowRoot as unknown as HTMLElement}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyleSheetManager>,
  );
};

(function () {
  if (window.top === window) {
    const setLoaded = () => initialize();

    // Check page has loaded and if not add listener for it
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setLoaded);
    } else {
      setLoaded();
    }
  }
})();
