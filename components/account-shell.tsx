import Image from "next/image";
import Link from "next/link";
import logo from "../visual-elements/Logotipo Podshop Branco e Azul.png";

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-8">
      <header>
        <Link href="/" aria-label="Podshop Imports, página inicial" className="inline-flex rounded-sm">
          <Image src={logo} alt="Podshop Imports" priority className="h-auto w-36 sm:w-40" />
        </Link>
      </header>
      <div className="my-auto w-full py-10">{children}</div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
        <Link href="/privacidade" className="transition-colors hover:text-foreground">Política de privacidade</Link>
        <Link href="/" className="transition-colors hover:text-foreground">Voltar ao catálogo</Link>
      </footer>
    </main>
  );
}
