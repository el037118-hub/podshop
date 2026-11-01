import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de privacidade | Podshop Imports",
  description: "Saiba como a Podshop Imports trata os dados pessoais enviados à loja.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar
      </Link>

      <article className="mt-8 rounded-xl border border-border bg-card p-5 sm:mt-10 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Política de privacidade</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground sm:text-base">
          <p>Nome, telefone, endereço, forma de pagamento preferida e observações podem ser adicionados ao perfil e usados para atender pedidos feitos na loja.</p>
          <p>O e-mail da conta fica no Supabase Auth. O nome e os demais dados preenchidos no perfil podem ser armazenados no Supabase para facilitar compras futuras.</p>
          <p>Os pedidos são enviados pelo WhatsApp e podem também ser salvos no painel administrativo para acompanhamento interno.</p>
          <p>Não vendemos dados pessoais. O cliente pode solicitar remoção ou correção de dados entrando em contato pelo WhatsApp da loja.</p>
        </div>
      </article>
    </main>
  );
}
