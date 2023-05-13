import {
  handleMessages,
  injectContentScript,
  isScriptAllowedPage,
} from "../message/handler/background";
import { setupPage } from "../message/sender/background";
import * as actions from "./actions";
import { createNote } from "../../storages/noteStorage";
import { getOrCreatePageInfoByUrl } from "../../storages/pageInfoStorage";
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
              actions.getSetting().then((setting) => {
                if (!tab?.id) return;

                injectContentScript(tab.id).then(() =>
                  setupPage(tab.id!, pageUrl, allNotes, setting)
                );
              });
            });
          });
        }
      })
      .catch((e) => {
        // TODO: エラー時の処理
        if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
      });
  });
});

// 直近に読み込まれたページURL
let currentUrl = "";

/**
 * タブが更新された時に呼ばれる
 * 0. 無効なページの場合はなにもしない
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

  if (isSystemLink(url)) return;

  isScriptAllowedPage(tabId).then((isAllowed) => {
    if (isAllowed) {
      actions
        .fetchAllNotesByPageUrl(url)
        .then((notes) => {
          actions.getSetting().then((setting) => {
            currentUrl = "";

            if (notes.length === 0) return setupPage(tabId, url, [], setting);

            injectContentScript(tabId).then(() => setupPage(tabId, url, notes, setting));
          });
        })
        .catch((e) => {
          console.log("error chrome.tabs.onUpdated.addListener", e);
        });
    }
  });
});

chrome.runtime.onMessage.addListener(handleMessages);
