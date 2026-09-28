import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/next-path";
import { sessionClient } from "@/lib/supabase/server";

const ADDRESS = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  const form = await request.formData();
  const emailValue = form.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const next = safeNextPath(form.get("next"));
  const captchaValue = form.get("cf-turnstile-response");
  const captcha = typeof captchaValue === "string" ? captchaValue : "";
  const url = new URL(request.url);

  if (!ADDRESS.test(email)) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("Enter a valid email address.")}`,
        url,
      ),
      303,
    );
  }

  if (process.env.CAPTCHA_ENFORCED !== "true" || !captcha) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("The bot check did not complete. Try again.")}`,
        url,
      ),
      303,
    );
  }

  const supabase = await sessionClient();
  const callback = new URL("/auth/callback", url);
  callback.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: callback.toString(),
      captchaToken: captcha,
    },
  });

  if (error && error.status === 429) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("Too many attempts. Wait a few minutes and try again.")}`,
        url,
      ),
      303,
    );
  }

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("We could not send a sign-in link. Try again.")}`,
        url,
      ),
      303,
    );
  }

  // Supabase returns the same success shape for existing and newly-created users.
  const done = new URL("/signin", url);
  done.searchParams.set("sent", "1");
  done.searchParams.set("next", next);
  return NextResponse.redirect(done, 303);
}
