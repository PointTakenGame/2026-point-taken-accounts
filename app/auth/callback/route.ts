import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/next-path";
import { sessionClient } from "@/lib/supabase/server";

const inactiveRequestMessage =
  "That sign-in link or request is no longer active. Try again.";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const refusal = url.searchParams.get("error");
  const refused = url.searchParams.get("error_description") ?? refusal;

  if (refusal === "access_denied") {
    // The person cancelled at the provider. Return them to sign-in quietly.
    const signin = new URL("/signin", url);
    signin.searchParams.set("next", next);
    return NextResponse.redirect(signin);
  }

  if (refused) {
    console.warn("Supabase rejected a sign-in callback", {
      error: refusal,
      errorCode: url.searchParams.get("error_code"),
    });
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent(inactiveRequestMessage)}`,
        url,
      ),
    );
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent(inactiveRequestMessage)}`,
        url,
      ),
    );
  }

  const supabase = await sessionClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // A mail scanner, double-click, or browser retry can replay a one-time code
    // after the first request has already established a valid session.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL(next, url));
    }

    console.warn("Supabase could not exchange a sign-in code", {
      name: error.name,
      code: error.code,
      status: error.status,
    });
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent(inactiveRequestMessage)}`,
        url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, url));
}
