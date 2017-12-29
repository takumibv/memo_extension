// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
const $ = require('jquery');
const url = require('url');
import PageInfo from './page_info.js';

// install or Updateして初めて開いた時に呼ばれる。
chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
})

chrome.browserAction.setBadgeText({
  text: `Hello`
})

$(function() {
  /****
  * Backgroundクラス
  * Chromeが開いたタイミングで1回だけ呼ばれる。
  ****/
  class Background {
    constructor() {
      this.assignEventHandlers();
      // this.setCardArea();
      const d = new Date();
      console.log("[%04d/%02d/%02d %02d:%02d:%02d] Memo app is Running", d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

      // page_infoを保持しておく場所. key: page_url, value: PageInfo
      this.page_infos = {};
      // 開いてるタブのidとurl {12: "http://...", 24: "http://..."}
      this.tab_id_url = {};
    }
    // Chromeの各種操作イベントに対するイベントハンドラを登録する。
    assignEventHandlers() {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "loading") {
          // ページの読み込みが始まった瞬間呼ばれる.
          window.bg.setPageInfo(tabId, tab.url);
        } else if (changeInfo.status === "complete") {
          // ページの読み込みが完了したら呼ばれる.
          window.bg.setPageTitle(tabId, tab.title);
        }
      });

      chrome.tabs.onActivated.addListener((activeInfo) => {
        // タブが切り替えられた時に呼ばれる.
        const tabId = activeInfo.tabId;
        chrome.tabs.get(tabId, (tab) => {
          window.bg.setPageInfo(tabId, tab.url);
          window.bg.setPageTitle(tabId, tab.title);
        });
      });

      chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        window.bg.onTabRemoved(tabId);
      });

      chrome.runtime.onMessage.addListener((msg, sender, res) => {
        console.log(msg, sender, res);
        switch (msg.method) {
          case 'CREATE_MEMO':
            window.bg.createMemo(msg.page_url, msg.memo);
          case 'SAVE_MEMO':
            window.bg.updateMemos(msg.page_url, msg.memos);
            break;
          default:
            break;
        }
      });
    }
    setPageInfo(tabId, page_url) {
      /***
      * 1. URL形成/urlセット
      * 2. ローカルストレージ探索
      * 3. カードセット
      ***/
      if (page_url.match(/^http(s?):\/\//) === null) { return; }
      const tab_url   = this.encodeUrl(page_url);
      this.tab_id_url[tabId] = tab_url;

      const page_info = new PageInfo(tab_url);
      this.page_infos[tab_url] = page_info;

      chrome.tabs.executeScript(
        null,
        { code: `let tab_url; let page_info;`}
      );
      this.setCardArea(tab_url, page_info);
    }
    setPageTitle(tabId, title) {
      // タイトルのセット(loading中はタイトルが入らない場合もあるため, setPageInfoと分けている)
      const tab_url = this.tab_id_url[tabId];
      if (tab_url) {
        this.page_infos[tab_url].setPageTitle(title);
      }
    }
    onTabRemoved(tabId) {
      this.page_infos[this.tab_id_url[tabId]].save();
      delete this.page_infos[this.tab_id_url[tabId]];
      delete this.tab_id_url[tabId];
    }
    encodeUrl(plain_url) {
      let parse_url = url.parse(plain_url);
      let formed_url = `${parse_url.protocol}//${parse_url.hostname}${parse_url.pathname}${parse_url.search || ''}`;
      return encodeURIComponent(formed_url);
    }
    decodeUrl(crypted_url) {
      return decodeURIComponent(crypted_url);
    }
    /****
    * Card Area
    ****/
    setCardArea(tab_url, page_info) {
      // page_info.setPageTitle("Qiitaの記事2");
      console.log("setCardArea", this.page_infos[tab_url]);
      // this.createPageInfo(tab_url);
      // this.setPageTitle(tab_url, tab_title);
      chrome.tabs.executeScript(
        null,
        { code:
          `tab_url    = '${tab_url}';` +
          `page_info  = JSON.parse('${JSON.stringify(page_info.serialize())}');`
        },
        () => {
          chrome.tabs.insertCSS(
            null, { file: "styles/base.css" }
          );
          chrome.tabs.insertCSS(
            null, { file: "styles/card.css" }
          );
          chrome.tabs.executeScript(
            null, { file: "scripts/react_app.js" }
          );
        }
      );
    }
    /****
    * Memo
    ****/
    makeMemo(tabId) {
      console.log("makeMemo");
      const url = this.tab_id_url[tabId];
      const memo = {id: Math.floor(Math.random()*10000), title: "新しいメモ", description: "ダブルクリックで編集", position_x: 0, position_y: 0, width: 300, height: 150, is_open: true};
      this.createMemo(url, memo);
      // chrome.tabs.executeScript(
      //   null, { code: "onChangeState(); " }
      // );
      this.setCardArea(url, this.page_infos[url]);
    }
    createMemo(page_url, memo) {
      console.log("createMemo", page_url, memo);
      this.page_infos[page_url].addMemo(memo);
      this.page_infos[page_url].save();
    }
    updateMemos(page_url, memos) {
      this.page_infos[page_url].setMemos(memos);
      this.page_infos[page_url].save();
    }


    getUserConfig() {
      let value = localStorage['User'];
      if (value) {
        value = JSON.parse(value);
        value.account = window.atob(value.account);
        value.pswd = window.atob(value.pswd);
        return value;
      } else {
        return null;
      }
    }
    setUserConfig(value) {
      value.account = window.btoa(value.account);
      value.pswd = window.btoa(value.pswd);
      localStorage['User'] = JSON.stringify(value);
    }
    deleteUserConfig() {
      localStorage.removeItem('User');
    }
    getMatrixCode() {
      let value = localStorage['MatrixCode'];
      if (value) {
        var val_str = window.atob(window.atob(value));
        return JSON.parse(JSON.parse(val_str));
      } else {
        return null;
      }
    }
    setMatrixCode(value) {
      var val_str = JSON.stringify(JSON.stringify(value));
      var val_enc = window.btoa(window.btoa(val_str));
      localStorage['MatrixCode'] = val_enc;
    }
    deleteMatrixCode() {
      localStorage.removeItem('MatrixCode');
    }
    getIsValid() {
      let is_valid = localStorage['is_valid'];
      if (is_valid) {
        return JSON.parse(is_valid);
      } else {
        return true;
      }
    }
    setIsValid(value) {
      localStorage['is_valid'] = value;
    }
    getOptionPageUrl() {
      return chrome.runtime.getURL("options.html");
    }
    migrateNewVersion() {
      let old_matrix_str = localStorage['password'];
      if (old_matrix_str) {
        var old_matrix = JSON.parse(JSON.parse(old_matrix_str));
        this.setMatrixCode(old_matrix);
        localStorage.removeItem('password');
      }
      let pass = localStorage['pass'];
      if (pass) {
        localStorage.removeItem('pass');
      }
    }
    identifyPage(url) {
      chrome.tabs.executeScript(
        null, {
          file: "scripts/identify_page.js"
        }
      );
    }
    inputUserInfo() {
      chrome.tabs.executeScript(
        null, {
          code: "var usr_pswd = " + JSON.stringify(this.getUserConfig()) + ";" +
            "var is_valid = " + JSON.stringify(this.getIsValid()) + ";"
        },
        function() {
          chrome.tabs.insertCSS(
            null, {
              file: "style/contents.css"
            }
          );
          chrome.tabs.executeScript(
            null, {
              file: "scripts/input_user_info.js"
            }
          );
        }
      );
    }
    inputMatrixCode() {
      chrome.tabs.executeScript(
        null, {
          code: "var matrix_code = " + JSON.stringify(this.getMatrixCode()) + ";" +
            "var is_valid = " + JSON.stringify(this.getIsValid()) + ";"
        },
        function() {
          chrome.tabs.insertCSS(
            null, {
              file: "style/contents.css"
            }
          );
          chrome.tabs.executeScript(
            null, {
              file: "scripts/input_matrix_code.js"
            }
          );
        }
      );
    }
    errorPage() {}
  }

  window.bg = new Background();
});
