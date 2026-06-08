-- Supabase schema for expedition and delivery management

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'expedicao', 'supervisor', 'motorista', 'cliente')),
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company_name text,
  document text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create table if not exists expeditions (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null,
  nf_number text not null,
  customer_id uuid references customers(id) on delete set null,
  carrier text,
  freight_type text check (freight_type in ('FOB', 'CIF')),
  responsible_id uuid references users(id) on delete set null,
  status text not null default 'pendente' check (status in ('pendente', 'em_transito', 'entregue', 'concluido', 'cancelado')),
  scheduled_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  expedition_id uuid references expeditions(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  order_number text,
  nf_number text,
  status text not null default 'pendente' check (status in ('pendente', 'carregado', 'em_transito', 'chegou', 'instalou', 'assinou', 'entregue', 'finalizado', 'concluido', 'cancelado')),
  arrival_at timestamptz,
  signed_at timestamptz,
  finished_at timestamptz,
  signature_name text,
  signature_document text,
  signature_role text,
  signature_ip inet,
  signature_gps text,
  checklist jsonb not null default '{}'::jsonb,
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_expedition_status_from_delivery() returns trigger language plpgsql as $$
declare
  v_remaining int;
  v_new_status text;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.expedition_id is not null then
    if new.status = 'cancelado' then
      v_new_status := 'cancelado';
    elsif new.status in ('carregado','em_transito','chegou','instalou','assinou') then
      if (select count(*) from public.deliveries where expedition_id = new.expedition_id and status not in ('entregue','finalizado','concluido','cancelado')) > 0 then
        v_new_status := 'em_transito';
      end if;
    elsif new.status = 'entregue' then
      select count(*) into v_remaining from public.deliveries where expedition_id = new.expedition_id and status not in ('entregue','finalizado','concluido','cancelado');
      if v_remaining = 0 then
        v_new_status := 'entregue';
      end if;
    elsif new.status in ('finalizado','concluido') then
      select count(*) into v_remaining from public.deliveries where expedition_id = new.expedition_id and status not in ('finalizado','concluido','cancelado');
      if v_remaining = 0 then
        v_new_status := 'concluido';
      end if;
    end if;

    if v_new_status is not null then
      update public.expeditions
      set status = v_new_status, updated_at = now()
      where id = new.expedition_id
        and status is distinct from v_new_status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_expedition_status on public.deliveries;
create trigger trg_sync_expedition_status
  after update on public.deliveries
  for each row when (old.status is distinct from new.status)
  execute function public.sync_expedition_status_from_delivery();

create or replace function public.sync_deliveries_status_from_expedition() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.id is not null then
    update public.deliveries
    set
      status = case
        when new.status = 'em_transito' then 'em_transito'
        when new.status = 'entregue' then 'entregue'
        when new.status = 'cancelado' then 'cancelado'
        when new.status = 'concluido' then 'concluido'
        else status
      end,
      order_number = new.order_number,
      nf_number = new.nf_number,
      customer_id = new.customer_id,
      updated_at = now()
    where expedition_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_deliveries_status on public.expeditions;
create trigger trg_sync_deliveries_status
  after update on public.expeditions
  for each row
  execute function public.sync_deliveries_status_from_expedition();

create or replace function public.delete_expedition_when_last_delivery_deleted() returns trigger language plpgsql as $$
begin
  if old.expedition_id is not null then
    delete from public.expeditions
    where id = old.expedition_id
      and not exists (select 1 from public.deliveries d where d.expedition_id = old.expedition_id);
  end if;
  return old;
end;
$$;

drop trigger if exists trg_delete_orphan_expedition on public.deliveries;
create trigger trg_delete_orphan_expedition
  after delete on public.deliveries
  for each row
  execute function public.delete_expedition_when_last_delivery_deleted();

create table if not exists delivery_photos (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid references deliveries(id) on delete cascade,
  photo_type text not null,
  storage_path text not null,
  public_url text not null,
  captured_at timestamptz not null default now(),
  latitude numeric,
  longitude numeric,
  city text,
  watermark text
);

create table if not exists warranties (
  id uuid primary key default uuid_generate_v4(),
  expedition_id uuid references expeditions(id) on delete cascade,
  delivery_id uuid references deliveries(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists occurrences (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid references deliveries(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  type text not null check (type in ('avaria', 'falta_volume', 'falta_acessorio', 'produto_errado', 'cliente_ausente')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists feedbacks (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete set null,
  delivery_id uuid references deliveries(id) on delete set null,
  expedition_id uuid references expeditions(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  client_name text,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  date timestamptz not null default now(),
  comment text,
  response text,
  liked boolean default false,
  created_at timestamptz not null default now()
);
alter table feedbacks add column if not exists expedition_id uuid references expeditions(id) on delete set null;
create index if not exists idx_feedbacks_delivery_id on feedbacks (delivery_id);
create index if not exists idx_feedbacks_customer_id on feedbacks (customer_id);
create index if not exists idx_feedbacks_expedition_id on feedbacks (expedition_id);
create index if not exists idx_feedbacks_date on feedbacks (date desc);
create index if not exists idx_feedbacks_company_id on feedbacks (company_id);

-- Enable Row Level Security and policies for client access
alter table customers enable row level security;
alter table deliveries enable row level security;
alter table delivery_photos enable row level security;
alter table warranties enable row level security;
alter table occurrences enable row level security;
alter table feedbacks enable row level security;

drop policy if exists "Allow read for authenticated users on customers" on customers;
drop policy if exists "Allow insert for authenticated users on customers" on customers;
drop policy if exists "Allow update for authenticated users on customers" on customers;
drop policy if exists "Allow delete for authenticated users on customers" on customers;
create policy "Allow read for authenticated users on customers" on customers
  for select using (auth.role() is not null);
create policy "Allow insert for authenticated users on customers" on customers
  for insert with check (auth.role() is not null);
create policy "Allow update for authenticated users on customers" on customers
  for update using (auth.role() is not null) with check (auth.role() is not null);
create policy "Allow delete for authenticated users on customers" on customers
  for delete using (auth.role() = 'admin');

drop policy if exists "Allow read all deliveries for authenticated users" on deliveries;
drop policy if exists "Allow insert deliveries" on deliveries;
drop policy if exists "Allow update deliveries" on deliveries;
create policy "Allow read all deliveries for authenticated users" on deliveries
  for select using (auth.role() is not null);
create policy "Allow insert deliveries" on deliveries
  for insert with check (auth.role() is not null);
create policy "Allow update deliveries" on deliveries
  for update using (auth.role() is not null);

drop policy if exists "Allow read photos for authenticated users" on delivery_photos;
drop policy if exists "Allow insert photos" on delivery_photos;
create policy "Allow read photos for authenticated users" on delivery_photos
  for select using (auth.role() is not null);
create policy "Allow insert photos" on delivery_photos
  for insert with check (auth.role() is not null);

drop policy if exists "Allow read warranties for authenticated users" on warranties;
drop policy if exists "Allow insert warranties" on warranties;
create policy "Allow read warranties for authenticated users" on warranties
  for select using (auth.role() is not null);
create policy "Allow insert warranties" on warranties
  for insert with check (auth.role() is not null);

drop policy if exists "Allow read occurrences for authenticated users" on occurrences;
drop policy if exists "Allow insert occurrences" on occurrences;
create policy "Allow read occurrences for authenticated users" on occurrences
  for select using (auth.role() is not null);
create policy "Allow insert occurrences" on occurrences
  for insert with check (auth.role() is not null);

drop policy if exists "Allow read feedbacks for authenticated users" on feedbacks;
drop policy if exists "Allow insert feedbacks" on feedbacks;
create policy "Allow read feedbacks for authenticated users" on feedbacks
  for select using (auth.role() is not null);
create policy "Allow insert feedbacks" on feedbacks
  for insert with check (auth.role() is not null);

-- Views used by client pages
drop view if exists public.vw_deliveries cascade;
create view public.vw_deliveries as
select
  d.id,
  d.order_number,
  d.nf_number,
  d.status,
  d.arrival_at,
  d.signed_at,
  d.finished_at,
  d.created_at,
  coalesce(c.name, e.client_name) as customer_name,
  c.document as customer_document,
  e.client_name as expedition_client_name,
  u.name as driver_name,
  d.company_id
from public.deliveries d
left join public.customers c on c.id = d.customer_id
left join public.expeditions e on e.id = d.expedition_id
left join public.users u on u.id = d.driver_user_id;

drop view if exists public.vw_warranties cascade;
create view public.vw_warranties as
select
  w.id,
  w.delivery_id,
  w.expedition_id,
  w.customer_id,
  w.start_date,
  w.end_date,
  w.status,
  w.created_at,
  coalesce(c.name, dc.name, e.client_name) as customer_name,
  e.client_name as expedition_client_name,
  coalesce(d.order_number, e.order_number) as order_number,
  coalesce(d.nf_number, e.nf_number) as nf_number
from public.warranties w
left join public.customers c on c.id = w.customer_id
left join public.deliveries d on d.id = w.delivery_id
left join public.customers dc on dc.id = d.customer_id
left join public.expeditions e on e.id = w.expedition_id;
