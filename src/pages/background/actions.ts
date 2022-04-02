import {
  createNote as _createNote,
  updateNote as _updateNote,
  deleteNote as _deleteNote,
  getAllNotesByPageId,
  getAllNotes,
} from "../../storages/noteStorage";
import {
  getIsVisibleNote as _getIsVisibleNote,
  setIsVisibleNote as _setIsVisibleNote,
} from "../../storages/noteVisibleStorage";
import {
  getAllPageInfos,
  getOrCreatePageInfoByUrl,
  getPageInfoByUrl,
} from "../../storages/pageInfoStorage";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";

export const fetchAllNotes = async (): Promise<Note[]> => {
  const notes = await getAllNotes();

  console.log("GET_ALL_NOTES:", notes);

  return notes;
};

export const fetchAllNotesAndPageInfo = async (): Promise<{
  notes: Note[];
  pageInfos: PageInfo[];
}> => {
  const notes = await getAllNotes();
  const pageInfos = await getAllPageInfos();

  console.log("GET_ALL_NOTES_AND_PAGE_INFO:", notes, pageInfos);

  return { notes, pageInfos };
};

export const fetchAllNotesByPageUrl = async (page_url: string): Promise<Note[]> => {
  const pageInfo = await getPageInfoByUrl(page_url);
  if (!pageInfo || !pageInfo.id) return [];

  const notes = await getAllNotesByPageId(pageInfo.id);

  console.log("GET_ALL_NOTES:", notes);

  return notes;
};

export const createNote = async (page_url: string): Promise<Note[]> => {
  const pageInfo = await getOrCreatePageInfoByUrl(page_url);
  const { note, allNotes } = await _createNote(pageInfo.id!);

  console.log("CREATE_NOTE:", note);

  return allNotes;
};

export const updateNote = async (note: Note): Promise<Note[]> => {
  if (!note.page_info_id) return [];

  const { allNotes } = await _updateNote(note.page_info_id, note);
  console.log("UPDATE_NOTE:", allNotes);

  return allNotes;
};

export const deleteNote = async (note: Note): Promise<Note[]> => {
  if (!note.page_info_id) return [];

  const { allNotes } = await _deleteNote(note.page_info_id, note.id);
  console.log("DELETE_NOTE:", allNotes);

  return allNotes;
};

export const fetchAllPageInfo = async (): Promise<PageInfo[]> => {
  const pageInfos = await getAllPageInfos();

  console.log("GET_ALL_PAGEINFOS:", pageInfos);

  return pageInfos;
};

export const scrollTo = async (tabId: number, note: Note) => {
  return await chrome.scripting.executeScript({
    target: { tabId },
    func: (position_x, position_y) => window.scrollTo(position_x ?? 0, position_y ?? 0),
    args: [note.position_x, note.position_y],
  });
};

export const getIsVisibleNote = async () => {
  return await _getIsVisibleNote();
};

export const setIsVisibleNote = async (isVisible: boolean) => {
  await _setIsVisibleNote(isVisible);

  return isVisible;
};
