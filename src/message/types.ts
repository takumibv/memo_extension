/**
 * 型安全なメッセージプロトコル (Discriminated Union)
 *
 * 旧: { method: 'GET_ALL_NOTES', senderType: 'POPUP', payload: { tab, ... } }
 * 新: { type: 'popup:getAllNotes', payload: { tab } }
 */
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { Selection } from '@/shared/types/Selection';
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
type PopupActivateInspector = {
  type: 'popup:activateInspector';
  payload: { tab: chrome.tabs.Tab };
};

type PopupMessage =
  | PopupGetAllNotes
  | PopupCreateNote
  | PopupUpdateNote
  | PopupDeleteNote
  | PopupScrollToNote
  | PopupGetVisibility
  | PopupUpdateVisibility
  | PopupActivateInspector;

// ===== Background 向けメッセージ (Content → Background) =====
type ContentGetAllNotes = { type: 'content:getAllNotes'; payload: { url: string } };
type ContentUpdateNote = { type: 'content:updateNote'; payload: { url: string; note: Note } };
type ContentDeleteNote = { type: 'content:deleteNote'; payload: { url: string; note: Note } };
type ContentGetVisibility = { type: 'content:getVisibility' };
type ContentCreatePinnedNote = {
  type: 'content:createPinnedNote';
  payload: { url: string; xpath: string; text: string; fallbackX: number; fallbackY: number };
};
type ContentAttachSelection = {
  type: 'content:attachSelection';
  payload: { url: string; noteId: number; xpath: string; text: string };
};

// content:ready はライフサイクル信号。通常のメッセージフローとは別扱い（injectContentScript内で処理）
type ContentMessage =
  | ContentGetAllNotes
  | ContentUpdateNote
  | ContentDeleteNote
  | ContentGetVisibility
  | ContentCreatePinnedNote
  | ContentAttachSelection;

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
  payload: {
    url: string;
    notes: Note[];
    selections?: Selection[];
    isVisible?: boolean;
    defaultColor?: string;
  };
};
type SetVisibility = { type: 'bg:setVisibility'; payload: { url: string; isVisible: boolean } };
type ActivateInspector = { type: 'bg:activateInspector' };

type ToContentMessage = SetupPage | SetVisibility | ActivateInspector;

// ===== レスポンス型マッピング =====
type ResponseMap = {
  'popup:getAllNotes': { notes: Note[]; isVisible: boolean };
  'popup:createNote': { notes: Note[] };
  'popup:updateNote': { notes: Note[] };
  'popup:deleteNote': { notes: Note[] };
  'popup:scrollToNote': Record<string, never>;
  'popup:getVisibility': { isVisible: boolean };
  'popup:updateVisibility': { isVisible: boolean };
  'popup:activateInspector': Record<string, never>;
  'content:getAllNotes': { notes: Note[] };
  'content:updateNote': { notes: Note[] };
  'content:deleteNote': { notes: Note[] };
  'content:getVisibility': { isVisible: boolean };
  'content:createPinnedNote': { notes: Note[] };
  'content:attachSelection': { notes: Note[] };
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

const BACKGROUND_MESSAGE_PREFIXES = ['popup:', 'content:', 'options:'] as const;
const CONTENT_MESSAGE_PREFIXES = ['bg:'] as const;

const hasStringType = (msg: unknown): msg is { type: string } =>
  typeof msg === 'object' && msg !== null && 'type' in msg && typeof (msg as { type: unknown }).type === 'string';

// メッセージがvalidかどうかの型ガード
const isToBackgroundMessage = (msg: unknown): msg is ToBackgroundMessage =>
  hasStringType(msg) && BACKGROUND_MESSAGE_PREFIXES.some(p => msg.type.startsWith(p));

const isToContentMessage = (msg: unknown): msg is ToContentMessage =>
  hasStringType(msg) && CONTENT_MESSAGE_PREFIXES.some(p => msg.type.startsWith(p));

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
