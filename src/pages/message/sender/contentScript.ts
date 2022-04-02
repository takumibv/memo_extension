import { Note } from "../../../types/Note";
import {
  CONTENT_SCRIPT,
  DELETE_NOTE,
  GET_ALL_NOTES,
  GET_NOTE_VISIBLE,
  UPDATE_NOTE,
} from "../actions";
import { sendAction } from "./base";

export const sendFetchAllNotes = async (): Promise<{ notes?: Note[] }> => {
  return await sendAction(GET_ALL_NOTES, CONTENT_SCRIPT, { url: window.location.href });
};

export const sendUpdateNote = async (note: Note): Promise<{ notes?: Note[] }> => {
  return await sendAction(UPDATE_NOTE, CONTENT_SCRIPT, { url: window.location.href, note });
};

export const sendDeleteNote = async (note: Note): Promise<{ notes?: Note[] }> => {
  return await sendAction(DELETE_NOTE, CONTENT_SCRIPT, { url: window.location.href, note });
};

export const sendFetchNoteVisible = async (): Promise<{ isVisible?: boolean }> => {
  return await sendAction(GET_NOTE_VISIBLE, CONTENT_SCRIPT, {});
};
