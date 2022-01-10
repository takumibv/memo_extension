import ja from "../public/_locales/ja/messages.json";
import en from "../public/_locales/en/messages.json";

const i18n: { [key: string]: typeof ja } = {
  ja,
  en,
};

/**
 * 翻訳されたメッセージを取得する\n
 * ServiceWorker上で「Uncaught TypeError: chrome.i18n.getMessage is not a function」というエラーが出るため、
 * @param key
 * @returns
 */
export const msg = (key: string, isBackground?: boolean): string => {
  if (isBackground || process.env.NODE_ENV !== "production") {
    // default: English
    const lang = navigator.language.slice(0, 2);
    return (i18n[lang] ? i18n[lang][key]?.message : en[key]?.message) ?? "";
  } else {
    return chrome.i18n.getMessage(key);
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

/**
 * chromeのシステム画面かどうかを判定する
 * @param link
 * @returns boolean
 */
export function isSystemLink(link: string): boolean {
  return (
    link.startsWith("chrome://") ||
    link.startsWith("chrome-extension://") ||
    link.startsWith("chrome-search://")
  );
}
