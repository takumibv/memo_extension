import styled, { createGlobalStyle } from "styled-components";
import { baseCSS, defaultFontFamilyCSS } from "../../resetCSS";

export const GlobalStyle = createGlobalStyle`
  #react-container-for-note-extension {
    font-size: 16px !important;
    line-height: 1.25 !important;

    ${defaultFontFamilyCSS}
  }
`;

export const SContainer = styled.div`
  ${baseCSS("div")}

  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1250;
`;

export const SButton = styled.button`
  ${baseCSS("button")}

  border-width: 0;
  border-style: solid;
  border-color: currentColor;
  -webkit-appearance: button;
  background-color: #e27900;
  background-image: none;
  line-height: inherit;
  color: #fff;
  margin: 8px;
  padding: 4px 8px;
  border-radius: 99px;
  pointer-events: initial;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;
