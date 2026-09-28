import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";

type AuthorizationDetails = {
  client?: { name?: string };
  scope?: string;
};

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
  const details = data as unknown as AuthorizationDetails;
  const clientName = details.client?.name ?? "a Point Taken game";
  const scopes = details.scope?.split(" ").filter(Boolean) ?? [];

  return (
    <main className="shell">
      <section className="card stack">
        <span className="eyebrow">Shared Point Taken identity</span>
        <h1>Continue to {clientName}</h1>
        <p className="lede">
          This lets {clientName} recognize your Point Taken account. Your email
          remains in the identity service and is not copied into the game
          database.
        </p>
        {scopes.length ? (
          <p className="muted">Requested access: {scopes.join(", ")}</p>
        ) : null}
        <form className="actions" action="/api/oauth/decision" method="post">
          <input
            type="hidden"
            name="authorization_id"
            value={authorizationId}
          />
          <button
            className="button"
            type="submit"
            name="decision"
            value="approve"
          >
            Continue
          </button>
          <button
            className="button secondary"
            type="submit"
            name="decision"
            value="deny"
          >
            Cancel
          </button>
        </form>
      </section>
    </main>
  );
}
