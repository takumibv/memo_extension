import { baseCSS, defaultFontFamilyCSS } from '@extension/shared/lib/utils/resetCSS.js';
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  font-size: 16px !important;
  line-height: 1.25 !important;

  ${defaultFontFamilyCSS}
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SContainer = (styled as any).div`
  ${baseCSS('div')}

  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1250;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SButton = (styled as any).button`
  ${baseCSS('button')}

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
