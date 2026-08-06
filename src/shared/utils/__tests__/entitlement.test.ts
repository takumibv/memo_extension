import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/storages/licenseStorage', () => ({
  getLicenseStatus: vi.fn(),
}));

import { getLicenseStatus } from '@/shared/storages/licenseStorage';
import { getTrialUsed } from '@/shared/storages/trialStorage';
import { canCreateTrackingNote, recordTrackingNoteCreated, TRIAL_LIMIT } from '../entitlement';

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

describe('entitlement', () => {
  beforeEach(() => {
    setupMockStorage();
    (getLicenseStatus as ReturnType<typeof vi.fn>).mockResolvedValue({ state: 'unlicensed' });
  });

  it('未課金・トライアル未消化なら許可される', async () => {
    expect(await canCreateTrackingNote()).toEqual({ allowed: true, licensed: false, trialRemaining: TRIAL_LIMIT });
  });

  it('未課金でトライアルをTRIAL_LIMIT回消費すると、次の1回はブロックされる', async () => {
    for (let i = 0; i < TRIAL_LIMIT; i++) {
      const check = await canCreateTrackingNote();
      expect(check.allowed).toBe(true);
      await recordTrackingNoteCreated();
    }

    expect(await canCreateTrackingNote()).toEqual({ allowed: false, licensed: false, trialRemaining: 0 });
  });

  it('ライセンス有効時はトライアル残数に関わらず常に許可され、トライアルは消費されない', async () => {
    (getLicenseStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      state: 'licensed',
      payload: { licenseId: 'lic_1', plan: 'lifetime', issuedAt: new Date().toISOString() },
    });

    for (let i = 0; i < TRIAL_LIMIT + 5; i++) {
      const check = await canCreateTrackingNote();
      expect(check.allowed).toBe(true);
      await recordTrackingNoteCreated();
    }

    expect(await getTrialUsed()).toBe(0);
  });
});
