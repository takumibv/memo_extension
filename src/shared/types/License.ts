export type LicensePlan = 'lifetime' | 'subscription';

export type LicensePayload = {
  licenseId: string;
  plan: LicensePlan;
  issuedAt: string;
  /** subscriptionプランのみ使用。lifetimeは常にundefined(無期限)。 */
  expiresAt?: string;
  email?: string;
};

export type LicenseStatus = { state: 'unlicensed' } | { state: 'licensed'; payload: LicensePayload };

/** Options画面表示用に、ライセンス状態とトライアル残数をまとめたビュー型。 */
export type LicenseStatusView = {
  licensed: boolean;
  plan?: LicensePlan;
  trialUsed: number;
  trialLimit: number;
  trialRemaining: number;
};
