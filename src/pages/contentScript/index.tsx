import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

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
  ReactDOM.render(<App />, rootElement);
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
