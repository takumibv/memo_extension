import { vi } from 'vitest';

// Chrome API モック
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
  remove: vi.fn(),
  onUpdated: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
  onActivated: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
  onRemoved: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
});

const createMockAction = () => ({
  setBadgeText: vi.fn(),
  setBadgeBackgroundColor: vi.fn(),
  setIcon: vi.fn(),
  setTitle: vi.fn(),
});

const createMockScripting = () => ({
  executeScript: vi.fn(),
  insertCSS: vi.fn(),
  removeCSS: vi.fn(),
});

const createMockI18n = () => ({
  getMessage: vi.fn((key: string) => key),
  getUILanguage: vi.fn(() => 'en'),
  getAcceptLanguages: vi.fn(() => ['en']),
});

global.chrome = {
  storage: createMockStorage(),
  runtime: createMockRuntime(),
  tabs: createMockTabs(),
  action: createMockAction(),
  scripting: createMockScripting(),
  i18n: createMockI18n(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

beforeEach(() => {
  vi.clearAllMocks();
});
