import type { ToBackgroundMessage, ToContentMessage, ResponseMap, MessageResponse } from '../types';

/**
 * Background にメッセージを送信する型安全な関数
 */
export const sendToBackground = <T extends ToBackgroundMessage>(
  message: T,
): Promise<T['type'] extends keyof ResponseMap ? ResponseMap[T['type']] : unknown> =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse<T['type']>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response?.data as T['type'] extends keyof ResponseMap ? ResponseMap[T['type']] : unknown);
      }
    });
  });

/**
 * Content Script にメッセージを送信する関数
 */
export const sendToTab = (tabId: number, message: ToContentMessage): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
