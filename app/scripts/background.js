// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
const $ = require('jquery');
const url = require('url');
import PageInfo from './model/page_infos.js';
import Memo from './model/memos.js';

// install or Updateして初めて開いた時に呼ばれる。
chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
})

chrome.contextMenus.create({
  title: "メモを追加",
  contexts: ["page"],
  type: "normal",
  onclick: function (info) {
    window.bg.makeMemo(null);
  }
});

$(function() {
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
      console.log("[%04d/%02d/%02d %02d:%02d:%02d] Memo app is Running", d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

      this.page_info = null; // 開いてるページのpage_infoを保持しておく場所
      this.can_show_memo = true; // 開いてるページがメモを表示できるかどうか

      this.options = {
        image_url: chrome.extension.getURL('images'),
        option_page_url: chrome.extension.getURL('pages/options.html')
      }; // resourseファイルのurl

      chrome.browserAction.setBadgeText({
        text: `Hello`
      })
    }
    // Chromeの各種操作イベントに対するイベントハンドラを登録する。
    assignEventHandlers() {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "loading" && tab.url.match(/^http(s?):\/\//)) {
          // ページの読み込みが始まった瞬間呼ばれる .
          window.bg.insertCSS(tabId);
          if (tab.active) {
            // 別タブでローディングしている場合は呼ばれない。
            window.bg.setPageInfo(tabId, tab.url);
          }
        } else if (tab.active && changeInfo.status === "complete" && tab.url.match(/^http(s?):\/\//)) {
          // ページの読み込みが完了したら呼ばれる.
          window.bg.setPageTitle(tabId, tab.title);
        }
      });

      chrome.tabs.onActivated.addListener((activeInfo) => {
        // タブが切り替えられた時/ページが更新された時に呼ばれる.
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
        console.log(this.page_info);
        switch (msg.method) {
          case 'CREATE_MEMO':
            window.bg.createMemo(msg.page_url, msg.memo);
          case 'UPDATE_TITLE':
          case 'UPDATE_DESCRIPTION':
          case 'UPDATE_IS_OPEN':
          case 'UPDATE_IS_FIXED':
          case 'MOVE_MEMO':
          case 'RESIZE_MEMO':
            window.bg.updateMemo(msg.page_url, msg.memo, msg.action_type);
            break;
          case 'DELETE_MEMO':
            window.bg.deleteMemo(msg.memo, msg.action_type);
            break;
          case 'CANNOT_SHOW_MEMO':
            window.bg.setCanShowMemo(false);
            break;
          case 'OPEN_OPTION_PAGE':
            window.bg.openMemoPage(msg.memo.id, msg.memo.page_info_id);
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
      if (page_url.match(/^http(s?):\/\//) === null) {
        this.setCanShowMemo(false);
        return;
      }
      const tab_url  = this.encodeUrl(page_url);
      this.page_info = new PageInfo(tab_url);;

      // 何回も呼ばれる想定
      this.setCardArea();
    }

    setPageTitle(tabId, title) {
      // タイトルのセット(loading中はタイトルが入らない場合もあるため, setPageInfoと分けている)
      if (this.page_info) {
        this.page_info.setPageTitle(title);
      }
    }

    onTabRemoved(tabId) {
      this.page_info.save();
    }

    encodeUrl(plain_url) {
      let parse_url = url.parse(plain_url);
      let formed_url = `${parse_url.protocol}//${parse_url.hostname}${parse_url.pathname}${parse_url.search || ''}`;
      return encodeURIComponent(formed_url);
    }

    decodeUrl(crypted_url) {
      return decodeURIComponent(crypted_url);
    }

    setBadgeNumber(num) {
      let text = num == 0 ? '' : `${num}`;
      chrome.browserAction.setBadgeText({ text: text });
      chrome.browserAction.setBadgeBackgroundColor({color: '#4183C4'});
    }
    setBadgeError() {
      chrome.browserAction.setBadgeText({ text: 'x' });
      chrome.browserAction.setBadgeBackgroundColor({color: '#DB1C21'});
    }
    scrollTo(memo_id) {
      let m = Memo.getMemoById(parseInt(memo_id));
      if (m && !m.is_fixed) {
        chrome.tabs.executeScript(
          null,
          { code: `window.scrollTo(0, ${m.position_y});` }
        );
      }
    }
    /****
    * Card Area
    ****/
    insertCSS(tab_id=null) {
      // 最初の1回のみ
      chrome.tabs.executeScript(
        tab_id,
        { code: `let tab_url; let page_info; let memos; let options;`}
      );
      chrome.tabs.insertCSS(
        tab_id, { file: "styles/base.css" }
      );
      chrome.tabs.insertCSS(
        tab_id, { file: "styles/reset.css" }
      );
      chrome.tabs.insertCSS(
        tab_id, { file: "styles/card.css" }
      );
    }
    setCardArea() {
      // カードの内容を更新するたびに呼ばれる

      this.setBadgeNumber(this.page_info.getMemos().length);

      chrome.tabs.executeScript(
        null,
        { code:
          `tab_url    = '${this.page_info.page_url}';` +
          `page_info  = JSON.parse('${JSON.stringify(this.page_info.serialize())}');` +
          `memos      = JSON.parse('${JSON.stringify(this.page_info.getMemos())}');` +
          `options    = JSON.parse('${JSON.stringify(this.options)}');`
        },
        () => {
          if (chrome.extension.lastError) {
            console.log("executeScript::", chrome.extension.lastError);
            this.setCanShowMemo(false);
            return;
          }
          this.setCanShowMemo(true);
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
      const url = this.page_info.page_url;
      const memo = {id: null, title: "新しいメモ", description: "ダブルクリックで編集", position_x: 0, position_y: null, width: 300, height: 150, is_open: true, is_fixed: false};
      this.updateMemo(url, memo);
      this.setCardArea();
    }

    updateMemo(page_url, memo, action_type=null) {
      let target_memo = Object.assign({}, memo);

      if (action_type === 'OPTIONS') {
        // options page
        new Memo(target_memo).save();
        new PageInfo(null, {id: memo.page_info_id}).checkMemoExistance();
      } else {
        // executeScript
        this.page_info.save();
        target_memo.page_info_id = this.page_info.id;
        new Memo(target_memo).save();
        this.page_info.checkMemoExistance();
      }
    }

    deleteMemo(memo, action_type=null) {
      if (action_type === 'OPTIONS') {
        // options page
        new Memo(memo).delete();
        new PageInfo(null, {id: memo.page_info_id}).checkMemoExistance();
      } else {
        // executeScript
        this.page_info.deleteMemo(memo);
        this.page_info.checkMemoExistance();
        this.setBadgeNumber(this.page_info.getMemos().length);
      }
      // this.setCardArea();
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
    setCanShowMemo(can_show) {
      this.can_show_memo = can_show;
      if (!can_show) { this.setBadgeError(); }
    }

    openOptionPage(memo=null) {
      const param = memo === null ? '' : memo.id;
      chrome.tabs.create({ 'url': `${chrome.extension.getURL('pages/options.html')}#settings` });
      // chrome.runtime.openOptionsPage();
    }
    openMemoPage(memo_id=null, page_info_id=null) {
      let param = memo_id ? `memo=${memo_id}` : '';
      param += page_info_id ? `&page_info=${page_info_id}` : '';
      chrome.tabs.create({ 'url': `${chrome.extension.getURL('pages/options.html')}#memos?${param}` });
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
