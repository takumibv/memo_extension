/**
 * 拡張側 (src/shared/utils/crypto.ts) と対になる、署名生成専用の最小暗号ユーティリティ。
 * 秘密鍵操作(署名生成)はサーバー側のみで行い、拡張側は公開鍵での検証のみを行う。
 */

export const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const textEncoder = new TextEncoder();

export const importEcdsaPrivateKey = (jwk: JsonWebKey): Promise<CryptoKey> =>
  crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);

export const signEcdsa = async (privateKey: CryptoKey, message: string): Promise<string> => {
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    textEncoder.encode(message),
  );
  return base64UrlEncode(new Uint8Array(signature));
};
