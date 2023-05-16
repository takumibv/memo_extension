import { Note } from "../../../types/Note";
import { Setting } from "../../../types/Setting";
import { BACKGROUND, SETUP_PAGE, SET_NOTE_VISIBLE } from "../actions";
import { sendActionToTab } from "./base";
import * as actions from "../../background/actions";
import { cache } from "../../background/cache";

/**
 * メモ情報をContentScriptにセットする
 */
export const setupPage = (tabId: number, url: string, notes: Note[], setting: Setting) => {
  cache.badge[tabId] = notes.length ?? 0;
  actions.setBadgeText(tabId, notes.length ?? 0);

  sendActionToTab(tabId, SETUP_PAGE, BACKGROUND, {
    url,
    notes,
    isVisible: setting?.is_visible,
    defaultColor: setting?.default_color,
  });
};

/**
 * メモの表示/非表示をContentScriptにセットする
 */
export const setupIsVisible = (tabId: number, url: string, isVisible: boolean) => {
  sendActionToTab(tabId, SET_NOTE_VISIBLE, BACKGROUND, { url, isVisible });
};
