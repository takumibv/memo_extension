import {
  CONTENT_SCRIPT,
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  OPEN_OPTION_PAGE,
  OPTIONS,
  POPUP,
  SET_ALL_NOTES,
  UPDATE_NOTE,
} from "../../actions";
import * as actions from "./actions";
import * as contentScript from "../contentScript";
import {
  createNote,
  deleteNote,
  getAllNotesByPageId,
  updateNote,
} from "../../storages/noteStorage";
import { getOrCreatePageInfoByUrl, getPageInfoByUrl } from "../../storages/pageInfoStorage";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
  ToContentScriptMessage,
} from "../../types/Actions";
import { Note } from "../../types/Note";
import { isSystemLink, msg } from "../../utils";

/**
 * Service Worker
 *
 * 1. ローカルストレージのデータを管理する
 *   1-1. ContentScriptからのアクションを受け取り、データを更新する
 *   1-2. ContentScriptへ、データを送信する
 *   1-3. Popupへ、データを送信する
 */

// install or Updateして初めて開いた時に呼ばれる。
chrome.runtime.onInstalled.addListener((details) => {
  const previousVersion = details.previousVersion || "x.x.x";
  console.log("previousVersion", previousVersion);
});

chrome.contextMenus.create({
  id: "note-extension-context-menu-create",
  title: msg("add_note_msg"),
  contexts: ["page", "frame", "editable", "image", "video", "audio", "link", "selection"],
});

chrome.contextMenus.onClicked.addListener((info) => {
  const { pageUrl } = info;

  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (!tab?.id) return;

    isScriptAllowedPage(tab.id)
      .then((isAllowed) => {
        if (isAllowed) {
          getOrCreatePageInfoByUrl(pageUrl).then((pageInfo) => {
            if (!pageInfo.id) return;

            createNote(pageInfo.id).then(({ allNotes }) => {
              if (!tab?.id) return;

              actions.setAllNotes(tab.id, pageUrl, allNotes);
            });
          });
        }
      })
      .catch((e) => {
        // TODO: エラー時の処理
      });
  });
});

const isScriptAllowedPage = async (tabId: number) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {},
  });
  return !chrome.runtime.lastError;
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  if (status !== "complete") return;

  chrome.scripting
    .executeScript({
      target: { tabId },
      files: ["contentScript.js"],
    })
    .then((result) => {
      console.log("chrome.scripting.executeScript", result);
    });
});

const _handleMessagesFromContentScript = (
  method: ToBackgroundMessageMethod,
  page_url: string,
  sendResponse: (response?: ToBackgroundMessageResponse) => void,
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
        .updateNote(page_url, targetNote)
        .then((notes) => sendResponse({ notes }))
        .catch((e) => {
          console.log("error UPDATE_NOTE:", e);
          sendResponse({ error: e });
        });
      return true;
    case DELETE_NOTE:
      actions
        .deleteNote(page_url, targetNote?.id)
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

  const sendResponseAndSetNotes = (notes: Note[]) => {
    sendResponse({ notes });
    actions.setAllNotes(tabId, tabUrl, notes);
  };

  if (isSystemLink(tabUrl))
    return sendResponse({ notes: [], error: new Error("このページでは使用できません") });

  isScriptAllowedPage(tabId).then((isAllowed) => {
    if (!isAllowed) sendResponse({ notes: [], error: new Error("このページでは使用できません") });

    switch (method) {
      case GET_ALL_NOTES:
        actions
          .fetchAllNotesByPageUrl(tabUrl)
          .then((notes) => sendResponse({ notes }))
          .catch((e) => console.log("error GET_ALL_NOTES:", e));
        return true;
      case CREATE_NOTE:
        // TODO content_scriptが無効なページは、createNoteを実行しないようにする
        actions
          .createNote(tabUrl)
          .then(sendResponseAndSetNotes)
          .catch((e) => console.log("error CREATE_NOTE:", e));
        return true;
      case UPDATE_NOTE:
        actions
          .updateNote(tabUrl, targetNote)
          .then(sendResponseAndSetNotes)
          .catch((e) => {
            console.log("error UPDATE_NOTE:", e);
          });
        return true;
      case DELETE_NOTE:
        actions
          .deleteNote(tabUrl, targetNote?.id)
          .then(sendResponseAndSetNotes)
          .catch((e) => {
            console.log("error DELETE_NOTE:", e);
          });
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
    default:
      break;
  }
};

const handleMessages = (
  action: ToBackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: ToBackgroundMessageResponse) => void
) => {
  const { method, page_url, targetNote, senderType } = action;
  const { tab } = sender;
  console.log("==== handleMessage ====", senderType, action, tab);

  switch (senderType) {
    case CONTENT_SCRIPT:
      return _handleMessagesFromContentScript(method, page_url, sendResponse, targetNote);
    case POPUP:
      return _handleMessagesFromPopup(method, sendResponse, action.tab, targetNote);
    case OPTIONS:
      return _handleMessagesFromOption(method, sendResponse, targetNote);
    default:
      sendResponse();
      return;
  }
};

chrome.runtime.onMessage.addListener(handleMessages);
