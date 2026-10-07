export function supabaseConfig(): [string, string] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase identity configuration is missing.");
  }
  return [url, key];
}

export function supabaseAdminConfig(): [string, string] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase account-deletion configuration is missing.");
  }
  return [url, key];
}
