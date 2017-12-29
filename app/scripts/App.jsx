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
    this.count = 0;
    // this.state = this.getInitialState();
    console.log("Memo Extension is running.");
  }
  getInitialState() {
    return {
      page_url: page_info.page_url,
      page_title: page_info.page_title,
      memos: page_info.memos
      // memos: [
      //   {id: 10, title: "memo1", description: "memoです11.", position_x: 0, position_y: 0, width: 300, height: 150, is_open: true},
      //   {id: 20, title: "memo2", description: "memoです22.", position_x: 0, position_y: 80, width: 300, height: 120, is_open: false}
      // ].concat(page_info.memos)
    };
  }
  componentWillMount() {
    const { page_info } = this.props;
    this.state = page_info;
  }
  actions(action) {
    console.log(action);
    switch (action.type) {
      case 'MAKE_MEMO':
        break;
      case 'UPDATE_TITLE':
        var updated_memos = this.state.memos;
        updated_memos[action.index].title = action.title;
        this.setState({memos: updated_memos});
        this.save('UPDATE_TITLE');
        break;
      case 'UPDATE_DESCRIPTION':
        var updated_memos = this.state.memos;
        updated_memos[action.index].description = action.description;
        this.setState({memos: updated_memos});
        this.save('UPDATE_DESCRIPTION');
        break;
      case 'UPDATE_IS_OPEN':
        var updated_memos = this.state.memos;
        updated_memos[action.index].is_open = action.is_open;
        this.setState({memos: updated_memos});
        this.save('UPDATE_IS_OPEN');
        break;
      case 'DELETE_MEMO':
        var updated_memos = this.state.memos;
        updated_memos.splice(action.index, 1);
        this.setState({memos: updated_memos});
        this.save('DELETE_MEMO');
        break;
      case 'MOVE_MEMO':
        var updated_memos = this.state.memos;
        if (updated_memos[action.index].position_x === action.position_x &&
          updated_memos[action.index].position_y === action.position_y) {
          break;
        }
        updated_memos[action.index].position_x = action.position_x;
        updated_memos[action.index].position_y = action.position_y;
        this.setState({memos: updated_memos});
        this.save('MOVE_MEMO');
        break;
      case 'RESIZE_MEMO':
        var updated_memos = this.state.memos;
        updated_memos[action.index].width = action.width;
        updated_memos[action.index].height = action.height;
        this.setState({memos: updated_memos});
        this.save('RESIZE_MEMO');
        break;
      case '':
        break;
      default:
        break;
    }
  }
  save(action_type) {
    console.log("count: ", this.count);
    this.count += 1;
    chrome.runtime.sendMessage({method: 'SAVE_MEMO', action_type: action_type, page_url: this.state.page_url, memos: this.state.memos});
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
  ReactDOM.render(
    <App page_info={page_info} />,
    document.getElementById('react-container-for-memo-extension')
  );
} catch (e) {
  alert("Memo App Error: このページではメモを表示できません。" + e);
} finally {

}

const onChangeState = () => {
  console.log("onChangeState");
}
