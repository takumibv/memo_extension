# どこでもメモ (Dokodemo Memo)

Webページ上に付箋メモを貼り付けるChrome拡張機能。

[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/XXX?label=users)](https://chromewebstore.google.com/detail/XXX)
![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://img.shields.io/badge/WXT-000000?style=flat-square)

## Features

- Webページ上にドラッグ&リサイズ可能な付箋メモを作成
- コンテキストメニュー（右クリック）からメモを追加
- メモの色変更、ピン留め、折りたたみ
- 全メモの一覧表示・検索・ソート（Optionsページ）
- データのインポート/エクスポート（JSON, CSV, テキスト）
- 多言語対応（日本語, English, 한국어, 中文, Español, Français, Deutsch, Italiano）

## Tech Stack

- [WXT](https://wxt.dev/) - Chrome Extension Framework
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)

## Setup

```bash
# Install dependencies
pnpm install

# Development (Chrome)
pnpm dev

# Development (Firefox)
pnpm dev:firefox

# Production build
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check
```

## Load Extension

### Chrome

1. `pnpm build`
2. `chrome://extensions` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」→ `.output/chrome-mv3` フォルダを選択

### Firefox

1. `pnpm build:firefox`
2. `about:debugging#/runtime/this-firefox` を開く
3. 「一時的なアドオンを読み込む」→ `.output/firefox-mv3/manifest.json` を選択

## Project Structure

```
src/
  entrypoints/       # WXT entrypoints (background, content, popup, options)
  background/        # Background script logic
  content/           # Content script components (StickyNote)
  message/           # Message passing (typed, discriminated union)
  options/           # Options page components
  shared/
    analytics/       # GA4 Measurement Protocol
    components/      # Shared UI components
    hooks/           # Custom hooks
    i18n/            # Internationalization
    storages/        # chrome.storage.local wrappers
    types/           # TypeScript types
    utils/           # Utility functions
  styles/            # Global CSS
```

## License

[MIT](LICENSE)
