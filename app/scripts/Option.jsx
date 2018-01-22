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
    // $(".mdl-card:last-child").css('margin-bottom', window.innerHeight - 100);
    this.scrollMemoCardListTo(query.memo);
    this.scrollSideBarTo(query.page_info);
  }
  actions(action) {
    const updated_memos = this.state.memos;
    let index = updated_memos.findIndex(({id}) => id === action.memo_id);
    switch (action.type) {
      case 'MAKE_MEMO':
        break;
      case 'UPDATE_TITLE':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        if (updated_memos[index].title === action.title) { break; }
        updated_memos[index].title       = action.title;
        updated_memos[index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_TITLE', updated_memos[index]);
        break;
      case 'UPDATE_DESCRIPTION':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        if (updated_memos[index].description === action.description) { break; }
        updated_memos[index].description = action.description;
        updated_memos[index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_DESCRIPTION', updated_memos[index]);
        break;
      case 'UPDATE_IS_OPEN':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        updated_memos[index].is_open     = action.is_open;
        updated_memos[index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_IS_OPEN', updated_memos[index]);
        break;
      case 'UPDATE_IS_FIXED':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        updated_memos[index].is_fixed     = action.is_fixed;
        const fix_position = updated_memos[index].is_fixed ? -1 : 1;
        updated_memos[index].position_x += $(window).scrollLeft() * fix_position;
        updated_memos[index].position_y += $(window).scrollTop() * fix_position;
        if(updated_memos[index].position_x < 0){ updated_memos[index].position_x = 0; }
        if(updated_memos[index].position_y < 0){ updated_memos[index].position_y = 0; }
        updated_memos[index].updated_at  = new Date().toISOString();
        this.setState({memos: updated_memos});
        this.save('UPDATE_IS_FIXED', updated_memos[index]);
        break;
      case 'DELETE_MEMO':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        var delete_memo   = this.state.memos[index];
        updated_memos.splice(index, 1);
        this.setState({memos: updated_memos});
        this.delete(delete_memo);
        break;
      case 'MOVE_MEMO':
      case 'RESIZE_MEMO':
      case 'OPEN_OPTION_PAGE':
        break;
      default:
        break;
    }
  }
  save(action_type, updated_memo) {
    chrome.runtime.sendMessage({ method: action_type, action_type: action_type, page_url: updated_memo.page_url, memo: updated_memo });
  }
  delete(memo) {
    chrome.runtime.sendMessage({ method: 'DELETE_MEMO', memo: memo, page_url: memo.page_url });
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
      // console.log(a.id, b.id, a[key], b[key], a[key] > b[key], new Date(a[key]) > new Date(b[key]));
      if (a[key] > b[key]){ return -1; }
      if (a[key] < b[key]){ return 1; }
      return 0;
    });
  }
  onClickPageInfo(target='') {
    const {query} = this.state;
    query.page_info = target;
    this.setState({query: query});
    // $("#sidebar").animate({scrollTop: $(`#page_info-${query.page_info}`).offset().top - 40});
    this.scrollSideBarTo(query.page_info);
  }
  scrollSideBarTo(page_info_id) {
    if(page_info_id && $(`#page_info-${page_info_id}`).length > 0) {
      $("#sidebar").animate({scrollTop: $(`#page_info-${page_info_id}`).offset().top - 40});
    }
  }
  scrollMemoCardListTo(memo_id) {
    if(memo_id && $(`#memo-${memo_id}`).length > 0) {
      $("#MemoCardList").animate({scrollTop: $(`#memo-${memo_id}`).offset().top - 40});
    }
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
    const {page_infos, options} = this.props;
    const {query} = this.state;
    const selected_all = query.page_info ? '' : 'selected';
    const sorted_page_infos = this.sortBy(page_infos, "created_at");
    return (
      <div id='sidebar'>
        <div className={`page_info-item ${selected_all}`} onClick={() => {this.onClickPageInfo();}}>
          <p>{'全て表示'}</p>
        </div>
        {page_infos.map((page_info, index) => {
          const url = this.decodeUrl(page_info.page_url);
          const selected = parseInt(query.page_info) === page_info.id ? 'selected' : '';
          return (
            <div key={page_info.id} id={`page_info-${page_info.id}`} className={`page_info-item ${selected}`} onClick={() => {this.onClickPageInfo(page_info.id);}}>
              <p>{page_info.page_title}</p>
              <a href={`${url}`} target="_blank" rel="noreferrer noopener"><img className='button_icon' src={`${options.image_url}/move_page_icon.png`} /></a>
              <span className='url_text'>{url}</span>
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
