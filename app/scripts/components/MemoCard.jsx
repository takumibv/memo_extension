import React, { Component, PropTypes } from 'react';
import EditButton from './buttons/EditButton.jsx';
import DeleteButton from './buttons/DeleteButton.jsx';
import CopyButton from './buttons/CopyButton.jsx';
import OpenCloseButton from './buttons/OpenCloseButton.jsx';
// import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
// import FlatButton from 'material-ui/Button';
global.jQuery = require('jquery');
const $ = require('jquery');
require('../lib/jinplace.js');
// const material = require('material-design-lite/material');
// const MDLite = require('material-design-lite/material');
// const componentHandler = MDLite.componentHandler;
require('../lib/tiny-draggable.js');
require('../lib/resizable_box.js');
require('../lib/text-editable.js');
// require('react');

export default class MemoCard extends Component {
  componentWillMount() {
    console.log("MDLite");
    // componentHandler.upgradeDom();
  }
  componentDidMount() {
    const {actions, index} = this.props;
    var wH = $(window).height();
    var wW = $(window).width();
    $(`#memo-card-${index}.resizable-box`).resizableBox({
      minWidth: 240,
      minHeight: 160,
    }, (index, w, h) => {
      actions({type: 'RESIZE_MEMO', index: index, width: w, height: h});
    });
    $(`#memo-card-${index} .mdl-card__title`).resizableBox({ isWidthResize: false });
    $(`#memo-card-${index}.draggable-card`).tinyDraggable({
      handle: '.handle-card'
    }, (index, top, left) => {
      actions({type: 'MOVE_MEMO', index: index, position_x: left, position_y: top});
    });
    $(`#memo-card-${index} .editable`).editable({
      target_selector: '.target-editor', bind_action: 'dblclick'
    }, (index, text) => {
      actions({type: 'UPDATE_TITLE', index: index, title: text});
    });
    $(`#memo-card-${index} .editable-textarea`).editable({
      target_selector: '.target-editor', bind_action: 'dblclick', is_enter_blur: false
    }, (index, text) => {
      actions({type: 'UPDATE_DESCRIPTION', index: index, description: text});
    });

    // $('#react-container-for-memo-extension').prepend("<script defer src='https://code.getmdl.io/1.3.0/material.min.js'></script>");
  }
  changeMemoAttr() {

  }
  nl2br(str) {
    const regex = /(<br>)/g;
    return str.split(regex).map(line => {
      return line.match(regex) ? <br/> : line;
    })
  }
  render() {
    const {index, memo, actions} = this.props;
  // //   console.log("card app");
  // //   console.log(MDLite);
  //   // return (
  //   //   <div className="App">
  //   //     <p>Hello World</p>
  //   //   </div>
  //   // );
    let minimize = '';
    if (!memo.is_open) {
      minimize = 'minimize';
    }
    let fixed = '';
    if (memo.is_fixed) {
      fixed = 'fixed';
    }
    const card_style = {
      width: memo.width,
      height: memo.height,
      left: memo.position_x,
      top: (memo.position_y === null ? $(window).scrollTop() : memo.position_y )
    };
    // actions({type: 'UPDATE_TITLE'});
    return (
      <div
        id={`memo-card-${index}`}
        className={`demo-card-wide mdl-card mdl-shadow--2dp resizable-box draggable-card ${minimize} ${fixed}`}
        style={card_style}
        index={index}>
        <div className="mdl-card__title mdl-card--border">
          <div className="handle-card" index={index}>
            <h2 className="mdl-card__title-text">
              <span className="editable" index={index}>{memo.title}</span>
              <input className="target-editor" type="text" />
            </h2>
          </div>

          <OpenCloseButton
            key={`open-close_btn-${index}`}
            index={index}
            is_open={memo.is_open}
            actions={actions} />
        </div>
        <div className="mdl-card__supporting-text">
          <div className="mdl-textfield mdl-js-textfield">
            <p id={`editable-textarea-${index}`} className="editable-textarea" index={index}>{this.nl2br(memo.description)}</p>
            <textarea className="mdl-textfield__input target-editor" type="text" placeholder="Text lines..."></textarea>
          </div>
        </div>
        <div className="mdl-card__actions">
          <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
            detail
          </a>

          <EditButton
            key={`edit_btn-${index}`}
            index={index}
            actions={actions} />
          <CopyButton
            key={`copy_btn-${index}`}
            index={index}
            actions={actions} />
          <span className="copied-msg-toast">Copied.</span>
          <DeleteButton
            key={`delete_btn-${index}`}
            index={index}
            actions={actions} />
        </div>
        <textarea style={{display: 'none'}} className="form-for-copy" ></textarea>
      </div>
    );
  }
  //
  // render() {
  //   return (
  //     <Card>
  //       <CardHeader
  //         title="URL Avatar"
  //         subtitle="Subtitle"
  //         avatar="images/jsa-128.jpg"
  //       />
  //       <CardMedia
  //         overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
  //       >
  //         <img src="images/nature-600-337.jpg" alt="" />
  //       </CardMedia>
  //       <CardTitle title="Card title" subtitle="Card subtitle" />
  //       <CardText>
  //         Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  //         Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
  //         Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
  //         Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
  //       </CardText>
  //       <CardActions>
  //         <FlatButton label="Action1" />
  //         <FlatButton label="Action2" />
  //       </CardActions>
  //     </Card>
  //   )
  // }
}
