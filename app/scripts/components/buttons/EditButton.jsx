import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class EditButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    var $target_text    = $('#' + $(e.currentTarget).attr('target'));
    var $target_editor  = $target_text.next('.target-editor');
    var target_text_height = $target_text[0].scrollHeight + 'px';
    $target_text.css('display', 'none');
    $target_editor.val($target_text.html().replace(/<br>/g, '\n'))
      .css('display', '')
      .focus();
    $target_editor.css('height', target_text_height);
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `mode_edit_btn-${index}`,
      'edit_icon',
      'edit',
      'mode_edit_btn',
      `editable-textarea-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
