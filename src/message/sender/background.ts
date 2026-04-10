import { sendToTab } from './base';
import * as actions from '@/background/actions';
import { cache } from '@/background/cache';
import { getSelection } from '@/shared/storages/selectionStorage';
import type { Note } from '@/shared/types/Note';
import type { Selection } from '@/shared/types/Selection';
import type { Setting } from '@/shared/types/Setting';

/**
 * メモ情報をContentScriptにセットする
 */
export const setupPage = async (tabId: number, url: string, notes: Note[], setting: Setting): Promise<void> => {
  cache.badge[tabId] = notes.length ?? 0;
  actions.setBadgeText(tabId, notes.length ?? 0);

  // Fetch selections for pinned notes
  const selectionIds = notes.flatMap(n => (n.selection_id ? [n.selection_id] : []));
  let selections: Selection[] = [];
  if (selectionIds.length > 0) {
    const results = await Promise.all(selectionIds.map(id => getSelection(id)));
    selections = results.filter((s): s is Selection => s !== undefined);
  }

  await sendToTab(tabId, {
    type: 'bg:setupPage',
    payload: {
      url,
      notes,
      selections,
      isVisible: setting?.is_visible,
      defaultColor: setting?.default_color,
    },
  });
};

/**
 * 要素ピッカーモードをContentScriptで開始する
 */
export const activateInspector = async (tabId: number): Promise<void> => {
  await sendToTab(tabId, { type: 'bg:activateInspector' });
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
