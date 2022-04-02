import {
  MessageRequest,
  MessageMethod,
  MessageResponse,
  MessageRequestPayload,
  SenderType,
  MessageResponseData,
} from "../message";

export function sendAction(
  method: MessageMethod,
  senderType: SenderType,
  payload?: MessageRequestPayload
) {
  console.log("sendMessage ======", method, senderType, payload);

  return new Promise<MessageResponseData>((resolve, reject) => {
    chrome.runtime.sendMessage<MessageRequest, MessageResponse>(
      {
        method: method,
        senderType,
        payload,
      },
      (response) => {
        const { data, error } = response ?? {};
        console.log("response ======", data, chrome.runtime.lastError);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (error) {
          reject(error.message);
        } else {
          resolve(data ?? {});
        }
      }
    );
  });
}

export function sendActionToTab(
  tabId: number,
  method: MessageMethod,
  senderType: SenderType,
  payload?: MessageRequestPayload
) {
  console.log("chrome.tabs sendMessage ======", method, senderType, payload);

  return new Promise<MessageResponseData>((resolve, reject) => {
    chrome.tabs.sendMessage<MessageRequest, MessageResponse>(
      tabId,
      {
        method: method,
        senderType,
        payload,
      },
      (response) => {
        const { data, error } = response ?? {};
        console.log("chrome.tabs response ======", data, chrome.runtime.lastError);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (error) {
          reject(error.message);
        } else {
          resolve(data ?? {});
        }
      }
    );
  });
}
