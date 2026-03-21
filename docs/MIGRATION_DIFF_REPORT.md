# OLD vs NEW (WXT) 移行差分レポート

> 作成日: 2026-03-21
> 対象: `old/src/` (v0.4.1) と `wxt/src/` + `pages/` + `packages/shared/` + `chrome-extension/src/` の比較

---

## 目次

- [総括：欠損・差異一覧](#総括欠損差異一覧)
- [1. Background Script](#1-background-script)
- [2. Message連携](#2-message連携)
- [3. Content Script](#3-content-script)
- [4. Popup](#4-popup)
- [5. Options - メモ一覧](#5-options---メモ一覧)
- [6. Options - 設定](#6-options---設定)
- [7. Storages / Hooks / Types / Utils](#7-storages--hooks--types--utils)
- [8. Chrome API / Manifest](#8-chrome-api--manifest)
- [NEW版での改善点](#new版での改善点)

---

## 総括：欠損・差異一覧

### 🔴 高（機能が完全に欠損）

| # | 領域 | 欠損内容 | OLDの場所 | 対応状況 |
|---|------|---------|-----------|---------|
| 1 | Options | **ページURLインライン編集機能** — サイドバーでページ選択中にURLを直接編集し`sendUpdatePageInfo`で保存できた | `old/src/pages/Options/Options.tsx` L193-212 | ✅ 修正済み |
| 2 | Options | **ページ移動時の`chrome.tabs.reload`** — メモ再表示のためリロードしていた | `old/src/pages/Options/Options.tsx` L182-183 | ✅ 修正済み |
| 3 | Options | **ページ移動失敗時のエラーアラート** — `alert(msg("failed_load_page_msg"))` | `old/src/pages/Options/Options.tsx` L188-190 | ✅ 修正済み |
| 4 | Background/Message | **`options:deleteNote`でバッジ更新なし** — Optionsからノート削除時にタブのバッジ数を更新 | `old: handler/background.ts` L312-320 | ⏭️ スキップ（下記参照） |
| 5 | Message | **`content:createNote`がWXT版に欠落** — ContentScriptからの`CREATE_NOTE`メッセージ＋バッジ更新 | `old: handler/background.ts` L76-131 | ⏭️ スキップ（下記参照） |

#### #4 処理箇所の特定（修正スキップ）

バッジ更新は `chrome.tabs.onActivated` リスナー（`wxt/src/entrypoints/background.ts:138-144`）が **インメモリキャッシュ** (`wxt/src/background/cache.ts`) から読み取る仕組み。Optionsページでノート削除しても即時更新はされないが、タブ切替時にキャッシュから再読み込みされる。ただしキャッシュ自体は削除時に更新されないため、タブを切り替えるまでバッジは古い値のまま。ページリロード時に `chrome.tabs.onUpdated` で正しい値に更新される。

#### #5 処理箇所の特定（修正スキップ）

Content Scriptからのノート作成は **メッセージ経由ではなく**、コンテキストメニューの `chrome.contextMenus.onClicked` ハンドラ（`wxt/src/entrypoints/background.ts:48-80`）が Background 内で直接 `createNote()` ストレージ関数を呼ぶフロー。具体的には: コンテキストメニュークリック → `getOrCreatePageInfoByUrl(pageUrl)` → `createNote(pageInfo.id)` → キャッシュ更新（L61） → `injectContentScript` → `setupPage()`。

### 🟡 中（挙動変更・一部欠損）

| # | 領域 | 差異内容 | 備考 |
|---|------|---------|------|
| 6 | Options | **フィルター状態がURLに永続化されない** — OLDは`?filter=123`で維持、NEWはメモリのみ | リロードでリセットされる |
| 7 | Options | **サイドバーのページリストがソート・検索に連動しない** — OLDの`filterPageInfos`はソート＋検索連動 | ✅ 修正済み |
| 8 | Options | **本文ダブルクリックで`description`フォーカスが開かない** — OLDは`initFocus="description"` | NEWは常に`'title'`フォーカス |
| 9 | Content | **`isVisible`状態がContent Scriptから完全削除** — `SET_NOTE_VISIBLE`メッセージを無視 | OLDでも状態は更新するがJSXで未使用（元から壊れていた） |
| 10 | Hooks | **`useNoteDownload`が完全欠損** — CSV/テキストダウンロード用hook | sharedパッケージに不在 |
| 11 | Hooks | **`useRouter` / `useQuery`が完全欠損** — URLクエリパラメータ読み取り用 | NEWはReact Router不使用のため不要の可能性 |
| 12 | Utils | **`msg()` i18n関数が欠損** — OLDのi18n基盤関数 | WXTには別の`i18n.ts`が存在 |
| 13 | Message | **`popup:getVisibility`のsender関数が未実装** — 型・ハンドラは存在するが呼び出し関数なし | `wxt/src/message/sender/popup.ts` |
| 14 | Manifest | **`notifications`権限が追加だがAPI使用なし** — 不要な権限警告 | `wxt.config.ts` |
| 15 | Manifest | **`short_name`が削除** — `__MSG_appShortName__`が未参照に | |

### 🟢 低（意図的変更の可能性）

| # | 領域 | 差異内容 |
|---|------|---------|
| 16 | Background | 初回インストール時URL: `setting.html#init` → `options.html#init`（リネーム） |
| 17 | Message | `OPEN_OPTION_PAGE`メッセージタイプ削除（OLDでもstub/no-op） |
| 18 | Message | `content:ready` vs `CONTENT_SCRIPT_READY` — Ready signal名の不一致リスク |
| 19 | Storage | `getNotesByPageId(pageId)` / `getPageInfoById(pageId)` の引数が削除（どちらもstub） |
| 20 | Options | ローディングUI: Skeleton UI → シンプルなスピナーに変更 |

---

## 1. Background Script

### 対象ファイル

| OLD | NEW (chrome-extension) | NEW (wxt) |
|-----|------------------------|-----------|
| `old/src/pages/background/index.ts` | `chrome-extension/src/background/index.ts` | `wxt/src/entrypoints/background.ts` |
| `old/src/pages/background/actions.ts` | `chrome-extension/src/background/actions.ts` | `wxt/src/background/actions.ts` |
| `old/src/pages/background/cache.ts` | `chrome-extension/src/background/cache.ts` | `wxt/src/background/cache.ts` |

### 一致している機能

- `chrome.runtime.onInstalled` — バージョン移行処理、初回インストール時のタブ作成
- `chrome.contextMenus.create` / `onClicked` — コンテキストメニューからのノート作成
- `chrome.tabs.onUpdated` / `onActivated` / `onRemoved` — タブイベントリスナー
- `actions.ts` — `setBadgeText`, `setBadgeBackgroundColor` 等

### 差異

- **WXT版**: `injectContentScript`にtry/catch追加、`content:ready`メッセージ待機（3秒タイムアウト）— 改善
- **WXT版**: ストレージマイグレーション (`migrateStorageIfNeeded`) — 新機能
- **WXT版**: `isScriptAllowedPage` / `hasContentScript` にtry/catch — 改善

---

## 2. Message連携

### 対象ファイル

| OLD | NEW (wxt) |
|-----|-----------|
| `old/src/pages/message/actions.ts` | `wxt/src/message/types.ts` |
| `old/src/pages/message/message.d.ts` | (型はtypes.tsに統合) |
| `old/src/pages/message/handler/background.ts` | `wxt/src/message/handler/background.ts` |
| `old/src/pages/message/sender/base.ts` | `wxt/src/message/sender/base.ts` |
| `old/src/pages/message/sender/popup.ts` | `wxt/src/message/sender/popup.ts` |
| `old/src/pages/message/sender/contentScript.ts` | `wxt/src/message/sender/contentScript.ts` |
| `old/src/pages/message/sender/options.ts` | `wxt/src/message/sender/options.ts` |
| `old/src/pages/message/sender/background.ts` | `wxt/src/message/sender/background.ts` |

### アーキテクチャ変更

OLD: `{ method: string, senderType: string, payload }` — 文字列ベース
WXT: `{ type: 'popup:getAllNotes', payload: {...} }` — Discriminated Union型

### Popup → Background メッセージ

| OLD | WXT | 状態 |
|-----|-----|------|
| `GET_ALL_NOTES` (POPUP) | `popup:getAllNotes` | ✅ 一致 |
| `CREATE_NOTE` (POPUP) | `popup:createNote` | ✅ 一致 |
| `UPDATE_NOTE` (POPUP) | `popup:updateNote` | ✅ 一致 |
| `DELETE_NOTE` (POPUP) | `popup:deleteNote` | ✅ 一致 |
| `SCROLL_TO_TARGET_NOTE` | `popup:scrollToNote` | ✅ 一致 |
| `GET_NOTE_VISIBLE` (POPUP) | `popup:getVisibility` | ⚠️ ハンドラあり、sender関数なし |
| `UPDATE_NOTE_VISIBLE` | `popup:updateVisibility` | ✅ 一致 |

### Content → Background メッセージ

| OLD | WXT | 状態 |
|-----|-----|------|
| `GET_ALL_NOTES` (CS) | `content:getAllNotes` | ✅ 一致 |
| `CREATE_NOTE` (CS) | — | 🔴 **欠落** |
| `UPDATE_NOTE` (CS) | `content:updateNote` | ✅ 一致 |
| `DELETE_NOTE` (CS) | `content:deleteNote` | ✅ 一致 |
| `GET_NOTE_VISIBLE` (CS) | `content:getVisibility` | ✅ 一致 |
| `OPEN_OPTION_PAGE` (CS) | — | 削除（OLDでもstub） |

### Options → Background メッセージ

| OLD | WXT | 状態 |
|-----|-----|------|
| `GET_ALL_NOTES_AND_PAGE_INFO` | `options:getAllData` | ✅ 統合（notes+pageInfosを返す） |
| `UPDATE_NOTE` (OPTIONS) | `options:updateNote` | ✅ 一致 |
| `DELETE_NOTE` (OPTIONS) | `options:deleteNote` | ⚠️ **バッジ更新なし** |
| `UPDATE_NOTE_INFO` | `options:updatePageInfo` | ✅ 一致 |
| `GET_SETTING` | `options:getSetting` | ✅ 一致 |
| `UPDATE_DEFAULT_COLOR` | `options:updateDefaultColor` | ✅ 一致 |

### Background → Content メッセージ

| OLD | WXT | 状態 |
|-----|-----|------|
| `SETUP_PAGE` | `bg:setupPage` | ✅ 一致 |
| `SET_NOTE_VISIBLE` | `bg:setVisibility` | ✅ 一致 |

---

## 3. Content Script

### 対象ファイル

| OLD | NEW |
|-----|-----|
| `old/src/pages/contentScript/index.tsx` | `pages/content/src/matches/all/index.tsx` |
| `old/src/pages/contentScript/App.tsx` | `pages/content/src/App.tsx` |
| `old/src/pages/contentScript/App.style.ts` | `pages/content/src/App.style.ts` |
| `old/src/components/StickyNote/StickyNote.tsx` | `pages/content/src/components/StickyNote/StickyNote.tsx` |
| `old/src/components/StickyNote/StickyNote.style.ts` | `pages/content/src/components/StickyNote/StickyNote.style.ts` |
| `old/src/components/StickyNote/StickyNoteActions.tsx` | `pages/content/src/components/StickyNote/StickyNoteActions.tsx` |
| `old/src/components/NoteEditModal/*` | (Content Scriptでは未使用 — Options/Popup専用) |
| `old/src/components/ColorPicker/ColorPicker.tsx` | `packages/shared/lib/components/ColorPicker/ColorPicker.tsx` |

### 一致している機能

- **Shadow DOM注入** — `mode: "open"`, styled-components, MUI Popper/Popover/Modal container設定
- **iframe除外** — `window.top === window` ガード
- **DOMContentLoaded待機**
- **StickyNote全機能** — ドラッグ、リサイズ、色変更、ピン留め、編集、削除、コピー、折りたたみ
- **キーボードショートカット** — Escape（キャンセル）、Ctrl/Cmd+Enter（保存）
- **beforeunloadガード** — 編集中の未保存変更警告
- **StickyNoteActions** — 全6ボタン（ピン、編集、コピー、カラーピッカー、削除、折りたたみ）
- **ColorPicker** — 8色 + デフォルト色スウォッチ
- **メッセージリスナー** — `chrome.runtime.onMessage` で `SETUP_PAGE`, `SET_NOTE_VISIBLE` を処理

### 差異

| 項目 | OLD | NEW | 影響 |
|------|-----|-----|------|
| React API | `ReactDOM.render()` (v17) | `createRoot()` (v18) | 改善 |
| `isVisible`状態 | `useState(true)` で保持（ただしJSXで未使用） | **完全削除** | OLDでも壊れていたが、インフラも削除 |
| `CONTENT_SCRIPT_READY` | なし | `chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' })` | 新規追加（React 18非同期レンダリング対応） |
| `useCallback`依存配列 | 一部不足 | 修正済み | バグ修正 |
| `displayName` | なし | 追加 | DevTools改善 |

---

## 4. Popup

### 対象ファイル

| OLD | NEW |
|-----|-----|
| `old/src/pages/Popup/index.tsx` | `pages/popup/src/index.tsx` |
| `old/src/pages/Popup/Popup.tsx` | `pages/popup/src/Popup.tsx` |
| `old/src/pages/Popup/Popup.style.ts` | `pages/popup/src/Popup.style.ts` |

### 結果: 機能的に完全一致。回帰なし

- **Add Note ボタン** — `FabIconButton` + `PlusIcon`, disabled制御, `sendCreateNote` → ✅ 一致
- **Open Options ボタン** — `chrome.runtime.openOptionsPage()` → ✅ 一致
- **ノートリスト表示** — 空状態メッセージ、リスト表示 → ✅ 一致
- **Show/Hide トグル** — OLDでも既にコメントアウト。回帰ではない
- **Chrome API** — `chrome.tabs.query`, `chrome.runtime.openOptionsPage` → ✅ 一致

### スタイル差異（軽微）

- `SHeader`: `position: sticky`, `border-bottom` 追加（改善）
- `SListItem`: `border-top` → `border-bottom` に変更
- `SPinIconButton`: 削除（OLDでも未使用だったデッドコード）

---

## 5. Options - メモ一覧

### 対象ファイル

| OLD | NEW (wxt) |
|-----|-----------|
| `old/src/pages/Options/Options.tsx` | `wxt/src/options/components/MemoListPage.tsx` |
| `old/src/pages/Options/Options.style.ts` | (Tailwind CSS化) |
| `old/src/components/OptionHeader/OptionHeader.tsx` | `wxt/src/options/components/OptionsHeader.tsx` |
| `old/src/components/OptionList/OptionListItem.tsx` | `wxt/src/options/components/NoteCard.tsx` |

### 一致している機能

- サイドバー（URL別グループ表示、ファビコン、ページタイトル、アクティブ状態）
- テキスト検索（タイトル・本文・URL・ページタイトル）
- ソート（作成日時・更新日時・タイトル）
- ノートカード表示（タイトル、本文、色、日付）
- ノートアクション（編集、コピー、カラーピッカー、削除）
- NoteEditModal

### 差異

| 項目 | OLD | NEW | 状態 |
|------|-----|-----|------|
| ルーティング | React Router URLベース | state `tab` 切り替え | アーキ変更 |
| フィルター永続化 | `?filter=xxx` (URL) | メモリのみ | 🟡 劣化 |
| **ページURL編集** | **鉛筆ボタン→input→save/cancel** | **なし** | 🔴 **欠損** |
| **タブリロード** | **`chrome.tabs.reload(tab.id)`** | **なし** | 🔴 **欠損** |
| **エラーアラート** | **`alert(msg(...))`** | **なし** | 🔴 **欠損** |
| サイドバーソート連動 | ソート・検索に連動 | 存在確認のみ | 🟡 劣化 |
| ダブルクリック | 本文→`description`フォーカス | 常に`title`フォーカス | 🟡 劣化 |
| ローディングUI | Skeleton UI | スピナー | 🟢 変更 |
| サイドバーメモ件数バッジ | なし | あり | ✅ 改善 |
| ダークカラー対応 | なし | テキスト色自動切替 | ✅ 改善 |
| 本文折りたたみ | なし | 100文字/3行以上で展開ボタン | ✅ 改善 |
| ソート永続化 | メモリのみ | `localStorage` | ✅ 改善 |

---

## 6. Options - 設定

### 対象ファイル

| OLD | NEW (wxt) |
|-----|-----------|
| `old/src/pages/Options/Setting.tsx` | `wxt/src/options/components/SettingsPage.tsx` |
| `old/src/components/Usage/Usage.tsx` | `wxt/src/options/components/Usage.tsx` (推定) |

### 一致している機能

- デフォルトカラー設定（ColorPicker）
- CSV / テキストダウンロード
- 使い方ガイド（Usage）
- 初回インストール後のハイライト (`#init`)

### 差異

| 項目 | OLD | NEW | 状態 |
|------|-----|-----|------|
| JSONエクスポート | なし | `getAllStorage()` で全データ出力 | ✅ 新機能 |
| JSONインポート | なし | overwrite / merge 2モード | ✅ 新機能 |
| CSVエスケープ | ダブルクォート未エスケープ | `escapeCsv`関数で`""`エスケープ | ✅ バグ修正 |
| ノート数0時の無効化 | なし | `disabled={notes.length === 0}` | ✅ 改善 |
| 作者リンク | `twitter.com/takumi_bv` | `x.com/takumi_bv` | ✅ 更新 |

---

## 7. Storages / Hooks / Types / Utils

### Storages

| ファイル | 状態 | 備考 |
|---------|------|------|
| `noteStorage.ts` | ✅ 一致 | `getNotesByPageId`の引数削除（stub） |
| `noteVisibleStorage.ts` | ✅ 一致 | |
| `defaultColorStorage.ts` | ✅ 一致 | |
| `pageInfoStorage.ts` | ✅ 一致 | `getPageInfoById`の引数削除（stub） |
| `common.ts` | ✅ 一致 | `any` → `unknown` に改善 |

### Hooks

| Hook | 状態 | 備考 |
|------|------|------|
| `useNote.ts` | ✅ 一致 | `useEffect`依存配列修正（改善） |
| `useClipboard.ts` | ✅ 一致 | |
| `useNoteDownload.ts` | 🟡 **欠損** | sharedパッケージに不在 |
| `useRouter.ts` | 🟡 **欠損** | React Router不使用のため不要の可能性 |

### Types

| 型 | 状態 |
|----|------|
| `Note.ts` | ✅ 全フィールド一致 |
| `PageInfo.ts` | ✅ 全フィールド一致 |
| `Setting.ts` | ✅ 全フィールド一致 |

### Utils

| 関数 | 状態 | 備考 |
|------|------|------|
| `encodeFormURL`, `decodeURL`, `formURL` | ✅ 一致 | |
| `formatDate`, `isSystemLink`, `isEqualsObject` | ✅ 一致 | |
| `resetCSS`, `baseCSS`, `defaultFontFamilyCSS` | ✅ 一致 | default case追加（改善） |
| `msg()` | 🟡 **欠損** | WXTには別の`i18n.ts`が存在 |

---

## 8. Chrome API / Manifest

### Chrome API 使用状況

| API | OLD | NEW | 状態 |
|-----|-----|-----|------|
| `chrome.runtime.onInstalled` | ✅ | ✅ | 一致 |
| `chrome.runtime.onMessage` | ✅ | ✅ | 一致 |
| `chrome.runtime.sendMessage` | ✅ | ✅ | 一致 |
| `chrome.runtime.openOptionsPage` | ✅ | ✅ | 一致 |
| `chrome.runtime.getURL` | ✅ | ✅ | URL変更 (`setting.html` → `options.html`) |
| `chrome.tabs.query` | ✅ | ✅ | 一致 |
| `chrome.tabs.create` | ✅ | ✅ | 一致 |
| `chrome.tabs.update` | ✅ | ✅ | 一致 |
| `chrome.tabs.reload` | ✅ | ❌ | 🔴 **削除** |
| `chrome.tabs.sendMessage` | ✅ | ✅ | 一致 |
| `chrome.tabs.onUpdated/onActivated/onRemoved` | ✅ | ✅ | 一致 |
| `chrome.scripting.executeScript` | ✅ | ✅ | ファイルパス変更 |
| `chrome.storage.local.*` | ✅ | ✅ | 一致 |
| `chrome.contextMenus.*` | ✅ | ✅ | 一致 |
| `chrome.action.setBadgeText/BackgroundColor` | ✅ | ✅ | 一致 |
| `chrome.i18n.getMessage` | ✅ | ✅ | WXT版は`|| key`フォールバック追加 |

### Manifest 差異

| フィールド | OLD | NEW (WXT) |
|-----------|-----|-----------|
| `version` | 0.4.1 | 0.5.0 |
| `name` key | `__MSG_appName__` | `__MSG_extensionName__` |
| `options_page` | `memos.html` | `options_ui: { page: "options.html", open_in_tab: true }` |
| `permissions` | `tabs, contextMenus, storage, scripting` | `storage, scripting, tabs, notifications, contextMenus` |
| `host_permissions` | `*://*/*` | `<all_urls>` |
| `web_accessible_resources` | なし | `*.js, *.css, *.svg, icon-*` |
| `short_name` | `__MSG_appShortName__` | **削除** |
| `notifications` permission | なし | あり（**API使用なし — 不要**） |

---

## NEW版での改善点

| 領域 | 改善内容 |
|------|---------|
| Message | Discriminated Union型による型安全なメッセージプロトコル |
| Background | `injectContentScript`のtry/catch + Ready signal待機 |
| Background | ストレージマイグレーション機能 |
| Content | React 18 (`createRoot`) + `CONTENT_SCRIPT_READY`ハンドシェイク |
| Content | `useCallback`依存配列のバグ修正 |
| Options | ダークカラー対応（輝度に応じたテキスト色自動切替） |
| Options | サイドバーメモ件数バッジ |
| Options | ノート本文折りたたみ |
| Options | ソート設定の`localStorage`永続化 |
| Options | NoteEditModalを親に1つだけマウント（パフォーマンス改善） |
| Settings | JSONデータのフルエクスポート/インポート |
| Settings | CSVエスケープバグ修正 |
| Storage | `any` → `unknown` 型改善 |
| Utils | `resetCSS` default case追加 |
