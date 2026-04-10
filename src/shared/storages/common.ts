export const getAllStorage = async () => await chrome.storage.local.get(null);

export const getStorage = async (storage_name: string) => await chrome.storage.local.get(storage_name);

export const setStorage = async (storage_name: string, data: unknown) => {
  await chrome.storage.local.set({ [storage_name]: data });
  return !chrome.runtime.lastError;
};

export const removeStorage = async (storage_name: string) => {
  await chrome.storage.local.remove(storage_name);
  return !chrome.runtime.lastError;
};

export const getNewId = (storage_data: { id?: number }[]) => {
  let new_id = Math.floor(Math.random() * 999999) + 1;
  while (storage_data.some(a => a.id === new_id)) {
    new_id = Math.floor(Math.random() * 999999) + 1;
  }

  return new_id;
};
