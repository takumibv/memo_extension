import { Hono } from 'hono';
import Stripe from 'stripe';
import { buildLifetimeLicensePayload, issueLicenseCode } from './license';

export type Env = {
  LICENSE_KV: KVNamespace;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  /** scripts/generate-keypair.ts が出力する秘密鍵側JWKをJSON文字列にしたもの */
  LICENSE_PRIVATE_KEY_JWK: string;
};

const app = new Hono<{ Bindings: Env }>();

const stripeClient = (env: Env) =>
  new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

const sessionKey = (sessionId: string) => `session:${sessionId}`;

app.post('/webhook/stripe', async c => {
  const signature = c.req.header('stripe-signature');
  if (!signature) return c.text('missing signature', 400);

  const body = await c.req.text();
  const stripe = stripeClient(c.env);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error('[webhook/stripe] signature verification failed', err);
    return c.text('invalid signature', 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // 買い切り(one-time payment)のみ対応。サブスクは今回スコープ外。
    if (session.mode !== 'payment') {
      return c.text('ignored: not a one-time payment session', 200);
    }

    const privateKeyJwk = JSON.parse(c.env.LICENSE_PRIVATE_KEY_JWK) as JsonWebKey;
    const licenseId = crypto.randomUUID();
    const payload = buildLifetimeLicensePayload(licenseId, session.customer_details?.email ?? undefined);
    const code = await issueLicenseCode(privateKeyJwk, payload);

    await c.env.LICENSE_KV.put(sessionKey(session.id), code);
    // 将来の失効確認 (/api/verify) 用に licenseId -> 状態 を保持する
    await c.env.LICENSE_KV.put(`license:${licenseId}`, JSON.stringify({ revoked: false, sessionId: session.id }));
  }

  return c.text('ok', 200);
});

app.get('/success', async c => {
  const sessionId = c.req.query('session_id');
  if (!sessionId) return c.html(renderPage('セッションIDが指定されていません。'), 400);

  const code = await c.env.LICENSE_KV.get(sessionKey(sessionId));
  if (!code) {
    // Webhookの処理がまだ完了していない可能性がある(数秒〜十数秒のタイムラグ)
    return c.html(
      renderPage('ライセンスコードを準備中です。数秒後にこのページを再読み込みしてください。', undefined, true),
    );
  }

  return c.html(renderPage(undefined, code));
});

app.get('/api/verify', async c => {
  const licenseId = c.req.query('licenseId');
  if (!licenseId) return c.json({ error: 'licenseId is required' }, 400);

  // TODO: サブスクリプション対応時はここでStripeの契約状態を確認し、
  // 失効していればrevoked:trueを返す。現状は買い切りのみのため常にfalse。
  const raw = await c.env.LICENSE_KV.get(`license:${licenseId}`);
  const revoked = raw ? (JSON.parse(raw) as { revoked: boolean }).revoked : false;
  return c.json({ revoked });
});

const renderPage = (message?: string, code?: string, autoRetry = false): string => `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Note Everywhere - ライセンスコード</title>
  ${autoRetry ? '<meta http-equiv="refresh" content="5" />' : ''}
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; padding: 0 20px; color: #1f2937; }
    .code { font-family: monospace; word-break: break-all; background: #f3f4f6; padding: 16px; border-radius: 8px; }
    button { margin-top: 12px; padding: 8px 16px; border-radius: 6px; border: none; background: #4f46e5; color: white; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Note Everywhere</h1>
  ${
    code
      ? `<p>ご購入ありがとうございます。以下のライセンスキーを拡張機能の設定画面(ライセンス欄)に入力して有効化してください。</p>
         <p class="code" id="code">${code}</p>
         <button onclick="navigator.clipboard.writeText(document.getElementById('code').textContent)">コピー</button>`
      : `<p>${message}</p>`
  }
</body>
</html>`;

export default app;
