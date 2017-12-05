const $ = require('jquery');
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MemoCardList from './components/MemoCardList.jsx';
require('material-design-lite/material');
// require('react');
// require('react-dom');
// require('./components/card.js');
console.log('=======Background Params======');
console.log(tab_url);
console.log(page_info);
if(!$('#react-container-for-memo-extension').length){
  $('body').prepend(
  	"<div id='react-container-for-memo-extension'></div>"
  );
}

export default class App extends Component {
  render() {
    const {page_url, memos} = this.props;
    console.log(memos);
    return(
      <MemoCardList
        page_url={page_url}
        memos={memos} />
    );
  }
}

// App.propTypes = {
//   memos: PropTypes.object.isRequired,
// };
App.defaultProps = {
  page_url: page_info.page_url,
  page_title: page_info.page_title,
  memos: [
    {title: "memo1", description: "memoです.", position_x: 0, position_y: 0},
    {title: "memo2", description: "memoです.", position_x: 0, position_y: 80}
  ].concat(page_info.memos)
};

try {
  ReactDOM.render(<App />, document.getElementById('react-container-for-memo-extension'));
} catch (e) {
  alert("Memo App Error: このページではメモを表示できません。" + e);
} finally {

}
