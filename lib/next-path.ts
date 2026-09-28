/** Keep post-auth navigation on this origin. OAuth clients own cross-origin redirects. */
export function safeNextPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const parsed = new URL(value, "https://auth.pointtaken.social");
    if (parsed.origin !== "https://auth.pointtaken.social") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
