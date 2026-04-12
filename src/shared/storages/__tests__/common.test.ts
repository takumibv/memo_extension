import { getAllStorage, getStorage, setStorage, removeStorage, getNewId } from '../common';
import { trackError } from '@/shared/analytics/ga4';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/shared/analytics/ga4', () => ({
  trackError: vi.fn(),
}));

describe('common storage functions', () => {
  describe('getAllStorage', () => {
    it('全ストレージデータを返す', async () => {
      const mockData = { key1: 'value1', key2: 'value2' };
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const result = await getAllStorage();

      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(null);
    });

    it('空のストレージで空オブジェクトを返す', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getAllStorage();

      expect(result).toEqual({});
    });
  });

  describe('getStorage', () => {
    it('指定キーのデータを返す', async () => {
      const mockData = { test_key: [1, 2, 3] };
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const result = await getStorage('test_key');

      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('test_key');
    });

    it('存在しないキーで空オブジェクトを返す', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getStorage('non_existent');

      expect(result).toEqual({});
    });
  });

  describe('setStorage', () => {
    it('正常にデータを保存しtrueを返す', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      const result = await setStorage('key', { data: 'value' });

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ key: { data: 'value' } });
    });

    it('lastErrorがある場合falseを返しtrackErrorを呼ぶ', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Quota exceeded',
      };

      const result = await setStorage('key', 'value');

      expect(result).toBe(false);
      expect(trackError).toHaveBeenCalledWith('storage_set', 'key: Quota exceeded');
    });

    it('例外発生時にtrackErrorを呼んで再スローする', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Write failed'));
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      await expect(setStorage('test_key', 'value')).rejects.toThrow('Write failed');
      expect(trackError).toHaveBeenCalledWith('storage_set', 'test_key: Write failed');
    });

    it('様々なデータ型を保存できる', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      await setStorage('arr', [1, 2, 3]);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ arr: [1, 2, 3] });

      await setStorage('str', 'hello');
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ str: 'hello' });

      await setStorage('num', 42);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ num: 42 });

      await setStorage('bool', true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ bool: true });
    });
  });

  describe('removeStorage', () => {
    it('正常に削除しtrueを返す', async () => {
      (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      const result = await removeStorage('key');

      expect(result).toBe(true);
      expect(chrome.storage.local.remove).toHaveBeenCalledWith('key');
    });

    it('lastErrorがある場合falseを返しtrackErrorを呼ぶ', async () => {
      (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Remove failed',
      };

      const result = await removeStorage('key');

      expect(result).toBe(false);
      expect(trackError).toHaveBeenCalledWith('storage_remove', 'key: Remove failed');
    });

    it('例外発生時にtrackErrorを呼んで再スローする', async () => {
      (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Delete failed'));
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      await expect(removeStorage('key')).rejects.toThrow('Delete failed');
      expect(trackError).toHaveBeenCalledWith('storage_remove', 'key: Delete failed');
    });
  });

  describe('getNewId', () => {
    it('ユニークなIDを生成する', () => {
      const existing = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const newId = getNewId(existing);

      expect(typeof newId).toBe('number');
      expect(existing.some(item => item.id === newId)).toBe(false);
    });

    it('0〜999999の範囲で生成する', () => {
      const newId = getNewId([]);

      expect(newId).toBeGreaterThanOrEqual(0);
      expect(newId).toBeLessThan(1000000);
    });

    it('空配列でも動作する', () => {
      const newId = getNewId([]);

      expect(typeof newId).toBe('number');
    });

    it('大量の既存IDがあっても衝突しない', () => {
      const existing = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

      const newId = getNewId(existing);

      expect(existing.some(item => item.id === newId)).toBe(false);
    });

    it('undefinedのIDを持つデータを扱える', () => {
      const existing = [{ id: 1 }, { id: undefined }, { id: 3 }];

      const newId = getNewId(existing);

      expect(typeof newId).toBe('number');
    });
  });

  describe('Chrome API エラーハンドリング', () => {
    it('Chrome APIエラー時にrejectされる', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Chrome API error'));

      await expect(getStorage('key')).rejects.toThrow('Chrome API error');
    });
  });
});
