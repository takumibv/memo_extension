const $ = require('jquery');

var popup;
$(function() {
  class Popup {
    constructor() {
      this.start();
    }
    start() {
      this.assignMessages();
      this.assignEventHandlers();
      this.setProps();
      this.setDefaultSize();
      this.restoreConfigurations();
    }
    assignMessages() {
      // 文言の割り当て
      let hash = {
        "usage_msg_1": "pop_usage_msg_1",
      };
      for (var key in hash) {
        $("#" + key).html(chrome.i18n.getMessage(hash[key]));
      }
    }
    assignEventHandlers() {
      $('.makeMemo').on('click', (e) => {
        this.makeMemo();
        window.close();
      });
      // イベントハンドラ設置
      // $('#usageModal').on('show.bs.modal', function(event) {
      //   var button = $(event.relatedTarget); // Button that triggered the modal
      //   var recipient = button.data('whatever'); // Extract info from data-* attributes
      //   var modal = $(this);
      //   modal.data('bs.modal').handleUpdate();
      //   $("body").css({
      //     height: "400px",
      //     width: "700px"
      //   });
      // });
    }
    setProps() {
      const query = { active: true, currentWindow: true };
      chrome.tabs.query(query, (tab) => {
        this.tabId  = tab[0].id;
        this.url    = tab[0].url;
      });
    }
    setDefaultSize() {
      this.w = $(document).width();
      this.h = $(document).height();
    }
    makeMemo() {
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        let bg = backgroundPage.bg;
        bg.makeMemo(this.tabId);
      });
    }
    restoreConfigurations() {
      // バックグラウンドから現状の設定値を持ってきて、UIにセットする。
      // chrome.runtime.getBackgroundPage((backgroundPage) => {
      //   let bg = backgroundPage.bg;
      //   var is_valid = bg.getIsValid();
      //   $("#is_valid_checkbox [name='is_valid']").prop("checked", is_valid);
      // });
    }
  }

  popup = new Popup();
});
