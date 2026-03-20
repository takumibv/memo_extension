import equal from 'fast-deep-equal';

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

export const isSystemLink = (link: string): boolean =>
  link.startsWith('chrome://') || link.startsWith('chrome-extension://') || link.startsWith('chrome-search://');

export const isEqualsObject = (a: object, b: object): boolean => {
  if (a === b) {
    return true;
  }

  return equal(a, b);
};
