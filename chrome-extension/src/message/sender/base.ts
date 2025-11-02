import type {
  MessageRequest,
  MessageMethod,
  MessageResponse,
  MessageRequestPayload,
  SenderType,
  MessageResponseData,
} from '../message';

export const sendAction = (method: MessageMethod, senderType: SenderType, payload?: MessageRequestPayload) =>
  new Promise<MessageResponseData>((resolve, reject) => {
    chrome.runtime.sendMessage<MessageRequest, MessageResponse>(
      {
        method: method,
        senderType,
        payload,
      },
      response => {
        const { data, error } = response ?? {};
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (error) {
          reject(error.message);
        } else {
          resolve(data ?? {});
        }
      },
    );
  });

export const sendActionToTab = (
  tabId: number,
  method: MessageMethod,
  senderType: SenderType,
  payload?: MessageRequestPayload,
) =>
  new Promise<MessageResponseData>((resolve, reject) => {
    chrome.tabs.sendMessage<MessageRequest, MessageResponse>(
      tabId,
      {
        method: method,
        senderType,
        payload,
      },
      response => {
        const { data, error } = response ?? {};
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (error) {
          reject(error.message);
        } else {
          resolve(data ?? {});
        }
      },
    );
  });
