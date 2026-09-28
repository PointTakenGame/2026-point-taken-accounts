import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/config";

export async function sessionClient() {
  const store = await cookies();
  const [url, key] = supabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (written) => {
        try {
          for (const { name, value, options } of written) {
            store.set(name, value, options);
          }
        } catch {
          // Server Components cannot write. proxy.ts refreshes on navigation.
        }
      },
    },
  });
}
