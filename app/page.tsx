import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  redirect(data.user ? "/account" : "/signin");
}
