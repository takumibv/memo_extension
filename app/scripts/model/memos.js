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
    this.save_strorage_api();
  }
  save_strorage_api() {
    const storage_name = `notes_${this.page_info_id}`;
    chrome.storage.local.get(storage_name, (storage) => {
      const memos = storage[storage_name] || [];
      const memoIndex = memos.findIndex((m) => m.id === this.id);

      if (memoIndex !== -1) {
        // update
        memos[memoIndex] = {
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
      } else {
        // create
        memos.push({
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
        });
      }

      chrome.storage.local.set({ [storage_name]: memos }, () => {
        console.log("saved memos", storage_name, memos);
      });
    });
  }
  delete() {
    super.delete();
    this.delete_strorage_api();
  }
  delete_strorage_api() {
    const storage_name = `notes_${this.page_info_id}`;
    chrome.storage.local.get(storage_name, (storage) => {
      const memos = storage[storage_name] || [];
      const memoIndex = memos.findIndex((m) => m.id === this.id);

      if (memoIndex !== -1) {
        // delete
        memos.splice(memoIndex, 1);

        if (memos.length === 0) {
          chrome.storage.local.remove(storage_name, () => {
            console.log("removed memos", storage_name, memos);
          });
        } else {
          chrome.storage.local.set({ [storage_name]: memos }, () => {
            console.log("deleted memo", storage_name, memos);
          });
        }
      }
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
