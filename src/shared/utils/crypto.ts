/**
 * ライセンスコード検証・トライアルカウンタ署名で使う最小限の暗号ユーティリティ。
 * WebCrypto (`crypto.subtle`) のみを使用し、拡張(service worker)・Node(vitest)双方で動作する。
 */

export const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const base64UrlDecode = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const textEncoder = new TextEncoder();

// ===== HMAC-SHA256 (トライアルカウンタの改ざん検知用) =====

const importHmacKey = (secret: string, usages: KeyUsage[]) =>
  crypto.subtle.importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages);

export const signHmac = async (secret: string, message: string): Promise<string> => {
  const key = await importHmacKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message));
  return base64UrlEncode(new Uint8Array(signature));
};

export const verifyHmac = async (secret: string, message: string, mac: string): Promise<boolean> => {
  try {
    const key = await importHmacKey(secret, ['verify']);
    return await crypto.subtle.verify('HMAC', key, base64UrlDecode(mac) as BufferSource, textEncoder.encode(message));
  } catch {
    return false;
  }
};

// ===== ECDSA P-256 (ライセンスコードの署名検証用) =====
// 秘密鍵操作(署名生成)はサーバー側のみで行う。拡張側はimportEcdsaPublicKey/verifyEcdsaSignatureのみ使用する。

export const importEcdsaPublicKey = (jwk: JsonWebKey): Promise<CryptoKey> =>
  crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);

export const verifyEcdsaSignature = async (
  publicKeyJwk: JsonWebKey,
  message: string,
  signatureB64Url: string,
): Promise<boolean> => {
  try {
    const key = await importEcdsaPublicKey(publicKeyJwk);
    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      base64UrlDecode(signatureB64Url) as BufferSource,
      textEncoder.encode(message),
    );
  } catch {
    return false;
  }
};
