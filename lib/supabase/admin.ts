import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseAdminConfig } from "@/lib/config";

export function adminClient() {
  const [url, key] = supabaseAdminConfig();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
