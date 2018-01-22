import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class DeleteButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const {actions, index, memo_id} = this.props;
    if(confirm("本当に削除しますか?")) {
      actions({type: 'DELETE_MEMO', index: index, memo_id: memo_id});
    }
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `delete_btn-${index}`,
      'trash_icon',
      'delete',
      'float-right',
      `delete_btn-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}
