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
      303,
    );
  }

  const supabase = await sessionClient();
  const result =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, {
          skipBrowserRedirect: true,
        })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, {
          skipBrowserRedirect: true,
        });

  const data = result.data as unknown as DecisionResult | null;
  if (result.error || !data?.redirect_url) {
    console.error("OAuth consent decision failed", {
      decision: decision === "approve" ? "approve" : "deny",
      error: result.error
        ? {
            name: result.error.name,
            message: result.error.message,
            status: result.error.status,
            code: result.error.code,
          }
        : null,
      dataKeys: data ? Object.keys(data) : [],
    });
    return NextResponse.redirect(
      new URL(
        "/signin?failed=Authorization%20could%20not%20be%20completed.",
        request.url,
      ),
      303,
    );
  }
  return NextResponse.redirect(data.redirect_url, 303);
}
