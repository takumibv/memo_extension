export const CHROME_WEB_STORE_EXTENSION_ID = 'fjfoncfdjhdefjhknbaphionnognbnpl';

export const EXTERNAL_LINKS = {
  buyMeACoffee: 'https://buymeacoffee.com/takumibv',
  twitter: 'https://x.com/takumi_bv',
  chromeWebStoreReview: `https://chrome.google.com/webstore/detail/${CHROME_WEB_STORE_EXTENSION_ID}`,
  // TODO: takumibv/memo_extension_server (非公開) の README.md の手順で
  // Stripe Payment Linkを作成したら実URLに置き換える
  purchaseLicense: 'https://buy.stripe.com/REPLACE_WITH_PAYMENT_LINK',
} as const;

export const openExternalLink = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
