import { baseCSS, defaultFontFamilyCSS } from '@extension/shared/lib/utils/resetCSS.js';
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    ${defaultFontFamilyCSS}
  }
`;

export const SContainer = styled.div`
  ${baseCSS('div')}
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

export const STitle = styled.h1`
  ${baseCSS('h1')}
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
`;

export const SSettingSection = styled.div`
  ${baseCSS('div')}
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
`;

export const SSettingTitle = styled.h2`
  ${baseCSS('h2')}
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
`;

export const SSettingDescription = styled.p`
  ${baseCSS('p')}
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;
