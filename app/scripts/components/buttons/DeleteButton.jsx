import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class DeleteButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const {actions, index, memo_id, options} = this.props;
    if(confirm(options.assignMessage('confirm_remove_memo_msg'))) {
      actions({type: 'DELETE_MEMO', index: index, memo_id: memo_id});
    }
  }
  render() {
    const {index, options} = this.props;
    return this.renderButton(
      `delete_btn-${index}`,
      'trash_icon',
      options.assignMessage('delete_msg'),
      'float-right',
      `delete_btn-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
