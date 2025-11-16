import { baseCSS, defaultFontFamilyCSS } from '@extension/shared/lib/utils/resetCSS.js';
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    ${defaultFontFamilyCSS}
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SContainer = (styled as any).div`
  ${baseCSS('div')}
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STitle = (styled as any).h1`
  ${baseCSS('h1')}
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SSettingSection = (styled as any).div`
  ${baseCSS('div')}
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SSettingTitle = (styled as any).h2`
  ${baseCSS('h2')}
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SSettingDescription = (styled as any).p`
  ${baseCSS('p')}
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;
