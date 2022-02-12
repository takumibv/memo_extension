import { useCallback } from "react";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../../../types/Actions";
import { Note } from "../../../types/Note";
import {
  CREATE_NOTE,
  UPDATE_NOTE,
  DELETE_NOTE,
  POPUP,
  SCROLL_TO_TARGET_NOTE,
  GET_ALL_NOTES,
} from "../actions";

const sendAction = (
  method: ToBackgroundMessageMethod,
  tab: chrome.tabs.Tab,
  targetNote?: Note
): Promise<{ notes?: Note[] }> => {
  console.log("sendMessage ======", method, targetNote);

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
      {
        method: method,
        senderType: POPUP,
        page_url: tab?.url || "",
        tab,
        targetNote,
      },
      ({ notes, error }) => {
        console.log("response ======", notes, chrome.runtime.lastError);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (error) {
          reject(error.message);
        } else {
          resolve({ notes });
        }
      }
    );
  });
};

export const fetchAllNotes = async (tab: chrome.tabs.Tab) => {
  return await sendAction(GET_ALL_NOTES, tab);
};
export const sendCreateNote = async (tab: chrome.tabs.Tab) => {
  return await sendAction(CREATE_NOTE, tab);
};
export const sendUpdateNote = async (tab: chrome.tabs.Tab, note: Note) => {
  return await sendAction(UPDATE_NOTE, tab, note);
};
export const sendDeleteNote = async (tab: chrome.tabs.Tab, note: Note) => {
  return await sendAction(DELETE_NOTE, tab, note);
};
export const sendScrollToTargetNote = async (tab: chrome.tabs.Tab, note: Note) => {
  return await sendAction(SCROLL_TO_TARGET_NOTE, tab, note);
};
