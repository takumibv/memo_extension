import React, { Component, PropTypes } from 'react';
import MemoCard from './MemoCard.jsx';
global.jQuery = require('jquery');
const $ = require('jquery');

export default class MemoCardList extends Component {
  render() {
    const {memos, actions, options} = this.props;
    return (
      <div id="MemoCardList">
        {memos.map((memo, index) => {
          return (
            <MemoCard
              key={memo.id}
              id={memo.id}
              index={index}
              memo={memo}
              options={options}
              actions={actions} />);
        })}
        {options.is_options_page && memos.length === 0 &&
          <div
            className={`demo-card-wide no-memo-msg`} >
            <p>{options.assignMessage('no_memo_msg')}</p>
          </div>
        }
      </div>
    );
  }
}
