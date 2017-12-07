/**
* クリックすると編集可能になるプラグイン
**/

(function($) {
  $.fn.editable = function(userOptions) {
    var elements = this;
    return this.each(function() {
      var defaults = {
        target_text_selector: this,   // 変更対象のテキスト
        target_editor_selector: this, // 変更時のエディタ
        bind_action: 'click',         // 変更アクション
        is_enter_blur: true           // "Enter"キーでblur処理をするか(falseの場合"ctrl+Enter"でblur)
      };
      defaults.handle_button = defaults.target_text_selector; // 変更ボタン
      var option = $.extend(defaults, userOptions);

      var $handle_button  = $(option.handle_button);
      var $target_text    = $(option.target_text_selector);
      var $target_editor  = $target_text.next(option.target_editor_selector);

      $target_editor.css('display', 'none');

      $handle_button.on(option.bind_action, function(){
        $target_text.css('display', 'none');
        $target_editor.val($target_text.html().replace(/<br>/g, '\n'))
          .css('display', '')
          .focus();
        if($target_editor[0].nodeName === 'INPUT') {
          $target_editor.val($target_text.text());
        } else if($target_editor[0].nodeName === 'TEXTAREA') {
          $target_editor.html($target_text.text());
        }
      });
      $target_editor.on({
        'blur': function(){
          var text = $(this).val();
          $(this).css('display', 'none');
          $target_text.html(escape_html(text))
            .css('display', '');
        },
        'keypress': function(e){
          if ( option.is_enter_blur && e.which === 13 ) {
            $(this).blur();
        		return false;
        	}
        }
      });
    });
  };

  function escape_html (string) {
    if(typeof string !== 'string') {
      return string;
    }
    return string.replace(/[&'`"<>]/g, function(match) {
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    }).replace(/\r?\n/g, '<br>');
  }
})(jQuery);
