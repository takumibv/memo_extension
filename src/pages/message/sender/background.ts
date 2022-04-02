import { Note } from "../../../types/Note";
import { BACKGROUND, SETUP_PAGE, SET_NOTE_VISIBLE } from "../actions";
import { sendActionToTab } from "./base";

/**
 * メモ情報をContentScriptにセットする
 */
export const setupPage = (tabId: number, url: string, notes: Note[], isVisible: boolean) => {
  sendActionToTab(tabId, SETUP_PAGE, BACKGROUND, { url, notes, isVisible });
};

/**
 * メモの表示/非表示をContentScriptにセットする
 */
export const setupIsVisible = (tabId: number, url: string, isVisible: boolean) => {
  sendActionToTab(tabId, SET_NOTE_VISIBLE, BACKGROUND, { url, isVisible });
};
