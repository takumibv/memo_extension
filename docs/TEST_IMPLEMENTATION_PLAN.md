# テスト導入計画

## 現在の状況

### ✅ 既存のテスト環境

| カテゴリ | 状態 | 詳細 |
|---------|------|------|
| E2Eテスト | ✅ あり | Playwright使用（`tests/e2e/`） |
| ユニットテスト（chrome-extension） | ⚠️ 設定のみ | `vitest run`スクリプトあり、設定ファイルなし |
| ユニットテスト（pages） | ❌ なし | 設定もテストもなし |
| ユニットテスト（packages） | ❌ なし | 設定もテストもなし |

### 📁 テスト対象のディレクトリ

```
chrome-extension/src/
├── background/
│   ├── index.ts              # Service Worker (動的Content Script注入)
│   ├── actions.ts            # Storage操作、Badge更新
│   └── cache.ts              # タブごとのBadgeカウントキャッシュ
└── message/
    ├── actions.ts            # メッセージタイプ定数
    ├── sender/               # メッセージ送信関数
    │   ├── background.ts
    │   ├── popup.ts
    │   ├── options.ts
    │   └── contentScript.ts
    └── handler/
        └── background.ts     # メッセージハンドラー

pages/
├── popup/src/
│   ├── Popup.tsx             # Popup UI（MUI + styled-components）
│   └── Popup.style.ts
├── options/src/
│   ├── Options.tsx           # Options UI（シンプル版）
│   └── Options.style.ts
└── content/src/
    ├── App.tsx               # Content Script メインロジック
    ├── App.style.ts
    └── components/
        └── StickyNote/       # メモコンポーネント
            ├── StickyNote.tsx
            ├── StickyNote.style.ts
            └── StickyNoteActions.tsx
```

---

## テスト戦略

### テストの種類と優先順位

| テスト種類 | 優先度 | 対象 | ツール |
|-----------|--------|------|--------|
| **ユニットテスト** | 🔴 高 | ビジネスロジック、ユーティリティ | Vitest |
| **コンポーネントテスト** | 🟡 中 | React コンポーネント | Vitest + React Testing Library |
| **統合テスト** | 🟡 中 | メッセージパッシング、Storage操作 | Vitest + chrome API モック |
| **E2Eテスト** | 🟢 低 | 拡張機能全体の動作 | Playwright（既存） |

---

## Phase 1: ユニットテスト環境構築（優先度: 高）

### 対象

- `chrome-extension/src/background/`
- `chrome-extension/src/message/`
- `packages/shared/lib/`

### 必要な依存関係

```bash
# Vitest関連
pnpm i -D vitest@latest @vitest/ui -w

# Testing Library関連
pnpm i -D @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest -w

# Chrome API モック
pnpm i -D @types/chrome vitest-webextension-mock -w

# jsdom（React コンポーネントテスト用）
pnpm i -D jsdom@latest -w

# happy-dom（軽量な代替、オプション）
# pnpm i -D happy-dom@latest -w
```

### Vitest設定ファイル

#### 1. 共通設定: `vitest.config.shared.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export const createVitestConfig = (dirname: string) =>
  defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'build', '.turbo'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/dist/**',
          '**/__tests__/**',
        ],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@extension/shared': path.resolve(dirname, '../../packages/shared'),
        '@extension/storage': path.resolve(dirname, '../../packages/storage'),
        '@extension/i18n': path.resolve(dirname, '../../packages/i18n'),
      },
    },
  });
```

#### 2. chrome-extension用: `chrome-extension/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Background scriptはNode環境
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.turbo'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@extension/shared': path.resolve(__dirname, '../packages/shared'),
      '@extension/storage': path.resolve(__dirname, '../packages/storage'),
      '@extension/i18n': path.resolve(__dirname, '../packages/i18n'),
    },
  },
});
```

#### 3. pages用: `pages/popup/vitest.config.ts`

```typescript
import { createVitestConfig } from '../../vitest.config.shared';

export default createVitestConfig(__dirname);
```

#### 4. Setup ファイル: `chrome-extension/vitest.setup.ts`

```typescript
import { vi } from 'vitest';
import { chromeMock } from 'vitest-webextension-mock';

// Chrome API モック
global.chrome = chromeMock;

// Storage API モック
const storageMock = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
  sync: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
};

chrome.storage = storageMock as any;

// Runtime API モック
chrome.runtime = {
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
} as any;

// Tabs API モック
chrome.tabs = {
  query: vi.fn(),
  sendMessage: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
} as any;

// i18n API モック
chrome.i18n = {
  getMessage: vi.fn((key: string) => key), // keyをそのまま返す
  getUILanguage: vi.fn(() => 'en'),
} as any;
```

#### 5. React Setup: `pages/popup/vitest.setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { chromeMock } from 'vitest-webextension-mock';

// Chrome API モック
global.chrome = chromeMock;

// i18n モック（Reactコンポーネント用）
vi.mock('@extension/i18n', () => ({
  t: (key: string) => key,
}));
```

---

## Phase 2: テストケース作成（優先度順）

### 2-1. ユーティリティ関数テスト（最優先）

**対象**: `packages/shared/lib/utils/utils.ts`

```typescript
// packages/shared/lib/utils/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { encodeFormURL, decodeURL, formURL, formatDate, isSystemLink, isEqualsObject } from '../utils';

describe('encodeFormURL', () => {
  it('should encode URL with query params', () => {
    const result = encodeFormURL('https://example.com', { foo: 'bar', baz: 'qux' });
    expect(result).toBe('https://example.com?foo=bar&baz=qux');
  });

  it('should handle empty params', () => {
    const result = encodeFormURL('https://example.com', {});
    expect(result).toBe('https://example.com');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-16T12:00:00Z');
    const result = formatDate(date);
    // 実装に応じて期待値を調整
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe('isSystemLink', () => {
  it('should return true for system links', () => {
    expect(isSystemLink('chrome://extensions')).toBe(true);
    expect(isSystemLink('chrome-extension://abc123')).toBe(true);
  });

  it('should return false for normal links', () => {
    expect(isSystemLink('https://example.com')).toBe(false);
  });
});

describe('isEqualsObject', () => {
  it('should return true for equal objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    expect(isEqualsObject(obj1, obj2)).toBe(true);
  });

  it('should return false for different objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 3 };
    expect(isEqualsObject(obj1, obj2)).toBe(false);
  });
});
```

---

### 2-2. Storage操作テスト

**対象**: `packages/shared/lib/storages/noteStorage.ts`

```typescript
// packages/shared/lib/storages/__tests__/noteStorage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNote, updateNote, deleteNote, getAllNotesByPageId } from '../noteStorage';
import type { Note } from '../../types/Note';

// Chrome storage モック
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
};

global.chrome = {
  storage: mockStorage,
} as any;

describe('noteStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note with correct structure', async () => {
      const noteData = {
        title: 'Test Note',
        text: 'Test content',
        pageId: 'page123',
      };

      mockStorage.local.set.mockResolvedValue(undefined);

      const result = await createNote(noteData);

      expect(result).toMatchObject({
        title: 'Test Note',
        text: 'Test content',
        pageId: 'page123',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockStorage.local.set).toHaveBeenCalled();
    });
  });

  describe('getAllNotesByPageId', () => {
    it('should return notes for specific page', async () => {
      const mockNotes = {
        'note1': { id: 'note1', pageId: 'page123', title: 'Note 1' },
        'note2': { id: 'note2', pageId: 'page456', title: 'Note 2' },
        'note3': { id: 'note3', pageId: 'page123', title: 'Note 3' },
      };

      mockStorage.local.get.mockResolvedValue(mockNotes);

      const result = await getAllNotesByPageId('page123');

      expect(result).toHaveLength(2);
      expect(result[0].pageId).toBe('page123');
      expect(result[1].pageId).toBe('page123');
    });
  });
});
```

---

### 2-3. Background Actions テスト

**対象**: `chrome-extension/src/background/actions.ts`

```typescript
// chrome-extension/src/background/__tests__/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setBadge, updateBadge } from '../actions';

describe('Background Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setBadge', () => {
    it('should set badge with correct count', async () => {
      const setBadgeTextMock = vi.fn();
      chrome.action = {
        setBadgeText: setBadgeTextMock,
      } as any;

      await setBadge(5, 123);

      expect(setBadgeTextMock).toHaveBeenCalledWith({
        text: '5',
        tabId: 123,
      });
    });

    it('should clear badge when count is 0', async () => {
      const setBadgeTextMock = vi.fn();
      chrome.action = {
        setBadgeText: setBadgeTextMock,
      } as any;

      await setBadge(0, 123);

      expect(setBadgeTextMock).toHaveBeenCalledWith({
        text: '',
        tabId: 123,
      });
    });
  });
});
```

---

### 2-4. React コンポーネントテスト

**対象**: `packages/shared/lib/components/Button.tsx`

```typescript
// packages/shared/lib/components/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });
});
```

---

### 2-5. Custom Hooks テスト

**対象**: `packages/shared/lib/hooks/useClipboard.ts`

```typescript
// packages/shared/lib/hooks/__tests__/useClipboard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    // Clipboard API モック
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Hello, World!');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, World!');
    expect(result.current.copied).toBe(true);
  });

  it('should reset copied state after timeout', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });
});
```

---

## Phase 3: CI/CD統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run type check
        run: pnpm type-check

      - name: Run lint
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## package.json更新

### ルートpackage.json

```json
{
  "scripts": {
    "test": "turbo test",
    "test:watch": "turbo test:watch",
    "test:coverage": "turbo test:coverage",
    "test:ui": "turbo test:ui"
  }
}
```

### chrome-extension/package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### pages/popup/package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 実装スケジュール

### Week 1: 環境構築（4-6時間）

| タスク | 工数 |
|-------|------|
| 依存関係インストール | 0.5h |
| Vitest設定ファイル作成 | 1h |
| Chrome API モックセットアップ | 1h |
| サンプルテスト作成・動作確認 | 1h |
| package.json更新 | 0.5h |

### Week 2: ユーティリティテスト（4-6時間）

| テスト対象 | 工数 |
|----------|------|
| utils.ts | 2h |
| noteStorage.ts | 2h |
| その他storages | 2h |

### Week 3: ロジックテスト（6-8時間）

| テスト対象 | 工数 |
|----------|------|
| background/actions.ts | 2h |
| background/cache.ts | 1h |
| message/handler | 3h |

### Week 4: コンポーネントテスト（6-8時間）

| テスト対象 | 工数 |
|----------|------|
| Button, Icon | 2h |
| ColorPicker | 2h |
| useClipboard, useNoteEdit | 2h |
| StickyNoteActions | 2h |

### Week 5: CI/CD統合（2-3時間）

| タスク | 工数 |
|-------|------|
| GitHub Actions設定 | 1h |
| カバレッジレポート設定 | 1h |
| ドキュメント整備 | 1h |

---

## テストカバレッジ目標

| カテゴリ | 目標カバレッジ |
|---------|--------------|
| ユーティリティ関数 | 90%+ |
| Storage操作 | 80%+ |
| Background Actions | 70%+ |
| React Components | 70%+ |
| Hooks | 80%+ |
| **全体** | **75%+** |

---

## ベストプラクティス

### 1. テストファイルの配置

```
src/
├── utils/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
└── hooks/
    ├── useClipboard.ts
    └── __tests__/
        └── useClipboard.test.ts
```

### 2. テスト命名規則

- **ファイル名**: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- **describe**: 関数名またはコンポーネント名
- **it/test**: "should + 期待される動作"

### 3. AAA パターン

```typescript
it('should do something', () => {
  // Arrange (準備)
  const input = 'test';

  // Act (実行)
  const result = myFunction(input);

  // Assert (検証)
  expect(result).toBe('expected');
});
```

### 4. モックの使い方

```typescript
// 良い例: 必要最小限のモック
vi.mock('@extension/i18n', () => ({
  t: (key: string) => key,
}));

// 悪い例: 過度なモック
vi.mock('../entire-module', () => ({
  // すべての関数をモック化
}));
```

---

## トラブルシューティング

### Chrome API が undefined エラー

**解決策**: `vitest.setup.ts` で Chrome API モックを設定

```typescript
import { chromeMock } from 'vitest-webextension-mock';
global.chrome = chromeMock;
```

### React Testing Library エラー

**解決策**: `vitest.config.ts` で `environment: 'jsdom'` を設定

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

### Import エイリアス解決エラー

**解決策**: `vitest.config.ts` で `resolve.alias` を設定

```typescript
resolve: {
  alias: {
    '@extension/shared': path.resolve(__dirname, '../packages/shared'),
  },
},
```

---

## 参考資料

- [Vitest公式ドキュメント](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [vitest-webextension-mock](https://github.com/aklinker1/vitest-webextension-mock)
- [Chrome Extension Testing Best Practices](https://developer.chrome.com/docs/extensions/mv3/tut_testing/)

---

## 次のアクション

テスト環境を構築する準備ができました。以下の順序で進めます：

1. ✅ **依存関係のインストール**
2. ✅ **Vitest設定ファイルの作成**
3. ✅ **サンプルテストの作成と動作確認**
4. ⏳ **段階的なテストケース追加**

進めますか？
