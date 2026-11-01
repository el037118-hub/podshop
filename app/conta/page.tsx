import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/account-profile-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CustomerProfile } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Minha conta | Podshop Imports",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) redirect("/conta/entrar");

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/conta/entrar");

  let profile: CustomerProfile | null = null;
  let loadError: string | undefined;
  const { data, error } = await supabase.from("customer_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (error) loadError = "Não foi possível carregar seus dados. Atualize a página ou tente novamente mais tarde.";
  else profile = data;

  return <AccountProfileForm userId={user.id} email={user.email ?? ""} initialProfile={profile} loadError={loadError} />;
}
