import equal from 'fast-deep-equal';

/**
 * 翻訳されたメッセージを取得する
 * chrome.i18n.getMessage API を使用
 * @param key
 * @returns
 */
export const msg = (key: string): string => {
  // Always use chrome.i18n.getMessage API
  // This avoids the need to import JSON files with complex relative paths
  try {
    return chrome.i18n.getMessage(key) || '';
  } catch (e) {
    console.warn(`Failed to get i18n message for key: ${key}`, e);
    return '';
  }
};

export const encodeFormURL = (url: string): string => encodeURIComponent(formURL(url));

export const decodeURL = (encodedUrl: string): string => decodeURIComponent(encodedUrl);

export const formURL = (url: string): string => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search || ''}`;
};

export const formatDate = (date: Date): string => {
  if (isNaN(date.getTime())) return '';

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${('0' + date.getHours()).slice(
    -2,
  )}:${('0' + date.getMinutes()).slice(-2)}`;
};

/**
 * chromeのシステム画面かどうかを判定する
 * @param link
 * @returns boolean
 */
export const isSystemLink = (link: string): boolean =>
  link.startsWith('chrome://') || link.startsWith('chrome-extension://') || link.startsWith('chrome-search://');

/**
 * Objectの比較. 1階層のみ
 * @returns
 */
export const isEqualsObject = (a: object, b: object): boolean => {
  if (a === b) {
    return true;
  }

  return equal(a, b);
};
