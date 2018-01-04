const $ = require('jquery');
import Memo from './memos.js';
import Base from './base.js';

const PAGE_INFO_STORAGE_NAME = "PageInfos";

export default class PageInfo extends Base {
  /*** props
  * id
  * page_url
  * page_title
  ****/
  constructor(page_url = null) {
    super(PAGE_INFO_STORAGE_NAME);
    const origin_page_info = this.fetchPageInfo(page_url);

    this.id         = origin_page_info.id;
    this.page_url   = origin_page_info.page_url;
    this.page_title = origin_page_info.page_title;
    // this.memos      = origin_page_info.memos;
  }
  // localStorageのpage_infoがあれば、attrにセットする。
  fetchPageInfo(page_url) {
    const origin_page_info = this.getStorage().filter(a => a.page_url === page_url)[0];
    let id = null,
        page_title = null,
        memos = [];

    if (origin_page_info) {
      id          = origin_page_info.id;
      page_title  = origin_page_info.title;
      // memos       = Memo.getMemosByPageInfoId(id);
    }

    return {
      id: id,
      page_url: page_url,
      page_title: page_title,
      // memos: memos
    };
  }
  // 出力用
  serialize() {
    return {
      id: this.id,
      page_url: this.page_url,
      page_title: this.page_title,
      // memos: this.memos
    }
  }
  serialize_for_save() {
    return {
      id: this.id,
      page_url: this.page_url,
      page_title: this.page_title
    }
  }
  checkMemoExistance() {
    if (this.getMemos().length === 0) { super.delete(); }
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
  getMemos() {
    return Memo.getMemosByPageInfoId(this.id);
  }
  deleteMemo(memo) {
    new Memo(memo).delete();
    // let index = this.memos
    //   .map((a, i) => a.id == this.id ? i : false)
    //   .filter(v => v)[0];
    // this.memos.splice(index, 1);
  }
}
