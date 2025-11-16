import { getIsVisibleNote, setIsVisibleNote } from '../noteVisibleStorage.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('noteVisibleStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chrome.runtime.lastError as any) = undefined;
  });

  describe('getIsVisibleNote', () => {
    it('should return false when no value is stored', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getIsVisibleNote();

      expect(result).toBe(false);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('visible_notes');
    });

    it('should return stored visibility value (true)', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        visible_notes: true,
      });

      const result = await getIsVisibleNote();

      expect(result).toBe(true);
    });

    it('should return stored visibility value (false)', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        visible_notes: false,
      });

      const result = await getIsVisibleNote();

      expect(result).toBe(false);
    });
  });

  describe('setIsVisibleNote', () => {
    it('should set visibility to true', async () => {
      const result = await setIsVisibleNote(true);

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ visible_notes: true });
    });

    it('should set visibility to false', async () => {
      const result = await setIsVisibleNote(false);

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ visible_notes: false });
    });

    it('should return false when storage fails', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(setIsVisibleNote(true)).rejects.toThrow('Storage error');
    });
  });

  describe('visibility state management', () => {
    it('should toggle visibility state', async () => {
      // Initially false
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
      const initial = await getIsVisibleNote();
      expect(initial).toBe(false);

      // Set to true
      await setIsVisibleNote(true);
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        visible_notes: true,
      });
      const afterSet = await getIsVisibleNote();
      expect(afterSet).toBe(true);

      // Set back to false
      await setIsVisibleNote(false);
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        visible_notes: false,
      });
      const afterToggle = await getIsVisibleNote();
      expect(afterToggle).toBe(false);
    });

    it('should maintain state across multiple get operations', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        visible_notes: true,
      });

      const result1 = await getIsVisibleNote();
      const result2 = await getIsVisibleNote();
      const result3 = await getIsVisibleNote();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(chrome.storage.local.get).toHaveBeenCalledTimes(3);
    });
  });
});
