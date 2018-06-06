const $ = require('jquery');
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MemoCardList from './components/MemoCardList.jsx';

const url = require('url');

export class OptionPage extends Component {
  constructor() {
    super();
    console.log("Memo Extension is running.");
  }
  componentWillMount() {
    const { page_infos, memos, options } = this.props;
    const query = this.parseQuery();
    console.log("query::", query);
    this.setState({
      query: query,
      options: options,
      page_infos: page_infos,
      memos: memos,
    });
    chrome.runtime.sendMessage({ method: 'SEND_PAGE_TRACKING', action_type: 'OPTIONS', page_url: location.pathname });
  }
  componentDidMount() {
    const {query} = this.state;

    this.scrollMemoCardListTo(query.memo);
    this.scrollSideBarTo(query.page_info);
  }
  actions(action) {
    const updated_memos = this.state.memos;
    let index = -1;
    switch (action.type) {
      case 'MAKE_MEMO':
        break;
      case 'UPDATE_TITLE':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        if (updated_memos[index].title === action.title) { break; }
        updated_memos[index].title       = action.title;
        updated_memos[index].updated_at  = new Date().toISOString();
        this.save('UPDATE_TITLE', updated_memos[index]);
        break;
      case 'UPDATE_DESCRIPTION':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        if (updated_memos[index].description === action.description) { break; }
        updated_memos[index].description = action.description;
        updated_memos[index].updated_at  = new Date().toISOString();
        this.save('UPDATE_DESCRIPTION', updated_memos[index]);
        break;
      case 'UPDATE_IS_OPEN':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        updated_memos[index].is_open     = action.is_open;
        updated_memos[index].updated_at  = new Date().toISOString();
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
        this.save('UPDATE_IS_FIXED', updated_memos[index]);
        break;
      case 'DELETE_MEMO':
        index = updated_memos.findIndex(({id}) => id === action.memo_id);
        if (index === -1) { break; }
        var delete_memo   = this.state.memos[index];
        updated_memos.splice(index, 1);
        this.delete(delete_memo);
        break;
      case 'MOVE_MEMO':
      case 'RESIZE_MEMO':
      case 'OPEN_OPTION_PAGE':
        break;
      case 'OPEN_PAGE_INFO':
        this.onClickPageInfo(action.page_info_id);
      default:
        break;
    }
  }
  save(method, updated_memo) {
    chrome.runtime.sendMessage({ method: method, action_type: 'OPTIONS', page_url: updated_memo.page_info.page_url, memo: updated_memo });
    this.reRender();
  }
  delete(memo) {
    chrome.runtime.sendMessage({ method: 'DELETE_MEMO', action_type: 'OPTIONS', memo: memo, page_url: memo.page_info.page_url });
    this.reRender();
  }
  reRender() {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const bg = backgroundPage.bg;
      const page_infos  = bg.getAllPageInfo();
      const memos       = bg.getAllMemos();
      this.setState({page_infos: page_infos, memos: memos});
    });
  }
  open_option_page(memo) {
    chrome.runtime.sendMessage({ method: 'OPEN_OPTION_PAGE', action_type: 'OPTIONS', memo: memo });
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
  sortBy(array, key, reverse = false) {
    const reverse_num = reverse ? -1 : 1;
    return array.sort((a, b) => {
      // console.log(a.id, b.id, a[key], b[key], a[key] > b[key], new Date(a[key]) > new Date(b[key]));
      if (a[key] > b[key]){ return -1 * reverse_num; }
      if (a[key] < b[key]){ return 1 * reverse_num; }
      return 0;
    });
  }
  onClickPageInfo(target='') {
    const {query} = this.state;
    query.page_info = target;
    this.reRender();
    this.setState({query: query});
    // $("#sidebar").animate({scrollTop: $(`#page_info-${query.page_info}`).offset().top - 40});
    this.scrollSideBarTo(query.page_info);
  }
  onChangeSearchQuery(target) {
    const {query} = this.state;
    query.search = target;
    this.reRender();
    this.setState({query: query});
    console.log("onChangeSearchQuery:: ", target);
  }
  onChangeMemoOrder(target) {
    const {query} = this.state;
    query.memo_order = target;
    this.reRender();
    this.setState({query: query});
    console.log("onChangeMemoOrder:: ", target);
  }
  scrollSideBarTo(page_info_id) {
    if(page_info_id && $(`#page_info-${page_info_id}`).length > 0) {
      $("#sidebar .scroll_y").animate({scrollTop: $(`#page_info-${page_info_id}`).offset().top + $("#sidebar .scroll_y").scrollTop() - 94});
    }
  }
  scrollMemoCardListTo(memo_id) {
    if(memo_id && $(`#memo-${memo_id}`).length > 0) {
      $("#MemoCardList").animate({scrollTop: $(`#memo-${memo_id}`).offset().top - 48});
    }
  }
  renderHeader() {
    const {query, options} = this.state;
    const memos_selected = (query.hash === '#memos' || query.hash === '') ? 'selected' : '';
    const settings_selected = query.hash === '#settings' ? 'selected' : '';
    const how_to_use_selected = query.hash === '#how_to_use' ? 'selected' : '';
    return (
      <div id='header'>
        <img className='main-icon' src={`${options.image_url}/icon_128.png`} />
        <h1>{options.assignMessage('app_name')}</h1>
        <div className="nav">
          <a
            href="#memos"
            className={`nav-item ${memos_selected}`}
            onClick={e => {window.location.reload(true)}} >
            {options.assignMessage('memo_header_msg')}
          </a>
          <a
            href="#settings"
            className={`nav-item ${settings_selected}`}
            onClick={e => {window.location.reload(true)}} >
            {options.assignMessage('settings_header_msg')}
          </a>
          <a
            href="#how_to_use"
            className={`nav-item ${how_to_use_selected}`}
            onClick={e => {window.location.reload(true)}} >
            {options.assignMessage('how_to_use_header_msg')}
          </a>
        </div>
      </div>
    );
  }
  renderSidebar() {
    const {options} = this.props;
    const {page_infos, query} = this.state;
    const selected_all = query.page_info ? '' : 'selected';
    const sorted_page_infos = this.sortBy(page_infos, "created_at");
    return (
      <div id='sidebar'>
        <div className={`page_info-item page_info-item--first ${selected_all}`} onClick={() => {this.onClickPageInfo();}}>
          <p>{options.assignMessage('show_all_memo_msg')}</p>
        </div>
        <div className="scroll_y">
          {sorted_page_infos.map((page_info, index) => {
            const url = this.decodeUrl(page_info.page_url);
            const selected = parseInt(query.page_info) === page_info.id ? 'selected' : '';
            return (
              <div
                key={page_info.id}
                id={`page_info-${page_info.id}`}
                className={`page_info-item ${selected}`}
                onClick={() => {this.onClickPageInfo(page_info.id);}} >
                <p>
                  {page_info.fav_icon_url &&
                    <img src={page_info.fav_icon_url} />}
                  {page_info.page_title}
                </p>
                <a href={`${url}`} target="_blank" rel="noreferrer noopener">
                  <img className='button_icon' src={`${options.image_url}/move_page_icon.png`} />
                </a>
                <span className='url_text'>{url}</span>
              </div>);
          })}
          <div className="list_bottom"></div>
        </div>
      </div>
    );
  }
  renderMemos() {
    const {memos, query} = this.state;
    const {options} = this.props;
    let render_memos = memos;
    const memo_order = query.memo_order || 'updated_at';

    if (query.page_info) {
      render_memos = render_memos.filter(memo => memo.page_info_id === parseInt(query.page_info));
    }
    if (query.search) {
      render_memos = render_memos.filter(memo =>
        (memo.title && memo.title.indexOf(query.search) != -1) ||
        (memo.description && memo.description.indexOf(query.search) != -1) ||
        (memo.page_info.page_url && this.decodeUrl(memo.page_info.page_url).indexOf(query.search) != -1) ||
        (memo.page_info.page_title && memo.page_info.page_title.indexOf(query.search) != -1)
      );
    }
    return (
      <div id="memo_list">
        {this.renderSearchBar()}
        <MemoCardList
          memos={this.sortBy(render_memos, memo_order, (memo_order === 'title'))}
          options={options}
          actions={this.actions.bind(this)} />
        <div className="list_bottom"></div>
      </div>
    );
  }
  renderSearchBar() {
    const {options} = this.props;
    return (
      <div id="search_bar">
        <input
          type="text"
          name="search_query"
          placeholder={options.assignMessage('search_query_msg')}
          onChange={e => this.onChangeSearchQuery(e.target.value) } />
        <select
          name="memo_order"
          onChange={e => this.onChangeMemoOrder(e.target.value)} >
          <option value="updated_at">{options.assignMessage('updated_at_sort_option')}</option>
          <option value="created_at">{options.assignMessage('created_at_sort_option')}</option>
          <option value="title">{options.assignMessage('title_sort_option')}</option>
        </select>
      </div>
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
    const {options} = this.props;
    return (
      <div id="container" className='clearfix'>
        <div id="settings">
          <h2>{options.assignMessage('setting_about_this_app')}</h2>
          <ul>
            <li>{options.assignMessage('setting_about_this_app_created_by')}: <a href="https://twitter.com/takumi_bv" target="_blank">@takumi_bv</a></li>
          </ul>
        </div>
      </div>
    );
  }
  renderHowToUsePage() {
    const {options} = this.props;
    return (
      <div id="container" className='clearfix'>
        <div id="how_to_use">
          <h2>{options.assignMessage('how_to_use_header_msg')}</h2>
          <table>
            <tbody>
              <tr>
                <th>{options.assignMessage('usage01')}</th>
                <td><img src={`${options.image_url}/usage01.png`} /></td>
              </tr>
              <tr>
                <th>{options.assignMessage('usage02')}<br />{options.assignMessage('usage02_2')}</th>
                <td><img src={`${options.image_url}/usage02.png`} /></td>
              </tr>
              <tr>
                <th>{options.assignMessage('usage03')}</th>
                <td><img src={`${options.image_url}/usage03.png`} /></td>
              </tr>
              <tr>
                <th>{options.assignMessage('usage04')}</th>
                <td><img src={`${options.image_url}/usage04.png`} /></td>
              </tr>
              <tr>
                <th>{options.assignMessage('usage05')}<br />{options.assignMessage('usage05_2')}</th>
                <td><img src={`${options.image_url}/usage05.png`} /></td>
              </tr>
              <tr>
                <th><a href="#memos" onClick={e => {window.location.reload(true)}}>{options.assignMessage('usage06')}</a>{options.assignMessage('usage06_2')}</th>
                <td><img src={`${options.image_url}/usage06.png`} /></td>
              </tr>
              <tr>
                <th>{options.assignMessage('usage07')}</th>
                <td><img src={`${options.image_url}/usage_function_${options.language}.png`} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  render() {
    const {query} = this.state;
    return(
      <div className='wrapper'>
        {this.renderHeader()}
        {query.hash === '#settings' &&
          this.renderSettingsPage()}
        {query.hash === '#how_to_use' &&
          this.renderHowToUsePage()}
        {(query.hash === '#memos' || query.hash === '') &&
          this.renderMemosPage()}
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
      option_page_url: chrome.extension.getURL('pages/options.html'),
      is_options_page: true,
      assignMessage: chrome.i18n.getMessage,
      language: chrome.i18n.getUILanguage(),
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
      // alert("Memo App Error: このページではメモを表示できません。" + e + tab_url);
      chrome.runtime.sendMessage({ method: 'CANNOT_SHOW_MEMO', msg: e, page_url: tab_url });
    }
});
