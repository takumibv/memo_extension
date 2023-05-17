import { getStorage, setStorage } from "./common";

const DEFAULT_COLOR_STORAGE_NAME = "default_color";

/**
 * メモの初期カラーを保存するストレージ
 */

export const getDefaultColor = async (): Promise<string> => {
  const storage = await getStorage(DEFAULT_COLOR_STORAGE_NAME);
  return (storage[DEFAULT_COLOR_STORAGE_NAME] || "") as string;
};

export const setDefaultColor = async (color: string): Promise<boolean> => {
  return await setStorage(DEFAULT_COLOR_STORAGE_NAME, color);
};
