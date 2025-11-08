# i18n 使用ガイド

## 概要

このプロジェクトでは、Chrome Extension i18n APIを使用した多言語対応を実装しています。
TypeScript型定義を自動生成することで、型安全性とIDE補完を実現しています。

**サポート言語**: en, ja, ko, de, es, fr, it, zh_CN

---

## 基本的な使い方

### 推奨: I18N定数を使用

```typescript
import { t } from '@extension/i18n';
import { I18N } from '@extension/shared/lib/i18n/keys';

// ✅ 型安全 + IDE補完 + hoverでメッセージ内容を確認可能
const message = t(I18N.WELCOME);
```

### 非推奨: 文字列リテラル

```typescript
// ❌ typoのリスク、IDE補完なし、内容不明
const message = t('welcome_msg');
```

---

## 実践例

### ボタンテキスト

```tsx
export const CreateNoteButton = () => (
  <button>
    {/* hoverで "make note" と表示される */}
    {t(I18N.MAKE_NOTE_BUTTON)}
  </button>
);
```

### 複数のメッセージ

```tsx
export const UsageInstructions = () => (
  <div>
    <h2>{t(I18N.HOW_TO_USE_HEADER)}</h2>
    <ol>
      <li>{t(I18N.USAGE_01)}</li>
      <li>{t(I18N.USAGE_02)}</li>
      <li>{t(I18N.USAGE_03)}</li>
    </ol>
  </div>
);
```

### 条件分岐

```tsx
const message = hasNotes
  ? t(I18N.THIS_PAGE_NOTE_LIST)
  : t(I18N.NO_NOTE);
```

### 配列マッピング

```tsx
const sortOptions = [
  { value: 'updated', label: t(I18N.UPDATED_AT_SORT_OPTION) },
  { value: 'created', label: t(I18N.CREATED_AT_SORT_OPTION) },
  { value: 'title', label: t(I18N.TITLE_SORT_OPTION) },
];
```

---

## IDE機能の活用

### 1. オートコンプリート
`I18N.`と入力すると、すべてのキーが候補表示されます。

### 2. Hoverでメッセージ確認
カーソルを合わせると、実際のメッセージ内容がツールチップで表示されます。

```typescript
I18N.WELCOME
// ↑ hoverすると "Welcome to Note Everywhere!" と表示
```

### 3. 定義ジャンプ
`Cmd+Click` (Mac) / `Ctrl+Click` (Windows) で定義元にジャンプできます。

### 4. 使用箇所を検索
`Shift+F12`ですべての使用箇所をリスト表示できます。

### 5. 一括リネーム
`F2`で定数名を変更すると、すべての使用箇所が自動更新されます。

---

## UI文字列からコードを見つける方法

### 例: UI上の「make note」ボタンを実装しているコードを探す

1. UIで「make note」を発見
2. VSCodeで`"make note"`を検索
3. `packages/shared/lib/i18n/keys.ts`にヒット:
   ```typescript
   /** "make note" */
   MAKE_NOTE_BUTTON: 'make_note_button_msg' as const,
   ```
4. `I18N.MAKE_NOTE_BUTTON`を検索
5. 使用箇所にすぐ到達 ✅

---

## 翻訳ファイルの更新

### 1. messages.jsonを編集

```json
// packages/i18n/locales/en/messages.json
{
  "new_feature_title": {
    "message": "New Feature",
    "description": "Title for the new feature section"
  }
}
```

### 2. 型定義を再生成

```bash
pnpm generate:i18n-keys
```

### 3. コードで使用

```typescript
const title = t(I18N.NEW_FEATURE_TITLE);
```

---

## プレースホルダーの使用

### messages.jsonで定義

```json
{
  "greeting": {
    "message": "Hello, $NAME$!",
    "placeholders": {
      "name": {
        "content": "$1",
        "example": "Alice"
      }
    }
  }
}
```

### コードで使用

```typescript
const greeting = t(I18N.GREETING, 'Alice');
// 結果: "Hello, Alice!"
```

---

## 移行ガイド

### Before (従来の方式)

```tsx
import { msg } from '@extension/shared/lib/utils/utils';

export const Component = () => {
  // ❌ 何が表示されるか不明確
  return <h1>{msg('welcome_msg')}</h1>;
};
```

### After (推奨方式)

```tsx
import { t } from '@extension/i18n';
import { I18N } from '@extension/shared/lib/i18n/keys';

export const Component = () => {
  // ✅ hoverで内容確認可能
  return <h1>{t(I18N.WELCOME)}</h1>;
};
```

---

## よくあるエラーと解決方法

### エラー: Property 'XXX' does not exist on type 'typeof I18N'

**原因**: keys.tsが古い、または新しいキーが追加されていない

**解決**: `pnpm generate:i18n-keys`を実行

### IDE補完が効かない

**原因**: TypeScriptサーバーのキャッシュが古い

**解決**: VSCodeで`Cmd+Shift+P` → "TypeScript: Restart TS Server"

### コンパイルエラー: 存在しないキー

```typescript
// ❌ コンパイルエラー
const message = t(I18N.NON_EXISTENT_KEY);

// ✅ 正しい使用
const message = t(I18N.WELCOME);
```

---

## ベストプラクティス

### ✅ 推奨

- `I18N`定数を常に使用する
- 新しいキーを追加したら`pnpm generate:i18n-keys`を実行
- `description`フィールドで翻訳者向けの説明を記載

### ❌ 非推奨

- 文字列リテラルの直接使用
- マジックストリングの動的生成
- keys.tsの手動編集（自動生成ファイル）

---

## まとめ

| 項目 | 従来の方式 | 新しい方式 |
|------|-----------|----------|
| コード可読性 | ❌ 内容不明 | ✅ hover表示 |
| typo防止 | ❌ 実行時エラー | ✅ コンパイルエラー |
| IDE補完 | ❌ なし | ✅ あり |
| UI→コード検索 | ❌ 困難 | ✅ 簡単 |
| リファクタリング | ❌ 難しい | ✅ 安全 |

---

## 参考資料

- [Chrome Extension i18n API](https://developer.chrome.com/docs/extensions/reference/api/i18n)
- プロジェクト内の実装: `packages/i18n/`
- 自動生成スクリプト: `scripts/generate-i18n-keys.ts`
