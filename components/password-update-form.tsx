"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function PasswordUpdateForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) return setError("As senhas não coincidem.");
    setBusy(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      setUpdated(true);
    } catch {
      setError("Não foi possível atualizar a senha. Solicite um novo link de redefinição e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border bg-card">
      <CardHeader className="gap-2 px-6 pt-6 sm:px-7 sm:pt-7">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Redefinir senha</h1>
        <CardDescription className="max-w-sm leading-6">Escolha uma nova senha para sua conta Podshop.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7">
        {updated ? (
          <div className="grid gap-4" role="status" aria-live="polite">
            <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="leading-5 text-foreground">Senha atualizada. Você já pode continuar para sua conta.</p>
            </div>
            <Button asChild className="min-h-11 w-full"><Link href="/conta">Ir para minha conta</Link></Button>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} required onChange={(event) => setPassword(event.target.value)} />
              <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirme a nova senha</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={confirmation} required onChange={(event) => setConfirmation(event.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="min-h-11 w-full" disabled={busy}>{busy ? "Salvando..." : "Salvar nova senha"}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
