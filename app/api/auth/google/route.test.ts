import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  sessionClient: async () => ({ auth: { signInWithOAuth } }),
}));

const { GET } = await import("./route");

const start = (next: string) =>
  GET(
    new Request(
      `https://auth.pointtaken.social/api/auth/google?next=${encodeURIComponent(next)}`,
    ),
  );

describe("GET /api/auth/google", () => {
  beforeEach(() => {
    signInWithOAuth.mockReset().mockResolvedValue({
      data: { provider: "google", url: "https://supabase.example/authorize" },
      error: null,
    });
  });

  it("starts Google OAuth with a callback that keeps next", async () => {
    const next = "/oauth/consent?authorization_id=abc";
    const response = await start(next);

    expect(signInWithOAuth).toHaveBeenCalledOnce();
    const { provider, options } = signInWithOAuth.mock.calls[0][0];
    expect(provider).toBe("google");
    expect(options.skipBrowserRedirect).toBe(true);
    const callback = new URL(options.redirectTo);
    expect(callback.origin).toBe("https://auth.pointtaken.social");
    expect(callback.pathname).toBe("/auth/callback");
    expect(callback.searchParams.get("next")).toBe(next);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://supabase.example/authorize",
    );
  });

  it.each(["https://evil.example/path", "//evil.example/path"])(
    "rejects an unsafe next: %s",
    async (unsafe) => {
      await start(unsafe);
      const { options } = signInWithOAuth.mock.calls[0][0];
      expect(new URL(options.redirectTo).searchParams.get("next")).toBe(
        "/account",
      );
    },
  );

  it("returns to sign-in with a message when OAuth cannot start", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { provider: "google", url: null },
      error: { name: "AuthApiError", status: 500 },
    });
    const response = await start("/account");

    const target = new URL(response.headers.get("location")!);
    expect(target.pathname).toBe("/signin");
    expect(target.searchParams.get("failed")).toBeTruthy();
    expect(target.searchParams.get("next")).toBe("/account");
  });
});
