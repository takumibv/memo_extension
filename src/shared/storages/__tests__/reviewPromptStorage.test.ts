import {
  getReviewPromptState,
  markDismissed,
  markSnoozed,
  shouldShowReviewPrompt,
  SNOOZE_DURATION_DAYS,
} from '../reviewPromptStorage';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

  (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  });

  delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;
};

describe('reviewPromptStorage', () => {
  beforeEach(() => {
    setupMockStorage();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getReviewPromptState', () => {
    it('未保存のときは undefined を返す', async () => {
      const state = await getReviewPromptState();
      expect(state).toBeUndefined();
    });
  });

  describe('markDismissed', () => {
    it('status: dismissed を保存する', async () => {
      await markDismissed();
      const state = await getReviewPromptState();
      expect(state).toEqual({ status: 'dismissed' });
    });
  });

  describe('markSnoozed', () => {
    it('status: snoozed と snoozedUntil (7日後) を保存する', async () => {
      await markSnoozed(SNOOZE_DURATION_DAYS);
      const state = await getReviewPromptState();
      const expected = new Date('2026-05-07T00:00:00Z').toISOString();
      expect(state).toEqual({ status: 'snoozed', snoozedUntil: expected });
    });
  });

  describe('shouldShowReviewPrompt', () => {
    it('noteCount < 10 のとき false を返す', async () => {
      expect(await shouldShowReviewPrompt(0)).toBe(false);
      expect(await shouldShowReviewPrompt(9)).toBe(false);
    });

    it('未保存 + noteCount >= 10 のとき true を返す', async () => {
      expect(await shouldShowReviewPrompt(10)).toBe(true);
      expect(await shouldShowReviewPrompt(50)).toBe(true);
    });

    it('dismissed なら noteCount に関わらず false', async () => {
      await markDismissed();
      expect(await shouldShowReviewPrompt(100)).toBe(false);
    });

    it('snoozed で期限内なら false', async () => {
      await markSnoozed(SNOOZE_DURATION_DAYS);
      // 6日後（期限内）
      vi.setSystemTime(new Date('2026-05-06T00:00:00Z'));
      expect(await shouldShowReviewPrompt(20)).toBe(false);
    });

    it('snoozed で期限切れなら true', async () => {
      await markSnoozed(SNOOZE_DURATION_DAYS);
      // 8日後（期限切れ）
      vi.setSystemTime(new Date('2026-05-08T00:00:00Z'));
      expect(await shouldShowReviewPrompt(20)).toBe(true);
    });
  });
});
