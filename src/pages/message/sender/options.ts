import { Note } from "../../../types/Note";
import { DELETE_NOTE, GET_ALL_NOTES_AND_PAGE_INFO, GET_SETTING, OPTIONS, UPDATE_DEFAULT_COLOR, UPDATE_NOTE, UPDATE_NOTE_INFO } from "../actions";
import { sendAction } from "./base";
import { PageInfo } from "../../../types/PageInfo";
import { Setting } from "../../../types/Setting";

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

export const sendUpdatePageInfo = async (pageInfo: PageInfo): Promise<{ pageInfos?: PageInfo[] }> => {
  return await sendAction(UPDATE_NOTE_INFO, OPTIONS, { pageInfo });
};

export const sendFetchSetting = async (): Promise<{ setting?: Setting }> => {
  return await sendAction(GET_SETTING, OPTIONS);
};

export const sendUpdateDefaultColor = async (defaultColor: string): Promise<{  setting?: Setting }> => {
  return await sendAction(UPDATE_DEFAULT_COLOR, OPTIONS, { defaultColor });
}