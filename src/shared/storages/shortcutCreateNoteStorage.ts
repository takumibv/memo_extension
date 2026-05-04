import { getStorage, setStorage } from './common';

const SHORTCUT_CREATE_NOTE_STORAGE_NAME = 'shortcut_create_note';

export const getShortcutCreateNote = async (): Promise<string> => {
  const storage = await getStorage(SHORTCUT_CREATE_NOTE_STORAGE_NAME);
  return (storage[SHORTCUT_CREATE_NOTE_STORAGE_NAME] || '') as string;
};

export const setShortcutCreateNote = async (shortcut: string): Promise<boolean> =>
  await setStorage(SHORTCUT_CREATE_NOTE_STORAGE_NAME, shortcut);
