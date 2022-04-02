const $ = require("jquery");
import Base from "./base.js";
import PageInfo from "./page_infos.js";

const PAGE_INFO_STORAGE_NAME = "PageInfos";
const MEMO_STORAGE_NAME = "Memos";

export default class Memo extends Base {
  /*** props
   * id
   * page_info_id
   * title
   * description
   * position_x
   * position_y
   * width
   * height
   * is_open
   * created_at
   * updated_at
   ***/
  constructor(params) {
    super(MEMO_STORAGE_NAME);

    this.id = params.id;
    this.page_info_id = params.page_info_id;
    this.title = params.title;
    this.description = params.description;
    this.position_x = params.position_x;
    this.position_y = params.position_y;
    this.width = params.width;
    this.height = params.height;
    this.is_open = params.is_open;
    this.is_fixed = params.is_fixed;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
  }
  serialize_for_save() {
    return {
      id: this.id,
      page_info_id: this.page_info_id,
      title: this.title,
      description: this.description,
      position_x: this.position_x,
      position_y: this.position_y,
      width: this.width,
      height: this.height,
      is_open: this.is_open,
      is_fixed: this.is_fixed,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
  save() {
    if (!this.created_at) {
      this.created_at = new Date().toISOString();
    }
    this.updated_at = new Date().toISOString();
    super.save();
  }
  save_strorage_api() {
    const storage_name = `${this.storage_name}_${this.page_info_id}`;
    chrome.storage.local.get(storage_name, (storage) => {
      // let index = storage
      //   .map((a, i) => (a.id == this.id ? i : false))
      //   .filter((v) => v || v === 0)[0];
      // if (index || index === 0) {
      //   // update
      //   const updated_data = this.serialize_for_save();
      //   if (
      //     storage[index].page_title &&
      //     (!updated_data.page_title || updated_data.page_title === "Option")
      //   ) {
      //     updated_data.page_title = storage[index].page_title;
      //   }
      //   storage[index] = updated_data;
      //   localStorage[this.storage_name] = JSON.stringify(storage);
      //   console.log("save!", this.serialize_for_save());
      // } else {
      //   // create
      //   storage.push(this.serialize_for_save());
      //   localStorage[this.storage_name] = JSON.stringify(storage);
      //   console.log("create!", this.serialize_for_save());
      // }
    });
  }
  static getMemoById(memo_id) {
    const storage = Base.getStorage(MEMO_STORAGE_NAME);
    return storage.filter((m) => m.id === memo_id)[0];
  }
  static getMemosByPageInfoId(page_info_id) {
    const storage = Base.getStorage(MEMO_STORAGE_NAME);
    const page_info = PageInfo.getPageInfoById(page_info_id);
    return storage
      .filter((m) => m.page_info_id === page_info_id)
      .map((m) => Object.assign({ page_info: page_info }, m));
  }
  static getAllMemos() {
    const storage = Base.getStorage(MEMO_STORAGE_NAME);
    return storage.map((memo) =>
      Object.assign(
        { page_info: PageInfo.getPageInfoById(memo.page_info_id) },
        memo
      )
    );
  }
  static saveMemos(memos, page_info_id) {
    // const storage = Base.getStorage(MEMO_STORAGE_NAME);
    //
    // memos.forEach(memo => {
    //   memo.page_info_id = page_info_id;
    //   if (!memo.created_at) { memo.created_at = new Date(); }
    //   if (!memo.updated_at) { memo.updated_at = new Date(); }
    //   new Memo(memo).save();
    // });
  }
}
