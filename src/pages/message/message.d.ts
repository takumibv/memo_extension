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
  SETUP_PAGE,
  UPDATE_NOTE,
  SCROLL_TO_TARGET_NOTE,
  UPDATE_NOTE_VISIBLE,
  GET_NOTE_VISIBLE,
  SET_NOTE_VISIBLE,
} from "./actions";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";

export type MessageRequest = {
  method: MessageMethod;
  senderType: SenderType;
  tab?: chrome.tabs.Tab;
  payload?: MessageRequestPayload;
};

export type MessageRequestPayload = {
  url?: string;
  tab?: chrome.tabs.Tab;
  note?: Note;
  notes?: Note[];
  pageInfo?: PageInfo;
  isVisible?: boolean;
};

export type MessageResponse = {
  data?: MessageResponseData;
  error?: Error;
};

export type MessageResponseData = {
  notes?: Note[];
  pageInfos?: PageInfo[];
  isVisible?: boolean;
};

export type MessageMethod = ToBackgroundMessageMethod | ToContentScriptMessageMethod;

export type ToBackgroundMessageMethod =
  | typeof GET_ALL_NOTES
  | typeof CREATE_NOTE
  | typeof UPDATE_NOTE
  | typeof DELETE_NOTE
  | typeof OPEN_OPTION_PAGE
  | typeof GET_ALL_NOTES_AND_PAGE_INFO
  | typeof SCROLL_TO_TARGET_NOTE
  | typeof GET_NOTE_VISIBLE
  | typeof UPDATE_NOTE_VISIBLE;

export type ToContentScriptMessageMethod = typeof SETUP_PAGE | typeof SET_NOTE_VISIBLE;

export type SenderType = typeof POPUP | typeof CONTENT_SCRIPT | typeof BACKGROUND | typeof OPTIONS;
