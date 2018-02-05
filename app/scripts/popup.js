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
        "make_memo_button_msg": "make_memo_button_msg",
        "setting_button_msg": "setting_button_msg",
        "menu_button_msg": "menu_button_msg",
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
          $('#page_infos').append(this.renderNoMemoMsg(chrome.i18n.getMessage('cannot_show_memo_msg')));
          $('#make_memo_button').prop("disabled", true);
        } else if (memos.length === 0) {
          $('#page_infos').append(this.renderNoMemoMsg(chrome.i18n.getMessage('no_memo_msg')));
        } else {
          for(let i in memos) {
            $('#page_infos').append(this.renderMemo(memos[i]));
          }
        }
      });
    }
  }

  popup = new Popup();
});
