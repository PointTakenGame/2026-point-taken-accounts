import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  adminClient: vi.fn(),
  cookies: vi.fn(),
  sessionClient: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/supabase/admin", () => ({ adminClient: mocks.adminClient }));
vi.mock("@/lib/supabase/server", () => ({
  sessionClient: mocks.sessionClient,
}));

import { POST } from "./route";

describe("POST /api/account/delete", () => {
  const deleteCookie = vi.fn();
  const deleteUser = vi.fn();
  const getUser = vi.fn();
  const signOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      delete: deleteCookie,
      getAll: () => [{ name: "sb-project-auth-token", value: "session" }],
    });
    getUser.mockResolvedValue({
      data: { user: { id: "identity-user-id" } },
      error: null,
    });
    signOut.mockResolvedValue({ error: null });
    deleteUser.mockResolvedValue({ error: null });
    mocks.sessionClient.mockResolvedValue({ auth: { getUser, signOut } });
    mocks.adminClient.mockReturnValue({
      auth: { admin: { deleteUser } },
    });
  });

  it("soft-deletes the verified user and starts the fixed signout fanout", async () => {
    const response = await POST(
      new Request("https://auth.pointtaken.social/api/account/delete", {
        headers: { origin: "https://auth.pointtaken.social" },
        method: "POST",
      }),
    );

    expect(getUser).toHaveBeenCalledOnce();
    expect(deleteUser).toHaveBeenCalledWith("identity-user-id", true);
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(deleteCookie).toHaveBeenCalledWith("sb-project-auth-token");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://brain.pointtaken.social/api/auth/deletion-signout",
    );
  });

  it("preserves the account and returns to account settings on an admin error", async () => {
    deleteUser.mockResolvedValue({ error: new Error("delete failed") });

    const response = await POST(
      new Request("https://auth.pointtaken.social/api/account/delete", {
        headers: { origin: "https://auth.pointtaken.social" },
        method: "POST",
      }),
    );

    expect(signOut).not.toHaveBeenCalled();
    expect(deleteCookie).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://auth.pointtaken.social/account?delete_failed=1",
    );
  });

  it("rejects cross-origin submissions before reading the session", async () => {
    const response = await POST(
      new Request("https://auth.pointtaken.social/api/account/delete", {
        headers: { origin: "https://example.com" },
        method: "POST",
      }),
    );

    expect(response.status).toBe(403);
    expect(getUser).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
