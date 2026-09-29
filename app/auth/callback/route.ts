import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/next-path";
import { sessionClient } from "@/lib/supabase/server";

const inactiveLinkMessage =
  "That sign-in link is no longer active. Open the newest Point Taken email, or request a new link.";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const refused =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (refused) {
    console.warn("Supabase rejected an email sign-in callback", {
      error: url.searchParams.get("error"),
      errorCode: url.searchParams.get("error_code"),
    });
    return NextResponse.redirect(
      new URL(`/signin?failed=${encodeURIComponent(inactiveLinkMessage)}`, url),
    );
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("That sign-in link is incomplete. Ask for a fresh one.")}`,
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

    console.warn("Supabase could not exchange an email sign-in code", {
      name: error.name,
      code: error.code,
      status: error.status,
    });
    return NextResponse.redirect(
      new URL(`/signin?failed=${encodeURIComponent(inactiveLinkMessage)}`, url),
    );
  }

  return NextResponse.redirect(new URL(next, url));
}
