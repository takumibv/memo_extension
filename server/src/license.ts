import { base64UrlEncode, importEcdsaPrivateKey, signEcdsa } from './crypto';

export type LicensePlan = 'lifetime' | 'subscription';

export type LicensePayload = {
  licenseId: string;
  plan: LicensePlan;
  issuedAt: string;
  expiresAt?: string;
  email?: string;
};

const textEncoder = new TextEncoder();

/**
 * ライセンスコードを生成する。拡張側 (licenseStorage.ts) が期待する形式:
 * `${base64url(JSON.stringify(payload))}.${base64url(signature)}`
 */
export const issueLicenseCode = async (privateKeyJwk: JsonWebKey, payload: LicensePayload): Promise<string> => {
  const payloadB64 = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)));
  const privateKey = await importEcdsaPrivateKey(privateKeyJwk);
  const signatureB64 = await signEcdsa(privateKey, payloadB64);
  return `${payloadB64}.${signatureB64}`;
};

export const buildLifetimeLicensePayload = (licenseId: string, email?: string): LicensePayload => ({
  licenseId,
  plan: 'lifetime',
  issuedAt: new Date().toISOString(),
  email,
});
