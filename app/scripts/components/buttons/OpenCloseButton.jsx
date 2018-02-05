import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class OpenCloseButton extends Button {
  componentWillMount() {
    const {options} = this.props;
    this.icon_name        = ['close_icon', 'open_icon'];
    this.tooltip_title    = [options.assignMessage('minimize_msg'), options.assignMessage('maximize_msg')];
    this.additional_class = ['close-card_btn', 'open-card_btn'];
  }
  componentDidMount() {
  }
  onClick(e) {
    const {actions, is_open, index, memo_id} = this.props;
    const $memo_card = $('#' + $(e.currentTarget).attr('target'));
    if(is_open) {
      $memo_card.animate({
        left: '0'
      }, 200, 'swing', function () {
        $memo_card.addClass('minimize');
        actions({type: 'UPDATE_IS_OPEN', index: index, memo_id: memo_id, is_open: !is_open});
      });
    } else {
      $memo_card.removeClass('minimize');
      actions({type: 'UPDATE_IS_OPEN', index: index, memo_id: memo_id, is_open: !is_open});
    }
  }
  render() {
    const {index, is_open, actions} = this.props;
    const is_open_index = is_open ? 0 : 1;

    return this.renderButton(
      `minimize_btn-${index}`,
      this.icon_name[is_open_index],
      this.tooltip_title[is_open_index],
      this.additional_class[is_open_index],
      `memo-card-${index}`,
      false,
      this.onClick.bind(this)
    );
  }
}
