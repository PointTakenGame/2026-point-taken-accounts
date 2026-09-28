import { NextResponse } from "next/server";
import { safeSignOutReturn } from "@/lib/signout-return";
import { sessionClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeSignOutReturn(url.searchParams.get("return_to"));
  const supabase = await sessionClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL(returnTo, url), 303);
}
