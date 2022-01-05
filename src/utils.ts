export const encodeFormURL = (url: string): string => {
  return encodeURIComponent(formURL(url));
};

export const formURL = (url: string): string => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${
    parsedUrl.search || ""
  }`;
};
