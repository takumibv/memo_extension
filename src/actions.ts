// contentScript → background
export const GET_ALL_NOTES = "GET_ALL_NOTES";
export const GET_NOTES_BY_PAGE_ID = "GET_NOTES_BY_PAGE_ID";
export const CREATE_NOTE = "CREATE_NOTE";
export const UPDATE_NOTE = "UPDATE_NOTE";
export const UPDATE_NOTE_TITLE = "UPDATE_NOTE_TITLE";
export const UPDATE_NOTE_DESCRIPTION = "UPDATE_NOTE_DESCRIPTION";
export const UPDATE_NOTE_IS_OPEN = "UPDATE_NOTE_IS_OPEN";
export const UPDATE_NOTE_IS_FIXED = "UPDATE_NOTE_IS_FIXED";
export const DELETE_NOTE = "DELETE_NOTE";
export const MOVE_NOTE = "MOVE_NOTE";
export const RESIZE_NOTE = "RESIZE_NOTE";

export const OPEN_OPTION_PAGE = "OPEN_OPTION_PAGE";

// background → contentScript, Popup
export const SET_NOTE = "SET_NOTE"; // 単一のメモをセットする
export const SET_ALL_NOTES = "SET_ALL_NOTES"; // 全てのメモをセットする

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
