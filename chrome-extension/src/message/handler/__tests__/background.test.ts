import { isScriptAllowedPage, hasContentScript, ROOT_DOM_ID } from '../background.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('message/handler/background utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ROOT_DOM_ID', () => {
    it('should have correct DOM ID constant', () => {
      expect(ROOT_DOM_ID).toBe('react-container-for-note-extension');
    });
  });

  describe('isScriptAllowedPage', () => {
    it('should return true when script can be injected', async () => {
      // chrome.runtime.lastError is undefined (success case)
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      vi.mocked(chrome.scripting.executeScript<unknown[], void>).mockResolvedValue([
        {
          result: undefined,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<void>[]);

      const result = await isScriptAllowedPage(1);

      expect(result).toBe(true);
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
      });
    });

    it('should return false when script cannot be injected (chrome.runtime.lastError exists)', async () => {
      // chrome.runtime.lastError exists (error case)
      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Cannot access chrome:// URLs',
      };

      vi.mocked(chrome.scripting.executeScript<unknown[], void>).mockResolvedValue([
        {
          result: undefined,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<void>[]);

      const result = await isScriptAllowedPage(1);

      expect(result).toBe(false);
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
      });
    });

    it('should handle different tab IDs', async () => {
      delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;

      vi.mocked(chrome.scripting.executeScript<unknown[], void>).mockResolvedValue([
        {
          result: undefined,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<void>[]);

      const tabIds = [1, 2, 999, 12345];

      for (const tabId of tabIds) {
        const result = await isScriptAllowedPage(tabId);

        expect(result).toBe(true);
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
          target: { tabId },
          func: expect.any(Function),
        });
      }
    });
  });

  describe('hasContentScript', () => {
    it('should return true when content script is already injected', async () => {
      vi.mocked(chrome.scripting.executeScript<unknown[], boolean>).mockResolvedValue([
        {
          result: true,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<boolean>[]);

      const result = await hasContentScript(1);

      expect(result).toBe(true);
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
      });
    });

    it('should return false when content script is not injected', async () => {
      vi.mocked(chrome.scripting.executeScript<unknown[], boolean>).mockResolvedValue([
        {
          result: false,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<boolean>[]);

      const result = await hasContentScript(1);

      expect(result).toBe(false);
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
      });
    });

    it('should execute function that checks for DOM element with correct ID', async () => {
      let executedFunc: (() => boolean) | undefined;

      vi.mocked(chrome.scripting.executeScript).mockImplementation(
        async (details: chrome.scripting.ScriptInjection<unknown[], boolean>) => {
          executedFunc = details.func as (() => boolean) | undefined;
          return [
            {
              result: false,
              frameId: 0,
            },
          ];
        },
      );

      await hasContentScript(1);

      // 実行される関数をシミュレート
      expect(executedFunc).toBeDefined();
      if (executedFunc) {
        // Function should check for element with ROOT_DOM_ID
        const funcString = executedFunc.toString();
        expect(funcString).toContain('react-container-for-note-extension');
        expect(funcString).toContain('getElementById');
      }
    });

    it('should handle different tab IDs', async () => {
      vi.mocked(chrome.scripting.executeScript<unknown[], boolean>).mockResolvedValue([
        {
          result: true,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<boolean>[]);

      const tabIds = [1, 2, 999, 12345];

      for (const tabId of tabIds) {
        const result = await hasContentScript(tabId);

        expect(result).toBe(true);
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
          target: { tabId },
          func: expect.any(Function),
        });
      }
    });

    it('should handle executeScript returning null result', async () => {
      vi.mocked(chrome.scripting.executeScript<unknown[], boolean | null>).mockResolvedValue([
        {
          result: null,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<boolean | null>[]);

      const result = await hasContentScript(1);

      // hasContentScript casts result as boolean, so null becomes null (not false)
      expect(result).toBe(null);
    });

    it('should handle executeScript returning undefined result', async () => {
      vi.mocked(chrome.scripting.executeScript<unknown[], void>).mockResolvedValue([
        {
          result: undefined,
          frameId: 0,
        },
      ] as chrome.scripting.InjectionResult<void>[]);

      const result = await hasContentScript(1);

      // hasContentScript casts result as boolean, so undefined becomes undefined (not false)
      expect(result).toBe(undefined);
    });
  });
});
