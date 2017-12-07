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
if(!$('#react-container-for-memo-extension').length){
  $('body').prepend(
  	"<div id='react-container-for-memo-extension'></div>"
  );
}

export class App extends Component {
  constructor() {
    super();
    this.state = this.getInitialState();
  }
  getInitialState() {
    return {
      page_url: page_info.page_url,
      page_title: page_info.page_title,
      memos: [
        {title: "memo1", description: "memoです11.", position_x: 0, position_y: 0, is_open: true},
        {title: "memo2", description: "memoです22.", position_x: 0, position_y: 80, is_open: false}
      ].concat(page_info.memos)
    };
  }
  actions(action) {
    console.log(action);
    switch (action.type) {
      case 'UPDATE_TITLE':
        console.log("update title");
        var updated_memos = this.state.memos;
        updated_memos[action.index].title = "test";
        this.setState({memos: updated_memos});
      case 'UPDATE_IS_OPEN':
        var updated_memos = this.state.memos;
        updated_memos[action.index].title = "test";
        updated_memos[action.index].description = "asdfasdfasdfasd";
        updated_memos[action.index].is_open = action.is_open;
        this.setState({memos: updated_memos});
      default:
        break;
    }
  }
  render() {
    const {page_url, memos} = this.state;
    console.log(memos);
    return(
      <MemoCardList
        page_url={page_url}
        memos={memos}
        actions={this.actions.bind(this)} />
    );
  }
}

// function mapStateToProps(state) {
//   return state;
// }
//
// function mapDispatchToProps(dispatch) {
//   return {
//     actions: Actions
//   };
// }

// App.propTypes = {
//   memos: PropTypes.object.isRequired,
// };

// App.defaultProps = {
//   page_url: page_info.page_url,
//   page_title: page_info.page_title,
//   memos: [
//     {title: "memo1", description: "memoです11.", position_x: 0, position_y: 0, is_open: true},
//     {title: "memo2", description: "memoです22.", position_x: 0, position_y: 80, is_open: false}
//   ].concat(page_info.memos)
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(App);

try {
  ReactDOM.render(<App />, document.getElementById('react-container-for-memo-extension'));
} catch (e) {
  alert("Memo App Error: このページではメモを表示できません。" + e);
} finally {

}
