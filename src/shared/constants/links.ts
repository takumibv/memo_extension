export const CHROME_WEB_STORE_EXTENSION_ID = 'fjfoncfdjhdefjhknbaphionnognbnpl';

export const EXTERNAL_LINKS = {
  buyMeACoffee: 'https://buymeacoffee.com/takumibv',
  twitter: 'https://x.com/takumi_bv',
  chromeWebStoreReview: `https://chrome.google.com/webstore/detail/${CHROME_WEB_STORE_EXTENSION_ID}`,
  // TODO: server/README.md の手順でStripe Payment Linkを作成したら実URLに置き換える
  purchaseLicense: 'https://buy.stripe.com/REPLACE_WITH_PAYMENT_LINK',
} as const;

export const openExternalLink = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
