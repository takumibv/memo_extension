import React, { Component, PropTypes } from 'react';
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
// require('react');

export default class MemoCard extends Component {
  componentWillMount() {
    console.log("MDLite");
    // componentHandler.upgradeDom();
  }
  componentDidMount() {
    var wH = $(window).height();
    var wW = $(window).width();

    console.log();
    $('.resizable-box').resizableBox({
      minWidth: 240,
      minHeight: 160,
    });
    $('.mdl-card__title').resizableBox({ isWidthResize: false });
    $('.draggable-card').tinyDraggable({ handle: '.handle-card' });
    // $('#react-container-for-memo-extension').prepend("<script defer src='https://code.getmdl.io/1.3.0/material.min.js'></script>");
  }
  render() {
    const {index, title, description} = this.props;
  // //   console.log("card app");
  // //   console.log(MDLite);
  //   // return (
  //   //   <div className="App">
  //   //     <p>Hello World</p>
  //   //   </div>
  //   // );
    return (
      <div className="demo-card-wide mdl-card mdl-shadow--2dp resizable-box draggable-card">
        <div className="mdl-card__title mdl-card--border">
          <div className="handle-card">
            <h2 className="mdl-card__title-text"><span className="editable">{title}</span></h2>
          </div>

          <button id={`minimize_btn-${index}`} className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect close-card_btn">
            <i className="material-icons">keyboard_arrow_left</i>
          </button>
          <div className="mdl-tooltip" data-mdl-for={`minimize_btn-${index}`}>minimize</div>
        </div>
        <div className="mdl-card__supporting-text">
          <div className="mdl-textfield mdl-js-textfield">
            <textarea className="mdl-textfield__input" type="text" placeholder="Text lines...">{description}</textarea>
          </div>
        </div>
        <div className="mdl-card__actions">
          <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
            Go detail
          </a>

          <button id={`mode_edit_btn-${index}`} className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
            <i className="material-icons">mode_edit</i>
          </button>
          <div className="mdl-tooltip" data-mdl-for={`mode_edit_btn-${index}`}>edit</div>

          <button id={`save_btn-${index}`} className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
            <i className="material-icons">save</i>
          </button>
          <div className="mdl-tooltip" data-mdl-for={`save_btn-${index}`}>save</div>

          <button id={`content_copy_btn-${index}`} className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
            <i className="material-icons">content_copy</i>
          </button>
          <div className="mdl-tooltip" data-mdl-for={`content_copy_btn-${index}`}>copy clip board</div>

          <button id={`delete_btn-${index}`} className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect float-right">
            <i className="material-icons">delete</i>
          </button>
          <div className="mdl-tooltip" data-mdl-for={`delete_btn-${index}`}>delete</div>
        </div>
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
