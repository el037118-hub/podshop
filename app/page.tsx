import { Storefront } from "@/components/storefront";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/database.types";

type CatalogProduct = Product & { category: { name: string } | null };

export default async function HomePage() {
  let products: CatalogProduct[] = [];
  let loadError: string | undefined;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*, category:categories(name)").eq("active", true).order("name");
    if (error) loadError = "Não foi possível carregar o catálogo. Tente novamente mais tarde.";
    else products = data ?? [];
  } catch {
    loadError = "Configure a ligação ao Supabase para carregar o catálogo.";
  }

  return <Storefront products={products} loadError={loadError} />;
}
