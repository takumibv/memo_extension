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
  ToContentScriptMessage,
} from "../../types/Actions";
import { Note } from "../../types/Note";
import { msg } from "../../utils";

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
// title: "メモを追加する",

chrome.contextMenus.onClicked.addListener((info) => {
  const { pageUrl } = info;
  console.log("chrome.contextMenus.onClicked.addListener:", info);

  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (!tab || !tab.id) {
      console.log("contextMenus: no tabs.id");
      return;
    }

    console.log("chrome.tabs.query:", tab);
    getOrCreatePageInfoByUrl(pageUrl).then((pageInfo) => {
      if (!pageInfo.id) return;

      createNote(pageInfo.id).then(({ allNotes }) => {
        if (!tab?.id) {
          return;
        }

        actions.setAllNotes(tab.id, pageUrl, allNotes);
      });
    });
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // TODO タブが切り替えられた時に呼ばれる.
  console.log("chrome.tabs.onActivated.addListener:", activeInfo);
});

const _handleMessagesFromContentScript = (
  method: ToBackgroundMessageMethod,
  page_url: string,
  sendResponse: (response?: Note[]) => void,
  targetNote?: Note
) => {
  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotesByPageUrl(page_url)
        .then(sendResponse)
        .catch((e) => console.log("error GET_ALL_NOTES:", e));
      return true;
    case CREATE_NOTE:
      actions
        .createNote(page_url)
        .then(sendResponse)
        .catch((e) => console.log("error CREATE_NOTE:", e));
      return true;
    case UPDATE_NOTE:
      actions
        .updateNote(page_url, targetNote)
        .then(sendResponse)
        .catch((e) => {
          console.log("error UPDATE_NOTE:", e);
        });
      return true;
    case DELETE_NOTE:
      actions
        .deleteNote(page_url, targetNote?.id)
        .then(sendResponse)
        .catch((e) => {
          console.log("error DELETE_NOTE:", e);
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
  sendResponse: (response?: Note[]) => void,
  tab?: chrome.tabs.Tab,
  targetNote?: Note
) => {
  const tabId = tab?.id;
  const tabUrl = tab?.url;
  if (!tabId || !tabUrl) return sendResponse([]);

  const sendResponseAndSetNotes = (notes: Note[]) => {
    sendResponse(notes);
    actions.setAllNotes(tabId, tabUrl, notes);
  };

  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotesByPageUrl(tabUrl)
        .then(sendResponseAndSetNotes)
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
};

const _handleMessagesFromOption = (
  method: ToBackgroundMessageMethod,
  sendResponse: (response?: Note[]) => void,
  targetNote?: Note
) => {
  switch (method) {
    case GET_ALL_NOTES:
      actions
        .fetchAllNotes()
        .then(sendResponse)
        .catch((e) => console.log("error GET_ALL_NOTES:", e));
      return true;
    default:
      break;
  }
};

const handleMessages = (
  action: ToBackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
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
