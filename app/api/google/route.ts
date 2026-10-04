import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/next-path";
import { sessionClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const callback = new URL("/auth/callback", url);
  callback.searchParams.set("next", next);

  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL(
        `/signin?failed=${encodeURIComponent("We could not start Google sign-in. Try again.")}&next=${encodeURIComponent(next)}`,
        url,
      ),
    );
  }

  return NextResponse.redirect(data.url);
}
