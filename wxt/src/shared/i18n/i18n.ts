export const t = (key: string, substitutions?: string | string[]): string =>
  chrome.i18n.getMessage(key, substitutions) || key;
