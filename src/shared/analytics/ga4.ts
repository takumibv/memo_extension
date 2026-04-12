/**
 * GA4 Measurement Protocol クライアント
 *
 * Background (Service Worker) から GA4 にイベントを送信する。
 * Content Script / Popup からは使わない（CSP制約 + ライフサイクルの問題）。
 *
 * 環境変数:
 *   VITE_GA4_MEASUREMENT_ID - GA4 測定ID (G-XXXXXXXXXX)
 *   VITE_GA4_API_SECRET     - Measurement Protocol API シークレット
 *
 * @see https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

const getMeasurementId = (): string | undefined => import.meta.env.VITE_GA4_MEASUREMENT_ID;
const getApiSecret = (): string | undefined => import.meta.env.VITE_GA4_API_SECRET;

/** GA4が設定済みかどうか */
const isEnabled = (): boolean => {
  const id = getMeasurementId();
  const secret = getApiSecret();
  return !!id && !!secret;
};

// ===== Client ID 管理 =====
// GA4はユーザー識別にclient_idが必要。匿名のランダムIDを使う。

const CLIENT_ID_KEY = 'ga4_client_id';

const getOrCreateClientId = async (): Promise<string> => {
  const stored = await chrome.storage.local.get(CLIENT_ID_KEY);
  if (stored[CLIENT_ID_KEY]) return stored[CLIENT_ID_KEY] as string;

  const clientId = `${Date.now()}.${Math.floor(Math.random() * 1_000_000_000)}`;
  await chrome.storage.local.set({ [CLIENT_ID_KEY]: clientId });
  return clientId;
};

// ===== イベント送信 =====

type GA4Event = {
  name: string;
  params?: Record<string, string | number | boolean>;
};

/**
 * GA4 にイベントを送信する。
 * 送信失敗してもエラーを投げない（fire-and-forget）。
 */
const sendEvent = async (event: GA4Event): Promise<void> => {
  if (!isEnabled()) return;

  try {
    const clientId = await getOrCreateClientId();
    const measurementId = getMeasurementId();
    const apiSecret = getApiSecret();

    const url = `${GA4_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    const body = {
      client_id: clientId,
      events: [
        {
          name: event.name,
          params: {
            ...event.params,
            engagement_time_msec: '1',
          },
        },
      ],
    };

    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch {
    // fire-and-forget: 送信失敗は無視
  }
};

// ===== 定義済みイベント =====

/** 拡張機能インストール / アップデート */
export const trackInstall = (reason: string, previousVersion?: string) =>
  sendEvent({
    name: 'extension_install',
    params: { reason, previous_version: previousVersion ?? 'new' },
  });

/** ストレージ移行の成功 */
export const trackMigrationSuccess = (noteCount: number, pageCount: number) =>
  sendEvent({
    name: 'storage_migration_success',
    params: { note_count: noteCount, page_count: pageCount },
  });

/** ストレージ移行のスキップ（データなし or 移行済み） */
export const trackMigrationSkip = (reason: 'already_done' | 'no_legacy_data') =>
  sendEvent({
    name: 'storage_migration_skip',
    params: { reason },
  });

/** ストレージ移行のリトライ成功 */
export const trackMigrationRetrySuccess = (attempt: number, noteCount: number, pageCount: number) =>
  sendEvent({
    name: 'storage_migration_retry_success',
    params: { attempt, note_count: noteCount, page_count: pageCount },
  });

/** ストレージ移行のエラー（全リトライ失敗） */
export const trackMigrationError = (error: string, attempts: number) =>
  sendEvent({
    name: 'storage_migration_error',
    params: { error_message: error.slice(0, 100), attempts },
  });

/** 汎用エラー */
export const trackError = (context: string, error: string) =>
  sendEvent({
    name: 'extension_error',
    params: {
      error_context: context,
      error_message: error.slice(0, 100),
    },
  });

export const analytics = {
  sendEvent,
  trackInstall,
  trackMigrationSuccess,
  trackMigrationSkip,
  trackMigrationRetrySuccess,
  trackMigrationError,
  trackError,
};
