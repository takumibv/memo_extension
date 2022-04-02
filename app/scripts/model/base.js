const $ = require("jquery");

export default class Base {
  constructor(storage_name) {
    this.storage_name = storage_name;
  }
  // localStorageのMemoListデータを丸ごと持ってくる。
  getStorage() {
    let storage = localStorage[this.storage_name];

    if (!storage) {
      localStorage[this.storage_name] = JSON.stringify([]);
    }

    return JSON.parse(localStorage[this.storage_name]);
  }
  static getStorage(storage_name) {
    let storage = localStorage[storage_name];

    if (!storage) {
      localStorage[storage_name] = JSON.stringify([]);
    }

    return JSON.parse(localStorage[storage_name]);
  }
  generateId() {
    const storage = this.getStorage();
    let new_id = Math.floor(Math.random() * 1000000);
    while (storage.some((a) => a.id === new_id)) {
      new_id = Math.floor(Math.random() * 1000000);
    }
    this.id = new_id;
  }
  serialize_for_save() {
    /* Override me */
  }
  save() {
    const storage = this.getStorage();

    if (!this.id) {
      this.generateId();
    }
    let index = storage
      .map((a, i) => (a.id == this.id ? i : false))
      .filter((v) => v || v === 0)[0];
    if (index || index === 0) {
      // update
      const updated_data = this.serialize_for_save();
      if (
        storage[index].page_title &&
        (!updated_data.page_title || updated_data.page_title === "Option")
      ) {
        updated_data.page_title = storage[index].page_title;
      }
      storage[index] = updated_data;
      localStorage[this.storage_name] = JSON.stringify(storage);
      console.log("save!", this.serialize_for_save());
    } else {
      // create
      storage.push(this.serialize_for_save());
      localStorage[this.storage_name] = JSON.stringify(storage);
      console.log("create!", this.serialize_for_save());
    }
  }
  delete() {
    const storage = this.getStorage();

    if (!this.id) {
      return;
    }
    let index = storage
      .map((a, i) => (a.id == this.id ? i : false))
      .filter((v) => v || v === 0)[0];
    if (index || index === 0) {
      storage.splice(index, 1);
      localStorage[this.storage_name] = JSON.stringify(storage);
      console.log("delete!", this.serialize_for_save());
    }
  }
}
