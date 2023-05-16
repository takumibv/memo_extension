import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { StyleSheetManager } from "styled-components";
import { ThemeProvider, createTheme } from "@mui/material";

export const ROOT_DOM_ID = "react-container-for-note-extension";

/** ----------------------------------------
 * Initial Setup
 * ----------------------------------------- */
export const initialize = () => {
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

  const rootElement = document.createElement("div");
  rootElement.id = ROOT_DOM_ID;
  document.body.appendChild(rootElement);
  const shadowRoot = rootElement.attachShadow({ mode: "open" });
  const shadowWrapper = document.createElement("div");
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

  ReactDOM.render(
    <StyleSheetManager target={shadowRoot}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyleSheetManager>,
    shadowWrapper
  );
};

(function () {
  if (window.top === window) {
    const setLoaded = () => initialize();

    // Check page has loaded and if not add listener for it
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setLoaded);
    } else {
      setLoaded();
    }
  }
})();
