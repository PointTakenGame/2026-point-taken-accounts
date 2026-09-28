"use client";

import Script from "next/script";

export function EmailSignInForm({
  siteKey,
  next,
}: {
  siteKey: string | undefined;
  next: string;
}) {
  return (
    <>
      {siteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}
      <form className="stack" action="/api/auth/email" method="post">
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
          />
        </div>
        {siteKey ? (
          <div
            className="cf-turnstile"
            data-sitekey={siteKey}
            data-theme="light"
          />
        ) : (
          <p className="notice error" role="alert">
            Sign-in protection is not configured yet. No account email will be
            sent.
          </p>
        )}
        <button className="button" type="submit" disabled={!siteKey}>
          Email me a sign-in link
        </button>
      </form>
    </>
  );
}
