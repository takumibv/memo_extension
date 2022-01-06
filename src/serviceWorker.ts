import {
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  OPEN_OPTION_PAGE,
  POPUP,
  SET_ALL_NOTES,
  UPDATE_NOTE,
} from "./actions";
import { createNote, deleteNote, getAllNotesByPageId, updateNote } from "./storages/noteStorage";
import { getOrCreatePageInfoByUrl, getPageInfoByUrl } from "./storages/pageInfoStorage";
import { ToBackgroundMessage, ToContentScriptMessage } from "./types/Actions";
import { Note } from "./types/Note";
import { msg } from "./utils";

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
        if (!tab || !tab.id) {
          return;
        }

        chrome.tabs.sendMessage(tab.id, {
          method: SET_ALL_NOTES,
          type: "App",
          notes: allNotes,
          page_url: pageUrl,
        });
      });
    });
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // TODO タブが切り替えられた時に呼ばれる.
  console.log("chrome.tabs.onActivated.addListener:", activeInfo);
});

const handleMessages = (
  action: ToBackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: Note[]) => void
) => {
  const { method, page_url, targetNote, senderType } = action;
  console.log("==== handleMessage ====", action, sender);

  // TODO アクションの精査
  switch (method) {
    case GET_ALL_NOTES:
      getPageInfoByUrl(page_url).then((pageInfo) => {
        if (!pageInfo || !pageInfo.id) return sendResponse([]);
        getAllNotesByPageId(pageInfo.id)
          .then((notes) => {
            console.log("GET_ALL_NOTES:", notes);

            sendResponse(notes);
          })
          .catch((e) => {
            console.log("error GET_ALL_NOTES:", e);
          });
      });
      return true;
    case CREATE_NOTE:
      getOrCreatePageInfoByUrl(page_url).then((pageInfo) => {
        createNote(pageInfo.id!)
          .then(({ note, allNotes }) => {
            console.log("CREATE_NOTE:", note);
            sendResponse(allNotes);
          })
          .catch((e) => {
            console.log("error CREATE_NOTE:", e);
          });
      });
      return true;
    case UPDATE_NOTE:
      if (!targetNote) return sendResponse([]);

      getOrCreatePageInfoByUrl(page_url).then((pageInfo) => {
        updateNote(pageInfo.id!, targetNote)
          .then(({ allNotes }) => {
            console.log("UPDATE_NOTE:", allNotes);

            sendResponse(allNotes);
          })
          .catch((e) => {
            console.log("error UPDATE_NOTE:", e);
          });
      });

      return true;
    case DELETE_NOTE:
      getPageInfoByUrl(page_url).then((pageInfo) => {
        if (!pageInfo || !pageInfo.id) return sendResponse([]);
        deleteNote(pageInfo.id, targetNote?.id)
          .then(({ allNotes }) => {
            console.log("DELETE_NOTE:", allNotes);

            sendResponse(allNotes);

            if (senderType === POPUP) {
              console.log("ContentScriptへメッセージを送信");
            }
          })
          .catch((e) => {
            console.log("error DELETE_NOTE:", e);
          });
      });
      return true;
    case OPEN_OPTION_PAGE:
      // open_option_page();
      break;
    default:
      break;
  }
  // });
};

chrome.runtime.onMessage.addListener(handleMessages);
