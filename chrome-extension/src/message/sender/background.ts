import { sendActionToTab } from './base';
import * as actions from '../../background/actions';
import { cache } from '../../background/cache';
import { BACKGROUND, SETUP_PAGE, SET_NOTE_VISIBLE } from '../actions';
import type { MessageResponseData } from '../message';
import type { Note } from '@extension/shared/lib/types/Note';
import type { Setting } from '@extension/shared/lib/types/Setting';

/**
 * backgroundから送信するメッセージ
 */

/**
 * メモ情報をContentScriptにセットする
 */
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

/**
 * メモの表示/非表示をContentScriptにセットする
 */
export const setupIsVisible = (tabId: number, url: string, isVisible: boolean): Promise<MessageResponseData> =>
  sendActionToTab(tabId, SET_NOTE_VISIBLE, BACKGROUND, { url, isVisible });
