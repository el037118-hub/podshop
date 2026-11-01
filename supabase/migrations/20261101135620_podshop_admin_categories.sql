do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'categories' and policyname = 'podshop_admin_insert_categories'
  ) then
    execute $sql$
      create policy podshop_admin_insert_categories on public.categories
      for insert to authenticated
      with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    $sql$;
  end if;
end
$policy$;
