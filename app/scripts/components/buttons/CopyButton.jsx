import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class CopyButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    var $target_text = $('#' + $(e.currentTarget).attr('target'));
    alert("copied!");
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `content_copy_btn-${index}`,
      'content_copy',
      'copy clip board',
      '',
      `memo-card-${index}`,
      this.onClick.bind(this)
    );
  }
}
