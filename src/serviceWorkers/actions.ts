import { BACKGROUND, SET_ALL_NOTES } from "../actions";
import {
  createNote as _createNote,
  updateNote as _updateNote,
  deleteNote as _deleteNote,
  getAllNotesByPageId,
} from "../storages/noteStorage";
import { getOrCreatePageInfoByUrl, getPageInfoByUrl } from "../storages/pageInfoStorage";
import { ToContentScriptMessage } from "../types/Actions";
import { Note } from "../types/Note";

export const fetchAllNotesByPageUrl = async (page_url: string): Promise<Note[]> => {
  const pageInfo = await getPageInfoByUrl(page_url);
  if (!pageInfo || !pageInfo.id) return [];

  const notes = getAllNotesByPageId(pageInfo.id);

  console.log("GET_ALL_NOTES:", notes);

  return notes;
};

export const createNote = async (page_url: string): Promise<Note[]> => {
  const pageInfo = await getOrCreatePageInfoByUrl(page_url);
  const { note, allNotes } = await _createNote(pageInfo.id!);

  console.log("CREATE_NOTE:", note);

  return allNotes;
};

export const updateNote = async (page_url: string, note?: Note): Promise<Note[]> => {
  if (!note) return [];

  const pageInfo = await getOrCreatePageInfoByUrl(page_url);
  const { allNotes } = await _updateNote(pageInfo.id!, note);
  console.log("UPDATE_NOTE:", allNotes);

  return allNotes;
};

export const deleteNote = async (page_url: string, note_id?: number): Promise<Note[]> => {
  const pageInfo = await getPageInfoByUrl(page_url);
  if (!pageInfo || !pageInfo.id) return [];

  const { allNotes } = await _deleteNote(pageInfo.id, note_id);
  console.log("DELETE_NOTE:", allNotes);

  return allNotes;
};

export const setAllNotes = (tabId: number, page_url: string, notes: Note[]) => {
  console.log("sendMessage ======", SET_ALL_NOTES, tabId, page_url, notes);
  chrome.tabs.sendMessage<ToContentScriptMessage>(tabId, {
    method: SET_ALL_NOTES,
    senderType: BACKGROUND,
    notes,
    page_url,
  });
};
