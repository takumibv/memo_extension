import React from "react";
import ReactDOM from "react-dom";
import Main from "./contentScript/Main";

export const ROOT_DOM_ID = "react-container-for-note-extension";

/** ----------------------------------------
 * Initial Setup
 * ----------------------------------------- */
const initialize = () => {
  console.log("=== initialize ===");

  // DOMを挿入
  injectDomElements();
};

/** ----------------------------------------
 * DOMを挿入
 * ページ上にメモを配置する
 * ----------------------------------------- */
const injectDomElements = () => {
  const rootElement = document.createElement("div");
  rootElement.id = ROOT_DOM_ID;
  document.body.appendChild(rootElement);
  ReactDOM.render(<Main />, rootElement);
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
