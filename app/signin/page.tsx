import { EmailSignInForm } from "@/components/email-signin-form";
import { safeNextPath } from "@/lib/next-path";

export const dynamic = "force-dynamic";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const next = safeNextPath(query.next);
  const sent = query.sent === "1";
  const signedOut = query.signed_out === "1";
  const deleted = query.deleted === "1";
  const failed = typeof query.failed === "string" ? query.failed : null;
  const requestAnotherHref = `/signin?next=${encodeURIComponent(next)}`;
  const siteKey =
    process.env.CAPTCHA_ENFORCED === "true"
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      : undefined;

  return (
    <main className="shell">
      <section className="card">
        <h1>Sign in or Make New Account</h1>

        {sent ? (
          <>
            <p className="notice" role="status">
              Check your email. Use the newest Point Taken email: requesting
              another link makes earlier links inactive.
            </p>
            <p>
              <a className="text-button" href={requestAnotherHref}>
                Send another link
              </a>
            </p>
          </>
        ) : null}
        {signedOut ? (
          <p className="notice" role="status">
            You’re signed out.
          </p>
        ) : null}
        {deleted ? (
          <p className="notice" role="status">
            Your account was deleted. Your past game contributions no longer
            identify you.
          </p>
        ) : null}
        {failed ? (
          <p className="notice error" role="alert">
            {failed}
          </p>
        ) : null}

        {sent ? null : <EmailSignInForm siteKey={siteKey} next={next} />}
        <p className="fine-print">
          By continuing, you agree to the Point Taken{" "}
          <a href="https://pointtaken.social/terms-of-use">Terms of Use</a> and{" "}
          <a href="https://pointtaken.social/privacy-policy">Privacy Policy</a>.
        </p>
      </section>
    </main>
  );
}
