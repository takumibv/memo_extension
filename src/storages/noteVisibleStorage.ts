import { getStorage, setStorage } from "./common";

const NOTE_VISIBLE_STORAGE_NAME = "visible_notes";

/**
 * メモが表示/非表示の設定を保存するストレージ
 */

export const getIsVisibleNote = async (): Promise<boolean> => {
  const storage = await getStorage(NOTE_VISIBLE_STORAGE_NAME);
  return (storage[NOTE_VISIBLE_STORAGE_NAME] || false) as boolean;
};

export const setIsVisibleNote = async (isVisible: boolean): Promise<boolean> => {
  return await setStorage(NOTE_VISIBLE_STORAGE_NAME, isVisible);
};
