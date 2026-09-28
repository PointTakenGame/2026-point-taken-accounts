import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Account() {
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/signin");

  return (
    <main className="shell">
      <section className="card stack">
        <span className="eyebrow">Point Taken account</span>
        <h1>You are signed in</h1>
        <p className="lede">{data.user.email ?? "Verified identity"}</p>
        <div className="actions">
          <a className="button" href="https://play.pointtaken.social">
            Play Brain
          </a>
          <a className="button secondary" href="https://pt-heart.vercel.app">
            Play Heart
          </a>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="button secondary" type="submit">
            Sign out on this browser
          </button>
        </form>
      </section>
    </main>
  );
}
