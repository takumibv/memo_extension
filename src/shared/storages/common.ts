import { trackError } from '@/shared/analytics/ga4';

export const getAllStorage = async () => await chrome.storage.local.get(null);

export const getStorage = async (storage_name: string) => await chrome.storage.local.get(storage_name);

export const setStorage = async (storage_name: string, data: unknown) => {
  try {
    await chrome.storage.local.set({ [storage_name]: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    trackError('storage_set', `${storage_name}: ${message}`);
    throw err;
  }
  if (chrome.runtime.lastError) {
    trackError('storage_set', `${storage_name}: ${chrome.runtime.lastError.message}`);
    return false;
  }
  return true;
};

export const removeStorage = async (storage_name: string) => {
  try {
    await chrome.storage.local.remove(storage_name);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    trackError('storage_remove', `${storage_name}: ${message}`);
    throw err;
  }
  if (chrome.runtime.lastError) {
    trackError('storage_remove', `${storage_name}: ${chrome.runtime.lastError.message}`);
    return false;
  }
  return true;
};

export const getNewId = (storage_data: { id?: number }[]) => {
  let new_id = Math.floor(Math.random() * 999999) + 1;
  while (storage_data.some(a => a.id === new_id)) {
    new_id = Math.floor(Math.random() * 999999) + 1;
  }

  return new_id;
};
