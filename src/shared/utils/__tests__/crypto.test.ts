import { base64UrlDecode, base64UrlEncode, signHmac, verifyEcdsaSignature, verifyHmac } from '../crypto';
import { describe, it, expect } from 'vitest';

describe('base64UrlEncode / base64UrlDecode', () => {
  it('往復でバイト列が復元される', () => {
    const bytes = new Uint8Array([0, 1, 2, 253, 254, 255, 10, 20, 30]);
    const encoded = base64UrlEncode(bytes);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(Array.from(base64UrlDecode(encoded))).toEqual(Array.from(bytes));
  });
});

describe('signHmac / verifyHmac', () => {
  it('正しい鍵とメッセージなら検証に成功する', async () => {
    const mac = await signHmac('secret-key', 'hello');
    expect(await verifyHmac('secret-key', 'hello', mac)).toBe(true);
  });

  it('メッセージが改ざんされたら検証に失敗する', async () => {
    const mac = await signHmac('secret-key', 'hello');
    expect(await verifyHmac('secret-key', 'tampered', mac)).toBe(false);
  });

  it('鍵が異なれば検証に失敗する', async () => {
    const mac = await signHmac('secret-key', 'hello');
    expect(await verifyHmac('different-key', 'hello', mac)).toBe(false);
  });

  it('MAC自体が不正な文字列でも例外を投げずfalseを返す', async () => {
    expect(await verifyHmac('secret-key', 'hello', 'not-a-valid-mac')).toBe(false);
  });
});

describe('verifyEcdsaSignature', () => {
  const generateKeyPair = () =>
    crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);

  const sign = async (privateKey: CryptoKey, message: string) => {
    const sig = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      new TextEncoder().encode(message),
    );
    return base64UrlEncode(new Uint8Array(sig));
  };

  it('正しい署名なら検証に成功する', async () => {
    const { privateKey, publicKey } = await generateKeyPair();
    const publicJwk = await crypto.subtle.exportKey('jwk', publicKey);
    const signature = await sign(privateKey, 'payload');

    expect(await verifyEcdsaSignature(publicJwk, 'payload', signature)).toBe(true);
  });

  it('メッセージが改ざんされたら検証に失敗する', async () => {
    const { privateKey, publicKey } = await generateKeyPair();
    const publicJwk = await crypto.subtle.exportKey('jwk', publicKey);
    const signature = await sign(privateKey, 'payload');

    expect(await verifyEcdsaSignature(publicJwk, 'tampered-payload', signature)).toBe(false);
  });

  it('別の鍵ペアの公開鍵では検証に失敗する', async () => {
    const { privateKey } = await generateKeyPair();
    const { publicKey: otherPublicKey } = await generateKeyPair();
    const otherPublicJwk = await crypto.subtle.exportKey('jwk', otherPublicKey);
    const signature = await sign(privateKey, 'payload');

    expect(await verifyEcdsaSignature(otherPublicJwk, 'payload', signature)).toBe(false);
  });
});
