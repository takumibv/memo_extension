import { getDefaultColor, setDefaultColor } from '../defaultColorStorage.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('defaultColorStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;
  });

  describe('getDefaultColor', () => {
    it('should return empty string when no color is stored', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getDefaultColor();

      expect(result).toBe('');
      expect(chrome.storage.local.get).toHaveBeenCalledWith('default_color');
    });

    it('should return stored color value', async () => {
      const color = '#FF5733';
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        default_color: color,
      });

      const result = await getDefaultColor();

      expect(result).toBe(color);
    });

    it('should handle various color formats', async () => {
      const testColors = ['#FFFFFF', '#000000', 'rgb(255, 0, 0)', 'rgba(255, 0, 0, 0.5)', 'red', 'transparent'];

      for (const color of testColors) {
        (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
          default_color: color,
        });

        const result = await getDefaultColor();
        expect(result).toBe(color);
      }
    });
  });

  describe('setDefaultColor', () => {
    it('should set color value', async () => {
      const color = '#FF5733';

      const result = await setDefaultColor(color);

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ default_color: color });
    });

    it('should handle hex color codes', async () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];

      for (const color of colors) {
        await setDefaultColor(color);
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ default_color: color });
      }
    });

    it('should handle RGB color values', async () => {
      const color = 'rgb(255, 128, 0)';

      const result = await setDefaultColor(color);

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ default_color: color });
    });

    it('should handle named colors', async () => {
      const color = 'blue';

      const result = await setDefaultColor(color);

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ default_color: color });
    });

    it('should handle empty string', async () => {
      const result = await setDefaultColor('');

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ default_color: '' });
    });

    it('should return false when storage fails', async () => {
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(setDefaultColor('#FF0000')).rejects.toThrow('Storage error');
    });
  });

  describe('color state management', () => {
    it('should update and retrieve color', async () => {
      // Set initial color
      await setDefaultColor('#FF5733');

      // Mock retrieval
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        default_color: '#FF5733',
      });

      const retrieved = await getDefaultColor();
      expect(retrieved).toBe('#FF5733');

      // Update color
      await setDefaultColor('#00AAFF');

      // Mock updated retrieval
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        default_color: '#00AAFF',
      });

      const updatedColor = await getDefaultColor();
      expect(updatedColor).toBe('#00AAFF');
    });

    it('should maintain color across multiple get operations', async () => {
      const color = '#8B00FF';
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        default_color: color,
      });

      const result1 = await getDefaultColor();
      const result2 = await getDefaultColor();
      const result3 = await getDefaultColor();

      expect(result1).toBe(color);
      expect(result2).toBe(color);
      expect(result3).toBe(color);
      expect(chrome.storage.local.get).toHaveBeenCalledTimes(3);
    });

    it('should clear color by setting empty string', async () => {
      // Set initial color
      await setDefaultColor('#FF5733');
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        default_color: '#FF5733',
      });

      const initialColor = await getDefaultColor();
      expect(initialColor).toBe('#FF5733');

      // Clear color
      await setDefaultColor('');
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        default_color: '',
      });

      const clearedColor = await getDefaultColor();
      expect(clearedColor).toBe('');
    });
  });
});
