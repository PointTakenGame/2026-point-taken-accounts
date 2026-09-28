const ALLOWED_SIGNOUT_RETURNS = new Set([
  "https://brain.pointtaken.social/",
  "https://heart.pointtaken.social/",
  "https://play.pointtaken.social/",
  "https://pt-heart.vercel.app/",
  "http://localhost:3100/",
  "http://localhost:3200/",
]);

export function safeSignOutReturn(value: unknown): string {
  return typeof value === "string" && ALLOWED_SIGNOUT_RETURNS.has(value)
    ? value
    : "/signin?signed_out=1";
}
