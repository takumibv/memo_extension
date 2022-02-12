import { useCallback } from "react";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../../../types/Actions";
import { Note } from "../../../types/Note";
import { CONTENT_SCRIPT, DELETE_NOTE, GET_ALL_NOTES, UPDATE_NOTE } from "../actions";

// → backgroundにメッセージを送る
const sendAction = (method: ToBackgroundMessageMethod, targetNote?: Note): Promise<Note[]> => {
  console.log("sendMessage ======", method, window.location.href, targetNote);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
      {
        method: method,
        senderType: CONTENT_SCRIPT,
        page_url: window.location.href, // targetNote.page_info.page_url,
        targetNote,
      },
      ({ notes, error }) => {
        console.log("response ======", notes, chrome.runtime.lastError);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (error) {
          reject(error.message);
        } else {
          resolve(notes || []);
        }
      }
    );
  });
};

export const sendFetchAllNotes = async () => {
  return await sendAction(GET_ALL_NOTES);
};

export const sendUpdateNote = async (note: Note) => {
  return await sendAction(UPDATE_NOTE, note);
};

export const sendDeleteNote = async (note: Note) => {
  return await sendAction(DELETE_NOTE, note);
};
