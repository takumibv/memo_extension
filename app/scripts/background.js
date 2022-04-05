// Enable chromereload by uncommenting this line:
import "chromereload/devonly";
const $ = require("jquery");
const url = require("url");
import PageInfo from "./model/page_infos.js";
import Memo from "./model/memos.js";

const text_to_string = (raw_text) => {
  const divNode = document.createElement("div");
  divNode.innerHTML = raw_text;
  return divNode.textContent;
};

// install or Updateして初めて開いた時に呼ばれる。
chrome.runtime.onInstalled.addListener((details) => {
  console.log(
    "previousVersion",
    details.previousVersion,
    (details.previousVersion || "").match(/^0\.2/g),
    window.bg
  );

  // previousVersionが 0.2.x 以下ならstorageに保存
  try {
    if ((details.previousVersion || "").match(/^0\.2/g)) {
      const memos = Memo.getAllMemos();
      let pageInfoMap = {};
      let memoMap = {};
      memos.forEach((memo) => {
        pageInfoMap[memo.page_info_id] = memo.page_info;

        // TODO メモを整形
        const targetMemo = {
          id: memo.id,
          page_info_id: memo.page_info_id,
          title: memo.title,
          description: text_to_string(memo.description),
          position_x: memo.position_x,
          position_y: memo.position_y,
          width: memo.width,
          height: memo.height,
          is_open: memo.is_open,
          is_fixed: memo.is_fixed,
          created_at: memo.created_at,
          updated_at: memo.updated_at,
        };

        if (memoMap[memo.page_info_id]) {
          memoMap[memo.page_info_id].push(targetMemo);
        } else {
          memoMap[memo.page_info_id] = [targetMemo];
        }
      });

      const saveMemos = () => {
        chrome.storage.local.clear();
        Object.keys(memoMap).forEach((page_info_id) => {
          chrome.storage.local.set(
            { [`notes_${page_info_id}`]: memoMap[page_info_id] },
            () => {
              console.log(
                "backup: saved memos",
                page_info_id,
                memoMap[page_info_id]
              );
            }
          );
        });
        const pageInfos = Object.keys(pageInfoMap).map((page_info_id) => {
          const page_info = pageInfoMap[page_info_id];

          return {
            id: page_info.id,
            page_url: decodeURIComponent(page_info.page_url),
            page_title: page_info.page_title,
            fav_icon_url: page_info.fav_icon_url,
            created_at: page_info.created_at,
          };
        });
        chrome.storage.local.set({ page_info: pageInfos }, () => {
          console.log("backup: saved pageInfos", pageInfos);
        });
      };
      saveMemos();
      ga("send", "event", "UpdateApp", "true", "", 1);
    } else {
      ga(
        "send",
        "event",
        "UpdateApp",
        "true",
        "Backup action was not fired.",
        1
      );
    }
  } catch (e) {
    ga("send", "event", "UpdateApp", "false", e.message, 1);
  }
});

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("add_memo_msg"),
  contexts: ["page"],
  type: "normal",
  onclick: function (info) {
    window.bg.makeMemo(null);
  },
});

$(function () {
  /****
   * Backgroundクラス
   * Chromeが開いたタイミングで1回だけ呼ばれる。
   ****/
  class Background {
    constructor() {
      this.initProps();
      this.assignEventHandlers();
    }
    // 初期値設定
    initProps() {
      const d = new Date();
      console.log(
        "[%04d/%02d/%02d %02d:%02d:%02d] Memo app is Running",
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds()
      );

      this.page_info = null; // 開いてるページのpage_infoを保持しておく場所

      /* can_show_memo: 開いてるページがメモを表示できるかどうか
       * 起動時のカレントページはウェブストアの可能性が高いので初期はとりあえずfalseにする.
       * TODO: 適切な初期値を設定する.
       **/
      this.can_show_memo = false;
      this.options = {
        image_url: chrome.extension.getURL("images"),
        option_page_url: chrome.extension.getURL("pages/options.html"),
      }; // resourseファイルのurl

      // 開いている全てのページにinsertCSSする.
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url.match(/^http(s?):\/\//)) {
            this.insertCSS(tab.id);
          }
        });
      });
    }
    // contents_script用
    assignMessages() {
      return {
        updated_at_msg: chrome.i18n.getMessage("updated_at_msg"),
        created_at_msg: chrome.i18n.getMessage("created_at_msg"),
        copied_msg: chrome.i18n.getMessage("copied_msg"),
        confirm_remove_memo_msg: chrome.i18n.getMessage(
          "confirm_remove_memo_msg"
        ),
        minimize_msg: chrome.i18n.getMessage("minimize_msg"),
        maximize_msg: chrome.i18n.getMessage("maximize_msg"),
        pinned_msg: chrome.i18n.getMessage("pinned_msg"),
        remove_pinned_msg: chrome.i18n.getMessage("remove_pinned_msg"),
        detail_msg: chrome.i18n.getMessage("detail_msg"),
        edit_msg: chrome.i18n.getMessage("edit_msg"),
        copy_msg: chrome.i18n.getMessage("copy_msg"),
        delete_msg: chrome.i18n.getMessage("delete_msg"),
        new_memo_title_msg: chrome.i18n.getMessage("new_memo_title_msg"),
        new_memo_description_msg: chrome.i18n.getMessage(
          "new_memo_description_msg"
        ),
        how_to_use_page_link_msg: chrome.i18n.getMessage(
          "how_to_use_page_link_msg"
        ),
        how_to_use_header_msg: chrome.i18n.getMessage("how_to_use_header_msg"),
      };
    }
    // Chromeの各種操作イベントに対するイベントハンドラを登録する。
    assignEventHandlers() {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (
          changeInfo.status === "loading" &&
          tab.url.match(/^http(s?):\/\//)
        ) {
          // ページの読み込みが始まった瞬間呼ばれる .
          window.bg.insertCSS(tabId);
          if (tab.active) {
            // 別タブでローディングしている場合は呼ばれない。
            window.bg.setPageInfo(tabId, tab.url);
          }
        } else if (
          tab.active &&
          changeInfo.status === "complete" &&
          tab.url.match(/^http(s?):\/\//)
        ) {
          // ページの読み込みが完了したら呼ばれる.(loading中はtab.titleがnullの場合がある)
          window.bg.setPageTitle(tabId, tab.title);
          window.bg.setFavIcon(tabId, tab.favIconUrl);
        }
      });
      chrome.tabs.onActivated.addListener((activeInfo) => {
        // タブが切り替えられた時に呼ばれる.
        chrome.tabs.get(activeInfo.tabId, (tab) => {
          window.bg.setPageInfo(tab.id, tab.url);
          window.bg.setPageTitle(tab.id, tab.title);
          window.bg.setFavIcon(tab.id, tab.favIconUrl);
        });
      });
      chrome.windows.onFocusChanged.addListener((windowId) => {
        // ウィンドウが切り替えられた時に呼ばれる.
        if (windowId != -1) {
          chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
            if (tabs[0]) {
              window.bg.setPageInfo(tabs[0].id, tabs[0].url);
              window.bg.setPageTitle(tabs[0].id, tabs[0].title);
              window.bg.setFavIcon(tabs[0].id, tabs[0].favIconUrl);
            }
          });
        }
      });
      chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        window.bg.onTabRemoved(tabId);
      });
      chrome.runtime.onMessage.addListener((msg, sender, res) => {
        switch (msg.method) {
          case "CREATE_MEMO":
            ga("send", "event", "Memo", msg.action_type, msg.method, 1);
            window.bg.createMemo(msg.page_url, msg.memo);
          case "UPDATE_TITLE":
          case "UPDATE_DESCRIPTION":
          case "UPDATE_IS_OPEN":
          case "UPDATE_IS_FIXED":
          case "MOVE_MEMO":
          case "RESIZE_MEMO":
            ga("send", "event", "Memo", msg.action_type, msg.method, 1);
            window.bg.updateMemo(msg.page_url, msg.memo, msg.action_type);
            break;
          case "DELETE_MEMO":
            ga("send", "event", "Memo", msg.action_type, msg.method, 1);
            window.bg.deleteMemo(msg.memo, msg.action_type);
            break;
          case "CANNOT_SHOW_MEMO":
            window.bg.setCanShowMemo(
              false,
              window.bg.decodeUrl(window.bg.page_info.page_url)
            );
            break;
          case "OPEN_OPTION_PAGE":
            window.bg.openMemoPage(msg.memo.id, msg.memo.page_info_id);
            break;
          case "SEND_PAGE_TRACKING":
            ga("send", "pageview", msg.page_url);
            break;
          default:
            break;
        }
      });
    }
    setPageInfo(tabId, page_url) {
      /***
       * 現在開いてるページのurl情報をセットする.
       * 1. URL形成/urlセット
       * 2. ローカルストレージ探索
       * 3. カードセット
       ***/
      if (page_url.match(/^http(s?):\/\//) === null) {
        this.page_info = null;
        this.setCanShowMemo(false);
        return;
      }
      const tab_url = this.encodeUrl(page_url);
      this.page_info = new PageInfo(tab_url);

      this.setCardArea();
    }
    setPageTitle(tabId, title) {
      // タイトルのセット(loading中はタイトルが入らない場合もあるため, setPageInfoと分けている)
      if (this.page_info) {
        this.page_info.setPageTitle(title);
      }
    }
    setFavIcon(tabId, icon_url) {
      if (this.page_info) {
        this.page_info.setPageFavIcon(icon_url);
      }
    }
    onTabRemoved(tabId) {
      this.page_info.save();
    }

    encodeUrl(plain_url) {
      let parse_url = url.parse(plain_url);
      let formed_url = `${parse_url.protocol}//${parse_url.hostname}${
        parse_url.pathname
      }${parse_url.search || ""}`;
      return encodeURIComponent(formed_url);
    }
    decodeUrl(crypted_url) {
      return decodeURIComponent(crypted_url);
    }

    setBadgeNumber(num) {
      let text = num == 0 ? "" : `${num}`;
      chrome.browserAction.setBadgeText({ text: text });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#4183C4" });
    }
    setBadgeError() {
      chrome.browserAction.setBadgeText({ text: "x" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#DB1C21" });
    }
    scrollTo(memo_id) {
      let m = Memo.getMemoById(parseInt(memo_id));
      if (m && !m.is_fixed) {
        chrome.tabs.executeScript(null, {
          code: `window.scrollTo(0, ${m.position_y});`,
        });
      }
    }
    /****
     * Card Area
     ****/
    insertCSS(tab_id = null) {
      // 最初の1回のみ
      chrome.tabs.executeScript(tab_id, {
        code: `let tab_url; let page_info; let memos; let options; let messages;`,
      });
      chrome.tabs.insertCSS(tab_id, { file: "styles/base.css" });
      chrome.tabs.insertCSS(tab_id, { file: "styles/card.css" });
    }
    setCardArea() {
      // カードの内容を更新するたびに呼ばれる
      this.setBadgeNumber(this.page_info.getMemos().length);
      chrome.tabs.executeScript(
        null,
        {
          code:
            `tab_url    = '${this.page_info.page_url}';` +
            `page_info  = JSON.parse('${JSON.stringify(
              this.page_info.serialize()
            )}');` +
            `memos      = JSON.parse('${JSON.stringify(
              this.page_info.getMemos()
            )}');` +
            `options    = JSON.parse('${JSON.stringify(this.options)}');` +
            `messages   = JSON.parse('${JSON.stringify(
              this.assignMessages()
            )}');`,
        },
        () => {
          if (chrome.extension.lastError) {
            this.setCanShowMemo(false, this.decodeUrl(this.page_info.page_url));
            return;
          }
          this.setCanShowMemo(true);
          chrome.tabs.executeScript(null, { file: "scripts/react_app.js" });
        }
      );
    }
    /****
     * Memo
     ****/
    makeMemo(tabId) {
      const url = this.page_info.page_url;
      const memo = {
        id: null,
        title: this.assignMessages()["new_memo_title_msg"],
        description: this.assignMessages()["new_memo_description_msg"],
        position_x: null,
        position_y: null,
        width: 300,
        height: 170,
        is_open: true,
        is_fixed: false,
      };
      this.updateMemo(url, memo);
      this.setCardArea();
      ga("send", "event", "Memo", "App", "MAKE_MEMO", 1);
    }
    updateMemo(page_url, memo, action_type = null) {
      let target_memo = Object.assign({}, memo);

      if (action_type === "OPTIONS") {
        // options page
        new Memo(target_memo).save();
        new PageInfo(null, { id: memo.page_info_id }).checkMemoExistance();
      } else {
        // executeScript
        this.page_info.save();
        target_memo.page_info_id = this.page_info.id;
        new Memo(target_memo).save();
        this.page_info.checkMemoExistance();
      }
    }
    deleteMemo(memo, action_type = null) {
      if (action_type === "OPTIONS") {
        // options page
        new Memo(memo).delete();
        new PageInfo(null, { id: memo.page_info_id }).checkMemoExistance();
      } else {
        // executeScript
        this.page_info.deleteMemo(memo);
        this.page_info.checkMemoExistance();
        this.setBadgeNumber(this.page_info.getMemos().length);
      }
    }

    getAllPageInfo() {
      return PageInfo.getAllPageInfoHavingMemo();
    }
    getAllMemos() {
      return Memo.getAllMemos();
    }

    canShowMemo() {
      return this.can_show_memo;
    }
    setCanShowMemo(can_show, page_url = null) {
      this.can_show_memo = can_show;
      if (!can_show) {
        this.setBadgeError();
        if (page_url) {
          ga("send", "event", "CanShowMemo", "false", page_url, 1);
        }
      }
    }

    openOptionPage(memo = null) {
      const param = memo === null ? "" : memo.id;
      chrome.tabs.create({
        url: `${chrome.extension.getURL("pages/options.html")}#settings`,
      });
      // chrome.runtime.openOptionsPage();
    }
    openMemoPage(memo_id = null, page_info_id = null) {
      let param = memo_id ? `memo=${memo_id}` : "";
      param += page_info_id ? `&page_info=${page_info_id}` : "";
      chrome.tabs.create({
        url: `${chrome.extension.getURL("pages/options.html")}#memos?${param}`,
      });
    }
    openHowToUsePage() {
      chrome.tabs.create({
        url: `${chrome.extension.getURL("pages/options.html")}#how_to_use`,
      });
    }
  }

  window.bg = new Background();
});
