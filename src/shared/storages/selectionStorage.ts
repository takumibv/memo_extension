import { getStorage, setStorage, removeStorage } from './common';
import type { Selection, SelectionTarget } from '@/shared/types/Selection';

const SELECTION_KEY_PREFIX = 'selection_';

const selectionKey = (id: string) => `${SELECTION_KEY_PREFIX}${id}`;

export const createSelection = async (target: SelectionTarget, text: string): Promise<Selection> => {
  const id = crypto.randomUUID();
  const selection: Selection = {
    id,
    target,
    text,
    created_at: new Date().toISOString(),
  };

  await setStorage(selectionKey(id), selection);
  return selection;
};

export const getSelection = async (id: string): Promise<Selection | undefined> => {
  const key = selectionKey(id);
  const storage = await getStorage(key);
  return storage[key] as Selection | undefined;
};

export const deleteSelection = async (id: string): Promise<void> => {
  await removeStorage(selectionKey(id));
};
