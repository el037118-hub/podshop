import type { Metadata } from "next";
import { AccountShell } from "@/components/account-shell";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Esqueci minha senha | Podshop Imports",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const query = await searchParams;
  return (
    <AccountShell>
      <PasswordResetRequestForm configured={isSupabaseConfigured()} invalidLink={query.erro === "link"} />
    </AccountShell>
  );
}
