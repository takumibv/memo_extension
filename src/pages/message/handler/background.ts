import {
  CONTENT_SCRIPT,
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  GET_ALL_NOTES_AND_PAGE_INFO,
  OPEN_OPTION_PAGE,
  OPTIONS,
  POPUP,
  SCROLL_TO_TARGET_NOTE,
  UPDATE_NOTE,
  GET_NOTE_VISIBLE,
  UPDATE_NOTE_VISIBLE,
  UPDATE_NOTE_INFO,
  GET_SETTING,
  UPDATE_DEFAULT_COLOR,
} from "../actions";
import * as actions from "../../background/actions";
import { MessageRequest, MessageResponse, MessageMethod, MessageRequestPayload } from "../message";
import { Note } from "../../../types/Note";
import { isSystemLink, msg } from "../../../utils";
import { setupIsVisible, setupPage } from "../sender/background";

export const ROOT_DOM_ID = "react-container-for-note-extension";

// メモ挿入が可能なページかどうかを判定する
export const isScriptAllowedPage = async (tabId: number) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {},
  });
  return !chrome.runtime.lastError;
};

// 既にコンテンツスクリプトが挿入されているかどうかを判定する
export const hasContentScript = async (tabId: number): Promise<boolean> => {
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const noteDOM = document.getElementById("react-container-for-note-extension");
      return !!noteDOM;
    },
  });
  return res.result as boolean;
};

// コンテンツスクリプトを挿入する
export const injectContentScript = async (tabId: number) => {
  const hasScript = await hasContentScript(tabId);
  // 既に挿入されている場合は何もしない
  if (hasScript) return false;

  return await chrome.scripting.executeScript({
    target: { tabId },
    files: ["contentScript.js"],
  });
};

// コンテンツスクリプトからのメッセージハンドラ
const _handleMessagesFromContentScript = (
  method: MessageMethod,
  sendResponse: (response?: MessageResponse) => void,
  payload: MessageRequestPayload
): boolean => {
  const { url = "", note } = payload;
  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotesByPageUrl(url)
        .then((notes) => sendResponse({ data: { notes } }))
        .catch((e) => {
          console.log("error GET_ALL_NOTES:", e);
          sendResponse({ error: e });
        });
      return true;
    case CREATE_NOTE:
      actions
        .createNote(url)
        .then((notes) => {
          chrome.tabs.query({ url, currentWindow: true }).then((tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) actions.setBadgeText(tab.id, notes.length ?? 0);
            });
          })
          return sendResponse({ data: { notes } });
        })
        .catch((e) => {
          console.log("error CREATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case UPDATE_NOTE:
      actions
        .updateNote(note!)
        .then((notes) => sendResponse({ data: { notes } }))
        .catch((e) => {
          console.log("error UPDATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case DELETE_NOTE:
      actions
        .deleteNote(note!)
        .then((notes) => {
          chrome.tabs.query({ url, currentWindow: true }).then((tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) actions.setBadgeText(tab.id, notes.length ?? 0);
            });
          })
          return sendResponse({ data: { notes } });
        })
        .catch((e) => {
          console.log("error DELETE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case OPEN_OPTION_PAGE:
      // open_option_page();
      break;
    case GET_NOTE_VISIBLE:
      actions
        .getIsVisibleNote()
        .then((isVisible) => sendResponse({ data: { isVisible } }))
        .catch((e) => {
          console.log("error GET_NOTE_VISIBLE:", e);
          sendResponse({ error: e });
        });
      break;
    default:
      break;
  }
  return false;
};

// ポップアップからのメッセージハンドラ
const _handleMessagesFromPopup = (
  method: MessageMethod,
  sendResponse: (response?: MessageResponse, error?: Error) => void,
  payload: MessageRequestPayload
): boolean => {
  const { tab, note, isVisible } = payload;
  const tabId = tab?.id;
  const tabUrl = tab?.url;

  if (!tabId || !tabUrl) {
    sendResponse({ data: { notes: [] }, error: new Error("このページでは使用できません") });
    return true;
  }

  // Chromeシステム画面は、アクションを実行しないようにする
  if (isSystemLink(tabUrl)) {
    sendResponse({ data: { notes: [] }, error: new Error("このページでは使用できません") });
    return true;
  }

  const sendResponseAndSetNotes = (notes: Note[]) => {
    actions.getSetting().then((setting) => {
      sendResponse({ data: { notes } });
      injectContentScript(tabId).then(() => setupPage(tabId, tabUrl, notes, setting));
    });
  };

  isScriptAllowedPage(tabId).then((isAllowed) => {
    // content_scriptが無効なページは、アクションを実行しないようにする
    if (!isAllowed)
      sendResponse({ data: { notes: [] }, error: new Error("このページでは使用できません") });

    switch (method) {
      case GET_ALL_NOTES:
        actions
          .fetchAllNotesByPageUrl(tabUrl)
          .then((notes) => {
            actions.getIsVisibleNote().then((isVisible) => {
              sendResponse({ data: { notes, isVisible } });
            });
          })
          .catch((e) => console.log("error GET_ALL_NOTES:", e));
        return true;
      case CREATE_NOTE:
        actions
          .createNote(tabUrl)
          .then((notes) => {
            if (tabId) actions.setBadgeText(tabId, notes.length ?? 0);
            sendResponseAndSetNotes(notes);
          })
          .catch((e) => console.log("error CREATE_NOTE:", e));
        return true;
      case SCROLL_TO_TARGET_NOTE:
        actions.scrollTo(tabId, note!).then(() => sendResponse());
        return true;
      case UPDATE_NOTE:
        actions
          .updateNote(note!)
          .then(sendResponseAndSetNotes)
          .catch((e) => {
            console.log("error UPDATE_NOTE:", e);
          });
        return true;
      case DELETE_NOTE:
        actions
          .deleteNote(note!)
          .then((notes) => {
            if (tabId) actions.setBadgeText(tabId, notes.length ?? 0);
            sendResponseAndSetNotes(notes);
          })
          .catch((e) => {
            console.log("error DELETE_NOTE:", e);
          });
        return true;
      case GET_NOTE_VISIBLE:
        actions.getIsVisibleNote().then((isVisible) => {
          sendResponse({ data: { isVisible } });
          injectContentScript(tabId).then(() => setupIsVisible(tabId, tabUrl, isVisible));
        });
        return true;
      case UPDATE_NOTE_VISIBLE:
        actions.setIsVisibleNote(!!isVisible).then((isVisible) => {
          sendResponse({ data: { isVisible } });
          injectContentScript(tabId).then(() => setupIsVisible(tabId, tabUrl, isVisible));
        });
        return true;
      default:
        break;
    }
  });

  return true;
};

// オプションページからのメッセージハンドラ
const _handleMessagesFromOption = (
  method: MessageMethod,
  sendResponse: (response?: MessageResponse) => void,
  payload: MessageRequestPayload
): boolean => {
  const { tab, note, pageInfo } = payload;

  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotes()
        .then((notes) => sendResponse({ data: { notes } }))
        .catch((e) => console.log("error GET_ALL_NOTES:", e));
      return true;
    case GET_ALL_NOTES_AND_PAGE_INFO:
      actions
        .fetchAllNotesAndPageInfo()
        .then(({ notes, pageInfos }) => sendResponse({ data: { notes, pageInfos } }))
        .catch((e) => console.log("error GET_ALL_NOTES:", e));
      return true;
    case UPDATE_NOTE:
      actions
        .updateNote(note!)
        .then(() => {
          actions
            .fetchAllNotesAndPageInfo()
            .then(({ notes, pageInfos }) => sendResponse({ data: { notes, pageInfos } }));
        })
        .catch((e) => {
          console.log("error UPDATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case DELETE_NOTE:
      actions
        .deleteNote(note!)
        .then(() => {
          actions.fetchAllNotesAndPageInfo().then(({ notes, pageInfos }) => {
            if (tab?.id) actions.setBadgeText(tab.id, notes.length ?? 0);
            sendResponse({ data: { notes, pageInfos } });
          });
        })
        .catch((e) => console.log("error DELETE_NOTE:", e));
      return true;
    case UPDATE_NOTE_INFO:
      actions
        .updatePageInfo(pageInfo!)
        .then((pageInfos) => {
          sendResponse({ data: { pageInfos } });
        })
        .catch((e) => console.log("error UPDATE_NOTE_INFO:", e));
      return true;
    case GET_SETTING:
      actions
        .getSetting()
        .then((setting) => {
          sendResponse({ data: { setting } });
        })
        .catch((e) => console.log("error GET_SETTING:", e));
      return true;
    case UPDATE_DEFAULT_COLOR:
      actions
        .setDefaultColor(payload.defaultColor!)
        .then((setting) => {
          sendResponse({ data: { setting } });
        })
        .catch((e) => console.log("error UPDATE_DEFAULT_COLOR:", e));
      return true;
    default:
      sendResponse({
        data: { notes: [], pageInfos: [] },
        error: new Error("無効なアクションです"),
      });
      return true;
  }
};

export const handleMessages = (
  action: MessageRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: MessageResponse) => void
): boolean => {
  const { method, senderType, payload } = action;
  console.log("==== handleMessage ====", action, payload);

  switch (senderType) {
    case CONTENT_SCRIPT:
      return _handleMessagesFromContentScript(method, sendResponse, payload ?? {});
    case POPUP:
      return _handleMessagesFromPopup(method, sendResponse, payload ?? {});
    case OPTIONS:
      return _handleMessagesFromOption(method, sendResponse, payload ?? {});
    default:
      sendResponse({
        error: new Error("無効なアクションです"),
      });
      return true;
  }
};
