import { Note } from "../../../types/Note";
import { DELETE_NOTE, GET_ALL_NOTES_AND_PAGE_INFO, OPTIONS, UPDATE_NOTE } from "../actions";
import { sendAction } from "./base";
import { PageInfo } from "../../../types/PageInfo";

export const sendUpdateNote = async (
  note?: Note,
  url?: string
): Promise<{ notes?: Note[]; pageInfos?: PageInfo[] }> => {
  return await sendAction(UPDATE_NOTE, OPTIONS, { url, note });
};

export const sendDeleteNote = async (
  note?: Note,
  url?: string
): Promise<{ notes?: Note[]; pageInfos?: PageInfo[] }> => {
  return await sendAction(DELETE_NOTE, OPTIONS, { url, note });
};

export const sendFetchAllNotes = async (): Promise<{ notes?: Note[]; pageInfos?: PageInfo[] }> => {
  return await sendAction(GET_ALL_NOTES_AND_PAGE_INFO, OPTIONS);
};
