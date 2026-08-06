import { getStorage, setStorage, removeStorage } from './common';
import { LICENSE_PUBLIC_KEY_JWK } from '@/shared/constants/licensePublicKey';
import { base64UrlDecode, verifyEcdsaSignature } from '@/shared/utils/crypto';
import type { LicensePayload, LicenseStatus } from '@/shared/types/License';

const LICENSE_KEY = 'license_v1';

const textDecoder = new TextDecoder();

/**
 * ライセンスコードの形式: `${base64url(JSON.stringify(payload))}.${base64url(signature)}`
 * 署名対象メッセージは先頭のpayload部分(base64url文字列そのもの)。
 */
const splitCode = (code: string): { payloadB64: string; signatureB64: string } | undefined => {
  const parts = code.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined;
  return { payloadB64: parts[0], signatureB64: parts[1] };
};

const decodePayload = (payloadB64: string): LicensePayload | undefined => {
  try {
    const json = textDecoder.decode(base64UrlDecode(payloadB64));
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'licenseId' in parsed &&
      'plan' in parsed &&
      'issuedAt' in parsed
    ) {
      return parsed as LicensePayload;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const isExpired = (payload: LicensePayload): boolean => {
  if (payload.plan !== 'subscription' || !payload.expiresAt) return false;
  return new Date(payload.expiresAt).getTime() <= Date.now();
};

/**
 * codeの署名を検証し、有効な場合はデコード済みpayloadを返す。
 * 保存済みフィールドを直接信用せず、毎回この関数で再検証してからpayloadを取り出すことで、
 * chrome.storage.local内のデータを直接書き換える改ざんを無効化する
 * (署名が伴わないpayloadの書き換えは常に検証失敗になる)。
 */
export const verifyLicenseCode = async (code: string): Promise<LicensePayload | undefined> => {
  const split = splitCode(code);
  if (!split) return undefined;

  const payload = decodePayload(split.payloadB64);
  if (!payload) return undefined;

  const valid = await verifyEcdsaSignature(LICENSE_PUBLIC_KEY_JWK, split.payloadB64, split.signatureB64);
  if (!valid) return undefined;
  if (isExpired(payload)) return undefined;

  return payload;
};

export const activateLicense = async (code: string): Promise<{ ok: true } | { ok: false; error: string }> => {
  const payload = await verifyLicenseCode(code);
  if (!payload) return { ok: false, error: 'invalid_license_code' };

  await setStorage(LICENSE_KEY, code.trim());
  return { ok: true };
};

export const deactivateLicense = async (): Promise<void> => {
  await removeStorage(LICENSE_KEY);
};

export const getLicenseStatus = async (): Promise<LicenseStatus> => {
  const storage = await getStorage(LICENSE_KEY);
  const code = storage[LICENSE_KEY] as string | undefined;
  if (!code) return { state: 'unlicensed' };

  const payload = await verifyLicenseCode(code);
  if (!payload) return { state: 'unlicensed' };

  return { state: 'licensed', payload };
};
