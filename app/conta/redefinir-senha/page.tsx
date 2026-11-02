import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { PasswordUpdateForm } from "@/components/password-update-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Redefinir senha | Podshop Imports",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/conta/entrar");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/conta/esqueci-senha?erro=link");

  return (
    <AccountShell>
      <PasswordUpdateForm />
    </AccountShell>
  );
}
