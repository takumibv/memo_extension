import { sendToBackground } from './base';
import type { Note } from '@/shared/types/Note';

export const fetchAllNotes = (tab: chrome.tabs.Tab) =>
  sendToBackground({ type: 'popup:getAllNotes', payload: { tab } });

export const sendCreateNote = (tab: chrome.tabs.Tab) =>
  sendToBackground({ type: 'popup:createNote', payload: { tab } });

export const sendUpdateNote = (tab: chrome.tabs.Tab, note: Note) =>
  sendToBackground({ type: 'popup:updateNote', payload: { tab, note } });

export const sendDeleteNote = (tab: chrome.tabs.Tab, note: Note) =>
  sendToBackground({ type: 'popup:deleteNote', payload: { tab, note } });

export const sendScrollToTargetNote = (tab: chrome.tabs.Tab, note: Note) =>
  sendToBackground({ type: 'popup:scrollToNote', payload: { tab, note } });

export const sendUpdateNoteVisible = (tab: chrome.tabs.Tab, isVisible: boolean) =>
  sendToBackground({ type: 'popup:updateVisibility', payload: { tab, isVisible } });
