/**
 * 型安全なメッセージプロトコル (Discriminated Union)
 *
 * 旧: { method: 'GET_ALL_NOTES', senderType: 'POPUP', payload: { tab, ... } }
 * 新: { type: 'popup:getAllNotes', payload: { tab } }
 */
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { Setting } from '@/shared/types/Setting';

// ===== Background 向けメッセージ (Popup → Background) =====
type PopupGetAllNotes = { type: 'popup:getAllNotes'; payload: { tab: chrome.tabs.Tab } };
type PopupCreateNote = { type: 'popup:createNote'; payload: { tab: chrome.tabs.Tab } };
type PopupUpdateNote = { type: 'popup:updateNote'; payload: { tab: chrome.tabs.Tab; note: Note } };
type PopupDeleteNote = { type: 'popup:deleteNote'; payload: { tab: chrome.tabs.Tab; note: Note } };
type PopupScrollToNote = { type: 'popup:scrollToNote'; payload: { tab: chrome.tabs.Tab; note: Note } };
type PopupGetVisibility = { type: 'popup:getVisibility'; payload: { tab: chrome.tabs.Tab } };
type PopupUpdateVisibility = {
  type: 'popup:updateVisibility';
  payload: { tab: chrome.tabs.Tab; isVisible: boolean };
};

type PopupMessage =
  | PopupGetAllNotes
  | PopupCreateNote
  | PopupUpdateNote
  | PopupDeleteNote
  | PopupScrollToNote
  | PopupGetVisibility
  | PopupUpdateVisibility;

// ===== Background 向けメッセージ (Content → Background) =====
type ContentGetAllNotes = { type: 'content:getAllNotes'; payload: { url: string } };
type ContentUpdateNote = { type: 'content:updateNote'; payload: { url: string; note: Note } };
type ContentDeleteNote = { type: 'content:deleteNote'; payload: { url: string; note: Note } };
type ContentGetVisibility = { type: 'content:getVisibility' };
type ContentReady = { type: 'content:ready' };

type ContentMessage = ContentGetAllNotes | ContentUpdateNote | ContentDeleteNote | ContentGetVisibility | ContentReady;

// ===== Background 向けメッセージ (Options → Background) =====
type OptionsGetAllData = { type: 'options:getAllData' };
type OptionsUpdateNote = { type: 'options:updateNote'; payload: { note: Note } };
type OptionsDeleteNote = { type: 'options:deleteNote'; payload: { note: Note } };
type OptionsUpdatePageInfo = { type: 'options:updatePageInfo'; payload: { pageInfo: PageInfo } };
type OptionsGetSetting = { type: 'options:getSetting' };
type OptionsUpdateDefaultColor = { type: 'options:updateDefaultColor'; payload: { color: string } };

type OptionsMessage =
  | OptionsGetAllData
  | OptionsUpdateNote
  | OptionsDeleteNote
  | OptionsUpdatePageInfo
  | OptionsGetSetting
  | OptionsUpdateDefaultColor;

// ===== 全 Background 向けメッセージの統合型 =====
type ToBackgroundMessage = PopupMessage | ContentMessage | OptionsMessage;

// ===== Content Script 向けメッセージ (Background → Content) =====
type SetupPage = {
  type: 'bg:setupPage';
  payload: { url: string; notes: Note[]; isVisible?: boolean; defaultColor?: string };
};
type SetVisibility = { type: 'bg:setVisibility'; payload: { url: string; isVisible: boolean } };

type ToContentMessage = SetupPage | SetVisibility;

// ===== レスポンス型マッピング =====
type ResponseMap = {
  'popup:getAllNotes': { notes: Note[]; isVisible: boolean };
  'popup:createNote': { notes: Note[] };
  'popup:updateNote': { notes: Note[] };
  'popup:deleteNote': { notes: Note[] };
  'popup:scrollToNote': Record<string, never>;
  'popup:getVisibility': { isVisible: boolean };
  'popup:updateVisibility': { isVisible: boolean };
  'content:getAllNotes': { notes: Note[] };
  'content:updateNote': { notes: Note[] };
  'content:deleteNote': { notes: Note[] };
  'content:getVisibility': { isVisible: boolean };
  'content:ready': Record<string, never>;
  'options:getAllData': { notes: Note[]; pageInfos: PageInfo[] };
  'options:updateNote': { notes: Note[]; pageInfos: PageInfo[] };
  'options:deleteNote': { notes: Note[]; pageInfos: PageInfo[] };
  'options:updatePageInfo': { pageInfos: PageInfo[] };
  'options:getSetting': { setting: Setting };
  'options:updateDefaultColor': { setting: Setting };
};

// ===== ユーティリティ型 =====
type MessageResponse<T extends ToBackgroundMessage['type'] = ToBackgroundMessage['type']> = {
  data?: T extends keyof ResponseMap ? ResponseMap[T] : unknown;
  error?: string;
};

// メッセージがvalidかどうかの型ガード
const isToBackgroundMessage = (msg: unknown): msg is ToBackgroundMessage =>
  typeof msg === 'object' && msg !== null && 'type' in msg && typeof (msg as { type: unknown }).type === 'string';

const isToContentMessage = (msg: unknown): msg is ToContentMessage =>
  typeof msg === 'object' && msg !== null && 'type' in msg && typeof (msg as { type: unknown }).type === 'string';

export type {
  PopupMessage,
  ContentMessage,
  OptionsMessage,
  ToBackgroundMessage,
  ToContentMessage,
  ResponseMap,
  MessageResponse,
};
export { isToBackgroundMessage, isToContentMessage };
