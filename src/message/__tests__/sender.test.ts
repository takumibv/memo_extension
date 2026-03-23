import { sendToBackground, sendToTab } from '../sender/base';
import { describe, it, expect, beforeEach } from 'vitest';
import type { vi } from 'vitest';

describe('message sender base', () => {
  beforeEach(() => {
    delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;
  });

  describe('sendToBackground', () => {
    it('メッセージを送信しレスポンスを返す', async () => {
      const mockResponse = { data: { notes: [], isVisible: true } };
      (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
        (_message: unknown, callback: (response: unknown) => void) => {
          callback(mockResponse);
        },
      );

      const result = await sendToBackground({
        type: 'popup:getAllNotes',
        payload: { tab: { id: 1, url: 'https://example.com' } as chrome.tabs.Tab },
      });

      expect(result).toEqual({ notes: [], isVisible: true });
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'popup:getAllNotes' }),
        expect.any(Function),
      );
    });

    it('chrome.runtime.lastErrorがある場合rejectする', async () => {
      (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
        (_message: unknown, callback: (response: unknown) => void) => {
          (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
            message: 'Extension context invalidated',
          };
          callback(undefined);
        },
      );

      await expect(
        sendToBackground({
          type: 'popup:getAllNotes',
          payload: { tab: { id: 1, url: 'https://example.com' } as chrome.tabs.Tab },
        }),
      ).rejects.toThrow('Extension context invalidated');
    });

    it('レスポンスにerrorがある場合rejectする', async () => {
      (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
        (_message: unknown, callback: (response: unknown) => void) => {
          callback({ error: 'このページでは使用できません' });
        },
      );

      await expect(
        sendToBackground({
          type: 'popup:createNote',
          payload: { tab: { id: 1, url: 'chrome://extensions' } as chrome.tabs.Tab },
        }),
      ).rejects.toThrow('このページでは使用できません');
    });
  });

  describe('sendToTab', () => {
    it('タブにメッセージを送信する', async () => {
      (chrome.tabs.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
        (_tabId: number, _message: unknown, callback: () => void) => {
          callback();
        },
      );

      await sendToTab(1, {
        type: 'bg:setupPage',
        payload: { url: 'https://example.com', notes: [] },
      });

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ type: 'bg:setupPage' }),
        expect.any(Function),
      );
    });

    it('chrome.runtime.lastErrorがある場合rejectする', async () => {
      (chrome.tabs.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
        (_tabId: number, _message: unknown, callback: () => void) => {
          (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
            message: 'Could not establish connection',
          };
          callback();
        },
      );

      await expect(
        sendToTab(999, {
          type: 'bg:setVisibility',
          payload: { url: 'https://example.com', isVisible: true },
        }),
      ).rejects.toThrow('Could not establish connection');
    });
  });
});
