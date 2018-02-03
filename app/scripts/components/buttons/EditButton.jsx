import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class EditButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    var $target_text = $('#' + $(e.currentTarget).attr('target'));
    $target_text.dblclick();
  }
  render() {
    const {index, options} = this.props;
    return this.renderButton(
      `mode_edit_btn-${index}`,
      'edit_icon',
      options.assignMessage('edit_msg'),
      'mode_edit_btn',
      `editable-textarea-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
