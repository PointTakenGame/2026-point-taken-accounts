import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({ default: () => null }));

const { default: SignIn } = await import("./page");

async function render(query: Record<string, string>) {
  return renderToStaticMarkup(
    await SignIn({ searchParams: Promise.resolve(query) }),
  );
}

const emailForm = 'action="/api/auth/email"';

describe("sign-in page", () => {
  it("offers Google above email, both carrying next", async () => {
    const next = "/oauth/consent?authorization_id=abc";
    const html = await render({ next });

    expect(html).toContain("Continue with Google");
    expect(html).toContain(
      `href="/api/auth/google?next=${encodeURIComponent(next)}"`,
    );
    expect(html).toContain(emailForm);
    expect(html).toContain(
      'name="next" value="/oauth/consent?authorization_id=abc"',
    );
    expect(html.indexOf("Continue with Google")).toBeLessThan(
      html.indexOf(emailForm),
    );
  });

  it("hides both options while the check-your-email state shows", async () => {
    const html = await render({ sent: "1" });
    expect(html).toContain("Check your email");
    expect(html).not.toContain("Continue with Google");
    expect(html).not.toContain(emailForm);
  });

  it("does not carry an unsafe next to Google", async () => {
    const html = await render({ next: "https://evil.example/path" });
    expect(html).toContain('href="/api/auth/google?next=%2Faccount"');
  });
});
