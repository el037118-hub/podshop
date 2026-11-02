"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, Grid2X2, Menu, Minus, Package, Plus, Search, ShieldCheck, ShoppingBag, Trash2, UserRound } from "lucide-react";
import type { Product } from "@/lib/database.types";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logo from "../visual-elements/Logotipo Podshop Branco e Azul.png";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const whatsappContact = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
const ageConfirmationKey = "podshop-age-confirmed";
type CatalogProduct = Product & { category: { name: string } | null };
type AgeAccess = "checking" | "confirm" | "denied" | "confirmed";

let memoryAgeAccess: AgeAccess = "confirm";

function getAgeAccessSnapshot(): AgeAccess {
  try {
    const decision = window.localStorage.getItem(ageConfirmationKey);
    return decision === "yes" ? "confirmed" : decision === "no" ? "denied" : "confirm";
  } catch {
    return memoryAgeAccess;
  }
}

function subscribeAgeAccess(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("podshop-age-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("podshop-age-change", callback);
  };
}

function updateAgeAccess(status: AgeAccess) {
  memoryAgeAccess = status;
  try {
    if (status === "confirm") window.localStorage.removeItem(ageConfirmationKey);
    else if (status !== "checking") window.localStorage.setItem(ageConfirmationKey, status === "confirmed" ? "yes" : "no");
  } catch {
    // The declaration remains in memory if local storage is unavailable.
  }
  window.dispatchEvent(new Event("podshop-age-change"));
}

function getServerAgeAccess(): AgeAccess {
  return "checking";
}

export function Storefront({ products, loadError }: { products: CatalogProduct[]; loadError?: string }) {
  const ageAccess = useSyncExternalStore(subscribeAgeAccess, getAgeAccessSnapshot, getServerAgeAccess);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(() => new Map());
  const [cartError, setCartError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => `${product.name} ${product.brand ?? ""} ${product.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [products, search]);

  const productSections = useMemo(() => {
    const grouped = new Map<string, Map<string, CatalogProduct[]>>();
    for (const product of visibleProducts) {
      const brand = product.brand?.trim() || "Sem marca informada";
      const category = product.category?.name.trim() || "Produtos";
      const categories = grouped.get(brand) ?? new Map<string, CatalogProduct[]>();
      categories.set(category, [...(categories.get(category) ?? []), product]);
      grouped.set(brand, categories);
    }
    return [...grouped]
      .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
      .map(([brand, categories]) => ({
        brand,
        categories: [...categories].sort(([a], [b]) => a.localeCompare(b, "pt-BR")),
      }));
  }, [visibleProducts]);

  const cartItems = [...cart].flatMap(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return product ? [{ product, quantity }] : [];
  });
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addProduct(product: Product) {
    const quantity = cart.get(product.id) ?? 0;
    if (quantity >= product.stock) {
      setCartError("A seleção já atingiu o estoque disponível para este produto.");
      setCartOpen(true);
      return;
    }
    setCart((previous) => {
      const next = new Map(previous);
      next.set(product.id, Math.min(product.stock, (next.get(product.id) ?? 0) + 1));
      return next;
    });
    setCartError("");
    setCartOpen(true);
  }

  function setQuantity(product: Product, quantity: number) {
    setCart((previous) => {
      const next = new Map(previous);
      if (quantity < 1) next.delete(product.id);
      else next.set(product.id, Math.min(quantity, product.stock));
      return next;
    });
  }

  function contactStore() {
    const phone = whatsappContact.replace(/\D/g, "");
    const isPhone = /^[+\d\s().-]+$/.test(whatsappContact) && /^\d{10,15}$/.test(phone);
    let destination: URL | null = null;
    if (isPhone) destination = new URL(`https://wa.me/${phone}`);
    else {
      try {
        const link = new URL(whatsappContact);
        if (link.protocol === "https:" && link.hostname === "wa.me" && /^\/message\/[A-Za-z0-9]+\/?$/.test(link.pathname)) destination = link;
      } catch {
        // Invalid contact configuration is reported below.
      }
    }
    if (!destination) return setCartError("Configure o número ou link de WhatsApp da loja.");

    const lines = cartItems.map(({ product, quantity }) => `${quantity} × ${product.name} — ${money.format(product.price * quantity)}`);
    const message = ["Olá! Tenho interesse nestes produtos:", ...lines, `Subtotal: ${money.format(total)}`].join("\n");
    if (isPhone) destination.searchParams.set("text", message);
    window.open(destination.toString(), "_blank", "noopener,noreferrer");
  }

  function confirmAge() {
    updateAgeAccess("confirmed");
  }

  if (ageAccess !== "confirmed") {
    if (ageAccess === "checking") {
      return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground" aria-busy="true">Carregando catálogo…</main>;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
        <DialogPrimitive.Root open>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md" />
            <DialogPrimitive.Content
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 text-center shadow-2xl"
              onEscapeKeyDown={(event) => event.preventDefault()}
              onPointerDownOutside={(event) => event.preventDefault()}
            >
              {ageAccess === "denied" ? (
                <>
                  <DialogPrimitive.Title className="text-2xl font-black">Acesso restrito</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-3 text-sm leading-6 text-muted-foreground">
                    Este catálogo é destinado exclusivamente a maiores de 18 anos.
                  </DialogPrimitive.Description>
                  <Button className="mt-6 w-full" variant="outline" onClick={() => updateAgeAccess("confirm")}>Voltar</Button>
                </>
              ) : (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Acesso restrito</p>
                  <DialogPrimitive.Title className="mt-3 text-3xl font-black leading-tight">Você tem 18 anos ou mais?</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-4 text-sm leading-6 text-muted-foreground">
                    Este catálogo é destinado exclusivamente a maiores de idade. Confirme sua idade para continuar.
                  </DialogPrimitive.Description>
                  <div className="mt-6 grid gap-3">
                    <Button className="min-h-12 w-full font-bold" onClick={confirmAge}>Sim, tenho 18 anos ou mais</Button>
                    <Button className="min-h-12 w-full font-bold" variant="outline" onClick={() => updateAgeAccess("denied")}>Não tenho 18 anos</Button>
                  </div>
                  <p className="mt-5 text-xs leading-5 text-muted-foreground">Ao confirmar, você declara ter idade suficiente para acessar este catálogo.</p>
                </>
              )}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#292b2f] bg-[#0c0d0fee] font-dm-sans backdrop-blur-sm">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1360px] items-center justify-between gap-3 px-[18px] min-[681px]:min-h-[76px] min-[681px]:px-[42px]">
          <Link href="/" aria-label="Podshop Imports, página inicial" className="shrink-0">
            <Image src={logo} alt="Podshop Imports" priority className="h-auto w-28 md:w-[205px]" />
          </Link>
          <nav className="flex items-center gap-2 lg:gap-0" aria-label="Navegação principal">
            <div className="mr-[29px] hidden items-center gap-[29px] text-xs font-bold min-[1001px]:flex">
              <Link href="#catalogo" className="inline-flex items-center gap-2 text-[#c2c4c8] transition-colors hover:text-white"><Grid2X2 className="size-4" aria-hidden="true" />Catálogo</Link>
              <Link href="/conta" className="inline-flex items-center gap-2 text-[#c2c4c8] transition-colors hover:text-white"><UserRound className="size-4" aria-hidden="true" />Minha conta</Link>
              <Link href="/admin" className="inline-flex items-center gap-2 text-[#c2c4c8] transition-colors hover:text-white"><ShieldCheck className="size-4" aria-hidden="true" />Administração</Link>
            </div>
            <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="size-11 min-[1001px]:hidden" aria-label="Abrir menu">
                  <Menu className="size-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent aria-describedby="navigation-description" className="max-w-xs">
                <SheetHeader className="border-b border-border">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription id="navigation-description">Acesse o catálogo e sua conta.</SheetDescription>
                </SheetHeader>
                <nav className="grid gap-1 px-6" aria-label="Menu principal">
                  <Link href="#catalogo" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent" onClick={() => setNavigationOpen(false)}><Grid2X2 className="size-4" aria-hidden="true" />Catálogo</Link>
                  <Link href="/conta" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent" onClick={() => setNavigationOpen(false)}><UserRound className="size-4" aria-hidden="true" />Minha conta</Link>
                  <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent" onClick={() => setNavigationOpen(false)}><ShieldCheck className="size-4" aria-hidden="true" />Administração</Link>
                  <Link href="/privacidade" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent" onClick={() => setNavigationOpen(false)}><ShieldCheck className="size-4" aria-hidden="true" />Política de privacidade</Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative h-10 gap-2 rounded-[5px] border-[#3c3e44] bg-[#17191c] px-2 text-xs font-bold sm:gap-3 sm:px-3" aria-label={`Abrir carrinho com ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}>
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  <span>Carrinho</span>
                  <Badge className="min-w-5 justify-center rounded-[4px] bg-[#326dff] px-1.5 py-0.5 text-xs">{cartCount}</Badge>
                </Button>
              </SheetTrigger>
              <SheetContent aria-describedby="cart-description" className="max-w-[420px] border-[#45484e] bg-[#17191c] font-dm-sans">
                <SheetHeader className="border-b border-[#45484e] p-[30px]">
                  <SheetTitle className="font-manrope text-[29px] font-semibold">Seu carrinho</SheetTitle>
                  <SheetDescription id="cart-description">O carrinho é temporário e será limpo ao sair ou recarregar esta página.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-[30px]">
                  {cartItems.length ? (
                    <ul className="divide-y divide-[#45484d]">
                      {cartItems.map(({ product, quantity }) => (
                        <li key={product.id} className="flex gap-3 py-4">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                            {product.image_url ? <Image src={product.image_url} alt="" fill sizes="64px" unoptimized className="object-cover" /> : <Package className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden="true" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{product.name}</p>
                            <p className="mt-1 text-sm text-accent">{money.format(product.price)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button size="icon" variant="outline" className="size-11" aria-label={`Diminuir ${product.name}`} onClick={() => setQuantity(product, quantity - 1)}><Minus className="size-3.5" /></Button>
                              <span className="min-w-5 text-center text-sm" aria-live="polite">{quantity}</span>
                              <Button size="icon" variant="outline" className="size-11" aria-label={`Aumentar ${product.name}`} disabled={quantity >= product.stock} onClick={() => setQuantity(product, quantity + 1)}><Plus className="size-3.5" /></Button>
                              <Button size="icon" variant="ghost" aria-label={`Remover ${product.name}`} className="ml-auto size-11 text-muted-foreground" onClick={() => setQuantity(product, 0)}><Trash2 className="size-4" /></Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-8 text-sm text-muted-foreground">O carrinho está vazio.</p>
                  )}
                </div>
                <div className="border-t border-[#45484e] p-[30px]">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <strong className="text-lg">{money.format(total)}</strong>
                  </div>
                  {cartError && <p role="alert" className="mb-3 text-sm text-destructive">{cartError}</p>}
                  <Button className="w-full bg-[#f5f5f4] text-[#141414] hover:bg-[#bdd0ff]" size="lg" disabled={!cartCount} onClick={contactStore}>Falar com a loja no WhatsApp <ArrowRight className="size-4" /></Button>
                  <p className="mt-3 text-xs text-muted-foreground">A disponibilidade e o valor final são confirmados pela loja.</p>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </header>

      <main className="bg-[#0b0c0e] font-dm-sans">
        <section className="mx-auto w-full max-w-[1360px] px-[18px] pb-7 pt-11 min-[681px]:px-[42px] min-[681px]:pb-11 min-[681px]:pt-16">
          <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#adb0b6]">
            <span className="h-0.5 w-6 bg-primary" aria-hidden="true" />Seleção Podshop / 2026
          </p>
          <div className="flex flex-col gap-6 border-b border-[#36383b] pb-7 min-[681px]:flex-row min-[681px]:items-end min-[681px]:justify-between min-[681px]:gap-12 min-[681px]:pb-11">
            <div>
              <h1 className="font-manrope mt-5 text-[49px] font-semibold leading-[1.06] tracking-[-0.075em] sm:text-[clamp(44px,5vw,70px)]">Escolhas<br />essenciais<span className="text-primary">.</span></h1>
              <p className="mt-4 max-w-[460px] text-sm leading-7 text-[#aaaeb5]">Encontre o que procura. Selecione seus itens e converse com a loja para finalizar o pedido.</p>
            </div>
            <label className="flex w-full items-center gap-3 border-b border-[#777b81] px-1 py-3 min-[681px]:w-[360px] min-[681px]:shrink-0">
              <span className="sr-only">Pesquisar produtos no catálogo</span>
              <Search className="size-[18px] shrink-0 text-[#a3a5aa]" aria-hidden="true" />
              <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no catálogo..." className="h-7 min-w-0 rounded-none border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0" />
            </label>
          </div>
        </section>

        <section id="catalogo" className="mx-auto w-full max-w-[1360px] px-[18px] pb-12 min-[681px]:px-[42px] min-[681px]:pb-16">
          <div className="mb-[22px] mt-8 flex flex-col items-start justify-between gap-3 min-[681px]:flex-row min-[681px]:items-center">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em]">Catálogo selecionado</h2>
            <span className="text-xs text-[#a3a5aa]" aria-live="polite">
              {loadError ? "Catálogo indisponível" : `${String(visibleProducts.length).padStart(2, "0")} ${visibleProducts.length === 1 ? "produto" : "produtos"}`}
            </span>
          </div>
          {loadError ? (
            <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{loadError}</div>
          ) : visibleProducts.length ? (
            <div className="grid gap-8">
              {productSections.map(({ brand, categories }) => (
                <section key={brand} aria-label={`Marca ${brand}`}>
                  <h2 className="mb-4 border-b border-[#303238] pb-2 font-manrope text-lg font-semibold tracking-tight text-[#f5f5f4]">{brand}</h2>
                  <div className="grid gap-6">
                    {categories.map(([category, sectionProducts]) => (
                      <section key={category} aria-label={`${brand}: ${category}`}>
                        {category !== "Produtos" && <h3 className="mb-3 text-sm font-medium text-muted-foreground">{category}</h3>}
                        <div className="grid grid-cols-2 gap-3 min-[681px]:gap-[22px] min-[1001px]:grid-cols-3">
                          {sectionProducts.map((product) => (
                      <article data-slot="product-card" key={product.id} className="group flex min-w-0 flex-col transition-[translate] duration-200 ease-out hover:-translate-y-[3px]">
                        <div className="catalog-art relative grid aspect-[1.08/1] place-items-center overflow-hidden rounded-[9px] border border-[#33363d] transition-colors duration-200 group-hover:border-[#5f6775]">
                          <span className="pointer-events-none absolute inset-3 rounded border border-[#33373c] max-sm:inset-[7px]" aria-hidden="true" />
                          <span className="absolute left-[22px] top-[22px] z-10 text-[10px] tracking-[0.13em] text-[#959ba5] max-sm:left-[13px] max-sm:top-[13px] max-sm:text-[8px]">PODSHOP</span>
                          {product.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 1000px) 50vw, 33vw" unoptimized className="z-[1] object-contain p-4 transition-transform duration-200 ease-out group-hover:scale-[1.02]" /> : <div className="relative z-[1] flex flex-col items-center gap-3 text-[#8e949d]"><span className="grid size-[55px] place-items-center rounded-full border border-[#4d535d] text-2xl text-[#abb2bc]" aria-hidden="true">◇</span><span className="text-[11px] max-sm:text-[9px]">Imagem indisponível</span></div>}
                        </div>
                        <div className="flex flex-1 flex-col gap-[13px] px-[3px] pt-[19px] max-[680px]:gap-2 max-[680px]:pt-[13px]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-manrope line-clamp-2 text-[15px] font-semibold leading-5 tracking-[-0.04em] sm:text-[19px] max-[350px]:text-[13px]">{product.name}</h3>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#42464d] px-2 py-1 text-[10px] text-[#bfc4ca] max-sm:px-1.5 max-sm:text-[9px] max-[350px]:text-[8px]">{product.stock > 0 ? "Disponível" : "Esgotado"}</span>
                          </div>
                          <p className="min-h-5 text-xs leading-[1.6] text-[#9699a1] max-sm:text-[11px]">{product.description || " "}</p>
                          <div className="mt-auto flex items-center justify-between gap-1 border-t border-[#33363c] pt-4">
                            <div>
                              <span className="mb-1 block text-[10px] text-[#878b92]">Valor unitário</span>
                              <strong className="font-manrope text-base font-bold tracking-tight tabular-nums sm:text-[21px] max-[350px]:text-sm">{money.format(product.price)}</strong>
                            </div>
                            <Button data-slot="product-add-button" className="h-11 shrink-0 rounded-[5px] bg-[#f1f3f6] px-2 text-[11px] font-bold text-[#101319] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#bdd0ff] active:scale-95 sm:px-[15px] sm:text-xs max-[350px]:size-11 max-[350px]:px-0 max-[350px]:text-base" aria-label={`Adicionar ${product.name} ao carrinho`} disabled={product.stock < 1} onClick={() => addProduct(product)}>
                              <span className="max-[350px]:hidden">Adicionar +</span><span className="hidden max-[350px]:inline">+</span>
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center px-5 py-20 text-center text-[#aab0ba]">
              <Package className="mb-3 size-7 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-base font-medium">{search.trim() ? "Nenhum produto encontrado" : "O catálogo está vazio"}</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{search.trim() ? "Experimente outro termo de busca." : "Os produtos serão apresentados aqui quando forem adicionados pela loja."}</p>
            </div>
          )}
        </section>

        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-2 border-t border-[#303238] px-[18px] pb-8 pt-5 text-[11px] text-[#878990] min-[681px]:flex-row min-[681px]:justify-between min-[681px]:px-[42px]">
          <span>CATÁLOGO DIGITAL · PEDIDOS VIA ATENDIMENTO</span>
          <span>SIMPLICIDADE EM CADA ESCOLHA</span>
        </div>
      </main>

      <footer className="border-t border-[#282a30] bg-[#0b0c0e] px-4 py-7 text-center text-xs text-[#858790] font-dm-sans">
        <Link href="/privacidade" className="transition-colors hover:text-foreground">Política de privacidade</Link>
      </footer>
    </>
  );
}
