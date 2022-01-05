import { Note } from "../types/Note";
import { getNewId, getStorage, setStorage } from "./common";
import { deletePageInfo } from "./pageInfoStorage";

const NOTE_STORAGE_NAME = "notes";

const getStorageName = (pageId: number) => `${NOTE_STORAGE_NAME}_${pageId}`;

const getNoteStorage = async (storageName: string): Promise<Note[]> => {
  const storage = await getStorage(storageName);
  return (storage[storageName] || []) as Note[];
};

const setNoteStorageByPageId = async (pageId: number, notes: Note[]): Promise<boolean> => {
  const storageName = getStorageName(pageId);

  return await setStorage(storageName, notes);
};

export type NoteCRUDResponseType = { note?: Note; allNotes: Note[] };

export const createNote = async (pageId: number): Promise<NoteCRUDResponseType> => {
  const notes = await getAllNotesByPageId(pageId);

  const id = getNewId(notes);
  const newNote: Note = { id, page_info_id: pageId, created_at: new Date().toISOString() };
  const allNotes = [...notes, newNote];
  if (await setNoteStorageByPageId(pageId, allNotes)) return { note: newNote, allNotes };

  throw new Error("createNote failed: " + chrome.runtime.lastError);
};

export const updateNote = async (pageId: number, note: Note): Promise<NoteCRUDResponseType> => {
  if (!note.id) return new Promise((_resolve, reject) => reject("id is required"));

  const notes = await getAllNotesByPageId(pageId);
  const allNotes = notes.map((_note) =>
    _note.id === note.id ? { ...note, updated_at: new Date().toISOString() } : _note
  );

  if (await setNoteStorageByPageId(pageId, allNotes)) return { note, allNotes };

  throw new Error("updateNote failed: " + chrome.runtime.lastError);
};

export const getAllNotesByPageId = async (pageId: number): Promise<Note[]> => {
  return await getNoteStorage(getStorageName(pageId));
};

export const getAllNotes = async (pageId: number): Promise<Note[]> => {
  // TODO
  return new Promise((_resolve, reject) => reject("getAllNotes is not implemented"));
};

export const getNotesByPageId = async (pageId: number): Promise<Note[]> => {
  // TODO
  return new Promise((_resolve, reject) => reject("getAllNotes is not implemented"));
};

export const deleteNote = async (
  pageId: number,
  noteId?: number
): Promise<NoteCRUDResponseType> => {
  if (!noteId) throw new Error("id is required");

  const notes = await getAllNotesByPageId(pageId);
  const note = notes.find((_note) => _note.id === noteId);
  const allNotes = notes.filter((_note) => _note.id !== noteId);

  if (allNotes.length === 0) deletePageInfo(pageId);

  // TODO 削除したNoteを履歴に残す

  if (await setNoteStorageByPageId(pageId, allNotes)) return { note, allNotes };

  throw new Error("deleteNote failed: " + chrome.runtime.lastError);
};
