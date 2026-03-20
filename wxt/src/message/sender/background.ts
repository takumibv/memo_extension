import { sendActionToTab } from './base';
import { BACKGROUND, SETUP_PAGE, SET_NOTE_VISIBLE } from '../actions';
import * as actions from '@/background/actions';
import { cache } from '@/background/cache';
import type { MessageResponseData } from '../message';
import type { Note } from '@/shared/types/Note';
import type { Setting } from '@/shared/types/Setting';

export const setupPage = (
  tabId: number,
  url: string,
  notes: Note[],
  setting: Setting,
): Promise<MessageResponseData> => {
  cache.badge[tabId] = notes.length ?? 0;
  actions.setBadgeText(tabId, notes.length ?? 0);

  return sendActionToTab(tabId, SETUP_PAGE, BACKGROUND, {
    url,
    notes,
    isVisible: setting?.is_visible,
    defaultColor: setting?.default_color,
  });
};

export const setupIsVisible = (tabId: number, url: string, isVisible: boolean): Promise<MessageResponseData> =>
  sendActionToTab(tabId, SET_NOTE_VISIBLE, BACKGROUND, { url, isVisible });
