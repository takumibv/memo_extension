import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class DeleteButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const {actions, index} = this.props;
    if(confirm("本当に削除しますか?")) {
      actions({type: 'DELETE_MEMO', index: index});
    }
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `delete_btn-${index}`,
      'delete',
      'delete',
      'float-right',
      `delete_btn-${index}`,
      this.onClick.bind(this)
    );
  }
}
