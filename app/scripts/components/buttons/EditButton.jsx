import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class EditButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    var $target_text    = $('#' + $(e.currentTarget).attr('target'));
    var $target_editor  = $target_text.next('.target-editor');
    $target_text.css('display', 'none');
    $target_editor.val($target_text.html().replace(/<br>/g, '\n'))
      .css('display', '')
      .focus();
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `mode_edit_btn-${index}`,
      'mode_edit',
      'edit',
      'mode_edit_btn',
      `editable-textarea-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
