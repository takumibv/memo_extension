import { getStorage, setStorage } from './common';
import { signHmac, verifyHmac } from '@/shared/utils/crypto';

export const TRIAL_LIMIT = 10;

const TRIAL_KEY = 'trial_pinned_count_v1';

/**
 * トライアル件数カウンタの改ざん検知用HMAC鍵。
 * コードに埋め込むため真の秘密ではなく、リバースエンジニアリングされれば突破される
 * (完全な改ざん防止はローカルのみでは不可能)。目的はdevtoolsからの
 * `chrome.storage.local`直接編集のような「カジュアルな」改ざんを防ぐこと。
 */
const TRIAL_HMAC_SECRET = 'note-everywhere.trial-counter.v1';

type TrialState = { count: number; mac: string };

const sign = (count: number) => signHmac(TRIAL_HMAC_SECRET, String(count));
const verify = (count: number, mac: string) => verifyHmac(TRIAL_HMAC_SECRET, String(count), mac);

/**
 * 検証済みの使用済みトライアル件数を返す。
 * - 未保存(初回利用): 0
 * - 保存済みだがMAC不一致(改ざん検知): フェイルクローズでTRIAL_LIMITを返す
 */
export const getTrialUsed = async (): Promise<number> => {
  const storage = await getStorage(TRIAL_KEY);
  const state = storage[TRIAL_KEY] as TrialState | undefined;
  if (!state) return 0;

  const valid = await verify(state.count, state.mac);
  if (!valid) return TRIAL_LIMIT;

  return state.count;
};

export const getTrialRemaining = async (): Promise<number> => Math.max(0, TRIAL_LIMIT - (await getTrialUsed()));

export const incrementTrialUsed = async (): Promise<number> => {
  const used = await getTrialUsed();
  const next = Math.min(used + 1, TRIAL_LIMIT);
  const mac = await sign(next);
  await setStorage(TRIAL_KEY, { count: next, mac } satisfies TrialState);
  return next;
};
