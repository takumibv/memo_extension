import { MessageRequest, ToBackgroundMessageMethod, MessageResponse } from "../message";
import { Note } from "../../../types/Note";
import {
  CREATE_NOTE,
  UPDATE_NOTE,
  DELETE_NOTE,
  POPUP,
  SCROLL_TO_TARGET_NOTE,
  GET_ALL_NOTES,
  UPDATE_NOTE_VISIBLE,
} from "../actions";
import { sendAction } from "./base";

export const fetchAllNotes = async (
  tab: chrome.tabs.Tab
): Promise<{ notes?: Note[]; isVisible?: boolean }> => {
  return await sendAction(GET_ALL_NOTES, POPUP, { tab });
};
export const sendCreateNote = async (tab: chrome.tabs.Tab): Promise<{ notes?: Note[] }> => {
  return await sendAction(CREATE_NOTE, POPUP, { tab });
};
export const sendUpdateNote = async (
  tab: chrome.tabs.Tab,
  note: Note
): Promise<{ notes?: Note[] }> => {
  return await sendAction(UPDATE_NOTE, POPUP, { tab, note });
};
export const sendDeleteNote = async (
  tab: chrome.tabs.Tab,
  note: Note
): Promise<{ notes?: Note[] }> => {
  return await sendAction(DELETE_NOTE, POPUP, { tab, note });
};
export const sendScrollToTargetNote = async (tab: chrome.tabs.Tab, note: Note): Promise<{}> => {
  return await sendAction(SCROLL_TO_TARGET_NOTE, POPUP, { tab, note });
};

export const sendUpdateNoteVisible = async (
  tab: chrome.tabs.Tab,
  isVisible: boolean
): Promise<{ isVisible?: boolean }> => {
  return await sendAction(UPDATE_NOTE_VISIBLE, POPUP, { tab, isVisible });
};
