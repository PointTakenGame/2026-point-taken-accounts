# Point Taken Identity

Shared identity and OAuth authorization UI for Point Taken Brain and Point Taken
Heart.

Brain and Heart are exact-ID allowlisted first-party clients. After sign-in,
their OAuth authorization requests are approved server-side without an
intermediate consent screen; all other clients are denied.

- Production URL: `https://auth.pointtaken.social`
- Supabase project: `point-taken-identity`
- Supabase ref: `obymwevdiixeupfsvbaa`
- Production policy: verified email or verified social identity only
- Anonymous sign-in: disabled
- OAuth: authorization code with PKCE

The identity database contains only Supabase Auth's own identity data. Game
profiles and game data stay in each game's database.

## Ways to sign in

- **Continue with Google.** `/api/auth/google` starts Supabase's Google OAuth
  flow with PKCE; the verifier lives in this app's session cookies.
- **Email link.** `/api/auth/email` sends a Supabase magic link after a
  Turnstile check.

Both return through `/auth/callback`, which exchanges the code for a session
and continues to the safe `next` path, such as
`/oauth/consent?authorization_id=...` when Brain or Heart started the sign-in.
If the person cancels at Google, the callback returns to `/signin` without an
error.

Supabase matches identities by verified email: signing in with Google using
the same verified address as an existing email account reaches the same
account.

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

### Supabase Auth

- Google provider enabled, with the Google OAuth client ID and secret stored
  only in the Supabase dashboard.
- The Google OAuth client lists
  `https://obymwevdiixeupfsvbaa.supabase.co/auth/v1/callback` as an authorized
  redirect URI.
- Redirect URLs allow `https://auth.pointtaken.social/auth/callback**` and, for
  local development, `http://localhost:3200/auth/callback**`.

## OAuth clients

Brain and Heart are registered separately, with exact production callback URLs
and separate development clients. Client secrets belong in each confidential
client's deployment environment, never in this repository.

Canonical production clients are `https://brain.pointtaken.social` and
`https://heart.pointtaken.social`. The legacy Brain and Heart URLs remain in
the callback lists only during the migration window.
