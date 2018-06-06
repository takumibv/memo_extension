import React, { Component, PropTypes } from 'react';
import EditButton from './buttons/EditButton.jsx';
import DeleteButton from './buttons/DeleteButton.jsx';
import CopyButton from './buttons/CopyButton.jsx';
import OpenCloseButton from './buttons/OpenCloseButton.jsx';
import DetailButton from './buttons/DetailButton.jsx';
import FixedButton from './buttons/FixedButton.jsx';
global.jQuery = require('jquery');
const $ = require('jquery');
require('../lib/jinplace.js');
require('../lib/tiny-draggable.js');
require('../lib/resizable_box.js');
require('../lib/text-editable.js');

export default class MemoCard extends Component {
  componentWillMount() {
    const {index, memo, actions} = this.props;

    if (memo.position_x === null) {
      const card_style = this.cardStyle();
      actions({type: 'MOVE_MEMO', index: index, memo_id: memo.id, position_x: card_style.left, position_y: card_style.top});
    }
  }
  componentDidMount() {
    const {actions, index, memo} = this.props;
    var wH = $(window).height();
    var wW = $(window).width();
    $(`#memo-card-${index}.resizable-box`).resizableBox({
      minWidth: 240,
      minHeight: 160,
    }, (index, w, h) => {
      actions({type: 'RESIZE_MEMO', index: index, memo_id: memo.id, width: w, height: h});
    });
    // $(`#memo-card-${index} .mdl-card__title`).resizableBox({ isWidthResize: false });
    $(`#memo-card-${index}.draggable-card`).tinyDraggable({
      handle: '.handle-card'
    }, (index, top, left) => {
      actions({type: 'MOVE_MEMO', index: index, memo_id: memo.id, position_x: left, position_y: top});
    });
    $(`#memo-card-${index} .editable`).editable({
      target_selector: '.target-editor', bind_action: 'dblclick'
    }, (index, text) => {
      actions({type: 'UPDATE_TITLE', index: index, memo_id: memo.id, title: text});
    });
    $(`#memo-card-${index} .editable-textarea`).editable({
      target_selector: '.target-editor', bind_action: 'dblclick', is_enter_blur: false, is_auto_resize: true
    }, (index, text) => {
      actions({type: 'UPDATE_DESCRIPTION', index: index, memo_id: memo.id, description: text});
    });
  }
  cardStyle() {
    const {memo} = this.props;

    return {
      width: memo.width,
      height: memo.height,
      left: (memo.position_x === null ? window.innerWidth/2 - memo.width/2 : memo.position_x),
      top: (memo.position_y === null ? $(window).scrollTop() + window.innerHeight/2 - memo.height/2 : memo.position_y )
    };
  }
  nl2br(str) {
    const regex = /(<br>)/g;
    return str.split(regex).map(line => {
      return line.match(regex) ? <br/> : line;
    })
  }
  onClick(target='') {
    $(`.mdl-card`).css('z-index', '10000');
    $(`#${target}`).css({'cssText': `${$(`#${target}`).attr('style')} z-index: 10001 !important;`});
  }
  openPageInfo(page_info_id) {
    const {actions} = this.props;
    // only options page
    actions({type: 'OPEN_PAGE_INFO', page_info_id: page_info_id});
  }
  render() {
    const {index, memo, actions, options} = this.props;

    const minimize = memo.is_open ? '' : 'minimize';
    const resizable = memo.is_open ? 'resizable-box' : '';
    const fixed = memo.is_fixed ? 'fixed' : '';
    const card_style = this.cardStyle();
    const created_at = new Date(memo.created_at);
    const created_at_str = `${created_at.getFullYear()}/${created_at.getMonth()+1}/${created_at.getDate()} ${('0'+created_at.getHours()).slice(-2)}:${('0'+created_at.getMinutes()).slice(-2)}`;
    const updated_at = new Date(memo.updated_at);
    const updated_at_str = `${updated_at.getFullYear()}/${updated_at.getMonth()+1}/${updated_at.getDate()} ${('0'+updated_at.getHours()).slice(-2)}:${('0'+updated_at.getMinutes()).slice(-2)}`;
    const page_url = decodeURIComponent(memo.page_info.page_url);

    return (
      <div
        id={`memo-card-${index}`}
        className={`demo-card-wide mdl-card mdl-shadow--2dp draggable-card ${minimize} ${resizable} ${fixed}`}
        style={card_style}
        index={index}
        onClick={() => {this.onClick(`memo-card-${index}`);}}>
        {!options.is_options_page && !memo.is_fixed &&
          <img className='mdl-card__pin_icon' src={`${options.image_url}/pin_icon.png`} />}
        <div id={`memo-${memo.id}`} className="mdl-card__title mdl-card--border">
          {options.is_options_page &&
            <div className="memo_infos">
              <div className="clearfix">
                <p className="date updated_at">{options.assignMessage('updated_at_msg')}: <span>{updated_at_str}</span></p>
                <p className="date created_at">{options.assignMessage('created_at_msg')}: <span>{created_at_str}</span></p>
              </div>
            </div>}
          <div className="handle-card-wrapper handle-card" index={index}>
            <h2 className="mdl-card__title-text">
              <span className="editable" index={index}>{memo.title}</span>
              <input className="target-editor" type="text" />
            </h2>
          </div>
          {options.is_options_page &&
            <div className="memo_infos">
              <div className="clearfix">
                {memo.page_info.fav_icon_url && <img src={memo.page_info.fav_icon_url} />}
                <a className="page_url" href={`${page_url}`} target="_blank" rel="noreferrer noopener">{`${memo.page_info.page_title}`}<br />{page_url}</a>
              </div>
              <a className="page_info_link" onClick={() => {this.openPageInfo(memo.page_info_id);}} rel="noreferrer noopener">{options.assignMessage('this_page_memo_list_msg')}</a>
            </div>}
          {options.is_options_page ?
            (<div className="mdl-card__actions">
              <FixedButton
                key={`fixed_btn-${index}`}
                index={index}
                memo_id={memo.id}
                options={options}
                actions={actions}
                is_fixed={memo.is_fixed} />
              <EditButton
                key={`edit_btn-${index}`}
                index={index}
                memo_id={memo.id}
                options={options}
                actions={actions} />
              <CopyButton
                key={`copy_btn-${index}`}
                index={index}
                memo_id={memo.id}
                options={options}
                actions={actions} />
              <span className="copied-msg-toast">{options.assignMessage('copied_msg')}</span>
              <DeleteButton
                key={`delete_btn-${index}`}
                index={index}
                memo_id={memo.id}
                options={options}
                actions={actions} />
            </div>) :
            (<OpenCloseButton
              key={`open-close_btn-${index}`}
              index={index}
              memo_id={memo.id}
              is_open={memo.is_open}
              options={options}
              actions={actions} />)
          }
        </div>
        <div className="mdl-card__supporting-text">
          <div className="mdl-textfield mdl-js-textfield">
            <p id={`editable-textarea-${index}`} className="editable-textarea" index={index} dangerouslySetInnerHTML={{__html: memo.description}} />
            <textarea className="mdl-textfield__input target-editor" type="text" placeholder="Text lines..."></textarea>
          </div>
        </div>
        {!options.is_options_page &&
          <div className="mdl-card__actions">
            <FixedButton
              key={`fixed_btn-${index}`}
              index={index}
              memo_id={memo.id}
              options={options}
              actions={actions}
              is_fixed={memo.is_fixed} />
            <DetailButton
              key={`detail_btn-${index}`}
              index={index}
              memo_id={memo.id}
              options={options}
              actions={actions} />
            <EditButton
              key={`edit_btn-${index}`}
              index={index}
              memo_id={memo.id}
              options={options}
              actions={actions} />
            <CopyButton
              key={`copy_btn-${index}`}
              index={index}
              memo_id={memo.id}
              options={options}
              actions={actions} />
            <span className="copied-msg-toast">{options.assignMessage('copied_msg')}</span>
            <DeleteButton
              key={`delete_btn-${index}`}
              index={index}
              memo_id={memo.id}
              options={options}
              actions={actions} />
          </div>}
        <textarea style={{display: 'none'}} className="form-for-copy" ></textarea>
      </div>
    );
  }
}
