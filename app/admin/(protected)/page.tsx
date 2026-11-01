import { AdminProducts } from "@/components/admin-products";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/database.types";

export default async function AdminPage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let loadError: string | undefined;
  try {
    const supabase = await createClient();
    const [productResult, categoryResult] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (productResult.error) loadError = "Não foi possível carregar os produtos. Atualize a página ou verifique as políticas do Supabase.";
    else products = productResult.data ?? [];
    if (!categoryResult.error) categories = categoryResult.data ?? [];
  } catch {
    loadError = "Não foi possível ligar ao Supabase.";
  }
  return <AdminProducts initialProducts={products} initialCategories={categories} loadError={loadError} />;
}
