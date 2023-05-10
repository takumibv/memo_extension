// contentScript, Popup, Option → background
export const GET_ALL_NOTES = "GET_ALL_NOTES";
export const GET_NOTES_BY_PAGE_ID = "GET_NOTES_BY_PAGE_ID";
export const CREATE_NOTE = "CREATE_NOTE";
export const UPDATE_NOTE = "UPDATE_NOTE";
export const DELETE_NOTE = "DELETE_NOTE";
export const GET_ALL_NOTES_AND_PAGE_INFO = "GET_ALL_NOTES_AND_PAGE_INFO";
export const GET_NOTE_VISIBLE = "GET_NOTE_VISIBLE";
export const UPDATE_NOTE_INFO = "UPDATE_NOTE_INFO";

// Popup → contentScript
export const SCROLL_TO_TARGET_NOTE = "SCROLL_TO_TARGET_NOTE";
export const OPEN_OPTION_PAGE = "OPEN_OPTION_PAGE";
export const UPDATE_NOTE_VISIBLE = "UPDATE_NOTE_VISIBLE"; // メモの表示設定を更新

// background → contentScript, Popup
export const SETUP_PAGE = "SETUP_PAGE"; // 全てのメモをセットする
export const SET_NOTE_VISIBLE = "SET_NOTE_VISIBLE"; // メモの表示設定をセットする

// page type
export const POPUP = "POPUP";
export const CONTENT_SCRIPT = "CONTENT_SCRIPT";
export const BACKGROUND = "BACKGROUND";
export const OPTIONS = "OPTIONS";
