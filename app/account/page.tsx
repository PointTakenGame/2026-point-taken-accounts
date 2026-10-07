import Image from "next/image";
import { redirect } from "next/navigation";
import { AccountDeletion } from "@/components/account-deletion";
import { sessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/signin");

  return (
    <main className="shell account-shell">
      <section className="card account-card">
        <header className="account-header">
          <div>
            <span className="eyebrow">Point Taken account</span>
            <p className="account-email">
              Signed in as {data.user.email ?? "Verified identity"}
            </p>
          </div>
        </header>

        <div className="game-chooser" aria-label="Choose a Point Taken game">
          <a
            className="game-card game-card-brain"
            href="https://brain.pointtaken.social"
          >
            <Image
              className="brain-tile-logo"
              src="/brand/point-taken-tile.png"
              width={53}
              height={58}
              alt="Point Taken"
              priority
            />
            <div className="game-card-copy brain-card-copy">
              <span className="game-card-kicker">Play Brain</span>
              <h1 className="brain-card-title">
                Disagreements don&apos;t have to be a dead end.
              </h1>
              <p className="brain-card-description">
                <strong>You both have Points to make.</strong>
                <br />
                Work together to find out how two good people can see the world
                so differently.
                <br />
                And maybe, find out what you share along the way.
              </p>
              <span className="game-card-action">
                Play Brain <span aria-hidden="true">→</span>
              </span>
            </div>
          </a>

          {/* To re-enable Heart, restore this section as an anchor to the
              production Heart URL and change the status/action copy below. */}
          <section
            className="game-card game-card-heart game-card-disabled"
            aria-labelledby="heart-card-title"
          >
            <span className="heart-art" aria-hidden="true">
              <Image
                src="/heart/humility-showdown.svg"
                width={118}
                height={118}
                alt=""
              />
            </span>
            <div className="game-card-copy heart-card-copy">
              <div className="heart-card-heading">
                <h2 id="heart-card-title">Humility Showdown</h2>
                <span className="beta-stamp">Coming soon</span>
              </div>
              <p>
                <strong>Angry people don&apos;t change their minds.</strong>
                <br />
                Want change? We&apos;ll teach you how to keep them calm.
              </p>
              <span className="game-card-action heart-card-action">
                Coming soon
              </span>
            </div>
          </section>
        </div>

        {query.delete_failed === "1" ? (
          <p className="notice error account-delete-error" role="alert">
            We couldn&apos;t delete your account. Nothing was changed. Please
            try again.
          </p>
        ) : null}

        <div className="account-management">
          <form
            className="account-signout"
            action="/api/auth/signout"
            method="post"
          >
            <button className="text-button" type="submit">
              Sign out
            </button>
          </form>
          <AccountDeletion />
        </div>
      </section>
    </main>
  );
}
