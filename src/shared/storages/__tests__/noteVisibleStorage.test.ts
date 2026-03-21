import { getIsVisibleNote, setIsVisibleNote } from '../noteVisibleStorage';
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

describe('noteVisibleStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  describe('getIsVisibleNote', () => {
    it('デフォルトでfalseを返す', async () => {
      const result = await getIsVisibleNote();

      expect(result).toBe(false);
    });

    it('保存済みの値を返す', async () => {
      mockStorage['visible_notes'] = true;

      const result = await getIsVisibleNote();

      expect(result).toBe(true);
    });
  });

  describe('setIsVisibleNote', () => {
    it('trueを保存する', async () => {
      await setIsVisibleNote(true);

      expect(mockStorage['visible_notes']).toBe(true);
    });

    it('falseを保存する', async () => {
      await setIsVisibleNote(true);
      await setIsVisibleNote(false);

      expect(mockStorage['visible_notes']).toBe(false);
    });

    it('トグル動作が正しい', async () => {
      expect(await getIsVisibleNote()).toBe(false);

      await setIsVisibleNote(true);
      expect(await getIsVisibleNote()).toBe(true);

      await setIsVisibleNote(false);
      expect(await getIsVisibleNote()).toBe(false);
    });
  });
});
