# G-STROKE

Portfolio, artwork storefront, commission inquiries, and studio administration for Godwin Azu. Built with Next.js App Router, Neon Postgres, Drizzle ORM, Cloudflare R2, Paystack, and Resend.

## Local setup

1. Install Node.js 20.9 or later.
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the values below.
4. Apply the schema to Neon with `npm run db:push`.
5. Start the app with `npm run dev`.

The `db:push` command is for applying the current Drizzle schema. For a production database, review the generated changes and take a backup before applying schema changes.

## Fixing `relation "artworks" does not exist`

This means the app can reach PostgreSQL, but the Neon database or branch selected by `DATABASE_URL` does not have the Drizzle tables yet. Set the real Neon connection string in `.env.local` (do not use the example placeholder), confirm it is the same database/branch configured in Vercel, then run:

```powershell
npm run db:push
```

The Drizzle config loads `.env.local`. After the command succeeds, verify in the Neon SQL Editor that `select to_regclass('public.artworks');` returns `artworks`, then redeploy or refresh the site. The homepage now stays available during initial setup but displays an empty portfolio until the table exists and artwork is added. Do not run `db:push` against a production database until you have confirmed the target and reviewed the schema changes.

## Environment variables

- `DATABASE_URL`: Neon pooled PostgreSQL connection string. Use the pooled connection URL for Vercel functions.
- `R2_ENDPOINT`, `R2_REGION`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: Cloudflare R2 S3 API credentials.
- `R2_BUCKET_NAME`: private bucket for purchased digital files.
- `R2_PUBLIC_BUCKET_NAME`: public bucket for gallery images.
- `R2_PUBLIC_BASE_URL`: HTTPS custom domain or public URL serving the public image bucket, without a trailing slash.
- `PAYSTACK_SECRET_KEY`: Paystack secret API key. Keep it server-only.
- `PAYSTACK_CURRENCY`: currency enabled for the Paystack account, for example `USD`, `GHS`, or `NGN`.
- `NEXT_PUBLIC_CURRENCY`: currency used to display prices in the site; keep it aligned with `PAYSTACK_CURRENCY`.
- `NEXT_PUBLIC_APP_URL`: deployed site origin, such as `https://your-domain.com`.
- `ADMIN_SESSION_TOKEN`: randomly generated admin login secret of at least 32 characters.
- `RESEND_API_KEY`: Resend API key used for digital delivery messages.
- `EMAIL_FROM`: verified sender identity in Resend, for example `Studio <orders@your-domain.com>`.

Do not commit `.env.local` or put secret keys in variables prefixed with `NEXT_PUBLIC_`.

## Cloudflare R2

Create two buckets. The public bucket serves portfolio images; the private bucket must not have public access and stores digital products. Configure a custom domain or public development URL for the public bucket and use it as `R2_PUBLIC_BASE_URL`.

Add a CORS rule to both buckets for the website origins that will upload from the browser. Allow `PUT`, `GET`, and `HEAD`; allow the `Content-Type` header; expose `ETag`. Include the exact production origin and, if needed, your Vercel preview origin. The application creates short-lived signed upload URLs only for authenticated admin sessions.

## Paystack

Set the live secret key and an account-supported `PAYSTACK_CURRENCY` in Vercel. Configure the Paystack webhook to:

`https://your-domain.com/api/webhooks/paystack`

The webhook validates the HMAC signature and verifies that the received amount and currency match the pending order. Digital downloads are stored privately and signed for 24 hours. Configure Resend and upload each digital file through `/admin` before listing it for sale.

## Admin

Visit `/admin/login` and sign in with `ADMIN_SESSION_TOKEN`. Generate a unique secret locally; for example, in PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

The token is stored in an HttpOnly, Secure-in-production, SameSite=Strict cookie for 12 hours. Admin APIs independently verify the session. Change the token to revoke active sessions.

## Vercel deployment

1. Import the repository into Vercel and select Node.js 20.x or newer.
2. Add every required production variable from the Environment Variables section to the Production environment. Add preview values separately if using preview deployments.
3. Apply the Neon schema before routing live traffic: run `npm run db:push` from a trusted local shell with the production `DATABASE_URL` set, after reviewing the schema changes.
4. Deploy and confirm the build completes.
5. Configure the R2 bucket CORS origins, the Paystack webhook URL, and the verified Resend sender domain.
6. In Paystack test mode, place a test order and confirm payment, webhook processing, email delivery, and the expiring download link before switching to live credentials.

Vercel does not need a custom `vercel.json` for this standard Next.js app. Database migrations/schema changes are not automatically applied by the deployment build.
