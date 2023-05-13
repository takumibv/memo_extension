import { Note } from "../../../types/Note";
import { Setting } from "../../../types/Setting";
import { BACKGROUND, SETUP_PAGE, SET_NOTE_VISIBLE } from "../actions";
import { sendActionToTab } from "./base";

/**
 * メモ情報をContentScriptにセットする
 */
export const setupPage = (tabId: number, url: string, notes: Note[], setting: Setting) => {
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
