import { describe, expect, it } from "vitest";
import {
  ACCOUNT_DELETION_SIGNOUT_URL,
  isSameOriginDeletionRequest,
} from "./account-deletion";

describe("account deletion", () => {
  it("uses the fixed Brain signout handoff", () => {
    expect(ACCOUNT_DELETION_SIGNOUT_URL).toBe(
      "https://brain.pointtaken.social/api/auth/deletion-signout",
    );
  });

  it("accepts only same-origin deletion submissions", () => {
    expect(
      isSameOriginDeletionRequest(
        new Request("https://auth.pointtaken.social/api/account/delete", {
          headers: { origin: "https://auth.pointtaken.social" },
          method: "POST",
        }),
      ),
    ).toBe(true);

    expect(
      isSameOriginDeletionRequest(
        new Request("https://auth.pointtaken.social/api/account/delete", {
          headers: { origin: "https://example.com" },
          method: "POST",
        }),
      ),
    ).toBe(false);

    expect(
      isSameOriginDeletionRequest(
        new Request("https://auth.pointtaken.social/api/account/delete", {
          method: "POST",
        }),
      ),
    ).toBe(false);
  });
});
