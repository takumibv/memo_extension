const $ = require('jquery');

const STORAGE_NAME = "MemoList";

export default class PageInfo {
  constructor(page_url = null) {
    const origin_page_info = this.fetchPageInfo(page_url);
    this.page_url   = origin_page_info.page_url;
    this.page_title = origin_page_info.page_title;
    this.memos      = origin_page_info.memos;
  }
  // localStorageのMemoListデータを丸ごと持ってくる。
  getStorage() {
    let storage = localStorage[STORAGE_NAME];
    if(!storage) {
      localStorage[STORAGE_NAME] = JSON.stringify({});
    }
    return JSON.parse(localStorage[STORAGE_NAME]);
  }
  // localStorageのpage_infoがあれば、attrにセットする。
  fetchPageInfo(page_url) {
    const origin_page_info = this.getStorage()[page_url];
    let page_title = null, memos = [];
    if (origin_page_info) {
      page_title  = origin_page_info.title;
      memos       = origin_page_info.memos;
    }
    return {
      page_url: page_url,
      page_title: page_title,
      memos: memos
    };
  }
  // 出力用
  serialize() {
    return {
      page_url: this.page_url,
      page_title: this.page_title,
      memos: this.memos
    }
  }
  save() {
    let storage = this.getStorage();
    storage[this.page_url] = this.serialize();
    localStorage[STORAGE_NAME] = JSON.stringify(storage);
  }
  /****
  * setter/getter
  ****/
  setPageUrl(page_url) {
    this.page_url = page_url;
  }
  getPageUrl(page_url) {
    return this.page_url;
  }
  setPageTitle(page_title) {
    this.page_title = page_title;
  }
  getPageTitle(page_title) {
    return this.page_title;
  }
  setMemos(memos) {
    this.memos = memos;
  }
  getMemos(memos) {
    return this.memos;
  }
}
