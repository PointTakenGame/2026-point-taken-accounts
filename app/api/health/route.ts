import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "point-taken-identity",
    anonymous_accounts: false,
    captcha_configured: Boolean(
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      process.env.CAPTCHA_ENFORCED === "true",
    ),
  });
}
