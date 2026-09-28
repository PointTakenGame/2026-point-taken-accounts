import { describe, expect, it } from "vitest";
import { safeSignOutReturn } from "./signout-return";

describe("safeSignOutReturn", () => {
  it("allows exact game roots", () => {
    expect(safeSignOutReturn("https://brain.pointtaken.social/")).toBe(
      "https://brain.pointtaken.social/",
    );
    expect(safeSignOutReturn("https://heart.pointtaken.social/")).toBe(
      "https://heart.pointtaken.social/",
    );
    expect(safeSignOutReturn("https://play.pointtaken.social/")).toBe(
      "https://play.pointtaken.social/",
    );
    expect(safeSignOutReturn("https://pt-heart.vercel.app/")).toBe(
      "https://pt-heart.vercel.app/",
    );
  });

  it("rejects arbitrary paths and origins", () => {
    expect(safeSignOutReturn("https://play.pointtaken.social/game/123")).toBe(
      "/signin?signed_out=1",
    );
    expect(safeSignOutReturn("https://example.com/")).toBe(
      "/signin?signed_out=1",
    );
    expect(safeSignOutReturn(undefined)).toBe("/signin?signed_out=1");
  });
});
