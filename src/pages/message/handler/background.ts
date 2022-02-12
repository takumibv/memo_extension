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
  UPDATE_NOTE_VISIBLE,
} from "../actions";
import * as actions from "../../background/actions";
import { createNote } from "../../../storages/noteStorage";
import { getOrCreatePageInfoByUrl } from "../../../storages/pageInfoStorage";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../../../types/Actions";
import { Note } from "../../../types/Note";
import { isSystemLink, msg } from "../../../utils";
import { sendSetAllNotes } from "../sender/background";

export const ROOT_DOM_ID = "react-container-for-note-extension";

const isScriptAllowedPage = async (tabId: number) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {},
  });
  return !chrome.runtime.lastError;
};

const hasContentScript = async (tabId: number): Promise<boolean> => {
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const noteDOM = document.getElementById("react-container-for-note-extension");
      return !!noteDOM;
    },
  });
  return res.result as boolean;
};

const injectContentScript = async (tabId: number) => {
  const hasScript = await hasContentScript(tabId);
  console.log("hasScript:", hasScript);
  if (hasScript) return false;

  return await chrome.scripting.executeScript({
    target: { tabId },
    files: ["contentScript.js"],
  });
};

const _handleMessagesFromContentScript = (
  method: ToBackgroundMessageMethod,
  sendResponse: (response?: ToBackgroundMessageResponse) => void,
  page_url: string,
  targetNote?: Note
) => {
  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotesByPageUrl(page_url)
        .then((notes) => sendResponse({ notes }))
        .catch((e) => {
          console.log("error GET_ALL_NOTES:", e);
          sendResponse({ error: e });
        });
      return true;
    case CREATE_NOTE:
      actions
        .createNote(page_url)
        .then((notes) => sendResponse({ notes }))
        .catch((e) => {
          console.log("error CREATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case UPDATE_NOTE:
      actions
        .updateNote(targetNote!)
        .then((notes) => sendResponse({ notes }))
        .catch((e) => {
          console.log("error UPDATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case DELETE_NOTE:
      actions
        .deleteNote(targetNote!)
        .then((notes) => sendResponse({ notes }))
        .catch((e) => {
          console.log("error DELETE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case OPEN_OPTION_PAGE:
      // open_option_page();
      break;
    default:
      break;
  }
  return false;
};

const _handleMessagesFromPopup = (
  method: ToBackgroundMessageMethod,
  sendResponse: (response?: ToBackgroundMessageResponse, error?: Error) => void,
  tab?: chrome.tabs.Tab,
  targetNote?: Note
) => {
  const tabId = tab?.id;
  const tabUrl = tab?.url;

  if (!tabId || !tabUrl)
    return sendResponse({ notes: [], error: new Error("このページでは使用できません") });

  // Chromeシステム画面は、アクションを実行しないようにする
  if (isSystemLink(tabUrl))
    return sendResponse({ notes: [], error: new Error("このページでは使用できません") });

  hasContentScript(tabId).then((isInjecting) => {
    console.log("hasContentScript _handleMessagesFromPopup", isInjecting);
  });

  const sendResponseAndSetNotes = (notes: Note[]) => {
    sendResponse({ notes });
    injectContentScript(tabId).then(() => sendSetAllNotes(tabId, tabUrl, notes));
  };

  isScriptAllowedPage(tabId).then((isAllowed) => {
    // content_scriptが無効なページは、アクションを実行しないようにする
    if (!isAllowed) sendResponse({ notes: [], error: new Error("このページでは使用できません") });

    switch (method) {
      case GET_ALL_NOTES:
        actions
          .fetchAllNotesByPageUrl(tabUrl)
          .then((notes) => sendResponse({ notes }))
          .catch((e) => console.log("error GET_ALL_NOTES:", e));
        return true;
      case CREATE_NOTE:
        actions
          .createNote(tabUrl)
          .then(sendResponseAndSetNotes)
          .catch((e) => console.log("error CREATE_NOTE:", e));
        return true;
      case SCROLL_TO_TARGET_NOTE:
        actions.scrollTo(tabId, targetNote!).then(() => sendResponse());
        return true;
      case UPDATE_NOTE:
        actions
          .updateNote(targetNote!)
          .then(sendResponseAndSetNotes)
          .catch((e) => {
            console.log("error UPDATE_NOTE:", e);
          });
        return true;
      case DELETE_NOTE:
        actions
          .deleteNote(targetNote!)
          .then(sendResponseAndSetNotes)
          .catch((e) => {
            console.log("error DELETE_NOTE:", e);
          });
        return true;
      case UPDATE_NOTE_VISIBLE:
        actions.setIsVisibleNote(true);
        return true;
      default:
        break;
    }
  });

  return true;
};

const _handleMessagesFromOption = (
  method: ToBackgroundMessageMethod,
  sendResponse: (response?: ToBackgroundMessageResponse) => void,
  targetNote?: Note
) => {
  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotes()
        .then((notes) => sendResponse({ notes }))
        .catch((e) => console.log("error GET_ALL_NOTES:", e));
      return true;
    case GET_ALL_NOTES_AND_PAGE_INFO:
      actions
        .fetchAllNotesAndPageInfo()
        .then(({ notes, pageInfos }) => sendResponse({ notes, pageInfos }))
        .catch((e) => console.log("error GET_ALL_NOTES:", e));
      return true;
    case UPDATE_NOTE:
      actions
        .updateNote(targetNote!)
        .then(() => {
          actions
            .fetchAllNotesAndPageInfo()
            .then(({ notes, pageInfos }) => sendResponse({ notes, pageInfos }));
        })
        .catch((e) => {
          console.log("error UPDATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case DELETE_NOTE:
      actions
        .deleteNote(targetNote!)
        .then(() => {
          actions
            .fetchAllNotesAndPageInfo()
            .then(({ notes, pageInfos }) => sendResponse({ notes, pageInfos }));
        })
        .catch((e) => console.log("error DELETE_NOTE:", e));
      return true;
    default:
      sendResponse({ notes: [], pageInfos: [], error: new Error("無効なアクションです") });
      return true;
  }
};

export const handleMessages: handleMessageType = (action, sender, sendResponse) => {
  const { method, page_url, targetNote, senderType } = action;
  const { tab } = sender;
  console.log("==== handleMessage ====", senderType, action, tab);

  switch (senderType) {
    case CONTENT_SCRIPT:
      return _handleMessagesFromContentScript(method, sendResponse, page_url, targetNote);
    case POPUP:
      return _handleMessagesFromPopup(method, sendResponse, action.tab, targetNote);
    case OPTIONS:
      return _handleMessagesFromOption(method, sendResponse, targetNote);
    default:
      sendResponse();
      return;
  }
};

type handleMessageType = (
  action: ToBackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: ToBackgroundMessageResponse) => void
) => void;
