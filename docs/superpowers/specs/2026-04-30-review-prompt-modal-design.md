# Review Prompt Modal Design

Status: Draft
Date: 2026-04-30

## 概要

Options 画面アクセス時に、Note を 10 個以上保有しているユーザーに対し、Chrome Web Store でのレビューと Buy Me a Coffee での支援をお願いするモーダルを表示する。表示は控えめにし、ユーザーが明示的に「次回から表示しない」を選んだ場合のみ完全に抑止する。「あとでにする」を選んだ場合は 1 週間後に再表示する。

## ゴール

- アクティブに使ってくれているユーザー（メモを 10 個以上保有）にレビューと支援を促す
- 押し付けがましくない UX：チェックボックスでオプトアウト可、スヌーズ可
- ハードコードされた外部 URL を一元管理する形に整理する（既存 `SettingsPage.tsx` の URL も一緒に置き換える）

## 非ゴール

- レビュー/コーヒー誘導のクリック数のトラッキング・分析
- 「絶対に再表示しない」状態を破棄してもう一度表示する管理画面の提供
- Note 数閾値を設定で変更可能にすること（10 個固定）
- レビューやコーヒーをクリックしたという永続的な状態の記録（モーダル open 中のみメモリで保持）

## 表示判定

`shouldShowReviewPrompt(noteCount)` の真理値：

| 条件                                        | 結果   |
| ------------------------------------------- | ------ |
| `noteCount < 10`                            | false |
| ストレージに状態なし（初回）                 | true  |
| `status === 'dismissed'`                    | false |
| `status === 'snoozed'` かつ期限内            | false |
| `status === 'snoozed'` かつ期限切れ          | true  |

判定はデータロード完了（`isLoading === false`）後に行い、`true` の場合は **1.5 秒の遅延** を入れてからモーダルを開く（画面が描画された後に自然に出るため）。

## データモデル

ストレージキー：`review_prompt_state`

```ts
type ReviewPromptStatus = 'snoozed' | 'dismissed';

type ReviewPromptState = {
  status: ReviewPromptStatus;
  snoozedUntil?: string; // ISO 8601, status === 'snoozed' のときのみ
};
```

- 状態が `undefined`（未保存）== 「まだ一度も表示していない」
- スヌーズ期間：**7 日間**（定数 `SNOOZE_DURATION_DAYS = 7`）

## ボタン挙動

### レビュー / コーヒーボタン

1. クリックで該当 URL を新規タブで開く（`target="_blank"` + `rel="noopener noreferrer"`）
2. 「次回から表示しない」チェックボックスを **自動的に ON にする**（ユーザーは手動で OFF にできる）
3. ボタンは残したまま、その下に小さくお礼メッセージを表示
   - レビュー：「レビューありがとうございます！🙏」
   - コーヒー：「コーヒーをありがとうございます！☕💛」
4. モーダルは閉じない（ストレージへの書き込みも発生しない）
5. ユーザーは再度ボタンを押せる

「クリック済み」状態は **メモリ上のみで保持**（コンポーネントの `useState`）。モーダルを閉じて再度表示された時はフレッシュ状態で開く。永続化はしない。

### 閉じる操作

| 操作                    | dontShowAgain チェック有 | チェック無               |
| ----------------------- | ----------------------- | ----------------------- |
| 「あとでにする」ボタン   | `dismissed` を保存       | `snoozed` (7 日後) を保存 |
| ✕（右上）               | `dismissed` を保存       | `snoozed` (7 日後) を保存 |
| ESC キー                 | `dismissed` を保存       | `snoozed` (7 日後) を保存 |
| 背景（オーバーレイ）クリック | **無効（モーダルは閉じない）** | **無効（モーダルは閉じない）** |

「次回から表示しない」が ON の場合、どの方法で閉じても `dismissed` になる（チェックボックスがすべてに優先する）。背景クリックは誤操作防止のため明示的に無効化する。

注意：レビュー / コーヒーボタンを押すとチェックボックスは自動的に ON になるが、ユーザーは手動で OFF にすることもできる。OFF にした状態で「あとでにする」または ✕ を押せば `snoozed` 扱いになる（クリック自体は履歴に影響しない）。

## ファイル構成

### 新規作成

| パス                                                          | 役割                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| `src/shared/constants/links.ts`                              | 静的 URL 定数（`buyMeACoffee`, `twitter`）                  |
| `src/shared/utils/chromeWebStore.ts`                          | `getChromeWebStoreReviewUrl()` を提供（`chrome.runtime.id` から動的生成） |
| `src/shared/storages/reviewPromptStorage.ts`                  | `getReviewPromptState`, `markDismissed`, `markSnoozed`, `shouldShowReviewPrompt` |
| `src/options/components/ReviewPromptModal.tsx`               | モーダル本体（@radix-ui/react-dialog 使用）                  |

### 変更

| パス                                              | 変更内容                                                 |
| ------------------------------------------------- | -------------------------------------------------------- |
| `src/entrypoints/options/App.tsx`                | 表示判定 + モーダルマウント                                |
| `src/options/components/SettingsPage.tsx`        | ハードコードされた buymeacoffee / twitter URL を `EXTERNAL_LINKS` 経由に置き換え |
| `src/shared/i18n/messages/ja.json` / `en.json`    | i18n キーを追加                                          |

## URL 一元管理（ハイブリッド方式）

`src/shared/constants/links.ts`：

```ts
export const EXTERNAL_LINKS = {
  buyMeACoffee: 'https://buymeacoffee.com/takumibv',
  twitter: 'https://x.com/takumi_bv',
} as const;
```

`src/shared/utils/chromeWebStore.ts`：

```ts
export const getChromeWebStoreReviewUrl = (): string =>
  `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`;
```

理由：拡張機能 ID は dev / production 環境で異なる可能性があるため、`chrome.runtime.id` から動的に生成する。一方 Buy Me a Coffee と Twitter は固定値なので constants で管理。

`SettingsPage.tsx` の既存ハードコードもこの `EXTERNAL_LINKS` を参照する形に書き換える（小さなリファクタ）。

## i18n キー

`shared/i18n/messages/{ja,en}.json` に以下を追加：

| キー                                  | ja                                                                                  | en                                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `review_prompt_title`                 | 拡張機能はいかがですか？                                                            | How are you enjoying the extension?                                                              |
| `review_prompt_description`           | いつもご利用いただきありがとうございます。よろしければストアでのレビューや、開発者へのご支援をいただけると励みになります 🙏 | Thanks for using the extension! A review or a small donation would mean a lot. 🙏                |
| `review_prompt_button_review`         | ⭐ ストアでレビューする                                                              | ⭐ Leave a review                                                                                  |
| `review_prompt_button_coffee`         | ☕ コーヒーを奢る                                                                    | ☕ Buy me a coffee                                                                                 |
| `review_prompt_button_later`          | あとでにする                                                                         | Maybe later                                                                                      |
| `review_prompt_dont_show_again`       | 次回から表示しない                                                                   | Don't show again                                                                                 |
| `review_prompt_thanks_review`         | レビューありがとうございます！🙏                                                     | Thanks for the review! 🙏                                                                         |
| `review_prompt_thanks_coffee`         | コーヒーをありがとうございます！☕💛                                                  | Thanks for the coffee! ☕💛                                                                       |

## UI 仕様

レイアウト：縦並びアクション（レイアウト1）。`@radix-ui/react-dialog` を使用。

```
┌─────────────────────────────────┐
│ ⭐                            ✕ │
│                                 │
│ 拡張機能はいかがですか？         │
│                                 │
│ いつもご利用いただきありがとう…   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⭐ ストアでレビューする       │ │  ← indigo-600
│ └─────────────────────────────┘ │
│ レビューありがとうございます！🙏  │  ← クリック後のみ表示（小さく）
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ☕ コーヒーを奢る              │ │  ← #FFDD00
│ └─────────────────────────────┘ │
│ コーヒーをありがとうございます！☕💛 │  ← クリック後のみ表示（小さく）
│ ─────────────────────────────── │
│ ☐ 次回から表示しない  あとでにする │
└─────────────────────────────────┘
```

- アイコン：`lucide-react` の `Star`（既に依存に入っている）
- アクションボタン：indigo（レビュー）と #FFDD00（コーヒー）。コーヒーボタンの色は既存 `SettingsPage.tsx` のトーンに揃える
- フッター：左にチェックボックス、右に「あとでにする」リンクボタン
- お礼メッセージ：ボタンの直下に `text-xs text-gray-500` で表示。クリック後のみ表示
- アニメーション：Radix の標準 fade + slide

## 状態管理（コンポーネント内）

```ts
const ReviewPromptModal = ({ open, onOpenChange }: Props) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [reviewedThisSession, setReviewedThisSession] = useState(false);
  const [donatedThisSession, setDonatedThisSession] = useState(false);

  const handleReview = () => {
    window.open(getChromeWebStoreReviewUrl(), '_blank', 'noopener,noreferrer');
    setReviewedThisSession(true);
    setDontShowAgain(true);
  };

  const handleCoffee = () => {
    window.open(EXTERNAL_LINKS.buyMeACoffee, '_blank', 'noopener,noreferrer');
    setDonatedThisSession(true);
    setDontShowAgain(true);
  };

  const handleClose = async () => {
    if (dontShowAgain) {
      await markDismissed();
    } else {
      await markSnoozed(SNOOZE_DURATION_DAYS);
    }
    onOpenChange(false);
  };

  // ✕、背景クリック、ESC キーすべて handleClose を経由
};
```

## エラーハンドリング

- ストレージ書き込み失敗（`markDismissed` / `markSnoozed`）：エラーをコンソールに出力するに留め、モーダルは閉じる。再表示されてもデータ損失のリスクは小さい
- `chrome.runtime.id` が未定義の場合（テスト環境など）：URL 生成は型上 `string` を返すが、`chrome.runtime.id` が空文字なら不正な URL になる。Options 画面では実際の拡張機能コンテキストで動くため通常は問題にならない

## テスト

`src/shared/storages/__tests__/reviewPromptStorage.test.ts` で以下をカバー：

- `shouldShowReviewPrompt`
  - noteCount < 10 → false
  - 未保存 + noteCount >= 10 → true
  - dismissed → false
  - snoozed で期限内 → false
  - snoozed で期限切れ → true
- `markDismissed` 後に `getReviewPromptState` が `{ status: 'dismissed' }` を返す
- `markSnoozed(7)` 後に `getReviewPromptState` が `{ status: 'snoozed', snoozedUntil: <7日後> }` を返す

既存のストレージテストパターン（`__tests__/common.test.ts` 等）に倣う。

## ロールアウト

- `Note` 数 10 個未満のユーザーには影響なし
- 既存ユーザーで Note 10 個以上 + ストレージに状態なし → 次回 Options アクセス時に初回表示

## 補足：ストレージへの書き込みタイミング

ストレージへの書き込みが発生するのは **モーダルを閉じた瞬間のみ**。レビュー / コーヒーボタンのクリックではストレージは触らない（メモリ上の `dontShowAgain` を ON にするだけ）。これにより：

- ユーザーが何かアクションを起こさずに（例：別タブに切り替えてそのまま放置）モーダルが残り続けても、ストレージは未変更のまま
- 次回 Options を開いた時、まだ「未保存」なので再表示される
- ユーザーが明示的に閉じた時にだけ `snoozed` または `dismissed` を確定する
