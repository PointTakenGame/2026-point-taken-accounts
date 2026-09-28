import { describe, expect, it } from "vitest";
import { isTrustedOAuthClient } from "./trusted-oauth-client";

describe("isTrustedOAuthClient", () => {
  it.each([
    "205d8059-ed06-4df8-91c7-4a1d6d7cca28",
    "f700979d-8366-4aff-82c0-05ad7b5cd658",
    "8f79d512-8f17-455e-9df7-1803519c1887",
    "0fe2f5b2-89c5-4c2c-8b21-af4e283c7178",
  ])("allows a registered Point Taken client: %s", (clientId) => {
    expect(isTrustedOAuthClient(clientId)).toBe(true);
  });

  it("rejects any other client", () => {
    expect(isTrustedOAuthClient("00000000-0000-0000-0000-000000000000")).toBe(
      false,
    );
    expect(isTrustedOAuthClient("")).toBe(false);
  });
});
