import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  sessionClient: async () => ({ auth: { exchangeCodeForSession, getUser } }),
}));

const { GET } = await import("./route");

const neutral = "That sign-in link or request is no longer active. Try again.";
const next = "/oauth/consent?authorization_id=abc";
const callback = (query: string) =>
  GET(new Request(`https://auth.pointtaken.social/auth/callback?${query}`));
const target = (response: Response) =>
  new URL(response.headers.get("location")!);

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
    getUser.mockReset().mockResolvedValue({ data: { user: null } });
  });

  it("exchanges the code and continues to next", async () => {
    const response = await callback(
      `code=abc&next=${encodeURIComponent(next)}`,
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    const url = target(response);
    expect(url.pathname + url.search).toBe(next);
  });

  it("returns quietly to sign-in when the person cancels", async () => {
    const response = await callback(
      `error=access_denied&error_description=denied&next=${encodeURIComponent(next)}`,
    );
    const url = target(response);
    expect(url.pathname).toBe("/signin");
    expect(url.searchParams.get("failed")).toBeNull();
    expect(url.searchParams.get("next")).toBe(next);
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("shows a neutral message for other provider errors", async () => {
    const response = await callback("error=server_error");
    expect(target(response).searchParams.get("failed")).toBe(neutral);
  });

  it("shows a neutral message when the code is missing", async () => {
    const response = await callback("next=/account");
    expect(target(response).searchParams.get("failed")).toBe(neutral);
  });

  it("continues when a replayed code already has a session", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { name: "AuthError" } });
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const response = await callback(
      `code=abc&next=${encodeURIComponent(next)}`,
    );
    const url = target(response);
    expect(url.pathname + url.search).toBe(next);
  });

  it("shows a neutral message when the exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { name: "AuthError" } });
    const response = await callback("code=abc");
    expect(target(response).searchParams.get("failed")).toBe(neutral);
  });

  it("rejects an unsafe next", async () => {
    const response = await callback(
      `code=abc&next=${encodeURIComponent("//evil.example")}`,
    );
    expect(target(response).toString()).toBe(
      "https://auth.pointtaken.social/account",
    );
  });
});
