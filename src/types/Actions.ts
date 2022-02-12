import {
  BACKGROUND,
  CONTENT_SCRIPT,
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  GET_ALL_NOTES_AND_PAGE_INFO,
  OPEN_OPTION_PAGE,
  OPTIONS,
  POPUP,
  SET_ALL_NOTES,
  UPDATE_NOTE,
  SCROLL_TO_TARGET_NOTE,
  UPDATE_NOTE_VISIBLE,
} from "../pages/message/actions";
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

export type ToBackgroundMessageResponse = {
  notes?: Note[];
  pageInfos?: PageInfo[];
  error?: Error;
};

export type ToBackgroundMessageMethod =
  | typeof GET_ALL_NOTES
  | typeof CREATE_NOTE
  | typeof UPDATE_NOTE
  | typeof DELETE_NOTE
  | typeof OPEN_OPTION_PAGE
  | typeof GET_ALL_NOTES_AND_PAGE_INFO
  | typeof SCROLL_TO_TARGET_NOTE
  | typeof UPDATE_NOTE_VISIBLE;

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
  | typeof DELETE_NOTE;

export type SenderType = typeof POPUP | typeof CONTENT_SCRIPT | typeof BACKGROUND | typeof OPTIONS;

export type handleMessageType<ActionType, ResponseType> = (
  action: ActionType,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: ResponseType) => void
) => void;
