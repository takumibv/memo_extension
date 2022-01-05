import { Note } from "../types/Note";
import { getNewId, getStorage, setStorage } from "./common";

const NOTE_STORAGE_NAME = "notes";

const getNoteStorage = async (): Promise<Note[]> => {
  const storage = await getStorage(NOTE_STORAGE_NAME);
  return (storage[NOTE_STORAGE_NAME] || []) as Note[];
};

const setNoteStorage = async (notes: Note[]): Promise<Note[]> => {
  await setStorage(NOTE_STORAGE_NAME, notes);

  return notes;
};

export const createNote = async () => {
  const notes = await getAllNotes();

  const id = getNewId(notes);

  return await setNoteStorage([...notes, { id }]);
};

export const updateNote = async (note: Note): Promise<Note[]> => {
  if (!note.id) return new Promise((_resolve, reject) => reject("id is required"));

  const notes = await getAllNotes();

  return await setNoteStorage([...notes.filter((_note) => _note.id !== note.id), note]);
};

export const getAllNotes = async () => {
  return await getNoteStorage();
};

export const getNotesByPageId = async (pageId: number) => {};

export const deleteNote = async (noteId?: number) => {
  if (!noteId) return new Promise((_resolve, reject) => reject("id is required"));

  const notes = await getAllNotes();

  return await setNoteStorage(notes.filter((_note) => _note.id !== noteId));
};
