import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class CopyButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const $target_text = $('#' + $(e.currentTarget).attr('target'));
    var copy_text = "";
    copy_text += $target_text.find(".mdl-card__title-text span").text();
    copy_text += " ";
    copy_text += $target_text.find(".mdl-textfield p").text();

    const tmp_form = $target_text.find('input.form-for-copy');
    tmp_form.val(copy_text);
    tmp_form.attr("type", "text").select();
    document.execCommand('copy');
    tmp_form.attr("type", "hidden");
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
      'content_copy',
      'copy clip board',
      '',
      `memo-card-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
