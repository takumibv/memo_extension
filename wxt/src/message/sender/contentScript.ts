import { sendAction } from './base';
import { CONTENT_SCRIPT, DELETE_NOTE, GET_ALL_NOTES, GET_NOTE_VISIBLE, UPDATE_NOTE } from '../actions';
import type { Note } from '@/shared/types/Note';

export const sendFetchAllNotes = async (): Promise<{ notes?: Note[] }> =>
  await sendAction(GET_ALL_NOTES, CONTENT_SCRIPT, { url: window.location.href });

export const sendUpdateNote = async (note: Note): Promise<{ notes?: Note[] }> =>
  await sendAction(UPDATE_NOTE, CONTENT_SCRIPT, { url: window.location.href, note });

export const sendDeleteNote = async (note: Note): Promise<{ notes?: Note[] }> =>
  await sendAction(DELETE_NOTE, CONTENT_SCRIPT, { url: window.location.href, note });

export const sendFetchNoteVisible = async (): Promise<{ isVisible?: boolean }> =>
  await sendAction(GET_NOTE_VISIBLE, CONTENT_SCRIPT, {});
