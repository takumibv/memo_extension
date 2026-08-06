import { getTrialRemaining, getTrialUsed, incrementTrialUsed, TRIAL_LIMIT } from '../trialStorage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('trialStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  it('未使用状態では0を返す', async () => {
    expect(await getTrialUsed()).toBe(0);
    expect(await getTrialRemaining()).toBe(TRIAL_LIMIT);
  });

  it('incrementTrialUsedを繰り返すとTRIAL_LIMITまで残数が減っていく', async () => {
    for (let i = 1; i <= TRIAL_LIMIT; i++) {
      const used = await incrementTrialUsed();
      expect(used).toBe(i);
    }
    expect(await getTrialUsed()).toBe(TRIAL_LIMIT);
    expect(await getTrialRemaining()).toBe(0);
  });

  it('TRIAL_LIMITを超えてincrementしても件数はクランプされる', async () => {
    for (let i = 0; i < TRIAL_LIMIT + 3; i++) {
      await incrementTrialUsed();
    }
    expect(await getTrialUsed()).toBe(TRIAL_LIMIT);
  });

  it('storageのcountを直接書き換えて(MAC不一致)改ざんすると、使用済み扱い(フェイルクローズ)になる', async () => {
    await incrementTrialUsed();
    await incrementTrialUsed();

    // devtools等でcountだけ書き換えられた想定(macは古いまま)
    const raw = mockStorage['trial_pinned_count_v1'] as { count: number; mac: string };
    mockStorage['trial_pinned_count_v1'] = { count: 0, mac: raw.mac };

    expect(await getTrialUsed()).toBe(TRIAL_LIMIT);
    expect(await getTrialRemaining()).toBe(0);
  });

  it('macが完全に不正な値の場合もフェイルクローズになる', async () => {
    mockStorage['trial_pinned_count_v1'] = { count: 1, mac: 'invalid-mac' };
    expect(await getTrialUsed()).toBe(TRIAL_LIMIT);
  });
});
