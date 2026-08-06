/**
 * ライセンスコード署名用のECDSA P-256鍵ペアを生成する一回限りのローカルスクリプト。
 *
 * 実行: pnpm generate-keypair (server/ ディレクトリ内で)
 *
 * 出力される秘密鍵JWKは `wrangler secret put LICENSE_PRIVATE_KEY_JWK` に貼り付け、
 * 公開鍵JWKは拡張の src/shared/constants/licensePublicKey.ts に貼り付ける。
 * 秘密鍵はどこにもコミットしないこと。
 */
const main = async () => {
  const keyPair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair;

  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

  console.log('=== Private key JWK (wrangler secret put LICENSE_PRIVATE_KEY_JWK 用) ===');
  console.log(JSON.stringify(privateJwk));
  console.log();
  console.log('=== Public key JWK (src/shared/constants/licensePublicKey.ts 用) ===');
  console.log(JSON.stringify(publicJwk, null, 2));
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
