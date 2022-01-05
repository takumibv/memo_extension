// localStorageのデータを丸ごと持ってくる。
export const getStorage = async (storage_name: string) => {
  return await chrome.storage.local.get(storage_name);
};

export const setStorage = async (storage_name: string, data: any) => {
  await chrome.storage.local.set({ [storage_name]: data });
  return !chrome.runtime.lastError;
};

export const getNewId = (storage_data: { id?: number }[]) => {
  let new_id = Math.floor(Math.random() * 1000000);
  while (storage_data.some((a) => a.id === new_id)) {
    new_id = Math.floor(Math.random() * 1000000);
  }

  return new_id;
};

// export const generateId = () => {
//   const storage = getStorage();
//   let new_id = Math.floor(Math.random()*1000000);
//   console.log(storage.some(a => a.id === new_id));
//   while(storage.some(a => a.id === new_id)) {
//     new_id = Math.floor(Math.random()*1000000);
//   }
//   id = new_id;
// }

// export const serialize_for_save = () => { /* Override me */ }

// export const save = () => {
//   const storage = getStorage();

//   if (!id) { generateId(); }
//   let index = storage
//     .map((a, i) => a.id == id ? i : false)
//     .filter(v => v || v===0)[0];
//   if (index || index===0) {
//     // update
//     const updated_data = serialize_for_save();
//     if (storage[index].page_title
//       && (!updated_data.page_title || updated_data.page_title==='Option')) {
//       updated_data.page_title = storage[index].page_title;
//     }
//     storage[index] = updated_data;
//     localStorage[storage_name] = JSON.stringify(storage);
//     console.log("save!", serialize_for_save());
//   } else {
//     // create
//     storage.push(serialize_for_save());
//     localStorage[storage_name] = JSON.stringify(storage);
//     console.log("create!", serialize_for_save());
//   }
// }
// export const deleteStorage = () => {
//   const storage = getStorage();

//   if (!id) { return; }
//   let index = storage
//     .map((a, i) => a.id == id ? i : false)
//     .filter(v => v || v===0)[0];
//   if (index || index===0) {
//     storage.splice(index, 1);
//     localStorage[storage_name] = JSON.stringify(storage);
//     console.log("delete!", serialize_for_save());
//   }
// }
