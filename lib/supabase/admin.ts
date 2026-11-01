import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/admin/login");
  if (user.app_metadata?.role !== "admin") redirect("/?access=denied");
  return user;
}
