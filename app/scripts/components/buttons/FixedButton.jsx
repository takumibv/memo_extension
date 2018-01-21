import React, { Component, PropTypes } from 'react';
import Button from './Button.jsx';
const $ = require('jquery');

export default class FixedButton extends Button {
  componentWillMount() {
    this.icon_name        = ['pin_rm_icon', 'pin_icon'];
    this.tooltip_title    = ['Remove Pin', 'Pin memo'];
    this.additional_class = ['pinned pin_btn', 'pin_btn'];
  }
  componentDidMount() {
  }
  onClick(e) {
    const {actions, is_fixed, index} = this.props;
    const $memo_card = $('#' + $(e.currentTarget).attr('target'));
    if(is_fixed) {
      $memo_card.removeClass('fixed');
      actions({type: 'UPDATE_IS_FIXED', index: index, is_fixed: !is_fixed});
    } else {
      $memo_card.addClass('fixed');
      actions({type: 'UPDATE_IS_FIXED', index: index, is_fixed: !is_fixed});
    }
  }
  render() {
    const {index, is_fixed, actions} = this.props;
    const is_fixed_index = is_fixed ? 0 : 1;

    return this.renderButton(
      `fixed_btn-${index}`,
      this.icon_name[is_fixed_index],
      this.tooltip_title[is_fixed_index],
      this.additional_class[is_fixed_index],
      `memo-card-${index}`,
      true,
      this.onClick.bind(this)
    );
  }
}