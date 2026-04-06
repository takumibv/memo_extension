import {
  getDefaultColor as _getDefaultColor,
  setDefaultColor as _setDefaultColor,
} from '@/shared/storages/defaultColorStorage';
import {
  createNote as _createNote,
  updateNote as _updateNote,
  deleteNote as _deleteNote,
  getAllNotesByPageId,
  getAllNotes,
} from '@/shared/storages/noteStorage';
import {
  createSelection as _createSelection,
  deleteSelection as _deleteSelection,
  getSelection,
} from '@/shared/storages/selectionStorage';
import {
  getIsVisibleNote as _getIsVisibleNote,
  setIsVisibleNote as _setIsVisibleNote,
} from '@/shared/storages/noteVisibleStorage';
import {
  getAllPageInfos,
  updatePageInfo as _updatePageInfo,
  setUpdatedAtPageInfo,
  getOrCreatePageInfoByUrl,
  getPageInfoByUrl,
} from '@/shared/storages/pageInfoStorage';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { SelectionTarget } from '@/shared/types/Selection';
import type { Setting } from '@/shared/types/Setting';

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
  const filteredPageInfos = pageInfos.filter(pageInfo => notes.some(note => note.page_info_id === pageInfo.id));
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
  const { allNotes } = await _createNote(pageInfo.id!);
  setUpdatedAtPageInfo(pageInfo.id!);
  return allNotes;
};

export const createPinnedNote = async (
  page_url: string,
  target: SelectionTarget,
  text: string,
  fallbackX: number,
  fallbackY: number,
): Promise<Note[]> => {
  const pageInfo = await getOrCreatePageInfoByUrl(page_url);
  const selection = await _createSelection(target, text);
  try {
    const { allNotes } = await _createNote(pageInfo.id!, {
      selection_id: selection.id,
      is_fixed: false,
      is_open: true,
      position_x: fallbackX,
      position_y: fallbackY,
    });
    setUpdatedAtPageInfo(pageInfo.id!);
    return allNotes;
  } catch (e) {
    await _deleteSelection(selection.id).catch(() => {});
    throw e;
  }
};

export const attachSelectionToNote = async (
  page_url: string,
  noteId: number,
  target: SelectionTarget,
  text: string,
): Promise<Note[]> => {
  const pageInfo = await getPageInfoByUrl(page_url);
  if (!pageInfo?.id) return [];

  const existingNotes = await getAllNotesByPageId(pageInfo.id);
  const existingNote = existingNotes.find(n => n.id === noteId);
  if (!existingNote) return existingNotes;

  const oldSelectionId = existingNote.selection_id;
  const selection = await _createSelection(target, text);
  try {
    const { allNotes } = await _updateNote(pageInfo.id, {
      ...existingNote,
      selection_id: selection.id,
      is_fixed: false,
      // Clear position so the tracker takes over immediately
      position_x: undefined,
      position_y: undefined,
    });
    // Delete old selection only after note update succeeds
    if (oldSelectionId) {
      await _deleteSelection(oldSelectionId).catch(() => {});
    }
    setUpdatedAtPageInfo(pageInfo.id);
    return allNotes;
  } catch (e) {
    await _deleteSelection(selection.id).catch(() => {});
    throw e;
  }
};

export const updateNote = async (note: Note): Promise<Note[]> => {
  if (!note.page_info_id) return [];

  // Cascade delete selection if selection_id is being cleared (detach from element)
  if (!note.selection_id) {
    const existingNotes = await getAllNotesByPageId(note.page_info_id);
    const existingNote = existingNotes.find(n => n.id === note.id);
    if (existingNote?.selection_id) {
      await _deleteSelection(existingNote.selection_id).catch(() => {});
    }
  }

  const { allNotes } = await _updateNote(note.page_info_id, note);
  setUpdatedAtPageInfo(note.page_info_id);
  return allNotes;
};

export const deleteNote = async (note: Note): Promise<Note[]> => {
  if (!note.page_info_id) return [];
  // Cascade delete selection if note is pinned to an element
  if (note.selection_id) {
    await _deleteSelection(note.selection_id);
  }
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
  // Resolve scroll target: XPath element for pinned notes, stored position for regular notes
  let xpath: string | null = null;
  if (note.selection_id) {
    const selection = await getSelection(note.selection_id);
    if (selection?.target.kind === 'element') {
      xpath = selection.target.xpath;
    }
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (xp: string | null, posX: number, posY: number) => {
      let targetY = posY;
      if (xp) {
        const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const el = result.singleNodeValue as Element | null;
        if (el) {
          targetY = el.getBoundingClientRect().top + window.scrollY;
        }
      }
      window.scrollTo({
        left: posX,
        top: Math.max(0, targetY - window.innerHeight / 2),
        behavior: 'smooth',
      });
    },
    args: [xpath, note.position_x ?? 0, note.position_y ?? 0],
  });
};

export const getIsVisibleNote = async () => await _getIsVisibleNote();

export const setIsVisibleNote = async (isVisible: boolean) => {
  await _setIsVisibleNote(isVisible);
  return isVisible;
};

export const getDefaultColor = async () => await _getDefaultColor();

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
  chrome.action.setBadgeText({ tabId, text: `${noteLength ?? ''}` });
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#000' });
};

export const setBadgeUnavailable = (tabId: number) => {
  chrome.action.setBadgeText({ tabId, text: 'x' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: 'red' });
};
