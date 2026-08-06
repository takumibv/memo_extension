# License Server (Cloudflare Workers)

追従メモ機能(要素へのピン留め)の買い切りライセンスコードを、Stripe決済のWebhookを
受けて発行するための最小構成サーバー。拡張本体 (`../src`) の pnpm workspace とは
独立しており、ここだけを個別にデプロイする。

## できること

- `POST /webhook/stripe`: Stripe Checkoutの`checkout.session.completed`
  (買い切り, `mode=payment`)を受け取り、ECDSA P-256の秘密鍵でライセンスコードを
  署名生成し、Workers KVに保存する。
- `GET /success?session_id=...`: 購入完了後にStripeがリダイレクトするページ。
  KVからコードを取得し、コピー用に画面に表示する(メール配信基盤なしで即座に
  コードを受け取れるようにするための、MVP優先の設計)。
- `GET /api/verify?licenseId=...`: 常に`{revoked:false}`を返すスタブ。
  将来サブスクリプション対応やライセンス失効(リファンド対応)を実装する際の
  拡張点として用意している。

このリポジトリのコードだけでは動かない。以下の手順で **あなた自身のStripe/
Cloudflareアカウントで** セットアップする必要がある。

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd server
pnpm install
```

### 2. 署名用鍵ペアの生成

```bash
pnpm generate-keypair
```

出力される2つのJWKのうち:
- **秘密鍵JWK** → 手順4で`LICENSE_PRIVATE_KEY_JWK`として登録する。**絶対にコミットしない。**
- **公開鍵JWK** → `../src/shared/constants/licensePublicKey.ts`の
  `LICENSE_PUBLIC_KEY_JWK`をこの内容で置き換える(拡張側の再ビルドが必要)。

### 3. Cloudflareのセットアップ

```bash
pnpm dlx wrangler login
pnpm dlx wrangler kv namespace create LICENSE_KV
```

出力された`id`を`wrangler.toml`の`kv_namespaces`の`id`に貼り付ける。

### 4. シークレットの登録

```bash
pnpm dlx wrangler secret put STRIPE_SECRET_KEY
pnpm dlx wrangler secret put STRIPE_WEBHOOK_SECRET   # 手順6で取得
pnpm dlx wrangler secret put LICENSE_PRIVATE_KEY_JWK  # 手順2の秘密鍵JWK(1行のJSON文字列)
```

ローカルで`wrangler dev`する場合は`.dev.vars.example`を`.dev.vars`にコピーして
同じ値を設定する(`.dev.vars`は`.gitignore`済み)。

### 5. デプロイ

```bash
pnpm deploy
```

デプロイ後のURL (`https://xxx.workers.dev`) を以降の手順で使う。

### 6. Stripe側の設定 (Stripeダッシュボードで)

1. **商品/価格を作成**: 買い切り(one-time)の価格を1つ作成する。
2. **Payment Linkを作成**: その価格でPayment Linkを作成し、
   支払い後の遷移先(after payment)を
   `https://xxx.workers.dev/success?session_id={CHECKOUT_SESSION_ID}` に設定する。
   - 作成したPayment LinkのURLを`../src/shared/constants/links.ts`の
     `EXTERNAL_LINKS.purchaseLicense`に設定する。
3. **Webhookを作成**: Developers > Webhooksで
   `https://xxx.workers.dev/webhook/stripe` 宛に`checkout.session.completed`
   イベントを送るWebhookエンドポイントを作成し、表示される signing secret
   (`whsec_...`)を手順4の`STRIPE_WEBHOOK_SECRET`に設定する。

### 7. 動作確認

Stripe CLIでローカルWebhookを検証できる:

```bash
stripe listen --forward-to localhost:8787/webhook/stripe
stripe trigger checkout.session.completed
```

`pnpm dev`(wrangler dev)を起動した状態で上記を実行し、ログにKV書き込みが
成功していることを確認する。本番は実際にPayment Linkで少額決済して
`/success`ページでコードが表示されることを確認する。

## 今回のスコープ外(将来の拡張点)

- サブスクリプション: `LicensePayload.plan`は`'subscription'`にも対応できる型に
  なっているが、Stripeの`customer.subscription.deleted`等を受けての失効処理・
  `/api/verify`での定期チェックは未実装。
- メール配信: 現状は`/success`ページでのコード表示のみ。購入者がページを
  閉じてしまった場合の再送手段がないため、必要であればメール配信(Resend等)を
  Webhookハンドラに追加する。
