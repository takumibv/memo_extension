import { getLicenseStatus } from '@/shared/storages/licenseStorage';
import { getTrialRemaining, incrementTrialUsed, TRIAL_LIMIT } from '@/shared/storages/trialStorage';

export { TRIAL_LIMIT };

export type EntitlementCheck = {
  allowed: boolean;
  licensed: boolean;
  trialRemaining: number;
};

/**
 * 追従メモの作成/アタッチがエンタイトルメント判定でブロックされたことを表すエラー。
 * message/handler側でcatchし、UIに`trialRemaining`を伝える構造化レスポンスに変換する。
 */
export class EntitlementBlockedError extends Error {
  readonly trialRemaining: number;

  constructor(trialRemaining: number) {
    super('entitlement_blocked');
    this.name = 'EntitlementBlockedError';
    this.trialRemaining = trialRemaining;
  }
}

/**
 * 追従メモ(要素へのピン留め)を新規作成/アタッチしてよいかどうかを判定する。
 * ライセンス有効 または トライアル残数 > 0 の場合に許可する。
 */
export const canCreateTrackingNote = async (): Promise<EntitlementCheck> => {
  const status = await getLicenseStatus();
  const licensed = status.state === 'licensed';
  if (licensed) return { allowed: true, licensed, trialRemaining: await getTrialRemaining() };

  const trialRemaining = await getTrialRemaining();
  return { allowed: trialRemaining > 0, licensed, trialRemaining };
};

/**
 * 追従メモの作成に成功した後に呼ぶ。未課金の場合のみトライアルカウンタを消費する。
 */
export const recordTrackingNoteCreated = async (): Promise<void> => {
  const status = await getLicenseStatus();
  if (status.state === 'licensed') return;
  await incrementTrialUsed();
};
