import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";
import { isTrustedOAuthClient } from "@/lib/trusted-oauth-client";

export const dynamic = "force-dynamic";

export default async function Consent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const authorizationId =
    typeof query.authorization_id === "string" ? query.authorization_id : "";
  if (!authorizationId)
    redirect("/signin?failed=Authorization%20request%20missing.");

  const supabase = await sessionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    const next = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
    redirect(`/signin?next=${encodeURIComponent(next)}`);
  }

  const { data, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (error || !data) {
    redirect(
      "/signin?failed=That%20authorization%20request%20is%20no%20longer%20valid.",
    );
  }
  if ("redirect_url" in data) redirect(data.redirect_url);

  const trusted = isTrustedOAuthClient(data.client.id);
  const result = trusted
    ? await supabase.auth.oauth.approveAuthorization(authorizationId, {
        skipBrowserRedirect: true,
      })
    : await supabase.auth.oauth.denyAuthorization(authorizationId, {
        skipBrowserRedirect: true,
      });

  if (result.error || !result.data?.redirect_url) {
    console.error("OAuth authorization could not be completed", {
      clientId: data.client.id,
      trusted,
      error: result.error
        ? {
            name: result.error.name,
            message: result.error.message,
            status: result.error.status,
            code: result.error.code,
          }
        : null,
    });
    redirect("/signin?failed=Authorization%20could%20not%20be%20completed.");
  }

  redirect(result.data.redirect_url);
}
