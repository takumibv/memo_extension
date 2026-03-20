import { sendToBackground } from './base';
import type { Note } from '@/shared/types/Note';

export const sendFetchAllNotes = () =>
  sendToBackground({ type: 'content:getAllNotes', payload: { url: window.location.href } });

export const sendUpdateNote = (note: Note) =>
  sendToBackground({ type: 'content:updateNote', payload: { url: window.location.href, note } });

export const sendDeleteNote = (note: Note) =>
  sendToBackground({ type: 'content:deleteNote', payload: { url: window.location.href, note } });

export const sendFetchNoteVisible = () => sendToBackground({ type: 'content:getVisibility' });
