# Vite移行計画 (Step by Step)

## 前提
- ベース: chrome-extension-boilerplate-react-vite (クリーンな状態でpnpm build成功確認済み)
- 旧プロジェクト: old/ ディレクトリに保存している
- 各ステップでpnpm buildを実行し、成功することを確認してから次に進む

## Phase 1: Background Script移行

### Step 1-1: Backgroundスクリプトの移行
- [ ] old/src/pages/background/ の内容を確認
- [ ] chrome-extension/src/background/ に移行
- [ ] pnpm build で成功確認

## Phase 2: Popup移行

### Step 2-1: 必要な依存関係のインストール
- [ ] @mui/material, @emotion/react, @emotion/styled のインストール
- [ ] styled-components (v5系) の確認
- [ ] @heroicons/react のインストール
- [ ] 依存関係のバージョン互換性確認

### Step 2-2: 共通コンポーネントの移行 (Popup用)
- [ ] old/src/components/Button/ の内容を確認
- [ ] old/src/components/Icon.tsx の内容を確認
- [ ] packages/shared/lib/components/ に移行
- [ ] import pathを@extension/*形式に統一
- [ ] pnpm build で成功確認

### Step 2-3: Popupページの移行
- [ ] old/src/pages/Popup/ の内容を確認
- [ ] pages/popup/src/ に移行 (Popup.tsx, Popup.style.ts)
- [ ] import pathを@extension/*形式に統一
- [ ] pnpm build で成功確認

## Phase 3: Options移行

### Step 3-1: Optionsページの移行
- [ ] old/src/pages/Options/ の内容を確認
- [ ] pages/options/src/ に移行
- [ ] 必要な依存関係を確認・追加
- [ ] pnpm build で成功確認

## Phase 4: Content Script移行

### Step 4-1: Content Scriptの移行
- [ ] old/src/pages/contentScript/ の内容を確認
- [ ] pages/content/src/ に移行
- [ ] 必要な依存関係を確認・追加
- [ ] pnpm build で成功確認

## Phase 5: 共通コンポーネント・ユーティリティ移行

### Step 5-1: 共通コンポーネントの移行
- [ ] old/src/components/ の残りコンポーネントを確認
- [ ] packages/shared/lib/components/ に移行
- [ ] MUI v7 + Emotion への対応確認
- [ ] styled-components との共存確認
- [ ] pnpm build で成功確認

### Step 5-2: ユーティリティの移行
- [ ] old/src/utils.ts, resetCSS.ts の内容を確認
- [ ] packages/shared/lib/utils/ に移行
- [ ] pnpm build で成功確認

### Step 5-3: Storage移行
- [ ] old/src/storages/ の内容を確認
- [ ] packages/storage/ または適切な場所に移行
- [ ] pnpm build で成功確認

### Step 5-4: Hooks移行
- [ ] old/src/hooks/ の内容を確認
- [ ] packages/shared/lib/hooks/ または適切な場所に移行
- [ ] pnpm build で成功確認

## Phase 6: 静的ファイル・Manifest移行

### Step 6-1: _localesファイル移行
- [ ] old/public/_locales/ の内容を確認
- [ ] chrome-extension/public/_locales/ に移行
- [ ] pnpm build で成功確認

### Step 6-2: Manifest.json移行
- [ ] old/public/manifest.json の内容を確認
- [ ] chrome-extension/manifest.js に反映
- [ ] pnpm build で成功確認

### Step 6-3: アイコン・静的ファイル移行
- [ ] old/public/images/ などの静的ファイルを確認
- [ ] chrome-extension/public/ に移行
- [ ] pnpm build で成功確認

## Phase 7: 最終確認・テスト

### Step 7-1: ビルド成果物の確認
- [ ] dist/ フォルダの内容を確認
- [ ] 全ファイルが正しく生成されているか確認

### Step 7-2: Chrome拡張機能として動作確認
- [ ] Chromeブラウザで拡張機能を読み込み
- [ ] 各機能が正常に動作するか確認

### Step 7-3: 依存関係の最適化
- [ ] 不要な依存関係を削除
- [ ] package.jsonのクリーンアップ

## 注意事項
- 各ステップで必ずpnpm buildを実行し、エラーがないことを確認
- エラーが出た場合は、その場で解決してから次のステップに進む
- コミットは各フェーズ完了時に実施
