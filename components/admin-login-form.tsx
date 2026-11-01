"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Esta conta não tem acesso administrativo.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível iniciar a sessão.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card">
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Administração</h1>
        <CardDescription>Entre com a conta administrativa da loja.</CardDescription>
      </CardHeader>
      <CardContent>
        {!configured ? (
          <Alert className="border-destructive/50 text-destructive">Configure as variáveis do Supabase antes de iniciar sessão.</Alert>
        ) : (
          <form className="grid gap-4" onSubmit={signIn}>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="username" value={email} required onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} required onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "A entrar..." : "Entrar"}</Button>
          </form>
        )}
        <p className="mt-5 text-xs text-muted-foreground">Não há cadastro público. O acesso requer uma conta com permissão de administrador no Supabase.</p>
      </CardContent>
    </Card>
  );
}
