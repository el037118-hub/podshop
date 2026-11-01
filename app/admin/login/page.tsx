import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { AdminLoginForm } from "@/components/admin-login-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Administração | Podshop Imports",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const configured = isSupabaseConfigured();
  if (configured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.role === "admin") redirect("/admin");
  }

  return (
    <AccountShell>
      <AdminLoginForm configured={configured} />
    </AccountShell>
  );
}
