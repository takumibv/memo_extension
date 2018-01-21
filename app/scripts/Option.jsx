const $ = require('jquery');
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MemoCardList from './components/MemoCardList.jsx';

const url = require('url');
// require('material-design-lite/material');

export class OptionPage extends Component {
  constructor() {
    super();
    console.log("Memo Extension is running.");
  }
  // getInitialState() {
  //   return {
  //     page_url: page_info.page_url,
  //     page_title: page_info.page_title,
  //     memos: memos
  //     // memos: [
  //     //   {id: 10, title: "memo1", description: "memoです11.", position_x: 0, position_y: 0, width: 300, height: 150, is_open: true},
  //     //   {id: 20, title: "memo2", description: "memoです22.", position_x: 0, position_y: 80, width: 300, height: 120, is_open: false}
  //     // ].concat(page_info.memos)
  //   };
  // }
  componentWillMount() {
    const { page_infos, memos, options } = this.props;
    // console.log(memos);
    // this.state = page_info;
    const query = this.parseQuery();
    console.log("query::", query);
    this.setState({
      // page_url: page_info.page_url,
      // page_title: page_info.title,
      query: query,
      options: options,
      memos: memos
    });
  }
  componentDidMount() {
    const {query} = this.state;
    if(query["memo"]) {
      console.log("moveto", query["memo"], `#memo-${query["memo"]}`);
      console.log($(`#memo-${query["memo"]}`));
      console.log($(`#memo-${query["memo"]}`).offset().top);
      $("#MemoCardList").animate({scrollTop: $(`#memo-${query["memo"]}`).offset().top});
    }
  }
  actions(action) {
    switch (action.type) {
      case 'MAKE_MEMO':
        break;
      case 'UPDATE_TITLE':
        var updated_memos = this.state.memos;
        updated_memos[action.index].title       = action.title;
        updated_memos[action.index].updated_at  = new Date();
        this.setState({memos: updated_memos});
        this.save('UPDATE_TITLE', updated_memos[action.index]);
        break;
      case 'UPDATE_DESCRIPTION':
        var updated_memos = this.state.memos;
        updated_memos[action.index].description = action.description;
        updated_memos[action.index].updated_at  = new Date();
        this.setState({memos: updated_memos});
        this.save('UPDATE_DESCRIPTION', updated_memos[action.index]);
        break;
      case 'UPDATE_IS_OPEN':
        var updated_memos = this.state.memos;
        updated_memos[action.index].is_open     = action.is_open;
        updated_memos[action.index].updated_at  = new Date();
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
        updated_memos[action.index].updated_at  = new Date();
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
        updated_memos[action.index].updated_at = new Date();
        this.setState({memos: updated_memos});
        this.save('MOVE_MEMO', updated_memos[action.index]);
        break;
      case 'RESIZE_MEMO':
        var updated_memos = this.state.memos;
        updated_memos[action.index].width       = action.width;
        updated_memos[action.index].height      = action.height;
        updated_memos[action.index].updated_at  = new Date();
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
  save(action_type, updated_memos) {
    chrome.runtime.sendMessage({ method: action_type, action_type: action_type, page_url: this.state.page_url, memo: updated_memos });
  }
  delete(memo) {
    chrome.runtime.sendMessage({ method: 'DELETE_MEMO', memo: memo, page_url: this.state.page_url });
  }
  open_option_page(memo) {
    chrome.runtime.sendMessage({ method: 'OPEN_OPTION_PAGE', memo: memo });
  }
  encodeUrl(plain_url) {
    let parse_url = url.parse(plain_url);
    let formed_url = `${parse_url.protocol}//${parse_url.hostname}${parse_url.pathname}${parse_url.search || ''}`;
    return encodeURIComponent(formed_url);
  }
  decodeUrl(crypted_url) {
    return decodeURIComponent(crypted_url);
  }
  parseQuery() {
    console.log("parseQuery", location.search);
    let query = {};
    if (location.hash.split('?')[1]) {
      query = location.hash.split('?')[1].split('&').reduce(function(obj, v) {
        var pair = v.split('=');
        obj[pair[0]] = pair[1];
        return obj;
      }, {});
    }
    query.hash = location.hash.split('?')[0];
    return query;
  }
  sortBy(array, key) {
    return array.sort((a, b) => {
      if (a[key] > b[key]){ return -1; }
      if (a[key] < b[key]){ return 1; }
      return 0;
    });
  }
  onClickPageInfo(e) {
    const {query} = this.state;
    query.page_info = $(e.target).attr("target");
    this.setState({query: query})
  }
  renderHeader() {
    const {query} = this.state;
    const memos_selected = (!query.hash || query.hash === '#memos') ? 'selected' : '';
    const settings_selected = query.hash === '#settings' ? 'selected' : '';
    return (
      <div id='header'>
        <h1>Option Page</h1>
        <div className="nav">
          <a href="#memos" className={`nav-item ${memos_selected}`} onClick={e => {window.location.reload(true)}}>Memos</a>
          <a href="#settings" className={`nav-item ${settings_selected}`} onClick={e => {window.location.reload(true)}}>Settings</a>
        </div>
      </div>
    );
  }
  renderTabbar() {
    return (
      <div id="tabbar">
        <a href="#scroll-tab-2" className="mdl-layout__tab">Tab 1</a>
        <a href="#scroll-tab-3" className="mdl-layout__tab">Tab 2</a>
      </div>
    );
  }
  renderSidebar() {
    const {page_infos} = this.props;
    const {query} = this.state;
    const selected_all = query.page_info ? '' : 'selected';
    return (
      <div id='sidebar'>
        <div className={`page_info-item ${selected_all}`} onClick={this.onClickPageInfo.bind(this)}>
          <p>{'全て表示'}</p>
        </div>
        {page_infos.map((page_info, index) => {
          const url = this.decodeUrl(page_info.page_url);
          const selected = parseInt(query.page_info) === page_info.id ? 'selected' : '';
          return (
            <div className={`page_info-item ${selected}`} onClick={this.onClickPageInfo.bind(this)} target={`${page_info.id}`}>
              <p>{page_info.page_title}</p>
              <a href={`${url}`} target="_blank" rel="noreferrer noopener">{url}</a>
            </div>);
        })}
      </div>
    );
  }
  renderMemos() {
    const {memos, query} = this.state;
    const {options} = this.props;
    const render_memos = query.page_info ? memos.filter(memo => memo.page_info_id === parseInt(query.page_info)) : memos;
    const sort_by = 'updated_at';
    return (
      <MemoCardList
        memos={this.sortBy(render_memos, sort_by)}
        options={options}
        actions={this.actions.bind(this)} />
    );
  }
  renderMemosPage() {
    return (
      <div id="container" className='clearfix'>
        {this.renderSidebar()}
        {this.renderMemos()}
      </div>
    );
  }
  renderSettingsPage() {
    return (
      <div id="container" className='clearfix'>
        settings
      </div>
    );
  }
  render() {
    const {query} = this.state;
    return(
      <div className='wrapper'>
        {this.renderHeader()}
        {query.hash === '#settings' ?
          this.renderSettingsPage() :
          this.renderMemosPage()
        }
      </div>
    );
  }
}

if(!$('#react-container-for-memo-extension').length){
  $('body').prepend(
  	"<div id='react-container-for-memo-extension'></div>"
  );
}

chrome.runtime.getBackgroundPage((backgroundPage) => {
    console.log("getBackgroundPage");
    let bg            = backgroundPage.bg;
    const page_infos  = bg.getAllPageInfo();
    const memos       = bg.getAllMemos();
    const options = {
      image_url: chrome.extension.getURL('images'),
      option_page_url: chrome.extension.getURL('pages/options.html')
    };

    console.log('======= Background Params ======');
    console.log(page_infos);
    console.log(memos);
    console.log(options);
    console.log('================================');

    try {
      ReactDOM.render(
        <OptionPage page_infos={page_infos} memos={memos} options={options} />,
        document.getElementById('react-container-for-memo-extension')
      );
    } catch (e) {
      alert("Memo App Error: このページではメモを表示できません。" + e + tab_url);
      chrome.runtime.sendMessage({ method: 'CANNOT_SHOW_MEMO', msg: e, page_url: tab_url });
    }
});
