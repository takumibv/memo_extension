import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class DetailButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const {actions, index, memo_id} = this.props;
    actions({type: 'OPEN_OPTION_PAGE', index: index, memo_id: memo_id});
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `detail_btn-${index}`,
      'move_page_icon',
      'details',
      'detail_btn',
      ``,
      true,
      this.onClick.bind(this)
    );
  }
}
