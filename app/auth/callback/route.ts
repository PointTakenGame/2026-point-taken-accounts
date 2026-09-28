import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/next-path";
import { sessionClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const refused =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (refused) {
    return NextResponse.redirect(
      new URL(`/signin?failed=${encodeURIComponent(refused)}`, url),
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
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("That link has expired or was opened in a different browser. Ask for a fresh one.")}`,
        url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, url));
}
