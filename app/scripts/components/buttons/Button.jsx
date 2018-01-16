import React, { Component } from 'react';

export default class Button extends Component {
  renderButton(
    button_id, icon_name, tooltip_title, additional_class='', target='',
    is_toast_top, onclick=null
  ) {
    const tooltip_top = is_toast_top ? 'mdl-tooltip--top' : '';
    const {options} = this.props;
    return(
      <button
        id={button_id}
        className={`${additional_class} mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect`}
        target={target}
        onClick={onclick} >
        <img className='button_icon' src={`${options.image_url}/${icon_name}.png`} />
        <div className={`mdl-tooltip ${tooltip_top}`} data-mdl-for={button_id}>{tooltip_title}</div>
      </button>
    );
  }
  render() {/* Override me */}
  onClick(e) {/* Override me */}
}
