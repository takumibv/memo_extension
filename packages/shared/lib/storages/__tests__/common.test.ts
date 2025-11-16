import { getAllStorage, getStorage, setStorage, removeStorage, getNewId } from '../common.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('common storage functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllStorage', () => {
    it('should return all storage data', async () => {
      const mockData = {
        notes_1: [{ id: 1, title: 'Note 1' }],
        notes_2: [{ id: 2, title: 'Note 2' }],
        settings: { theme: 'dark' },
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const result = await getAllStorage();

      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(null);
    });

    it('should return empty object when storage is empty', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getAllStorage();

      expect(result).toEqual({});
    });
  });

  describe('getStorage', () => {
    it('should return storage data for specific key', async () => {
      const storageName = 'notes_1';
      const mockData = { notes_1: [{ id: 1, title: 'Note 1' }] };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const result = await getStorage(storageName);

      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(storageName);
    });

    it('should return empty object when key does not exist', async () => {
      const storageName = 'non_existent_key';

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getStorage(storageName);

      expect(result).toEqual({});
    });
  });

  describe('setStorage', () => {
    it('should set storage data successfully', async () => {
      const storageName = 'notes_1';
      const data = [{ id: 1, title: 'Note 1' }];

      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime.lastError as any) = undefined;

      const result = await setStorage(storageName, data);

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ [storageName]: data });
    });

    it('should return false when storage set fails', async () => {
      const storageName = 'notes_1';
      const data = [{ id: 1, title: 'Note 1' }];

      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime as any).lastError = { message: 'Storage quota exceeded' };

      const result = await setStorage(storageName, data);

      expect(result).toBe(false);
    });

    it('should handle various data types', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime.lastError as any) = undefined;

      // Array
      await setStorage('array_key', [1, 2, 3]);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ array_key: [1, 2, 3] });

      // Object
      await setStorage('object_key', { foo: 'bar' });
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ object_key: { foo: 'bar' } });

      // String
      await setStorage('string_key', 'test');
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ string_key: 'test' });

      // Number
      await setStorage('number_key', 42);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ number_key: 42 });

      // Boolean
      await setStorage('boolean_key', true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ boolean_key: true });
    });
  });

  describe('removeStorage', () => {
    it('should remove storage data successfully', async () => {
      const storageName = 'notes_1';

      (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime.lastError as any) = undefined;

      const result = await removeStorage(storageName);

      expect(result).toBe(true);
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(storageName);
    });

    it('should return false when remove fails', async () => {
      const storageName = 'notes_1';

      (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime as any).lastError = { message: 'Remove failed' };

      const result = await removeStorage(storageName);

      expect(result).toBe(false);
    });
  });

  describe('getNewId', () => {
    it('should generate a new unique ID', () => {
      const existingData = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const newId = getNewId(existingData);

      expect(newId).toBeDefined();
      expect(typeof newId).toBe('number');
      expect(existingData.some(item => item.id === newId)).toBe(false);
    });

    it('should generate ID in expected range (0 - 999999)', () => {
      const existingData: { id?: number }[] = [];

      const newId = getNewId(existingData);

      expect(newId).toBeGreaterThanOrEqual(0);
      expect(newId).toBeLessThan(1000000);
    });

    it('should handle empty array', () => {
      const emptyData: { id?: number }[] = [];

      const newId = getNewId(emptyData);

      expect(newId).toBeDefined();
      expect(typeof newId).toBe('number');
    });

    it('should generate different IDs on multiple calls', () => {
      const existingData: { id?: number }[] = [];

      const id1 = getNewId(existingData);
      existingData.push({ id: id1 });

      const id2 = getNewId(existingData);
      existingData.push({ id: id2 });

      const id3 = getNewId(existingData);

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should avoid collision with existing IDs', () => {
      // 大量の既存IDがある場合でも衝突を回避
      const existingData = Array.from({ length: 100 }, (_, i) => ({ id: i }));

      const newId = getNewId(existingData);

      expect(existingData.some(item => item.id === newId)).toBe(false);
    });

    it('should handle data with undefined IDs', () => {
      const existingData = [{ id: 1 }, { id: undefined }, { id: 3 }];

      const newId = getNewId(existingData);

      expect(newId).toBeDefined();
      expect(typeof newId).toBe('number');
    });

    it('should eventually find unique ID even with many existing IDs', () => {
      // ランダム生成なので、理論的には衝突の可能性があるが、
      // アルゴリズムは衝突を検出して再生成する
      const existingData = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

      const newId = getNewId(existingData);

      expect(newId).toBeDefined();
      expect(existingData.some(item => item.id === newId)).toBe(false);
      expect(newId).toBeGreaterThanOrEqual(0);
      expect(newId).toBeLessThan(1000000);
    });
  });

  describe('Storage error handling', () => {
    it('should handle Chrome API errors gracefully', async () => {
      const storageName = 'test_key';

      // Chrome APIがエラーを返す場合
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Chrome API error'));

      await expect(getStorage(storageName)).rejects.toThrow('Chrome API error');
    });

    it('should handle lastError in setStorage', async () => {
      const storageName = 'test_key';
      const data = { test: 'data' };

      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // lastErrorがある場合
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime as any).lastError = { message: 'QUOTA_BYTES_PER_ITEM quota exceeded' };
      const result1 = await setStorage(storageName, data);
      expect(result1).toBe(false);

      // lastErrorがない場合
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime.lastError as any) = undefined;
      const result2 = await setStorage(storageName, data);
      expect(result2).toBe(true);
    });

    it('should handle lastError in removeStorage', async () => {
      const storageName = 'test_key';

      (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // lastErrorがある場合
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime as any).lastError = { message: 'Storage not found' };
      const result1 = await removeStorage(storageName);
      expect(result1).toBe(false);

      // lastErrorがない場合
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome.runtime.lastError as any) = undefined;
      const result2 = await removeStorage(storageName);
      expect(result2).toBe(true);
    });
  });
});
