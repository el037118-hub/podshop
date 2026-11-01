"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { MailCheck } from "lucide-react";

export function AccountAccessForm({ mode, configured, initialNotice }: { mode: "signin" | "signup"; configured: boolean; initialNotice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice ?? "");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: new URL("/auth/callback", window.location.origin).toString() },
        });
        if (signupError) throw signupError;
        if (data.session) {
          router.replace("/conta");
          router.refresh();
        } else {
          setNotice("Enviamos um link de confirmação para seu e-mail. Confirme o endereço para ativar sua conta Podshop e depois entre para completar seu perfil.");
        }
      } else {
        const { error: signinError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signinError) throw signinError;
        router.replace("/conta");
        router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a solicitação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border bg-card">
      <CardHeader className="gap-2 px-6 pt-6 sm:px-7 sm:pt-7">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">{isSignup ? "Criar conta" : "Entrar na conta"}</h1>
        <CardDescription className="max-w-sm leading-6">{isSignup ? "Crie seu acesso e complete seus dados de contato depois de entrar." : "Entre para consultar e atualizar seus dados."}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7">
        {!configured ? (
          <Alert className="border-destructive/50 text-destructive">Configure o Supabase antes de continuar.</Alert>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="account-email">E-mail</Label>
              <Input id="account-email" type="email" autoComplete="email" maxLength={254} value={email} required onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-password">Senha</Label>
              <Input id="account-password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} maxLength={72} value={password} required onChange={(event) => setPassword(event.target.value)} />
              {isSignup && <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>}
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {notice && (isSignup ? (
              <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm" role="status" aria-live="polite">
                <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Confira seu e-mail</p>
                  <p className="mt-1 leading-5 text-muted-foreground">{notice} Se não encontrar, confira também a caixa de spam.</p>
                </div>
              </div>
            ) : <Alert className="border-primary/30 text-muted-foreground" role="status" aria-live="polite">{notice}</Alert>)}
            <Button type="submit" className="mt-1 min-h-11 w-full" disabled={busy}>{busy ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}</Button>
          </form>
        )}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignup ? "Já tem uma conta? " : "Ainda não tem conta? "}
          <Link href={isSignup ? "/conta/entrar" : "/conta/criar"} className="font-semibold text-accent hover:underline">
            {isSignup ? "Entrar" : "Criar conta"}
          </Link>
        </p>
        {isSignup && (
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            Consulte nossa <Link href="/privacidade" className="text-accent hover:underline">Política de privacidade</Link>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
