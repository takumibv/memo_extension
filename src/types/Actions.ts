import {
  BACKGROUND,
  CONTENT_SCRIPT,
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  MOVE_NOTE,
  OPEN_OPTION_PAGE,
  OPTIONS,
  POPUP,
  RESIZE_NOTE,
  SET_ALL_NOTES,
  UPDATE_NOTE,
  UPDATE_NOTE_DESCRIPTION,
  UPDATE_NOTE_IS_FIXED,
  UPDATE_NOTE_IS_OPEN,
  UPDATE_NOTE_TITLE,
} from "../actions";
import { Note } from "./Note";
import { PageInfo } from "./PageInfo";

export type ToBackgroundMessage = {
  method: ToBackgroundMessageMethod;
  senderType: SenderType;
  page_url: string;
  targetPageInfo?: PageInfo;
  targetNote?: Note;
  tab?: chrome.tabs.Tab;
  data?: any;
};

export type ToBackgroundMessageMethod =
  | typeof GET_ALL_NOTES
  | typeof CREATE_NOTE
  | typeof UPDATE_NOTE
  | typeof DELETE_NOTE
  | typeof OPEN_OPTION_PAGE;

export type ToContentScriptMessage = {
  method: ToContentScriptMessageMethod;
  senderType: SenderType;
  page_url: string;
  notes: Note[];
  data?: any;
};

export type ToContentScriptMessageMethod = typeof SET_ALL_NOTES;

export type NoteActionType =
  | typeof GET_ALL_NOTES
  | typeof CREATE_NOTE
  | typeof UPDATE_NOTE
  | typeof UPDATE_NOTE_TITLE
  | typeof UPDATE_NOTE_DESCRIPTION
  | typeof UPDATE_NOTE_IS_OPEN
  | typeof UPDATE_NOTE_IS_FIXED
  | typeof DELETE_NOTE
  | typeof MOVE_NOTE
  | typeof RESIZE_NOTE;

export type SenderType = typeof POPUP | typeof CONTENT_SCRIPT | typeof BACKGROUND | typeof OPTIONS;
