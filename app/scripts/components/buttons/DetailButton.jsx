import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class DetailButton extends Button {
  componentDidMount() {

  }
  onClick(e) {
    const {actions, index} = this.props;
    actions({type: 'OPEN_OPTION_PAGE', index: index});
  }
  render() {
    const {index} = this.props;
    return this.renderButton(
      `detail_btn-${index}`,
      'move_page_icon',
      'details',
      '',
      ``,
      true,
      this.onClick.bind(this)
    );
  }
}
