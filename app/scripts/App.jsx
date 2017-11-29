const $ = require('jquery');
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MemoCardList from './components/MemoCardList.jsx';
require('material-design-lite/material');
// require('react');
// require('react-dom');
// require('./components/card.js');
console.log('aaaaaaaaaaa');
console.log(tab_url);
if(!$('#react-container-for-memo-extension').length){
  $('body').prepend(
  	"<div id='react-container-for-memo-extension'></div>"
  );
}

export default class App extends Component {
  render() {
    const {url, memos} = this.props;
    return(
      <MemoCardList
        url={url}
        memos={memos} />
    );
  }
}

// App.propTypes = {
//   memos: PropTypes.object.isRequired,
// };
App.defaultProps = {
  url: tab_url,
  memos: [
    {title: "memo1", description: "memoです."},
    {title: "memo2", description: "memo desu.."}
  ]
};

try {
  ReactDOM.render(<App />, document.getElementById('react-container-for-memo-extension'));
} catch (e) {
  alert("Memo App Error: このページではメモを表示できません。" + e);
} finally {

}
