import { ToContentScriptMessage } from "../../../types/Actions";
import { Note } from "../../../types/Note";
import { BACKGROUND, SET_ALL_NOTES } from "../actions";

export const sendSetAllNotes = (tabId: number, page_url: string, notes: Note[]) => {
  console.log("sendMessage ======", SET_ALL_NOTES, tabId, page_url, notes);
  chrome.tabs.sendMessage<ToContentScriptMessage>(tabId, {
    method: SET_ALL_NOTES,
    senderType: BACKGROUND,
    notes,
    page_url,
  });
};
