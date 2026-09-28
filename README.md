# Point Taken Identity

Shared identity and OAuth authorization UI for Point Taken Brain and Point Taken
Heart.

- Production URL: `https://auth.pointtaken.social`
- Supabase project: `point-taken-identity`
- Supabase ref: `obymwevdiixeupfsvbaa`
- Production policy: verified email or verified social identity only
- Anonymous sign-in: disabled
- OAuth: authorization code with PKCE

The identity database contains only Supabase Auth's own identity data. Game
profiles and game data stay in each game's database.

## Local setup

Copy `.env.example` to `.env.local`, fill the publishable key and Turnstile test
keys, then run:

```bash
npm install
npm run dev
```

Local development runs at `http://localhost:3200`.

## Required production configuration

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `CAPTCHA_ENFORCED=true`

The app intentionally refuses to send sign-in email in production when
Turnstile is not configured. Supabase Auth owns server-side CAPTCHA validation;
the browser token is submitted once to Supabase to prevent replay failures.

## OAuth clients

Brain and Heart are registered separately, with exact production callback URLs
and separate development clients. Client secrets belong in each confidential
client's deployment environment, never in this repository.

Canonical production clients are `https://brain.pointtaken.social` and
`https://heart.pointtaken.social`. The legacy Brain and Heart URLs remain in
the callback lists only during the migration window.
