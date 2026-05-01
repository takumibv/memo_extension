import { CHROME_WEB_STORE_EXTENSION_ID } from '@/shared/constants/links';

export const getChromeWebStoreReviewUrl = (): string =>
  `https://chrome.google.com/webstore/detail/${CHROME_WEB_STORE_EXTENSION_ID}`;
