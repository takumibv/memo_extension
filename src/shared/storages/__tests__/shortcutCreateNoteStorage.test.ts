import { getShortcutCreateNote, setShortcutCreateNote } from '../shortcutCreateNoteStorage';
import { describe, it, expect } from 'vitest';
import type { vi } from 'vitest';

let mockStorage: Record<string, unknown> = {};

const setupMockStorage = () => {
  mockStorage = {};

  (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation((key: string | null) => {
    if (key === null) return Promise.resolve({ ...mockStorage });
    return Promise.resolve({ [key]: mockStorage[key] });
  });

  (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockImplementation((items: Record<string, unknown>) => {
    Object.assign(mockStorage, items);
    return Promise.resolve();
  });

  delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;
};

describe('shortcutCreateNoteStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  describe('getShortcutCreateNote', () => {
    it('未設定の場合は空文字を返す', async () => {
      const result = await getShortcutCreateNote();
      expect(result).toBe('');
    });

    it('保存済みのショートカットを返す', async () => {
      mockStorage['shortcut_create_note'] = 'Alt+Shift+KeyN';
      const result = await getShortcutCreateNote();
      expect(result).toBe('Alt+Shift+KeyN');
    });
  });

  describe('setShortcutCreateNote', () => {
    it('ショートカットを保存する', async () => {
      await setShortcutCreateNote('Alt+Shift+KeyN');
      expect(mockStorage['shortcut_create_note']).toBe('Alt+Shift+KeyN');
    });

    it('空文字でショートカットをリセットできる', async () => {
      await setShortcutCreateNote('Alt+Shift+KeyN');
      await setShortcutCreateNote('');
      expect(mockStorage['shortcut_create_note']).toBe('');
    });
  });
});
