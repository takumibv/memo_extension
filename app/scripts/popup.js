const $ = require('jquery');
require('material-design-lite/material');

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
      this.restoreConfigurations();
      this.setDefaultSize();
    }
    assignMessages() {
      // 文言の割り当て
      let hash = {
        "usage_msg_1": "pop_usage_msg_1",
        // "make_memo_button" : "make_memo_button"
      };
      for (var key in hash) {
        $("#" + key).html(chrome.i18n.getMessage(hash[key]));
      }
    }
    assignEventHandlers() {
      $(document).on('click', '.makeMemo', e => {
        this.onClickMakeMemoButton();
        window.close();
      });

      $(document).on('click', '#setting_button', e => {
        this.onClickOpenSettingPageButton();
        window.close();
      });

      $(document).on('click', '#menu_button', e => {
        this.onClickOpenMemoPageButton(null);
        window.close();
      });

      $(document).on('click', '.memo .move_position-button', e => {
        this.onClickMovePositionButton($(e.currentTarget).attr('target'));
      });

      $(document).on('click', '.memo .open_option-button', e => {
        this.onClickOpenMemoPageButton($(e.currentTarget).attr('target'));
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
    onClickMakeMemoButton() {
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        backgroundPage.bg.makeMemo(this.tabId);
      });
    }
    onClickOpenSettingPageButton() {
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        backgroundPage.bg.openOptionPage();
      });
    }
    onClickOpenMemoPageButton(memo_id) {
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        backgroundPage.bg.openMemoPage(memo_id);
      });
    }
    onClickMovePositionButton(memo_id) {
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        backgroundPage.bg.scrollTo(memo_id);
      });
    }
    renderMemo(memo) {
      const disabled = memo.is_fixed ? 'disabled' : '';
      return (`<div id='memo-${memo.id}' class="memo mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <span>${memo.title}</span>
                </span>
                <button class="move_position-button mdl-list__item-secondary-action mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" ${disabled} target='${memo.id}'>
                  <i class="material-icons">keyboard_arrow_right</i>
                </button>
                <button class="open_option-button mdl-list__item-secondary-action mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" target='${memo.id}'>
                  <i class="material-icons">info</i>
                </button>
              </div>`);
    }
    renderNoMemoMsg(msg) {
      return (`<div class="memo mdl-list__item">
                <span>${msg}</span>
              </div>`);
    }
    restoreConfigurations(memo) {
      // バックグラウンドから現状の設定値を持ってきて、UIにセットする。
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        const bg = backgroundPage.bg;
        const page_url = bg.page_info.page_url;
        const memos = bg.page_info.getMemos();

        if (!bg.canShowMemo()) {
          $('#page_infos').append(this.renderNoMemoMsg('このページではメモを表示できません。'));
          $('#make_memo_button').prop("disabled", true);
        } else if (memos.length === 0) {
          $('#page_infos').append(this.renderNoMemoMsg('メモがありません。'));
        } else {
          for(let i in memos) {
            $('#page_infos').append(this.renderMemo(memos[i]));
          }
        }

        // var is_valid = bg.getIsValid();
        // $("#is_valid_checkbox [name='is_valid']").prop("checked", is_valid);
      });
    }
  }

  popup = new Popup();
});
