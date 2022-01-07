import _message from "../public/_locales/ja/messages.json";

/**
 * 翻訳されたメッセージを取得する
 * @param key
 * @returns
 */
export const msg = (key: string): string => {
  if (process.env.NODE_ENV === "production") {
    return chrome.i18n.getMessage(key);
  } else {
    return _message[key] ? _message[key].message : "";
  }
};

export const encodeFormURL = (url: string): string => {
  return encodeURIComponent(formURL(url));
};

export const formURL = (url: string): string => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${
    parsedUrl.search || ""
  }`;
};

export function isSystemLink(link: string) {
  return (
    link.startsWith("chrome://") ||
    link.startsWith("chrome-extension://") ||
    link.startsWith("chrome-search://")
  );
}
