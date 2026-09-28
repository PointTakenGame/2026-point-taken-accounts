import { describe, expect, it } from "vitest";
import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
  it("keeps a local OAuth continuation", () => {
    expect(safeNextPath("/oauth/consent?authorization_id=abc")).toBe(
      "/oauth/consent?authorization_id=abc",
    );
  });

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "javascript:alert(1)",
    "not-a-path",
  ])("rejects %s", (candidate) => {
    expect(safeNextPath(candidate)).toBe("/account");
  });
});
