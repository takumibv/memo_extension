import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Chrome API モック（pages用: popup, options, content）
const createMockStorage = () => ({
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
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
});

const createMockRuntime = () => ({
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
  getManifest: vi.fn(() => ({ version: '0.5.0' })),
  id: 'test-extension-id',
  getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
});

const createMockTabs = () => ({
  query: vi.fn(),
  sendMessage: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
});

const createMockI18n = () => ({
  getMessage: vi.fn((key: string) => key),
  getUILanguage: vi.fn(() => 'en'),
});

// グローバルなchrome APIモックを設定
global.chrome = {
  storage: createMockStorage(),
  runtime: createMockRuntime(),
  tabs: createMockTabs(),
  i18n: createMockI18n(),
} as any;

// i18n モック（Reactコンポーネント用）
vi.mock('@extension/i18n', () => ({
  t: vi.fn((key: string) => key),
}));

// 各テストの前にモックをリセット
beforeEach(() => {
  vi.clearAllMocks();
});
