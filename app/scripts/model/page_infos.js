const $ = require('jquery');
import Memo from './memos.js';
import Base from './base.js';

const PAGE_INFO_STORAGE_NAME = "PageInfos";
const MEMO_STORAGE_NAME = "Memos";

export default class PageInfo extends Base {
  /*** props
  * id
  * page_url
  * page_title
  ****/
  constructor(page_url = null, page_info = null) {
    super(PAGE_INFO_STORAGE_NAME);

    if (page_info) {
      this.id         = page_info.id;
      this.page_url   = page_info.page_url;
      this.page_title = page_info.page_title;
    } else {
      const origin_page_info = this.fetchPageInfo(page_url);

      this.id         = origin_page_info.id;
      this.page_url   = origin_page_info.page_url;
      this.page_title = origin_page_info.page_title;
    }
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
      created_at: this.created_at,
      // memos: this.memos
    }
  }
  save() {
    if (!this.created_at) { this.created_at = new Date().toISOString(); }
    super.save();
  }
  serialize_for_save() {
    return {
      id: this.id,
      page_url: this.page_url,
      page_title: this.page_title,
      created_at: this.created_at,
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
  static getAllPageInfo() {
    const storage = Base.getStorage(PAGE_INFO_STORAGE_NAME);
    return storage;
  }
  static getAllPageInfoHavingMemo() {
    const all_page_infos = Base.getStorage(PAGE_INFO_STORAGE_NAME);
    const all_memos = Base.getStorage(MEMO_STORAGE_NAME);
    all_page_infos.filter(
      page_info => !all_memos.some(memo => memo.page_info_id===page_info.id)
    ).forEach(page_info => {
      new PageInfo(null, page_info).delete();
    });
    return all_page_infos.filter(page_info => all_memos.some(memo => memo.page_info_id===page_info.id));
  }
}
