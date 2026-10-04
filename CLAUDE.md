# Point Taken Identity working agreement

This repository owns the shared Point Taken identity surface at
`auth.pointtaken.social`. Brain and Heart are OAuth clients. Neither game owns
identity.

## Security boundary

- The backing Supabase project is auth-only. Do not add game content, progress,
  display names, room state, or analytics tables here.
- Anonymous sign-in is deliberately disabled. Every playable account must have
  a verified email or verified social identity.
- Never commit provider secrets, Supabase secret keys, SMTP credentials, CAPTCHA
  secrets, database passwords, tokens, or production `.env` files.
- OAuth clients use authorization code flow with PKCE. Never place access or
  refresh tokens in URLs.
- Redirect destinations are exact allowlisted URLs. Never accept an arbitrary
  return URL.
- Authentication entry points must remain rate limited and CAPTCHA protected.
  Production fails closed when CAPTCHA is not configured. The exception is
  `/api/auth/google`: it sends no email and only redirects to Google, which
  runs its own abuse protection, and Supabase rate limits the OAuth flow.
- Use `getUser()` for authorization decisions. Do not trust an unverified cookie
  or `getSession()` user object.

## Scope

This app owns sign-in, callback handling, OAuth authorization, account identity,
and logout. The exact allowlisted first-party Brain and Heart clients are
approved without a player-facing consent screen; every other client is denied.
Brain owns Brain data. Heart owns Heart data. The marketing site only links
here.

## Gate

Before pushing, run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```
