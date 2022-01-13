import {
  CONTENT_SCRIPT,
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  GET_ALL_NOTES_AND_PAGE_INFO,
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

export const ROOT_DOM_ID = "react-container-for-note-extension";

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
  title: msg("add_note_msg", true),
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

              injectContentScript(tab.id).then(() =>
                actions.setAllNotes(tab.id!, pageUrl, allNotes)
              );
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

// 直近に読み込まれたページURL
let currentUrl = "";

/**
 * タブが更新された時に呼ばれる
 * 1. ページに紐づくメモがない場合、contentScriptを実行せず、[]を返す（SPA対策）
 * 2. ページに紐づくメモがある場合、contentScriptを実行し、メモを返す
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  if (status !== "complete") return;

  const { url } = tab;
  // iframeを読み込まれたタイミングでも走るので、同一URLを読み込んだ際は無視するようにする
  if (url === undefined || currentUrl === url) return;
  currentUrl = url;

  actions
    .fetchAllNotesByPageUrl(url)
    .then((notes) => {
      currentUrl = "";

      if (notes.length === 0) return actions.setAllNotes(tabId, url, []);

      injectContentScript(tabId).then(() => actions.setAllNotes(tabId, url, notes));
    })
    .catch((e) => {
      console.log("error chrome.tabs.onUpdated.addListener", e);
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
    injectContentScript(tabId).then(() => actions.setAllNotes(tabId, tabUrl, notes));
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
