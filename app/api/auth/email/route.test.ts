import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOtp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  sessionClient: async () => ({ auth: { signInWithOtp } }),
}));

const { POST } = await import("./route");

function submit(fields: Record<string, string>) {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return POST(
    new Request("https://auth.pointtaken.social/api/auth/email", {
      method: "POST",
      body,
    }),
  );
}

describe("POST /api/auth/email", () => {
  beforeEach(() => {
    vi.stubEnv("CAPTCHA_ENFORCED", "true");
    signInWithOtp.mockReset().mockResolvedValue({ data: {}, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends a link whose callback keeps next", async () => {
    const next = "/oauth/consent?authorization_id=abc";
    const response = await submit({
      email: "player@example.com",
      next,
      "cf-turnstile-response": "token",
    });

    const { email, options } = signInWithOtp.mock.calls[0][0];
    expect(email).toBe("player@example.com");
    expect(options.captchaToken).toBe("token");
    expect(new URL(options.emailRedirectTo).searchParams.get("next")).toBe(
      next,
    );
    const url = new URL(response.headers.get("location")!);
    expect(url.searchParams.get("sent")).toBe("1");
    expect(url.searchParams.get("next")).toBe(next);
  });

  it("refuses without a CAPTCHA token", async () => {
    const response = await submit({ email: "player@example.com" });
    expect(signInWithOtp).not.toHaveBeenCalled();
    expect(
      new URL(response.headers.get("location")!).searchParams.get("failed"),
    ).toBeTruthy();
  });

  it("fails closed when CAPTCHA is not enforced", async () => {
    vi.stubEnv("CAPTCHA_ENFORCED", "false");
    await submit({
      email: "player@example.com",
      "cf-turnstile-response": "token",
    });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it("rejects an unsafe next", async () => {
    await submit({
      email: "player@example.com",
      next: "https://evil.example/path",
      "cf-turnstile-response": "token",
    });
    const { options } = signInWithOtp.mock.calls[0][0];
    expect(new URL(options.emailRedirectTo).searchParams.get("next")).toBe(
      "/account",
    );
  });
});
