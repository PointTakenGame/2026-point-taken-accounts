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
  const failed = typeof query.failed === "string" ? query.failed : null;
  const siteKey =
    process.env.CAPTCHA_ENFORCED === "true"
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      : undefined;

  return (
    <main className="shell">
      <section className="card">
        <span className="eyebrow">One account, both games</span>
        <h1>Point Taken</h1>
        <p className="lede">
          Sign in once to play Brain and Humility Showdown. We use a verified
          email so your account can come back on another device.
        </p>

        {sent ? (
          <p className="notice" role="status">
            Check your email. If the address can receive a Point Taken link, it
            will arrive shortly.
          </p>
        ) : null}
        {failed ? (
          <p className="notice error" role="alert">
            {failed}
          </p>
        ) : null}

        <EmailSignInForm siteKey={siteKey} next={next} />
        <p className="fine-print">
          No password and no guest account. The link verifies that the address
          belongs to you. By continuing, you agree to the Point Taken Terms of
          Use and Privacy Policy.
        </p>
      </section>
    </main>
  );
}
