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
    var wH = $(window).height();
    var wW = $(window).width();
    $('.resizable-box').resizableBox({
      minWidth: 240,
      minHeight: 160,
    }, (w, h) => {console.log(w,h);});
    $('.mdl-card__title').resizableBox({ isWidthResize: false });
    $('.draggable-card').tinyDraggable({ handle: '.handle-card' });
    $('.editable').editable({ target_selector: '.target-editor', bind_action: 'dblclick'});
    $('.editable-textarea').editable({ target_selector: '.target-editor', bind_action: 'dblclick', is_enter_blur: false});

    // $('#react-container-for-memo-extension').prepend("<script defer src='https://code.getmdl.io/1.3.0/material.min.js'></script>");
  }
  changeMemoAttr() {

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
    if(!memo.is_open){
      minimize = 'minimize';
    }
    // actions({type: 'UPDATE_TITLE'});
    return (
      <div id={`memo-card-${index}`} className={`demo-card-wide mdl-card mdl-shadow--2dp resizable-box draggable-card ${minimize}`}>
        <div className="mdl-card__title mdl-card--border">
          <div className="handle-card">
            <h2 className="mdl-card__title-text">
              <span className="editable">{memo.title}</span>
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
            <p id={`editable-textarea-${index}`} className="editable-textarea">{memo.description}</p>
            <textarea className="mdl-textfield__input target-editor" type="text" placeholder="Text lines..."></textarea>
          </div>
        </div>
        <div className="mdl-card__actions">
          <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
            Go detail
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
        <input className="form-for-copy" type="hidden" />
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
