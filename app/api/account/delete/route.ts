import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCOUNT_DELETION_SIGNOUT_URL,
  isSameOriginDeletionRequest,
} from "@/lib/account-deletion";
import { adminClient } from "@/lib/supabase/admin";
import { sessionClient } from "@/lib/supabase/server";

async function clearIdentityCookies() {
  const store = await cookies();
  for (const cookie of store.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      store.delete(cookie.name);
    }
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!isSameOriginDeletionRequest(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const supabase = await sessionClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    await clearIdentityCookies();
    return NextResponse.redirect(new URL("/signin", url), 303);
  }

  try {
    const { error: deletionError } = await adminClient().auth.admin.deleteUser(
      data.user.id,
      true,
    );
    if (deletionError) throw deletionError;
  } catch {
    return NextResponse.redirect(new URL("/account?delete_failed=1", url), 303);
  }

  // The deleted user can no longer refresh this session. Also clear every
  // browser cookie now so this device does not retain its short-lived JWT.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  await clearIdentityCookies();

  return NextResponse.redirect(ACCOUNT_DELETION_SIGNOUT_URL, 303);
}
