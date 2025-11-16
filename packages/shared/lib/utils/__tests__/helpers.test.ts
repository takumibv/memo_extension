import { excludeValuesFromBaseArray, sleep } from '../helpers.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('helpers', () => {
  describe('excludeValuesFromBaseArray', () => {
    it('should exclude specified values from base array', () => {
      const baseArray = ['a', 'b', 'c', 'd', 'e'];
      const excludeArray = ['b', 'd'];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual(['a', 'c', 'e']);
    });

    it('should return original array when exclude array is empty', () => {
      const baseArray = ['a', 'b', 'c'];
      const excludeArray: string[] = [];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array when all values are excluded', () => {
      const baseArray = ['a', 'b', 'c'];
      const excludeArray = ['a', 'b', 'c'];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual([]);
    });

    it('should handle exclude values not in base array', () => {
      const baseArray = ['a', 'b', 'c'];
      const excludeArray = ['d', 'e', 'f'];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle mixed string and number exclude values', () => {
      const baseArray = ['a', 'b', 'c', 'd'];
      const excludeArray = ['b', 1, 'd', 2];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual(['a', 'c']);
    });

    it('should handle duplicate values in exclude array', () => {
      const baseArray = ['a', 'b', 'c', 'd'];
      const excludeArray = ['b', 'b', 'd', 'd'];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual(['a', 'c']);
    });

    it('should return empty array when base array is empty', () => {
      const baseArray: string[] = [];
      const excludeArray = ['a', 'b'];

      const result = excludeValuesFromBaseArray(baseArray, excludeArray);

      expect(result).toEqual([]);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should resolve after specified time', async () => {
      const sleepPromise = sleep(1000);

      // まだ解決されていない
      let resolved = false;
      sleepPromise.then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);

      // 1秒経過
      await vi.advanceTimersByTimeAsync(1000);

      // Promise解決を待つ
      await sleepPromise;

      expect(resolved).toBe(true);
    });

    it('should resolve after different time periods', async () => {
      const testCases = [100, 500, 2000];

      for (const time of testCases) {
        const sleepPromise = sleep(time);

        let resolved = false;
        sleepPromise.then(() => {
          resolved = true;
        });

        // まだ解決されていない
        expect(resolved).toBe(false);

        // 指定時間経過
        await vi.advanceTimersByTimeAsync(time);

        // Promise解決を待つ
        await sleepPromise;

        expect(resolved).toBe(true);
      }
    });

    it('should resolve immediately for 0 milliseconds', async () => {
      const sleepPromise = sleep(0);

      await vi.advanceTimersByTimeAsync(0);
      await sleepPromise;

      // エラーが発生しないことを確認
      expect(true).toBe(true);
    });

    it('should handle multiple concurrent sleeps', async () => {
      const sleep1 = sleep(1000);
      const sleep2 = sleep(2000);
      const sleep3 = sleep(500);

      let resolved1 = false;
      let resolved2 = false;
      let resolved3 = false;

      sleep1.then(() => {
        resolved1 = true;
      });
      sleep2.then(() => {
        resolved2 = true;
      });
      sleep3.then(() => {
        resolved3 = true;
      });

      // 500ms経過
      await vi.advanceTimersByTimeAsync(500);
      await Promise.resolve(); // microtask処理
      expect(resolved3).toBe(true);
      expect(resolved1).toBe(false);
      expect(resolved2).toBe(false);

      // さらに500ms経過（合計1000ms）
      await vi.advanceTimersByTimeAsync(500);
      await sleep1;
      expect(resolved1).toBe(true);
      expect(resolved2).toBe(false);

      // さらに1000ms経過（合計2000ms）
      await vi.advanceTimersByTimeAsync(1000);
      await sleep2;
      expect(resolved2).toBe(true);
    });
  });
});
