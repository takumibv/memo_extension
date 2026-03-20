import { getAllStorage, getNewId, getStorage, removeStorage, setStorage } from './common';
import { deletePageInfo } from './pageInfoStorage';
import { DEAULT_NOTE_HEIGHT, DEAULT_NOTE_WIDTH } from '@/shared/types/Note';
import type { Note } from '@/shared/types/Note';

const NOTE_STORAGE_NAME = 'notes';

const getStorageName = (pageId: number) => `${NOTE_STORAGE_NAME}_${pageId}`;

const getNoteStorage = async (storageName: string): Promise<Note[]> => {
  const storage = await getStorage(storageName);
  return (storage[storageName] || []) as Note[];
};

const setNoteStorageByPageId = async (pageId: number, notes: Note[]): Promise<boolean> => {
  const storageName = getStorageName(pageId);

  return await setStorage(storageName, notes);
};

const removeNoteStorageByPageId = async (pageId: number): Promise<boolean> =>
  await removeStorage(getStorageName(pageId));

export type NoteCRUDResponseType = { note?: Note; allNotes: Note[] };

export const createNote = async (pageId: number): Promise<NoteCRUDResponseType> => {
  const notes = await getAllNotesByPageId(pageId);

  const id = getNewId(notes);
  const newNote: Note = {
    id,
    page_info_id: pageId,
    width: DEAULT_NOTE_WIDTH,
    height: DEAULT_NOTE_HEIGHT,
    is_fixed: true,
    is_open: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const allNotes = [...notes, newNote];
  if (await setNoteStorageByPageId(pageId, allNotes)) return { note: newNote, allNotes };

  throw new Error('createNote failed: ' + chrome.runtime.lastError?.message);
};

export const updateNote = async (pageId: number, note: Note): Promise<NoteCRUDResponseType> => {
  if (!note.id) return new Promise((_resolve, reject) => reject('id is required'));

  const notes = await getAllNotesByPageId(pageId);
  const allNotes = notes.map(_note =>
    _note.id === note.id ? { ...note, updated_at: new Date().toISOString() } : _note,
  );

  if (await setNoteStorageByPageId(pageId, allNotes)) return { note, allNotes };

  throw new Error('updateNote failed: ' + chrome.runtime.lastError?.message);
};

export const getAllNotesByPageId = async (pageId: number): Promise<Note[]> =>
  await getNoteStorage(getStorageName(pageId));

export const getAllNotes = async (): Promise<Note[]> => {
  const storage = await getAllStorage();
  const filteredNotes = Object.keys(storage)
    .filter(key => key.match(new RegExp(`^${NOTE_STORAGE_NAME}_`, 'g')))
    .map(key => storage[key])
    .flat();
  return filteredNotes;
};

export const deleteNote = async (pageId: number, noteId?: number): Promise<NoteCRUDResponseType> => {
  if (!noteId) throw new Error('id is required');

  const notes = await getAllNotesByPageId(pageId);
  const note = notes.find(_note => _note.id === noteId);
  const allNotes = notes.filter(_note => _note.id !== noteId);

  if (await setNoteStorageByPageId(pageId, allNotes)) {
    if (allNotes.length === 0) {
      await deletePageInfo(pageId);
      await removeNoteStorageByPageId(pageId);
    }

    return { note, allNotes };
  }

  throw new Error('deleteNote failed: ' + chrome.runtime.lastError?.message);
};
