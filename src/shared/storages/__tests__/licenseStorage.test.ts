import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import type { LicensePayload } from '@/shared/types/License';

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

const textEncoder = new TextEncoder();

const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

let privateKey: CryptoKey;
let licenseStorage: typeof import('../licenseStorage');

const buildCode = async (payload: LicensePayload): Promise<string> => {
  const payloadB64 = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    textEncoder.encode(payloadB64),
  );
  return `${payloadB64}.${base64UrlEncode(new Uint8Array(signature))}`;
};

beforeAll(async () => {
  const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  privateKey = keyPair.privateKey;
  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

  // licenseStorage が参照する公開鍵をテスト用の鍵ペアに差し替える
  vi.doMock('@/shared/constants/licensePublicKey', () => ({ LICENSE_PUBLIC_KEY_JWK: publicJwk }));

  licenseStorage = await import('../licenseStorage');
});

describe('licenseStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  it('未保存の場合は unlicensed', async () => {
    expect(await licenseStorage.getLicenseStatus()).toEqual({ state: 'unlicensed' });
  });

  it('正しく署名されたlifetimeコードはactivateに成功し、以後licensedになる', async () => {
    const payload: LicensePayload = { licenseId: 'lic_1', plan: 'lifetime', issuedAt: new Date().toISOString() };
    const code = await buildCode(payload);

    const result = await licenseStorage.activateLicense(code);
    expect(result).toEqual({ ok: true });

    expect(await licenseStorage.getLicenseStatus()).toEqual({ state: 'licensed', payload });
  });

  it('署名が改ざんされたコードはactivateに失敗する', async () => {
    const payload: LicensePayload = { licenseId: 'lic_2', plan: 'lifetime', issuedAt: new Date().toISOString() };
    const code = await buildCode(payload);
    const [payloadPart, sigPart] = code.split('.');
    if (!payloadPart || !sigPart) throw new Error('unexpected code format in test setup');
    // 末尾文字はbase64urlのpaddingビットにしかかからず実バイトが変わらない場合があるため、
    // 先頭付近(6bit全てが実データ)の文字を書き換える
    const flipIndex = 2;
    const original = sigPart[flipIndex];
    const replacement = original === 'A' ? 'Z' : 'A';
    const tamperedSig = sigPart.slice(0, flipIndex) + replacement + sigPart.slice(flipIndex + 1);
    const tamperedCode = `${payloadPart}.${tamperedSig}`;

    const result = await licenseStorage.activateLicense(tamperedCode);
    expect(result).toEqual({ ok: false, error: 'invalid_license_code' });
  });

  it('payload部分だけ書き換えたコード(署名は元のまま)はactivateに失敗する', async () => {
    const payload: LicensePayload = { licenseId: 'lic_3', plan: 'lifetime', issuedAt: new Date().toISOString() };
    const code = await buildCode(payload);
    const [, sigPart] = code.split('.');

    const forgedPayload: LicensePayload = { ...payload, licenseId: 'lic_stolen' };
    const forgedPayloadB64 = base64UrlEncode(textEncoder.encode(JSON.stringify(forgedPayload)));
    const forgedCode = `${forgedPayloadB64}.${sigPart}`;

    const result = await licenseStorage.activateLicense(forgedCode);
    expect(result.ok).toBe(false);
  });

  it('保存済みコードをstorage上で直接書き換えても、再検証でunlicensedに戻る', async () => {
    const payload: LicensePayload = { licenseId: 'lic_4', plan: 'lifetime', issuedAt: new Date().toISOString() };
    const code = await buildCode(payload);
    await licenseStorage.activateLicense(code);

    // devtools等でstorage内のコード文字列自体を別物に書き換えた想定
    mockStorage['license_v1'] = 'garbage.not-a-real-code';

    expect(await licenseStorage.getLicenseStatus()).toEqual({ state: 'unlicensed' });
  });

  it('期限切れのsubscriptionはunlicensedになる', async () => {
    const payload: LicensePayload = {
      licenseId: 'lic_sub',
      plan: 'subscription',
      issuedAt: new Date('2020-01-01').toISOString(),
      expiresAt: new Date('2020-02-01').toISOString(),
    };
    const code = await buildCode(payload);

    const result = await licenseStorage.activateLicense(code);
    expect(result.ok).toBe(false);
  });

  it('形式不正な文字列(区切りのないコード)はactivateに失敗する', async () => {
    const result = await licenseStorage.activateLicense('not-a-valid-code-format');
    expect(result.ok).toBe(false);
  });
});
