-- Permite que cada usuario vea solamente sus propios cierres y vencimientos.
alter table public.datos_tarjeta enable row level security;

drop policy if exists "Users can read own card data" on public.datos_tarjeta;

create policy "Users can read own card data"
on public.datos_tarjeta
for select
to authenticated
using (created_by = auth.uid());
