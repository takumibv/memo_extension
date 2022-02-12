import { useCallback } from "react";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../../../types/Actions";
import { Note } from "../../../types/Note";
import { DELETE_NOTE, GET_ALL_NOTES_AND_PAGE_INFO, OPTIONS, UPDATE_NOTE } from "../actions";

const sendAction = (
  method: ToBackgroundMessageMethod,
  page_url?: string,
  targetNote?: Note
): Promise<ToBackgroundMessageResponse> => {
  console.log("sendMessage ======", method, targetNote);

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
      {
        method: method,
        senderType: OPTIONS,
        page_url: page_url ?? "",
        targetNote,
      },
      (response) => {
        console.log(
          "response ======",
          response.notes,
          response.pageInfos,
          chrome.runtime.lastError
        );
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(response);
        }
      }
    );
  });
};

export const sendUpdateNote = async (note?: Note, page_url?: string) => {
  return await sendAction(UPDATE_NOTE, page_url, note);
};

export const sendDeleteNote = async (note?: Note, page_url?: string) => {
  return await sendAction(DELETE_NOTE, page_url, note);
};

export const sendFetchAllNotes = async () => {
  return await sendAction(GET_ALL_NOTES_AND_PAGE_INFO);
};
