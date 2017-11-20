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
    setDefaultSize() {
      this.w = $(document).width();
      this.h = $(document).height();
    }
    restoreConfigurations() {
      // バックグラウンドから現状の設定値を持ってきて、UIにセットする。
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        let bg = backgroundPage.bg;
        var is_valid = bg.getIsValid();
        $("#is_valid_checkbox [name='is_valid']").prop("checked", is_valid);
      });
    }
  }

  popup = new Popup();
});