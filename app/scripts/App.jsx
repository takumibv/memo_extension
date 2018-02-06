const $ = require('jquery');
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MemoCardList from './components/MemoCardList.jsx';
require('material-design-lite/material');
// require('react');
// require('react-dom');
// require('./components/card.js');
console.log('======= Background Params ======');
console.log(tab_url);
console.log(page_info);
console.log(memos);
console.log(options);
console.log('================================');
if(!$('#react-container-for-memo-extension').length){
  $('body').prepend(
  	"<div id='react-container-for-memo-extension'></div>"
  );
}

export class App extends Component {
  constructor() {
    super();
    console.log("Memo Extension is running.");
  }
  componentWillMount() {
    const { page_info, memos } = this.props;

    this.setState({
      page_url: page_info.page_url,
      page_title: page_info.title,
      memos: memos
    });
  }
  actions(action) {
    switch (action.type) {
      case 'MAKE_MEMO':
        break;
      case 'UPDATE_TITLE':
        var updated_memos = this.state.memos;
        if (updated_memos[action.index].title === action.title) { break; }
        updated_memos[action.index].title       = action.title;
        updated_memos[action.index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_TITLE', updated_memos[action.index]);
        break;
      case 'UPDATE_DESCRIPTION':
        var updated_memos = this.state.memos;
        if (updated_memos[action.index].description === action.description) { break; }
        updated_memos[action.index].description = action.description;
        updated_memos[action.index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_DESCRIPTION', updated_memos[action.index]);
        break;
      case 'UPDATE_IS_OPEN':
        var updated_memos = this.state.memos;
        updated_memos[action.index].is_open     = action.is_open;
        updated_memos[action.index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_IS_OPEN', updated_memos[action.index]);
        break;
      case 'UPDATE_IS_FIXED':
        var updated_memos = this.state.memos;
        updated_memos[action.index].is_fixed     = action.is_fixed;
        const fix_position = updated_memos[action.index].is_fixed ? -1 : 1;
        updated_memos[action.index].position_x += $(window).scrollLeft() * fix_position;
        updated_memos[action.index].position_y += $(window).scrollTop() * fix_position;
        if(updated_memos[action.index].position_x < 0){ updated_memos[action.index].position_x = 0; }
        if(updated_memos[action.index].position_y < 0){ updated_memos[action.index].position_y = 0; }
        updated_memos[action.index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_IS_FIXED', updated_memos[action.index]);
        break;
      case 'DELETE_MEMO':
        var updated_memos = this.state.memos;
        var delete_memo   = this.state.memos[action.index];
        updated_memos.splice(action.index, 1);
        this.setState({memos: updated_memos});
        this.delete(delete_memo);
        break;
      case 'MOVE_MEMO':
        var updated_memos = this.state.memos;
        if (updated_memos[action.index].position_x === action.position_x &&
          updated_memos[action.index].position_y === action.position_y) {
          break;
        }
        updated_memos[action.index].position_x = action.position_x;
        updated_memos[action.index].position_y = action.position_y;
        if (updated_memos[action.index].is_fixed) {
          updated_memos[action.index].position_x -= $(window).scrollLeft();
          updated_memos[action.index].position_y -= $(window).scrollTop();
        }
        if(updated_memos[action.index].position_x < 0){ updated_memos[action.index].position_x = 0; }
        if(updated_memos[action.index].position_y < 0){ updated_memos[action.index].position_y = 0; }
        updated_memos[action.index].updated_at = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('MOVE_MEMO', updated_memos[action.index]);
        break;
      case 'RESIZE_MEMO':
        var updated_memos = this.state.memos;
        updated_memos[action.index].width       = action.width;
        updated_memos[action.index].height      = action.height;
        updated_memos[action.index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('RESIZE_MEMO', updated_memos[action.index]);
        break;
      case 'OPEN_OPTION_PAGE':
        this.open_option_page(this.state.memos[action.index]);
        break;
      default:
        break;
    }
  }
  save(method, updated_memo) {
    chrome.runtime.sendMessage({ method: method, action_type: 'App', page_url: updated_memo.page_info.page_url, memo: updated_memo });
  }
  delete(memo) {
    chrome.runtime.sendMessage({ method: 'DELETE_MEMO', action_type: 'App', memo: memo, page_url: memo.page_info.page_url });
  }
  open_option_page(memo) {
    chrome.runtime.sendMessage({ method: 'OPEN_OPTION_PAGE', memo: memo });
  }
  render() {
    const {page_url, memos} = this.state;
    const {options} = this.props;
    return(
      <MemoCardList
        memos={memos}
        options={options}
        actions={this.actions.bind(this)} />
    );
  }
}

try {
  options.assignMessage = val => { return messages[val]; };
  ReactDOM.render(
    <App page_info={page_info} memos={memos} options={options} />,
    document.getElementById('react-container-for-memo-extension')
  );
} catch (e) {
  chrome.runtime.sendMessage({ method: 'CANNOT_SHOW_MEMO', msg: e, page_url: tab_url });
} finally {

}
