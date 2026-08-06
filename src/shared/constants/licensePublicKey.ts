/**
 * ライセンスコード署名検証用の公開鍵(ECDSA P-256, JWK形式)。
 * 公開鍵であり秘密情報ではないため、コードへの直接埋め込みで問題ない。
 *
 * `server/scripts/generate-keypair.ts` を実行して鍵ペアを生成したら、
 * 出力される公開鍵JWKでこの定数を置き換えること。
 * 置き換えるまではダミー値のため、いかなるライセンスコードも検証に失敗する
 * (= 未購入状態のまま。トライアル枠は影響を受けない)。
 */
export const LICENSE_PUBLIC_KEY_JWK: JsonWebKey = {
  kty: 'EC',
  crv: 'P-256',
  x: 'REPLACE_WITH_GENERATED_PUBLIC_KEY_X',
  y: 'REPLACE_WITH_GENERATED_PUBLIC_KEY_Y',
};
