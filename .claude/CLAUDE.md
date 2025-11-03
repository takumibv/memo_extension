# Chrome Extension Vite Migration Project

このプロジェクトは、Chrome拡張機能「どこでもメモ」をWebpackからViteへ段階的に移行するプロジェクトです。

## プロジェクト概要

- **ベース**: chrome-extension-boilerplate-react-vite
- **ブランチ**: `feature/vite-migration-stepbystep`
- **旧プロジェクト**: `old/` ディレクトリに保存
- **移行方針**: 段階的移行（Phase 1: Background → Phase 2: Popup → Phase 3: Content Script → Phase 4: Options）

## 技術スタック

### パッケージマネージャー・ビルドツール
- **pnpm**: パッケージマネージャー（yarnやnpmは使用しない）
- **Vite 6.x**: ビルドツール
- **Turbo (Turborepo)**: モノレポビルドオーケストレーター
- **TypeScript 5.8.x**: 型安全性

### フロントエンド
- **React 19**: UIライブラリ（ダウングレード禁止）
- **MUI v7** (@mui/material v7.3.4): Material-UIコンポーネント
- **Emotion** (@emotion/react, @emotion/styled): CSS-in-JS（最終的な移行先）
- **styled-components v5.3.x**: CSS-in-JS（暫定的に使用、将来Emotionに移行予定）
- **@heroicons/react v2.2.0**: アイコンライブラリ

### Chrome Extension
- **Manifest V3**: Chrome拡張機能の仕様
- **Service Worker**: Backgroundスクリプトの実行環境

## 重要な制約とルール

### 1. コード品質に関するルール

#### ESLint・型エラーの扱い
- **原則**: `any`型や`eslint-disable`の使用は極力避ける
- **例外**: styled-components v5の型互換性問題のみ、以下のパターンを許容:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const SButton = (styled as any).button<Props>`
  ```
- **理由**: styled-components v5の型定義が不完全で、`styled.button`が正しく認識されないため
- **将来対応**: 最終的にEmotionへ移行することで解決予定

#### その他のeslint-disable
- 使用する場合は、必ず理由をコメントで明記する
- 一時的な回避策である場合は、TODOコメントを追加する
- 可能な限り、型定義やコード構造の改善で解決する

### 2. インポートパスの規約

#### モノレポパッケージ
- `@extension/shared`: 共通コンポーネント・ユーティリティ
- `@extension/storage`: ストレージ関連
- `@extension/i18n`: 国際化
- `@extension/ui`: UIコンポーネント

#### ファイル拡張子
- TypeScript ESModulesでは、import文に`.js`拡張子を明記する
- 例: `import { Note } from '../types/Note.js';`
- 理由: `--moduleResolution: node16/nodenext`で必須

### 3. スタイリングの規約

#### 現在の状態
- Popup: styled-components使用
- 将来的にEmotionへ移行予定
- MUI v7と併用

#### styled-componentsの型問題回避パターン
```typescript
import styled, { css } from 'styled-components';

// 正しいパターン（型エラー回避）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SButton = (styled as any).button<Props>`
  /* styles */
`;

// 誤ったパターン（型エラーが発生）
export const SButton = styled.button<Props>`  // ❌
export const SButton = styled('button')<Props>`  // ❌
```

### 4. Prettier設定

#### プロジェクト設定（`.prettierrc`）
```json
{
  "trailingComma": "all",
  "semi": true,
  "singleQuote": true,
  "arrowParens": "avoid",
  "printWidth": 120,
  "bracketSameLine": true,
  "htmlWhitespaceSensitivity": "strict"
}
```

#### エディタ設定
- `.vscode/settings.json`で`prettier.configPath`を明示
- VSCodeのグローバル設定を上書きしてプロジェクト設定を優先

### 5. 開発フロー

#### 各フェーズの作業手順
1. 旧プロジェクト（`old/`）のコードを確認
2. 新プロジェクトに移行（import pathを`@extension/*`形式に変更）
3. `pnpm turbo build --filter=<package>...`でビルド確認
4. `pnpm lint:fix`でLintエラー修正
5. `pnpm type-check`で型エラー確認
6. コミット（必ずPrettierとESLintをパス）

#### コミットメッセージ規約
- フォーマット: `<type>: <subject>`
- 例: `feat: migrate Popup page with MUI and styled-components support`
- 末尾に以下を追加:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### 6. ビルドコマンド

```bash
# 特定のパッケージとその依存関係をビルド
pnpm turbo build --filter=@extension/shared...
pnpm turbo build --filter=@extension/popup...

# 全体ビルド
pnpm build

# Lint修正
pnpm lint:fix

# 型チェック
pnpm type-check

# フォーマット
pnpm format
```

## トラブルシューティング

### styled-components型エラー
**症状**: `Property 'button' does not exist on type`
**解決**: `(styled as any).button`構文を使用し、eslint-disableコメントを追加

### Prettier設定が反映されない
**症状**: エディタとCLIで異なるフォーマット結果
**解決**: `.vscode/settings.json`に`prettier.configPath`を明記

### import拡張子エラー
**症状**: `Relative import paths need explicit file extensions`
**解決**: import文に`.js`拡張子を追加

### React 19互換性
**注意**: React 19へのダウングレードは避ける
**対応**: 依存関係の最新バージョンを使用（例: vite-plugin-node-polyfills v0.24.0）

## 現在の進捗状況

- ✅ Phase 1: Background Script移行 (コミット: 386afc7)
- ✅ Phase 2: Popup移行 (コミット: c80d68a)
- 🚧 Phase 3: Content Script移行
  - ✅ Phase 3-1: react-draggable & useNoteEditフック (コミット: 896be4d)
  - ⏳ Phase 3-2: StickyNoteコンポーネント
  - ⏳ Phase 3-3: Content Script本体
- ⏳ Phase 4: Options移行

詳細は`MIGRATION_PLAN.md`を参照。

## 参考資料

- [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)
- [MUI v7 Documentation](https://mui.com/)
- [styled-components Documentation](https://styled-components.com/)
- [Vite Documentation](https://vitejs.dev/)
