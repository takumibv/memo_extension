import styled, { createGlobalStyle } from "styled-components";
import { resetCSS } from "../../resetCSS";

export const GlobalStyle = createGlobalStyle`
  ${resetCSS}

  body {
    font-size: 16px;
  }

  /* TODO dark theme https://medium.com/bigpanda-engineering/dark-theme-with-styled-components-a573dd898e2a */
  @media (prefers-color-scheme: dark) {
    /* body {
      background-color: #000;
      color: #fff;
    } */
  }
`;

export const SContainer = styled.div`
  position: relative;
`;

export const SMain = styled.div`
  overflow: auto;
  background-color: #fafaf6;
  height: 100vh;
  height: 100dvh;
`;

export const SMainLeft = styled.div`
  position: fixed;
  left: 0;
  top: 2.75em;
  bottom: 0;
  overflow-y: auto;
  width: 18em;
  padding-left: 1em;
  z-index: 1;
`;

export const SMainRight = styled.main`
  position: relative;
  padding: 4em 2em 0 19em;
  height: 100%;
`;

export const SMainRightInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const SMainContent = styled.main`
  padding: 4em 2em 1.5em;
  margin: 0 auto;
  max-width: 44rem;
`;

export const SMainRightHeader = styled.div`
  display: flex;
  margin-bottom: 0.25em;
`;
