"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Pencil, Plus, Trash2, Upload } from "lucide-react";
import type { Category, Product } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const bucket = "product-images";
const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function storagePath(publicUrl: string | null) {
  if (!publicUrl) return null;
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const pathname = new URL(publicUrl).pathname;
    const index = pathname.indexOf(marker);
    return index < 0 ? null : decodeURIComponent(pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

type ProductForm = { name: string; brand: string; category: string; description: string; price: string; stock: string; active: boolean };
const emptyForm: ProductForm = { name: "", brand: "", category: "", description: "", price: "", stock: "", active: true };

export function AdminProducts({ initialProducts, initialCategories, loadError }: { initialProducts: Product[]; initialCategories: Category[]; loadError?: string }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const brands = [...new Set(products.map((product) => product.brand?.trim()).filter((brand): brand is string => Boolean(brand)))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState(loadError ?? "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const previewObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

  function releasePreview() {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = null;
  }

  function chooseImage(file: File | null) {
    releasePreview();
    setImageFile(file);
    if (file) {
      previewObjectUrl.current = URL.createObjectURL(file);
      setPreviewUrl(previewObjectUrl.current);
    } else setPreviewUrl(editing?.image_url ?? null);
  }

  function startNewProduct() {
    setEditing(null);
    releasePreview();
    setImageFile(null);
    setPreviewUrl(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setDialogOpen(true);
  }

  function startEdit(product: Product) {
    setEditing(product);
    releasePreview();
    setImageFile(null);
    setPreviewUrl(product.image_url);
    setForm({
      name: product.name,
      brand: product.brand ?? "",
      category: categories.find((category) => category.id === product.category_id)?.name ?? "",
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      active: product.active,
    });
    setError("");
    setNotice("");
    setDialogOpen(true);
  }

  function closeForm(open: boolean) {
    if (!open && busy) return;
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      releasePreview();
      setImageFile(null);
      setPreviewUrl(null);
      setForm(emptyForm);
    }
  }

  function validateFile(file: File) {
    if (!allowedImageTypes.has(file.type)) return "Use uma imagem PNG, JPEG ou WebP.";
    if (!file.size || file.size > maxImageSize) return "A imagem deve ter até 5 MB.";
    return "";
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const name = form.name.trim();
    const brand = form.brand.trim();
    const categoryName = form.category.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!name) return setError("Informe o nome do produto.");
    if (brand.length > 80) return setError("A marca pode ter até 80 caracteres.");
    if (categoryName.length > 80) return setError("A categoria pode ter até 80 caracteres.");
    if (description.length > 1000) return setError("A descrição pode ter até 1 000 caracteres.");
    if (!Number.isFinite(price) || price < 0) return setError("Informe um preço válido, igual ou superior a zero.");
    if (!Number.isSafeInteger(stock) || stock < 0) return setError("O estoque deve ser um número inteiro igual ou superior a zero.");
    if (imageFile) {
      const imageError = validateFile(imageFile);
      if (imageError) return setError(imageError);
    }
    if (!editing && !imageFile) return setError("Selecione uma imagem para o produto.");

    setBusy(true);
    let uploadedPath: string | null = null;
    try {
      const supabase = createClient();
      const id = editing?.id ?? crypto.randomUUID();
      let categoryId: string | null = null;
      if (categoryName) {
        const { data: existingCategory, error: categoryLookupError } = await supabase
          .from("categories")
          .select("id, name")
          .eq("name", categoryName)
          .maybeSingle();
        if (categoryLookupError) throw new Error(`Não foi possível verificar a categoria. ${categoryLookupError.message}`);
        if (existingCategory) categoryId = existingCategory.id;
        else {
          const { data: newCategory, error: categoryInsertError } = await supabase
            .from("categories")
            .insert({ name: categoryName })
            .select("*")
            .single();
          if (categoryInsertError) throw new Error(`Não foi possível criar a categoria. ${categoryInsertError.message}`);
          categoryId = newCategory.id;
          setCategories((current) => [...current, newCategory].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
        }
      }

      let imageUrl = editing?.image_url ?? null;
      if (imageFile) {
        const extension = imageFile.type === "image/jpeg" ? "jpg" : imageFile.type.split("/")[1];
        uploadedPath = `${id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(uploadedPath, imageFile, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw new Error(`Não foi possível carregar a imagem. ${uploadError.message}`);
        imageUrl = supabase.storage.from(bucket).getPublicUrl(uploadedPath).data.publicUrl;
      }

      const productValues = { name, brand: brand || null, category_id: categoryId, description: description || null, price, stock, active: form.active, image_url: imageUrl };
      const result = editing
        ? await supabase.from("products").update(productValues).eq("id", id).select("*").single()
        : await supabase.from("products").insert({ id, ...productValues }).select("*").single();

      if (result.error) {
        let cleanupWarning = "";
        if (uploadedPath) {
          const { error: cleanupError } = await supabase.storage.from(bucket).remove([uploadedPath]);
          if (cleanupError) cleanupWarning = " A imagem carregada não pôde ser removida.";
        }
        throw new Error(`Não foi possível salvar o produto. ${result.error.message}${cleanupWarning}`);
      }

      const savedProduct = result.data;
      setProducts((current) => [...current.filter((product) => product.id !== id), savedProduct].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      const oldPath = storagePath(editing?.image_url ?? null);
      let cleanupNotice = "";
      if (oldPath && uploadedPath && oldPath !== uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from(bucket).remove([oldPath]);
        if (cleanupError) cleanupNotice = " O produto foi guardado, mas não foi possível remover a imagem anterior.";
      }
      setNotice(cleanupNotice || (editing ? "Produto atualizado." : "Produto adicionado."));
      closeForm(false);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Ocorreu um erro inesperado.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Excluir “${product.name}”?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id).select("id").single();
      if (deleteError) throw new Error(`Não foi possível excluir o produto. ${deleteError.message}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      const path = storagePath(product.image_url);
      if (path) {
        const { error: storageError } = await supabase.storage.from(bucket).remove([path]);
      setNotice(storageError ? "Produto excluído. A imagem antiga não foi removida do Storage." : "Produto excluído.");
    } else setNotice("Produto excluído.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocorreu um erro inesperado.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Não foi possível terminar a sessão.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[.2em] text-accent">PODSHOP IMPORTS</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Produtos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Gerencie o catálogo, os preços e o estoque.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/"><ArrowLeft className="size-4" aria-hidden="true" />Voltar à loja</Link></Button>
          <Button variant="outline" onClick={signOut}><LogOut className="size-4" />Terminar sessão</Button>
          <Button onClick={startNewProduct}><Plus className="size-4" />Novo produto</Button>
        </div>
      </div>

      <Alert className="mb-5 border-accent/30 bg-accent/5 text-muted-foreground">
        Esta área exige uma conta administrativa. As alterações são aplicadas ao catálogo ligado ao Supabase.
      </Alert>
      {error && <Alert className="mb-5 border-destructive/50 text-destructive">{error}</Alert>}
      {notice && <Alert className="mb-5 border-accent/40 text-accent" role="status">{notice}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
          <CardDescription>{products.length} {products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Marca</TableHead><TableHead>Modelo</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="min-w-48">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                          {product.image_url ? <Image src={product.image_url} alt="" fill sizes="48px" unoptimized className="object-cover" /> : <span className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">—</span>}
                        </div>
                        <div className="min-w-0"><p className="max-w-72 truncate font-medium">{product.name}</p><p className="max-w-72 truncate text-xs text-muted-foreground">{product.description || "Sem descrição"}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>{product.brand || "—"}</TableCell>
                    <TableCell>{categories.find((category) => category.id === product.category_id)?.name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{money.format(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell><Badge variant={product.active ? "success" : "muted"}>{product.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => startEdit(product)}><Pencil className="size-3.5" />Editar</Button>
                        <Button variant="destructive" size="sm" disabled={busy} onClick={() => deleteProduct(product)}><Trash2 className="size-3.5" />Excluir</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-5 py-12 text-center">
              <p className="font-medium">Ainda não há produtos no catálogo.</p>
              <p className="mt-1 text-sm text-muted-foreground">Adicione o primeiro produto para o apresentar na loja.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={closeForm}>
        <DialogContent
          className="bottom-0 left-0 right-0 top-4 h-[calc(100dvh_-_1rem)] max-h-none w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%_-_2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6"
          onPointerDownOutside={(event) => {
            event.preventDefault();
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          }}
        >
          <DialogHeader className="pr-8">
            <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
            <DialogDescription>Preencha os dados do produto. Imagens PNG, JPEG ou WebP até 5 MB.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={saveProduct}>
            <div className="grid gap-2">
              <Label htmlFor="product-name">Nome</Label>
              <Input id="product-name" value={form.name} maxLength={120} required onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-brand">Marca</Label>
              <Input id="product-brand" value={form.brand} maxLength={80} list="product-brands" placeholder="Ex.: Ignite" onChange={(event) => setForm({ ...form, brand: event.target.value })} />
              <datalist id="product-brands">
                {brands.map((brand) => <option key={brand} value={brand} />)}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-category">Modelo ou categoria</Label>
              <Input id="product-category" value={form.category} maxLength={80} list="product-categories" placeholder="Ex.: Ignite V155" onChange={(event) => setForm({ ...form, category: event.target.value })} />
              <datalist id="product-categories">
                {categories.map((category) => <option key={category.id} value={category.name} />)}
              </datalist>
              <p className="text-xs text-muted-foreground">Os produtos com o mesmo modelo aparecem juntos no catálogo.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea id="product-description" value={form.description} maxLength={1000} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="product-price">Preço</Label>
                <Input id="product-price" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} required onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-stock">Estoque</Label>
                <Input id="product-stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} required onChange={(event) => setForm({ ...form, stock: event.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-image">Imagem do produto</Label>
              <Input id="product-image" type="file" accept="image/png,image/jpeg,image/webp" required={!editing} onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && (!allowedImageTypes.has(file.type) || file.size > maxImageSize || !file.size)) {
                  setError(!allowedImageTypes.has(file.type) ? "Use uma imagem PNG, JPEG ou WebP." : "A imagem deve ter até 5 MB.");
                  event.target.value = "";
                  return;
                }
                setError("");
                chooseImage(file);
              }} />
              {editing && <p className="text-xs text-muted-foreground">Deixe em branco para manter a imagem atual.</p>}
              {previewUrl && <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-secondary"><Image src={previewUrl} alt="Pré-visualização do produto" fill unoptimized className="object-contain" /></div>}
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="size-4 accent-primary" />
              Apresentar produto no catálogo
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => closeForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={busy}>{busy ? "Salvando..." : editing ? "Salvar alterações" : <><Upload className="size-4" />Salvar produto</>}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
