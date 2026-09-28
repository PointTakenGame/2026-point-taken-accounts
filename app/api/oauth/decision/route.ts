import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/server";

type DecisionResult = { redirect_url?: string };

export async function POST(request: Request) {
  const form = await request.formData();
  const authorizationId = form.get("authorization_id");
  const decision = form.get("decision");
  if (typeof authorizationId !== "string" || !authorizationId) {
    return NextResponse.redirect(
      new URL("/signin?failed=Authorization%20missing.", request.url),
    );
  }

  const supabase = await sessionClient();
  const result =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);

  const data = result.data as unknown as DecisionResult | null;
  if (result.error || !data?.redirect_url) {
    return NextResponse.redirect(
      new URL(
        "/signin?failed=Authorization%20could%20not%20be%20completed.",
        request.url,
      ),
    );
  }
  return NextResponse.redirect(data.redirect_url);
}
