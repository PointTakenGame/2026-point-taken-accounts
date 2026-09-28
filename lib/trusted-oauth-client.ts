const TRUSTED_OAUTH_CLIENT_IDS = new Set([
  // Point Taken Brain
  "205d8059-ed06-4df8-91c7-4a1d6d7cca28",
  // Point Taken Brain (local)
  "f700979d-8366-4aff-82c0-05ad7b5cd658",
  // Alpha-test Humility Showdown
  "8f79d512-8f17-455e-9df7-1803519c1887",
  // Alpha-test Humility Showdown (local)
  "0fe2f5b2-89c5-4c2c-8b21-af4e283c7178",
]);

export function isTrustedOAuthClient(clientId: string): boolean {
  return TRUSTED_OAUTH_CLIENT_IDS.has(clientId);
}
