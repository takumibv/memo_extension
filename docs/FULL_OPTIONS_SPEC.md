# フル機能版 Options ページ仕様書

## 概要

現在のシンプル版Optionsページ（デフォルトカラー設定のみ）を、旧実装に基づいたフル機能版に拡張する際の仕様書。

## アーキテクチャ

### ルーティング構成

```
/options/
├── /notes.html        - メモ一覧ページ（メインページ）
└── /setting.html      - 設定ページ
```

**使用ライブラリ:**
- react-router-dom (v5系)
- BrowserRouter, Route, Switch, Redirect, Link

### ページ構成

## 1. メモ一覧ページ (`/notes.html`)

### 機能概要

すべてのメモを一覧表示し、検索・フィルタリング・編集・削除が可能なページ。

### レイアウト

```
┌─────────────────────────────────────────────────────┐
│ Header (固定)                                        │
│ [Logo] Note Everywhere  [メモ] [設定]               │
├────────────┬────────────────────────────────────────┤
│            │ [検索ボックス] [ソート選択]            │
│ サイドバー │                                        │
│            │ ┌────────────────────────────────┐    │
│ ・全メモ   │ │ メモカード1                     │    │
│            │ │ タイトル / 本文 / 日時          │    │
│ ・Site A   │ │ [アクション: 編集/削除/色変更]   │    │
│ ・Site B   │ └────────────────────────────────┘    │
│ ・Site C   │                                        │
│            │ ┌────────────────────────────────┐    │
│            │ │ メモカード2                     │    │
│            │ └────────────────────────────────┘    │
│            │                                        │
│            │ (仮想スクロール: react-virtualized)   │
└────────────┴────────────────────────────────────────┘
```

### 主要コンポーネント

#### 1.1 OptionHeader コンポーネント

**役割:** アプリケーション全体のヘッダー

**機能:**
- アプリ名とロゴ表示
- メモ/設定タブの切り替え
- アクティブタブの視覚的表示（下線）

**Props:**
```typescript
type Props = {
  current: "notes" | "setting";
};
```

**使用するi18nキー:**
- `I18N.APP_NAME` - アプリ名
- `I18N.NOTE_HEADER` - "メモ"タブ
- `I18N.SETTINGS_HEADER` - "設定"タブ

#### 1.2 サイドバー (SSideNav)

**役割:** ページごとのフィルタリングナビゲーション

**機能:**
- 「全メモ」オプション（フィルタなし）
- サイトごとのメモ一覧表示
  - Faviconアイコン表示
  - ページタイトル表示
  - ページURL表示
- アクティブフィルタのハイライト表示
- 検索結果に基づくフィルタリング
- ソート対応（作成日/更新日/タイトル）

**State管理:**
```typescript
const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
const currentPageInfoId = query.get("filter") ? Number(query.get("filter")) : undefined;
```

**使用するi18nキー:**
- `I18N.SHOW_ALL_NOTE` - "全メモ"

#### 1.3 検索・ソート機能

**検索機能:**
- 対象: メモのタイトル、本文、ページURL、ページタイトル
- リアルタイム検索（入力即反映）
- サイドバーとメモ一覧の両方に適用

**ソート機能:**
- 作成日順（降順）
- 更新日順（降順）
- タイトル順（昇順）

**UI:**
```tsx
<SInputWrap>
  <SInputIcon />
  <SInput
    placeholder={t(I18N.SEARCH_QUERY)}
    value={searchText}
    onChange={onChangeSearch}
  />
</SInputWrap>

<SSelectWrap>
  <SSelectIcon />
  <SSelect onChange={onChangeSort}>
    <option value="created_at">{t(I18N.CREATED_AT_SORT_OPTION)}</option>
    <option value="updated_at">{t(I18N.UPDATED_AT_SORT_OPTION)}</option>
    <option value="title">{t(I18N.TITLE_SORT_OPTION)}</option>
  </SSelect>
</SSelectWrap>
```

#### 1.4 現在のページ情報表示エリア

**表示条件:** フィルタが適用されている場合のみ表示

**機能:**
- ページのFavicon表示
- ページタイトル表示
- ページURL表示・編集
- フィルタ解除ボタン（×アイコン）

**URL編集機能:**
- 鉛筆アイコンクリックで編集モード
- 保存/キャンセルボタン
- 警告メッセージ表示: `I18N.LINK_EDIT_NOTE`

```tsx
<SCurrentPageArea>
  <SCurrentPageAreaHeader>
    <SCurrentPageFaviconImage src={currentPageInfo.fav_icon_url} />
    <SCurrentPageTitle>{currentPageInfo.page_title}</SCurrentPageTitle>
    <SCurrentPageCloseButton onClick={() => onClickFilter()}>
      <XMarkIcon />
    </SCurrentPageCloseButton>
  </SCurrentPageAreaHeader>

  <SCurrentPageLinkArea>
    {linkEditMode ? (
      <>
        <SPageLinkEditInput value={editLink} onChange={...} />
        <SPageLinkEditInputAlert>{t(I18N.LINK_EDIT_NOTE)}</SPageLinkEditInputAlert>
        <SPageLinkEditButton onClick={handleSaveLink}>
          {t(I18N.SAVE)}
        </SPageLinkEditButton>
        <SPageLinkEditButton secondary onClick={...}>
          {t(I18N.CANCEL)}
        </SPageLinkEditButton>
      </>
    ) : (
      <>
        <SCurrentPageLink onClick={() => onClickLink(...)}>
          {currentPageInfo.page_url}
        </SCurrentPageLink>
        <SCurrentPageLinkEditButton onClick={handleEditLink}>
          <PencilSquareIcon />
        </SCurrentPageLinkEditButton>
      </>
    )}
  </SCurrentPageLinkArea>
</SCurrentPageArea>
```

#### 1.5 OptionListItem コンポーネント

**役割:** 個別メモのカード表示

**機能:**
- メモ内容表示（タイトル/本文）
- 背景色表示（メモの色設定）
- ダブルクリックで編集モーダル表示
- 作成日時・更新日時表示
- アクションボタン:
  - 編集（鉛筆アイコン）
  - コピー（クリップボードアイコン）
  - 色変更（パレットアイコン）
  - 削除（ゴミ箱アイコン）
- ページ情報表示（showPageInfo=trueの場合）
  - Favicon
  - ページタイトル
  - ページURLリンク
  - フィルタボタン（該当ページのみ表示）

**Props:**
```typescript
type Props = {
  note: Note;
  defaultColor?: string;
  pageInfo?: PageInfo;
  showPageInfo?: boolean;      // 全メモ表示時のみtrue
  currentPageInfoId?: number;
  onUpdate: (note: Note) => Promise<boolean>;
  onDelete: (note: Note) => Promise<boolean>;
  onClickLink: (url: string) => void;
  onClickFilter: (pageInfoId?: number) => void;
  measure?: () => void;         // react-virtualized用
};
```

**使用するi18nキー:**
- `I18N.EDIT` - 編集ボタン
- `I18N.COPY` / `I18N.COPIED` - コピーボタン
- `I18N.COLOR` - 色変更ボタン
- `I18N.DELETE` - 削除ボタン
- `I18N.CONFIRM_REMOVE_NOTE` - 削除確認ダイアログ
- `I18N.GO_TO_THIS_PAGE` - ページリンクツールチップ

**編集モーダル:**
- タイトル入力フィールド
- 本文入力フィールド（複数行）
- 保存/キャンセルボタン
- フォーカス制御（initFocus prop）

#### 1.6 仮想スクロール (react-virtualized)

**使用理由:** 大量のメモを効率的に表示するため

**使用コンポーネント:**
- `AutoSizer` - 親要素のサイズを自動取得
- `List` - 仮想スクロールリスト
- `CellMeasurer` / `CellMeasurerCache` - 動的な高さ測定

```tsx
const cache = useNote(
  () => new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  }),
  []
);

<AutoSizer>
  {({ height, width }) => (
    <List
      width={width}
      height={height}
      rowCount={filteredNotes.length}
      deferredMeasurementCache={cache}
      rowHeight={cache.rowHeight}
      rowRenderer={({ key, parent, index, style }) => (
        <CellMeasurer
          key={note.id}
          cache={cache}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          {({ measure, registerChild }) => (
            <div ref={registerChild} style={style}>
              <OptionListItem
                note={filteredNotes[index]}
                measure={measure}
                {...props}
              />
            </div>
          )}
        </CellMeasurer>
      )}
    />
  )}
</AutoSizer>
```

#### 1.7 空状態表示

**表示条件:**
- メモが0件の場合

```tsx
{!isLoading && filteredNotes.length === 0 && (
  <SNoNoteText>{t(I18N.NO_NOTE)}</SNoNoteText>
)}
```

#### 1.8 スケルトンローディング

**表示条件:**
- isLoading === true

**コンポーネント:**
```tsx
const CardListSkelton = () => (
  <>
    <div style={{ display: "flex" }}>
      <SSkeleton variant="rounded" width={"100%"} height={36} />
      <SSkeleton variant="rounded" width={192} height={36} />
    </div>
    <SSkeleton variant="rounded" width={"100%"} height={100} />
    <SSkeleton variant="rounded" width={"100%"} height={100} />
    <SSkeleton variant="rounded" width={"100%"} height={100} />
  </>
);
```

### データフロー

```
useEffect (初回マウント)
  ↓
sendFetchAllNotes()
  ↓
Background Service Worker
  ↓
Chrome Storage API
  ↓
{notes: Note[], pageInfos: PageInfo[]}
  ↓
State更新 (setNotes, setPageInfos)
  ↓
filteredNotes計算 (useNote)
  - 検索フィルタ適用
  - ページフィルタ適用
  - ソート適用
  ↓
react-virtualized List表示
```

### 操作フロー

#### メモ更新フロー

```
ユーザー操作 (編集/色変更)
  ↓
onUpdate(note)
  ↓
sendUpdateNote(note, page_url)
  ↓
Background Service Worker
  ↓
Chrome Storage更新
  ↓
{notes, pageInfos}レスポンス
  ↓
State更新
  ↓
再レンダリング
```

#### メモ削除フロー

```
削除ボタンクリック
  ↓
confirm(I18N.CONFIRM_REMOVE_NOTE)
  ↓
onDelete(note)
  ↓
sendDeleteNote(note, page_url)
  ↓
Background Service Worker
  ↓
Chrome Storage削除
  ↓
{notes, pageInfos}レスポンス
  ↓
State更新
  ↓
再レンダリング
```

#### ページリンククリック

```
URLリンククリック
  ↓
onClickLink(url)
  ↓
chrome.tabs.query({url, currentWindow: true})
  ↓
タブが存在する？
  Yes → chrome.tabs.update(tab.id, {active: true})
        chrome.tabs.reload(tab.id)
  No  → chrome.tabs.create({url})
```

---

## 2. 設定ページ (`/setting.html`)

### 機能概要

アプリケーション設定とメモのエクスポート機能を提供。

### レイアウト

```
┌─────────────────────────────────────────────────────┐
│ Header (固定)                                        │
│ [Logo] Note Everywhere  [メモ] [設定]               │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ デフォルトカラー                              │  │
│ │ [カラーピッカー]                              │  │
│ └──────────────────────────────────────────────┘  │
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ エクスポート                                  │  │
│ │ [CSVダウンロード] [txtダウンロード]          │  │
│ └──────────────────────────────────────────────┘  │
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ 使い方                                        │  │
│ │ [使い方コンポーネント]                        │  │
│ └──────────────────────────────────────────────┘  │
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ 作者                                          │  │
│ │ @takumi_bv                                    │  │
│ └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 設定項目

#### 2.1 デフォルトカラー設定

**機能:**
- 新規メモのデフォルト背景色を設定
- ColorPickerコンポーネント使用
- 変更即座に保存

**実装:**
```tsx
<SSettingItem>
  <SSettingItemTitle>{t(I18N.DEFAULT_COLOR)}</SSettingItemTitle>
  <SSettingItemContent>
    <ColorPicker
      color={defaultColor}
      onChangeColor={onClickDefaultColor}
    />
  </SSettingItemContent>
</SSettingItem>
```

#### 2.2 エクスポート機能

**CSV形式:**
```csv
id, title, description, url
1, "タイトル1", "本文1", https://example.com/page1
2, "タイトル2", "本文2", https://example.com/page2
```

**テキスト形式:**
```
id: 1
title: タイトル1
page: https://example.com/page1
content:
本文1
------------------------------------------------------------
id: 2
title: タイトル2
page: https://example.com/page2
content:
本文2
```

**実装:**
```tsx
<SSettingItem>
  <SSettingItemTitle>{t(I18N.EXPORT)}</SSettingItemTitle>
  <SSettingItemContent>
    <Button onClick={handleDownloadCSV}>
      {t(I18N.CSV_DOWNLOAD)}
    </Button>
    <Button onClick={handleDownloadText} style={{marginLeft: '0.5rem'}}>
      {t(I18N.TEXT_DOWNLOAD)}
    </Button>
  </SSettingItemContent>
</SSettingItem>
```

**使用フック:**
```typescript
const { handleDownload } = useNoteDownload();

const handleDownloadCSV = () => {
  const copyHead = "id, title, description, url\n";
  const copyText = notes.map(note => {
    return `${note.id}, ${note.title ? `"${note.title}"` : ""}, ${
      note.description ? `"${note.description}"` : ""
    }, ${pageInfos.find(p => p.id === note.page_info_id)?.page_url}`;
  }).join("\n");
  handleDownload(copyHead + copyText);
};

const handleDownloadText = () => {
  const copyText = notes.map(note => {
    return `id: ${note.id}
title: ${note.title ?? ""}
page: ${pageInfos.find(p => p.id === note.page_info_id)?.page_url}
content:
${note.description ?? ""}`;
  }).join("\n------------------------------------------------------------\n");
  handleDownload(copyText, "text/plain", "txt");
};
```

#### 2.3 使い方ガイド

**コンポーネント:** `Usage`

**内容:**
- 拡張機能の使い方説明
- スクリーンショット付き手順

**使用するi18nキー:**
- `I18N.HOW_TO_USE_PAGE_LINK` - "使い方"
- `I18N.USAGE_01` ~ `I18N.USAGE_07` - 各ステップ

#### 2.4 作者情報

**表示内容:**
- 作者名（Twitterリンク）

**実装:**
```tsx
<SSettingItem>
  <SSettingItemTitle>{t(I18N.MAKER)}</SSettingItemTitle>
  <SSettingItemContent>
    <a href="https://twitter.com/takumi_bv" target="_blank">
      @takumi_bv
    </a>
  </SSettingItemContent>
</SSettingItem>
```

---

## 必要な依存関係

### npm パッケージ

```json
{
  "dependencies": {
    "react-router-dom": "^5.3.4",
    "react-virtualized": "^9.22.5"
  },
  "devDependencies": {
    "@types/react-router-dom": "^5.3.3",
    "@types/react-virtualized": "^9.21.x"
  }
}
```

### 既存の共有コンポーネント

- `ColorPicker` - カラーピッカー
- `Button` - ボタンコンポーネント
- `Icon` (CopyIcon, PalletIcon等) - アイコン
- `NoteEditModal` - メモ編集モーダル
- `Usage` - 使い方ガイド

### 新規作成が必要なコンポーネント

- `OptionHeader` - ヘッダーコンポーネント
- `OptionListItem` - メモカードコンポーネント

---

## 型定義

### Note型

```typescript
type Note = {
  id: number;
  page_info_id: number;
  title?: string;
  description?: string;
  color?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  is_fixed?: boolean;
  is_open?: boolean;
  created_at: string;
  updated_at: string;
};
```

### PageInfo型

```typescript
type PageInfo = {
  id: number;
  page_url?: string;
  page_title?: string;
  fav_icon_url?: string;
  created_at?: string;
  updated_at?: string;
};
```

---

## i18nキー一覧

### メモ一覧ページ用

- `I18N.APP_NAME` - "Note Everywhere"
- `I18N.NOTE_HEADER` - "メモ"
- `I18N.SHOW_ALL_NOTE` - "全メモ"
- `I18N.SEARCH_QUERY` - "検索"
- `I18N.CREATED_AT_SORT_OPTION` - "作成日"
- `I18N.UPDATED_AT_SORT_OPTION` - "更新日"
- `I18N.TITLE_SORT_OPTION` - "タイトル"
- `I18N.LINK_EDIT_NOTE` - "リンクが正しくないと..."
- `I18N.SAVE` - "保存"
- `I18N.CANCEL` - "キャンセル"
- `I18N.NO_NOTE` - "メモがありません"
- `I18N.EDIT` - "編集"
- `I18N.COPY` - "コピー"
- `I18N.COPIED` - "コピーしました"
- `I18N.COLOR` - "色"
- `I18N.DELETE` - "削除"
- `I18N.CONFIRM_REMOVE_NOTE` - "削除してよろしいですか？"
- `I18N.GO_TO_THIS_PAGE` - "このページへ移動"
- `I18N.FAILED_LOAD_PAGE` - "ページの読み込みに失敗しました"

### 設定ページ用

- `I18N.SETTINGS_HEADER` - "設定"
- `I18N.DEFAULT_COLOR` - "デフォルトカラー"
- `I18N.EXPORT` - "エクスポート"
- `I18N.CSV_DOWNLOAD` - "CSVダウンロード"
- `I18N.TEXT_DOWNLOAD` - "txtダウンロード"
- `I18N.HOW_TO_USE_PAGE_LINK` - "使い方"
- `I18N.MAKER` - "作者"

---

## スタイリング

### 使用技術

- **styled-components** (v5系) - 既存の実装との互換性のため
- 将来的に **Emotion** への移行を検討

### カラーパレット

```css
--primary-color: #4c4722;
--background-color: #fff;
--border-color: rgba(0, 0, 0, 0.1);
--hover-background: rgba(0, 0, 0, 0.05);
--icon-color: rgba(0, 0, 0, 0.4);
```

---

## 移行計画

### Phase 1: 依存関係とルーティング

1. react-router-dom, react-virtualizedのインストール
2. ルーティング構造の実装 (index.tsx)
3. OptionHeaderコンポーネントの移行

### Phase 2: メモ一覧ページ (基本構造)

1. Options.tsxの基本レイアウト実装
2. サイドバーナビゲーション実装
3. 検索・ソート機能実装

### Phase 3: メモ一覧ページ (詳細機能)

1. OptionListItemコンポーネント移行
2. react-virtualized統合
3. メモ編集・削除機能実装
4. ページ情報表示エリア実装

### Phase 4: 設定ページ

1. Setting.tsxの実装
2. エクスポート機能実装
3. Usageコンポーネント移行

### Phase 5: i18n対応とテスト

1. すべてのmsg()をt(I18N.*)に置き換え
2. 動作テスト
3. ビルド確認

---

## 注意事項

### React 19対応

- `VFC`型は廃止 → `React.FC`を使用
- `ReactDOM.render` → `createRoot`を使用

### 型安全性

- `any`型の使用を最小限に
- react-virtualizedの型定義に注意
- styled-componentsのworkaround: `(styled as any).xxx`

### パフォーマンス

- react-virtualizedによる仮想スクロール必須（大量メモ対応）
- useNoteでfilteredNotes/filterPageInfosを最適化
- useCallbackでイベントハンドラを最適化

### アクセシビリティ

- Tooltipで各アクションの説明を表示
- キーボード操作対応（Enterでモーダル保存など）
- 適切なaria属性の付与

---

## 参考ファイル

### 旧実装（参照用）

```
old/src/pages/Options/
├── index.tsx                    - ルーティング設定
├── Options.tsx                  - メモ一覧ページ
├── Options.style.ts             - メモ一覧ページスタイル
├── Setting.tsx                  - 設定ページ
├── Setting.style.ts             - 設定ページスタイル
└── index.style.ts               - 共通スタイル

old/src/components/
├── OptionHeader/
│   └── OptionHeader.tsx         - ヘッダーコンポーネント
└── OptionList/
    └── OptionListItem.tsx       - メモカードコンポーネント
```

### 現在の実装（シンプル版）

```
pages/options/src/
├── index.tsx                    - エントリーポイント
├── Options.tsx                  - 設定ページ（デフォルトカラーのみ）
└── Options.style.ts             - スタイル定義
```

---

## まとめ

フル機能版Optionsページは、以下の主要機能を提供します：

1. **メモ一覧管理** - すべてのメモの表示・編集・削除
2. **検索・フィルタリング** - テキスト検索、ページフィルタ、ソート
3. **仮想スクロール** - 大量メモの効率的な表示
4. **設定管理** - デフォルトカラー設定
5. **エクスポート** - CSV/テキスト形式でのエクスポート
6. **多言語対応** - 8言語対応のi18n実装

現在のシンプル版から移行する場合、段階的な実装が推奨されます。
