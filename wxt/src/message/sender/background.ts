import { sendToTab } from './base';
import * as actions from '@/background/actions';
import { cache } from '@/background/cache';
import type { Note } from '@/shared/types/Note';
import type { Setting } from '@/shared/types/Setting';

/**
 * メモ情報をContentScriptにセットする
 */
export const setupPage = async (tabId: number, url: string, notes: Note[], setting: Setting): Promise<void> => {
  cache.badge[tabId] = notes.length ?? 0;
  actions.setBadgeText(tabId, notes.length ?? 0);

  await sendToTab(tabId, {
    type: 'bg:setupPage',
    payload: {
      url,
      notes,
      isVisible: setting?.is_visible,
      defaultColor: setting?.default_color,
    },
  });
};

/**
 * メモの表示/非表示をContentScriptにセットする
 */
export const setupIsVisible = async (tabId: number, url: string, isVisible: boolean): Promise<void> => {
  await sendToTab(tabId, {
    type: 'bg:setVisibility',
    payload: { url, isVisible },
  });
};
