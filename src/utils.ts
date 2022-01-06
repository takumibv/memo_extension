import _message from "../public/_locales/ja/messages.json";

export const encodeFormURL = (url: string): string => {
  return encodeURIComponent(formURL(url));
};

export const formURL = (url: string): string => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${
    parsedUrl.search || ""
  }`;
};

export const msg = (key: string): string => {
  if (process.env.NODE_ENV === "production") {
    return chrome.i18n.getMessage(key);
  } else {
    return _message[key] ? _message[key].message : "";
  }
};
