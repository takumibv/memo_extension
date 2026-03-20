import { sendToBackground } from './base';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';

export const sendUpdateNote = (note: Note) => sendToBackground({ type: 'options:updateNote', payload: { note } });

export const sendDeleteNote = (note: Note) => sendToBackground({ type: 'options:deleteNote', payload: { note } });

export const sendFetchAllNotes = () => sendToBackground({ type: 'options:getAllData' });

export const sendUpdatePageInfo = (pageInfo: PageInfo) =>
  sendToBackground({ type: 'options:updatePageInfo', payload: { pageInfo } });

export const sendFetchSetting = () => sendToBackground({ type: 'options:getSetting' });

export const sendUpdateDefaultColor = (color: string) =>
  sendToBackground({ type: 'options:updateDefaultColor', payload: { color } });
