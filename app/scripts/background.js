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
    }
    // Chromeの各種操作イベントに対するイベントハンドラを登録する。
    assignEventHandlers() {
      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        // タブがupdate
        // if (changeInfo.status == "complete" && tab.url.indexOf(ACCESS_URL) != -1) {
        //   window.bg.identifyPage(tab.url);
        // }
        if (changeInfo.status == "loading") {
          window.bg.onTabLoading(tabId, changeInfo, tab);
        } else if (changeInfo.status == "complete") {
          window.bg.onTabUpdated(tabId, changeInfo, tab);
        }
      });
      chrome.runtime.onMessage.addListener(function(msg, sender, res) {
        // if (msg.id == "identify_page") {
        //   /* page_type
        //    * 1: Account、Passwordの入力ページ
        //    * 2: マトリックスコード３つの入力ページ
        //    * 3: エラーページ
        //    * 4: その他,
        //    ****/
        //   var page_type = msg.page_type;
        //   switch (page_type) {
        //     case 1:
        //       window.bg.inputUserInfo();
        //       break;
        //     case 2:
        //       window.bg.inputMatrixCode();
        //       break;
        //     case 3:
        //       window.bg.errorPage();
        //       break;
        //     default:
        //       break;
        //   }
        // } else if (msg.id == "open_options_page") {
        //   chrome.runtime.openOptionsPage();
        // }
      });
    }
    onTabLoading(tabId, changeInfo, tab) {
      /***
      * 1. URL形成
      * 2. ローカルストレージ探索
      * 3. カードセット
      ***/
      const tab_url   = this.encodeUrl(tab.url);
      // const page_info = this.getPageInfoByUrl(tab_url);
      const page_info = new PageInfo(tab_url);
      this.page_infos[tab_url] = page_info;
      this.setCardArea(tab_url, page_info);
    }
    onTabUpdated(tabId, changeInfo, tab) {
      /***
      * タイトルのセット(loading中はタイトルが入らない場合もあるため)
      ***/
      const tab_url = this.encodeUrl(tab.url);
      this.page_infos[tab_url].setPageTitle(tab.title);
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
      console.log(this.page_infos);
      // this.createPageInfo(tab_url);
      // this.setPageTitle(tab_url, tab_title);
      chrome.tabs.executeScript(
        null,
        { code:
          `const tab_url    = '${tab_url}';` +
          `const page_info  = JSON.parse('${JSON.stringify(page_info.serialize())}');`
        },
        function() {
          chrome.tabs.insertCSS(
            null, {
              file: "styles/base.css"
            }
          );
          chrome.tabs.insertCSS(
            null, {
              file: "styles/card.css"
            }
          );
          chrome.tabs.executeScript(
            null, {
              file: "scripts/react_app.js"
            }
          );
        }
      );
    }
    /****
    * Memo
    ****/
    createMemo(page_url, memo) {

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
