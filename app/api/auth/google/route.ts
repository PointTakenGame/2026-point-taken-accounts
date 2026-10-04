import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/next-path";
import { sessionClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));

  // The session client stores the PKCE verifier in this browser's cookies, so
  // /auth/callback can exchange the code Google sends back.
  const supabase = await sessionClient();
  const callback = new URL("/auth/callback", url);
  callback.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    console.warn("Supabase could not start Google sign-in", {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    });
    const failed = new URL("/signin", url);
    failed.searchParams.set(
      "failed",
      "We could not start Google sign-in. Try again.",
    );
    failed.searchParams.set("next", next);
    return NextResponse.redirect(failed, 303);
  }

  return NextResponse.redirect(data.url, 303);
}
