"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function PasswordResetRequestForm({ configured, invalidLink }: { configured: boolean; invalidLink: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const redirectTo = new URL("/auth/password-recovery", window.location.origin);
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectTo.toString() });
      if (resetError) throw resetError;
      setSent(true);
    } catch {
      setError("Não foi possível enviar o link agora. Confira o e-mail e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border bg-card">
      <CardHeader className="gap-2 px-6 pt-6 sm:px-7 sm:pt-7">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Esqueci minha senha</h1>
        <CardDescription className="max-w-sm leading-6">Informe o e-mail da sua conta para receber um link de redefinição.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7">
        {invalidLink && <Alert className="mb-4 border-destructive/50 text-destructive">Esse link não é válido ou expirou. Solicite um novo abaixo.</Alert>}
        {!configured ? (
          <Alert className="border-destructive/50 text-destructive">Configure o Supabase antes de continuar.</Alert>
        ) : sent ? (
          <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm" role="status" aria-live="polite">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Confira seu e-mail</p>
              <p className="mt-1 leading-5 text-muted-foreground">Se houver uma conta associada a esse endereço, enviaremos um link para redefinir a senha.</p>
              <Link href="/conta/entrar" className="mt-3 inline-block font-semibold text-accent hover:underline">Voltar para entrar</Link>
            </div>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="recovery-email">E-mail</Label>
              <Input id="recovery-email" type="email" autoComplete="email" maxLength={254} value={email} required onChange={(event) => setEmail(event.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="min-h-11 w-full" disabled={busy}>{busy ? "Enviando..." : "Enviar link de redefinição"}</Button>
          </form>
        )}
        {!sent && <p className="mt-5 text-center text-sm text-muted-foreground"><Link href="/conta/entrar" className="font-semibold text-accent hover:underline">Voltar para entrar</Link></p>}
      </CardContent>
    </Card>
  );
}
