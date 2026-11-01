alter table public.products enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $policies$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'podshop_admin_select_products'
  ) then
    execute $sql$
      create policy podshop_admin_select_products on public.products
      for select to authenticated
      using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'podshop_admin_insert_products'
  ) then
    execute $sql$
      create policy podshop_admin_insert_products on public.products
      for insert to authenticated
      with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'podshop_admin_update_products'
  ) then
    execute $sql$
      create policy podshop_admin_update_products on public.products
      for update to authenticated
      using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
      with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'podshop_admin_delete_products'
  ) then
    execute $sql$
      create policy podshop_admin_delete_products on public.products
      for delete to authenticated
      using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'podshop_public_read_product_images'
  ) then
    execute $sql$
      create policy podshop_public_read_product_images on storage.objects
      for select to public
      using (bucket_id = 'product-images')
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'podshop_admin_insert_product_images'
  ) then
    execute $sql$
      create policy podshop_admin_insert_product_images on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'product-images'
        and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
      )
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'podshop_admin_update_product_images'
  ) then
    execute $sql$
      create policy podshop_admin_update_product_images on storage.objects
      for update to authenticated
      using (
        bucket_id = 'product-images'
        and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
      )
      with check (
        bucket_id = 'product-images'
        and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
      )
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'podshop_admin_delete_product_images'
  ) then
    execute $sql$
      create policy podshop_admin_delete_product_images on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'product-images'
        and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
      )
    $sql$;
  end if;
end
$policies$;
