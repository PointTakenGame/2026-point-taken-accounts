import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await sessionClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/signin", request.url), 303);
}
