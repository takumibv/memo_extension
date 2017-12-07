import React, { Component } from 'react';

export default class Button extends Component {
  renderButton(
    button_id, icon_name, tooltip_title, additional_class='', target='', onclick=null
  ) {
    return(
      <button
        id={button_id}
        className={`${additional_class} mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect`}
        target={target}
        onClick={onclick} >
        <i className="material-icons">{icon_name}</i>
        <div className="mdl-tooltip" data-mdl-for={button_id}>{tooltip_title}</div>
      </button>
    );
  }
  render() {/* Override me */}
  onClick(e) {/* Override me */}
}
