import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { AccountAccessForm } from "@/components/account-access-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Criar conta | Podshop Imports",
  robots: { index: false, follow: false },
};

export default async function CreateAccountPage() {
  const configured = isSupabaseConfigured();
  if (configured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/conta");
  }

  return (
    <AccountShell>
      <AccountAccessForm mode="signup" configured={configured} />
    </AccountShell>
  );
}
