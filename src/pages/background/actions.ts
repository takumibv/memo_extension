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
  getDefaultColor as _getDefaultColor,
  setDefaultColor as _setDefaultColor,
} from "../../storages/defaultColorStorage";
import {
  getAllPageInfos,
  updatePageInfo as _updatePageInfo,
  setUpdatedAtPageInfo,
  getOrCreatePageInfoByUrl,
  getPageInfoByUrl,
} from "../../storages/pageInfoStorage";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";
import { Setting } from "../../types/Setting";

export const fetchAllNotes = async (): Promise<Note[]> => {
  const notes = await getAllNotes();

  return notes;
};

export const fetchAllNotesAndPageInfo = async (): Promise<{
  notes: Note[];
  pageInfos: PageInfo[];
}> => {
  const notes = await getAllNotes();
  const pageInfos = await getAllPageInfos();

  const filteredPageInfos = pageInfos.filter((pageInfo) => {
    return notes.some((note) => note.page_info_id === pageInfo.id);
  });

  return { notes, pageInfos: filteredPageInfos };
};

export const fetchAllNotesByPageUrl = async (page_url: string): Promise<Note[]> => {
  const pageInfo = await getPageInfoByUrl(page_url);
  if (!pageInfo || !pageInfo.id) return [];

  const notes = await getAllNotesByPageId(pageInfo.id);

  return notes;
};

export const createNote = async (page_url: string): Promise<Note[]> => {
  const pageInfo = await getOrCreatePageInfoByUrl(page_url);
  const { note, allNotes } = await _createNote(pageInfo.id!);
  setUpdatedAtPageInfo(pageInfo.id!);

  return allNotes;
};

export const updateNote = async (note: Note): Promise<Note[]> => {
  if (!note.page_info_id) return [];

  const { allNotes } = await _updateNote(note.page_info_id, note);
  setUpdatedAtPageInfo(note.page_info_id);

  return allNotes;
};

export const deleteNote = async (note: Note): Promise<Note[]> => {
  if (!note.page_info_id) return [];

  const { allNotes } = await _deleteNote(note.page_info_id, note.id);

  return allNotes;
};

export const fetchAllPageInfo = async (): Promise<PageInfo[]> => {
  const pageInfos = await getAllPageInfos();

  return pageInfos;
};

export const updatePageInfo = async (page_info: PageInfo): Promise<PageInfo[]> => {
  if (!page_info.id) return [];

  const { allPageInfos } = await _updatePageInfo(page_info);

  return allPageInfos;
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

export const getDefaultColor = async () => {
  return await _getDefaultColor();
};

export const setDefaultColor = async (color: string) => {
  await _setDefaultColor(color);

  return await getSetting();
};

export const getSetting = async (): Promise<Setting> => {
  const setting = {
    is_visible: await _getIsVisibleNote(),
    default_color: await _getDefaultColor(),
  };

  return setting;
};

export const setBadgeText = (tabId: number, noteLength?: number | string) => {
  chrome.action.setBadgeText({ tabId, text: `${noteLength ?? ""}` });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#000" });
};

export const setBadgeUnavailable = (tabId: number) => {
  chrome.action.setBadgeText({ tabId, text: "x" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "red" });
};
