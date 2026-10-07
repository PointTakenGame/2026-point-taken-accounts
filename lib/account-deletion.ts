export const ACCOUNT_DELETION_SIGNOUT_URL =
  "https://brain.pointtaken.social/api/auth/deletion-signout";

export function isSameOriginDeletionRequest(request: Request): boolean {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  return origin === requestUrl.origin;
}
