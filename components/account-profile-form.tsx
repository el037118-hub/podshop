"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AccountShell } from "@/components/account-shell";
import { createClient } from "@/lib/supabase/client";
import type { CustomerProfile } from "@/lib/database.types";

type ProfileDraft = Pick<CustomerProfile, "full_name" | "phone" | "address" | "payment_method" | "observations">;

export function AccountProfileForm({
  userId,
  email,
  initialProfile,
  loadError,
}: {
  userId: string;
  email: string;
  initialProfile: CustomerProfile | null;
  loadError?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileDraft>(() => ({
    full_name: initialProfile?.full_name ?? "",
    phone: initialProfile?.phone ?? "",
    address: initialProfile?.address ?? "",
    payment_method: initialProfile?.payment_method ?? "",
    observations: initialProfile?.observations ?? "",
  }));
  const [error, setError] = useState(loadError ?? "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const profile = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      payment_method: form.payment_method.trim(),
      observations: form.observations.trim(),
    };
    if (!profile.full_name) return setError("Informe seu nome.");
    if (profile.full_name.length > 120 || profile.phone.length > 40 || profile.address.length > 500 || profile.payment_method.length > 80 || profile.observations.length > 1000) {
      return setError("Confira o tamanho dos campos e tente novamente.");
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error: saveError } = await supabase.from("customer_profiles").upsert({ user_id: userId, ...profile }, { onConflict: "user_id" });
      if (saveError) throw saveError;
      setNotice("Seus dados foram salvos.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar seus dados.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError("");
    try {
      const supabase = createClient();
      const { error: signoutError } = await supabase.auth.signOut();
      if (signoutError) throw signoutError;
      router.replace("/conta/entrar");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível sair da conta.");
    }
  }

  const fieldDisabled = busy || Boolean(loadError);

  return (
    <AccountShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Minha conta</h1>
          <p className="mt-2 break-all text-sm text-muted-foreground">{email}</p>
        </div>
        <Button variant="outline" onClick={signOut} disabled={busy}>Sair da conta</Button>
      </div>

      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="gap-2 px-6 pt-6 sm:px-7 sm:pt-7">
          <h2 className="text-xl font-semibold leading-none tracking-tight">Seus dados</h2>
          <CardDescription className="leading-6">Salve informações para facilitar o atendimento. O e-mail da conta é gerenciado pelo Supabase Auth.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7">
          <form className="grid gap-4" onSubmit={saveProfile}>
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input id="profile-name" autoComplete="name" maxLength={120} value={form.full_name} disabled={fieldDisabled} required onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Telefone</Label>
              <Input id="profile-phone" type="tel" autoComplete="tel" maxLength={40} value={form.phone} disabled={fieldDisabled} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-address">Endereço</Label>
              <Textarea id="profile-address" autoComplete="street-address" maxLength={500} rows={2} className="min-h-[72px] max-w-xl resize-y" value={form.address} disabled={fieldDisabled} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-payment">Forma de pagamento preferida</Label>
              <Input id="profile-payment" maxLength={80} placeholder="Ex.: transferência, cartão" value={form.payment_method} disabled={fieldDisabled} onChange={(event) => setForm({ ...form, payment_method: event.target.value })} />
              <p className="text-xs text-muted-foreground">Informe apenas a modalidade. Não coloque números de cartão ou dados bancários.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-observations">Observações</Label>
              <Textarea id="profile-observations" maxLength={1000} rows={3} placeholder="Informações que queira compartilhar com a loja" value={form.observations} disabled={fieldDisabled} onChange={(event) => setForm({ ...form, observations: event.target.value })} />
            </div>
            {error && <Alert className="border-destructive/50 text-destructive" role="alert">{error}</Alert>}
            {notice && <Alert className="border-primary/30 text-accent" role="status" aria-live="polite">{notice}</Alert>}
            <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={fieldDisabled}>{busy ? "Salvando..." : "Salvar dados"}</Button>
          </form>
        </CardContent>
      </Card>
    </AccountShell>
  );
}
