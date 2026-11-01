import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { AccountAccessForm } from "@/components/account-access-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Entrar | Podshop Imports",
  robots: { index: false, follow: false },
};

export default async function AccountSignInPage({ searchParams }: { searchParams: Promise<{ confirmacao?: string }> }) {
  const query = await searchParams;
  const configured = isSupabaseConfigured();
  if (configured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/conta");
  }

  return (
    <AccountShell>
      <AccountAccessForm mode="signin" configured={configured} initialNotice={query.confirmacao === "erro" ? "Não foi possível confirmar o e-mail. Solicite um novo link ou tente novamente." : undefined} />
    </AccountShell>
  );
}
