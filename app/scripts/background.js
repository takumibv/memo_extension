// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
const $ = require('jquery');

// install or Updateして初めて開いた時に呼ばれる。
chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
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
      const d = new Date();
      console.log("[%04d/%02d/%02d %02d:%02d:%02d] Memo app is Running", d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
    }
    // Chromeの各種操作イベントに対するイベントハンドラを登録する。
    assignEventHandlers() {
      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        // タブがupdate
        // if (changeInfo.status == "complete" && tab.url.indexOf(ACCESS_URL) != -1) {
        //   window.bg.identifyPage(tab.url);
        // }
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