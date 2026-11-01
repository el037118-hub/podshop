alter table public.products
  add column if not exists brand text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_brand_length'
  ) then
    alter table public.products
      add constraint products_brand_length
      check (brand is null or char_length(brand) <= 80);
  end if;
end;
$$;
