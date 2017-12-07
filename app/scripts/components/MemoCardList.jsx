import React, { Component, PropTypes } from 'react';
import MemoCard from './MemoCard.jsx';
// import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
// import FlatButton from 'material-ui/Button';
global.jQuery = require('jquery');
const $ = require('jquery');

export default class MemoCardList extends Component {
  static makeMemoCard() {

  }
  componentWillMount() {
    console.log("MemoCardList");
    // componentHandler.upgradeDom();
  }
  componentDidMount() {
    // var wH = $(window).height();
    // var wW = $(window).width();
    //
    // console.log();
    // $('.resizable-box').resizableBox({
    //   minWidth: 240,
    //   minHeight: 160,
    // });
    // $('.mdl-card__title').resizableBox({ isWidthResize: false });
    // $('.draggable-card').tinyDraggable({ handle: '.handle-card' });
    // // $('#react-container-for-memo-extension').prepend("<script defer src='https://code.getmdl.io/1.3.0/material.min.js'></script>");
  }
  render() {
    const {page_url, memos, actions} = this.props;
    return (
      <div id="MemoCardList">
        {memos.map((memo, index) => {
          // return null;
          console.log(index, memo);
          return (
            <MemoCard
              key={memo.id}
              id={memo.id}
              index={index}
              memo={memo}
              actions={actions} />);
        })}
      </div>
    );
  }
}
