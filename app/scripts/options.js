'use strict';
global.jQuery = require('jquery');
const $ = require('jquery');
// import 'jquery/dist/jquery'
// import 'jquery-ui/ui/core'
// import 'jquery-ui/ui/widget'
// import 'jquery-ui/ui/widgets/mouse'
// import 'jquery-ui/ui/widgets/resizable'
require('./lib/jinplace.js');
require('material-design-lite/material');
require('./lib/tiny-draggable.js');
require('./lib/resizable_box.js');

var option;

$(function() {
    class Options {
        constructor() {
            this.start();
        }
        start() {
            this.assignMessages();
            this.assignEventHandlers();
            this.restoreConfigurations();
        }
        saveUser(callback) {
            chrome.runtime.getBackgroundPage((backgroundPage) => {
                let bg       = backgroundPage.bg;
                var user     = {};
                user.account = $("#account_pswd_form [name='account']").val();
                user.pswd    = $("#account_pswd_form [name='pswd']").val();
                var is_valid = (user.account!="" && user.account!="");

                if(is_valid) bg.setUserConfig(user);
                callback(is_valid);
            });
        }
        assignMessages() {
            let hash = {
                "setting_page_title": "opt_setting_page_title",
            };
            for (var key in hash) {
                $("#" + key).html(chrome.i18n.getMessage(hash[key]));
            }
        }
        assignEventHandlers() {
          console.log("options");
          $('.resizable-box').resizableBox({
            minWidth: 240,
            minHeight: 160,
          });
          $('.mdl-card__title').resizableBox({ isWidthResize: false });
          $('.draggable-card').tinyDraggable({ handle: '.handle' });
          // $('.editable').jinplace();

          // // 動いてない
          // $('.draggable-card').resizable({
          //   minHeight: 100,
          //   minWidth: 100
          // });
        }
        restoreConfigurations() {
            chrome.runtime.getBackgroundPage((backgroundPage) => {
                let bg          = backgroundPage.bg;
                var matrix_data = bg.getMatrixCode();
                var usr         = bg.getUserConfig();
                var is_valid    = bg.getIsValid();
                if(matrix_data) option.setMatrix(matrix_data);
                if(usr){
                    $("#account_pswd_form [name='account']").val(usr.account);
                    $("#account_pswd_form [name='pswd']").val(usr.pswd);
                }
                $("#is_valid_checkbox [name='is_valid']").prop("checked", is_valid);
            });
        }
    }

    option = new Options();
});

//
// (function($) {
//   $.fn.tinyDraggable = function(options) {
//     var settings = $.extend({
//       handle: 0,
//       exclude: 0
//     }, options);
//     return this.each(function() {
//       var dx, dy, el = $(this),
//         handle = settings.handle ? $(settings.handle, el) : el;
//       handle.on({
//         mousedown: function(e) {
//           if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) return;
//           e.preventDefault();
//           var os = el.offset();
//           dx = e.pageX - os.left, dy = e.pageY - os.top;
//           $(document).on('mousemove.drag', function(e) {
//             el.offset({
//               top: e.pageY - dy,
//               left: e.pageX - dx
//             });
//           });
//         },
//         mouseup: function(e) {
//           $(document).off('mousemove.drag');
//         }
//       });
//     });
//   }
// }($));
