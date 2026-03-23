import { getDefaultColor, setDefaultColor } from '../defaultColorStorage';
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

describe('defaultColorStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  describe('getDefaultColor', () => {
    it('デフォルトで空文字を返す', async () => {
      const result = await getDefaultColor();

      expect(result).toBe('');
    });

    it('保存済みの色を返す', async () => {
      mockStorage['default_color'] = '#ff0000';

      const result = await getDefaultColor();

      expect(result).toBe('#ff0000');
    });
  });

  describe('setDefaultColor', () => {
    it('色を保存する', async () => {
      await setDefaultColor('#00ff00');

      expect(mockStorage['default_color']).toBe('#00ff00');
    });

    it('様々な色フォーマットを保存できる', async () => {
      await setDefaultColor('#ff0000');
      expect(mockStorage['default_color']).toBe('#ff0000');

      await setDefaultColor('rgb(0, 255, 0)');
      expect(mockStorage['default_color']).toBe('rgb(0, 255, 0)');

      await setDefaultColor('blue');
      expect(mockStorage['default_color']).toBe('blue');
    });

    it('空文字で色をリセットできる', async () => {
      await setDefaultColor('#ff0000');
      await setDefaultColor('');

      expect(mockStorage['default_color']).toBe('');
    });
  });
});
