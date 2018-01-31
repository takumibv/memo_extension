import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class CopyButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const $target_text = $('#' + $(e.currentTarget).attr('target'));
    var copy_text = "";
    copy_text += $target_text.find(".mdl-card__title-text span").html().replace(/<br>/g, '\n').replace(/<a href=\"((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))\">/g, '').replace(/<\/a>/g, '');
    copy_text += "\n";
    copy_text += $target_text.find(".mdl-textfield p").html().replace(/<br>/g, '\n').replace(/<a href=\"((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))\">/g, '').replace(/<\/a>/g, '');

    const tmp_form = $target_text.find('textarea.form-for-copy');
    tmp_form.val(copy_text);
    tmp_form.css("display", "block").select();
    document.execCommand('copy');
    tmp_form.css("display", "none");
    this.success_toast($target_text.find(".copied-msg-toast"));
  }
  success_toast($toast) {
    $toast.css({display: 'initial'});
    setTimeout(function(){ $toast.fadeOut() }, 500);
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `content_copy_btn-${index}`,
      'copy_icon',
      'copy clip board',
      '',
      `memo-card-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
