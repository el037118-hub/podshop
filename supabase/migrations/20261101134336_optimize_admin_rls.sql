drop policy if exists podshop_admin_select_products on public.products;
create policy podshop_admin_select_products on public.products
for select to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists podshop_admin_insert_products on public.products;
create policy podshop_admin_insert_products on public.products
for insert to authenticated
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists podshop_admin_update_products on public.products;
create policy podshop_admin_update_products on public.products
for update to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists podshop_admin_delete_products on public.products;
create policy podshop_admin_delete_products on public.products
for delete to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
