import { getStorage, setStorage } from './common';

const DEFAULT_COLOR_STORAGE_NAME = 'default_color';

export const getDefaultColor = async (): Promise<string> => {
  const storage = await getStorage(DEFAULT_COLOR_STORAGE_NAME);
  return (storage[DEFAULT_COLOR_STORAGE_NAME] || '') as string;
};

export const setDefaultColor = async (color: string): Promise<boolean> =>
  await setStorage(DEFAULT_COLOR_STORAGE_NAME, color);
