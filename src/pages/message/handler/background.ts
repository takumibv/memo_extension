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
} from "../actions";
import * as actions from "../../background/actions";
import { MessageRequest, MessageResponse, MessageMethod, MessageRequestPayload } from "../message";
import { Note } from "../../../types/Note";
import { isSystemLink, msg } from "../../../utils";
import { setupIsVisible, setupPage } from "../sender/background";

export const ROOT_DOM_ID = "react-container-for-note-extension";

export const isScriptAllowedPage = async (tabId: number) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {},
  });
  return !chrome.runtime.lastError;
};

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

export const injectContentScript = async (tabId: number) => {
  const hasScript = await hasContentScript(tabId);
  if (hasScript) return false;

  return await chrome.scripting.executeScript({
    target: { tabId },
    files: ["contentScript.js"],
  });
};

const _handleMessagesFromContentScript = (
  method: MessageMethod,
  sendResponse: (response?: MessageResponse) => void,
  payload: MessageRequestPayload
) => {
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
        .then((notes) => sendResponse({ data: { notes } }))
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
        .then((notes) => sendResponse({ data: { notes } }))
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

const _handleMessagesFromPopup = (
  method: MessageMethod,
  sendResponse: (response?: MessageResponse, error?: Error) => void,
  payload: MessageRequestPayload
) => {
  const { tab, note, isVisible } = payload;
  const tabId = tab?.id;
  const tabUrl = tab?.url;

  if (!tabId || !tabUrl)
    return sendResponse({ data: { notes: [] }, error: new Error("このページでは使用できません") });

  // Chromeシステム画面は、アクションを実行しないようにする
  if (isSystemLink(tabUrl))
    return sendResponse({ data: { notes: [] }, error: new Error("このページでは使用できません") });

  const sendResponseAndSetNotes = (notes: Note[]) => {
    actions.getIsVisibleNote().then((isVisible) => {
      sendResponse({ data: { notes } });
      injectContentScript(tabId).then(() => setupPage(tabId, tabUrl, notes, isVisible));
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
          .then(sendResponseAndSetNotes)
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
          .then(sendResponseAndSetNotes)
          .catch((e) => {
            console.log("error DELETE_NOTE:", e);
          });
        return true;
      case GET_NOTE_VISIBLE:
        actions.getIsVisibleNote().then((isVisible) => {
          sendResponse({ data: { isVisible } });
          injectContentScript(tabId).then(() => setupIsVisible(tabId, tabUrl, isVisible));
        });
        break;
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

const _handleMessagesFromOption = (
  method: MessageMethod,
  sendResponse: (response?: MessageResponse) => void,
  payload: MessageRequestPayload
) => {
  const { note, pageInfo } = payload;

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
          actions
            .fetchAllNotesAndPageInfo()
            .then(({ notes, pageInfos }) => sendResponse({ data: { notes, pageInfos } }));
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
) => {
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
      return;
  }
};
