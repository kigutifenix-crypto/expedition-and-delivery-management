-- Supabase Migration: Schema for Expedition and Delivery Management
-- Includes customers, companies, expedições, volumes, fotos, entregas, assinaturas digitais,
-- garantias, feedbacks, ocorrências, auditoria, documentos, QR codes, WhatsApp, arquivos e RLS profissional.

-- Extensions
create extension if not exists "pgcrypto";

grant usage on schema public to anon;
grant usage on schema public to authenticated;

-- Companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_companies_document on public.companies (document);
create index if not exists idx_companies_created_at on public.companies (created_at desc);

-- Users table (application users / system operators)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'supervisor', 'expedicao', 'motorista', 'cliente')),
  status text not null default 'Ativo' check (status in ('Ativo', 'Bloqueado', 'Em Entrega', 'Inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_role on public.users (role);
create index if not exists idx_users_status on public.users (status);
create index if not exists idx_users_company_id on public.users (company_id);

-- Customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  company_name text,
  document text unique,
  email text,
  phone text,
  address text,
  city text,
  state text,
  portal_enabled boolean not null default true,
  portal_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_created_at on public.customers (created_at desc);
create index if not exists idx_customers_document on public.customers (document);
create index if not exists idx_customers_company_id on public.customers (company_id);
create index if not exists idx_customers_portal_user_id on public.customers (portal_user_id);

-- Expeditions table
create table if not exists public.expeditions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  responsible_user_id uuid references public.users(id) on delete set null,
  order_number text not null,
  nf_number text not null,
  client_name text not null,
  client_email text,
  address text not null,
  carrier text not null,
  freight_type text not null check (freight_type in ('FOB', 'CIF', 'CIF/FOB', 'OUTROS')),
  responsible text,
  observations text,
  status text not null check (status in ('pendente', 'em_transito', 'entregue', 'concluido', 'cancelado')),
  date timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  products jsonb default '[]',
  metadata jsonb default '{}'
);
create index if not exists idx_expeditions_customer_id on public.expeditions (customer_id);
create index if not exists idx_expeditions_status on public.expeditions (status);
create index if not exists idx_expeditions_date on public.expeditions (date desc);
create index if not exists idx_expeditions_order_number on public.expeditions (order_number);
create index if not exists idx_expeditions_nf_number on public.expeditions (nf_number);
create index if not exists idx_expeditions_company_id on public.expeditions (company_id);
create index if not exists idx_expeditions_responsible_user_id on public.expeditions (responsible_user_id);

grant select, insert, update, delete on public.expeditions to anon;
grant select, insert, update, delete on public.expeditions to authenticated;

-- Expedition volumes table
create table if not exists public.expedition_volumes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  expedition_id uuid not null references public.expeditions(id) on delete cascade,
  volume_number integer not null,
  description text,
  quantity integer not null default 1,
  weight numeric(10,2) not null default 0,
  observation text,
  created_at timestamptz not null default now()
);
create index if not exists idx_expedition_volumes_expedition_id on public.expedition_volumes (expedition_id);
create index if not exists idx_expedition_volumes_company_id on public.expedition_volumes (company_id);

-- Expedition photos table
create table if not exists public.expedition_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  expedition_id uuid not null references public.expeditions(id) on delete cascade,
  photo_type text not null,
  storage_path text not null,
  public_url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  captured_at timestamptz not null default now(),
  captured_device text,
  captured_ip text,
  watermark_applied boolean not null default false,
  city text,
  state text,
  latitude numeric(10,8),
  longitude numeric(11,8)
);
create index if not exists idx_expedition_photos_expedition_id on public.expedition_photos (expedition_id);
create index if not exists idx_expedition_photos_company_id on public.expedition_photos (company_id);
create index if not exists idx_expedition_photos_location on public.expedition_photos (latitude, longitude);

-- Deliveries table
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  expedition_id uuid references public.expeditions(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  driver_user_id uuid references public.users(id) on delete set null,
  order_number text not null,
  nf_number text not null,
  status text not null check (status in ('pendente', 'em_transito', 'entregue', 'chegada', 'instalacao', 'assinatura', 'finalizado', 'concluido', 'cancelado')),
  arrival_at timestamptz,
  signed_at timestamptz,
  finished_at timestamptz,
  signer_name text,
  signer_document text,
  signer_role text,
  signature_gps text,
  signature_ip text,
  delivery_notes text,
  checklist jsonb default '{"unloaded": false, "installed": false, "tested": false, "working": false, "trained": false}',
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_deliveries_customer_id on public.deliveries (customer_id);
create index if not exists idx_deliveries_expedition_id on public.deliveries (expedition_id);
create index if not exists idx_deliveries_driver_user_id on public.deliveries (driver_user_id);
create index if not exists idx_deliveries_status on public.deliveries (status);
create index if not exists idx_deliveries_created_at on public.deliveries (created_at desc);
create index if not exists idx_deliveries_company_id on public.deliveries (company_id);
create index if not exists idx_deliveries_location on public.deliveries (latitude, longitude);
create index if not exists idx_deliveries_order_number on public.deliveries (order_number);
create index if not exists idx_deliveries_nf_number on public.deliveries (nf_number);

grant select, insert, update, delete on public.deliveries to anon;
grant select, insert, update, delete on public.deliveries to authenticated;

-- Delivery photos table
create table if not exists public.delivery_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  photo_type text not null,
  storage_path text not null,
  public_url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  captured_at timestamptz not null default now(),
  captured_device text,
  captured_ip text,
  watermark_applied boolean not null default false,
  city text,
  state text,
  latitude numeric(10,8),
  longitude numeric(11,8)
);
create index if not exists idx_delivery_photos_delivery_id on public.delivery_photos (delivery_id);
create index if not exists idx_delivery_photos_company_id on public.delivery_photos (company_id);
create index if not exists idx_delivery_photos_location on public.delivery_photos (latitude, longitude);

-- Digital signatures table
create table if not exists public.digital_signatures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  signed_by uuid references public.users(id) on delete set null,
  signer_name text not null,
  signer_document text,
  signer_role text,
  gps_location text,
  ip_address text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  signature_data text,
  signed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_digital_signatures_delivery_id on public.digital_signatures (delivery_id);
create index if not exists idx_digital_signatures_company_id on public.digital_signatures (company_id);
create index if not exists idx_digital_signatures_location on public.digital_signatures (latitude, longitude);

-- Warranties table
create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('active', 'expired', 'cancelled', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_warranties_delivery_id_unique on public.warranties (delivery_id) where delivery_id is not null;
create index if not exists idx_warranties_customer_id on public.warranties (customer_id);
create index if not exists idx_warranties_company_id on public.warranties (company_id);

-- Feedbacks table
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete set null,
  expedition_id uuid references public.expeditions(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  client_name text,
  rating numeric(2,1) not null check (rating >= 0 and rating <= 5),
  date timestamptz not null default now(),
  comment text,
  response text,
  liked boolean default false,
  created_at timestamptz not null default now()
);
alter table public.feedbacks add column if not exists expedition_id uuid references public.expeditions(id) on delete set null;
create index if not exists idx_feedbacks_delivery_id on public.feedbacks (delivery_id);
create index if not exists idx_feedbacks_customer_id on public.feedbacks (customer_id);
create index if not exists idx_feedbacks_expedition_id on public.feedbacks (expedition_id);
create index if not exists idx_feedbacks_date on public.feedbacks (date desc);
create index if not exists idx_feedbacks_company_id on public.feedbacks (company_id);

-- Notas detalhadas por categoria
alter table public.feedbacks add column if not exists delivery_rating numeric(2,1) check (delivery_rating >= 0 and delivery_rating <= 5);
alter table public.feedbacks add column if not exists installation_rating numeric(2,1) check (installation_rating >= 0 and installation_rating <= 5);
alter table public.feedbacks add column if not exists service_rating numeric(2,1) check (service_rating >= 0 and service_rating <= 5);
alter table public.feedbacks add column if not exists equipment_rating numeric(2,1) check (equipment_rating >= 0 and equipment_rating <= 5);
create index if not exists idx_feedbacks_delivery_rating on public.feedbacks (delivery_rating);
create index if not exists idx_feedbacks_installation_rating on public.feedbacks (installation_rating);
create index if not exists idx_feedbacks_service_rating on public.feedbacks (service_rating);
create index if not exists idx_feedbacks_equipment_rating on public.feedbacks (equipment_rating);

-- Occurrences table
create table if not exists public.occurrences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete set null,
  expedition_id uuid references public.expeditions(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  reported_by uuid references public.users(id) on delete set null,
  occurrence_type text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'cancelled')),
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz not null default now()
);
create index if not exists idx_occurrences_delivery_id on public.occurrences (delivery_id);
create index if not exists idx_occurrences_expedition_id on public.occurrences (expedition_id);
create index if not exists idx_occurrences_customer_id on public.occurrences (customer_id);
create index if not exists idx_occurrences_reported_by on public.occurrences (reported_by);
create index if not exists idx_occurrences_company_id on public.occurrences (company_id);
create index if not exists idx_occurrences_location on public.occurrences (latitude, longitude);

-- Delivery status history table
create table if not exists public.delivery_status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete cascade,
  status text not null,
  previous_status text,
  changed_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_delivery_status_history_delivery_id on public.delivery_status_history (delivery_id);
create index if not exists idx_delivery_status_history_company_id on public.delivery_status_history (company_id);
create index if not exists idx_delivery_status_history_created_at on public.delivery_status_history (created_at desc);

-- Delivery documents table
create table if not exists public.delivery_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete cascade,
  document_type text not null check (document_type in ('TERMO_ENTREGA', 'GARANTIA', 'COMPROVANTE', 'RELATORIO')),
  storage_path text not null,
  public_url text not null,
  generated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_delivery_documents_delivery_id on public.delivery_documents (delivery_id);
create index if not exists idx_delivery_documents_company_id on public.delivery_documents (company_id);
create index if not exists idx_delivery_documents_created_at on public.delivery_documents (created_at desc);

-- QR codes table
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete cascade,
  token text unique not null,
  public_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_qr_codes_delivery_id on public.qr_codes (delivery_id);
create index if not exists idx_qr_codes_token on public.qr_codes (token);
create index if not exists idx_qr_codes_company_id on public.qr_codes (company_id);

-- WhatsApp messages table
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  phone text,
  message_type text not null check (message_type in ('ENTREGA', 'GARANTIA', 'FEEDBACK', 'LEMBRETE')),
  message_content text,
  status text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_whatsapp_messages_delivery_id on public.whatsapp_messages (delivery_id);
create index if not exists idx_whatsapp_messages_customer_id on public.whatsapp_messages (customer_id);
create index if not exists idx_whatsapp_messages_company_id on public.whatsapp_messages (company_id);
create index if not exists idx_whatsapp_messages_sent_at on public.whatsapp_messages (sent_at desc);

-- Email messages table
create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid references public.deliveries(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  email text not null,
  subject text,
  status text check (status in ('pending', 'sent', 'failed', 'delivered')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_email_messages_delivery_id on public.email_messages (delivery_id);
create index if not exists idx_email_messages_customer_id on public.email_messages (customer_id);
create index if not exists idx_email_messages_company_id on public.email_messages (company_id);
create index if not exists idx_email_messages_sent_at on public.email_messages (sent_at desc);

-- Occurrence files table
create table if not exists public.occurrence_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  occurrence_id uuid references public.occurrences(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_occurrence_files_occurrence_id on public.occurrence_files (occurrence_id);
create index if not exists idx_occurrence_files_company_id on public.occurrence_files (company_id);

-- Delivery checklists table
create table if not exists public.delivery_checklists (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  delivery_id uuid unique not null references public.deliveries(id) on delete cascade,
  unloaded boolean default false,
  installed boolean default false,
  tested boolean default false,
  working boolean default false,
  trained boolean default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_delivery_checklists_delivery_id on public.delivery_checklists (delivery_id);
create index if not exists idx_delivery_checklists_company_id on public.delivery_checklists (company_id);

-- Audit logs table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  record_table text not null,
  record_id uuid,
  action text not null,
  performed_by uuid references public.users(id) on delete set null,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_record_table on public.audit_logs (record_table);
create index if not exists idx_audit_logs_record_id on public.audit_logs (record_id);
create index if not exists idx_audit_logs_performed_by on public.audit_logs (performed_by);

-- Audit trigger function
create or replace function public.log_table_changes() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    insert into public.audit_logs(record_table, record_id, action, performed_by, changes, created_at)
    values (tg_table_name, old.id, 'delete', public.current_user_id(), to_jsonb(old), now());
    return old;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_logs(record_table, record_id, action, performed_by, changes, created_at)
    values (tg_table_name, new.id, 'update', public.current_user_id(), jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)), now());
    return new;
  elsif tg_op = 'INSERT' then
    insert into public.audit_logs(record_table, record_id, action, performed_by, changes, created_at)
    values (tg_table_name, new.id, 'insert', public.current_user_id(), to_jsonb(new), now());
    return new;
  end if;
  return null;
end;
$$;

-- Helper functions for role-based RLS
create or replace function public.current_user_id() returns uuid
language sql stable security definer set row_security = off as $$
select u.id
from public.users u
where u.auth_id = auth.uid()
limit 1;
$$;

create or replace function public.current_customer_id() returns uuid
language sql stable security definer set row_security = off as $$
select c.id from public.customers c
join public.users u on c.portal_user_id = u.id
where u.auth_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set row_security = off as $$
select exists(
  select 1 from public.users u
  where u.auth_id = auth.uid() and u.role = 'admin'
);
$$;

create or replace function public.is_supervisor() returns boolean
language sql stable security definer set row_security = off as $$
select exists(
  select 1 from public.users u
  where u.auth_id = auth.uid() and u.role = 'supervisor'
);
$$;

create or replace function public.is_expedicao() returns boolean
language sql stable security definer set row_security = off as $$
select exists(
  select 1 from public.users u
  where u.auth_id = auth.uid() and u.role = 'expedicao'
);
$$;

create or replace function public.is_motorista() returns boolean
language sql stable security definer set row_security = off as $$
select exists(
  select 1 from public.users u
  where u.auth_id = auth.uid() and u.role = 'motorista'
);
$$;

create or replace function public.is_cliente() returns boolean
language sql stable security definer set row_security = off as $$
select exists(
  select 1 from public.customers c
  join public.users u on c.portal_user_id = u.id
  where u.auth_id = auth.uid()
);
$$;

create or replace function public.is_current_user(p_user_id uuid) returns boolean
language sql stable security definer set row_security = off as $$
select exists(
  select 1 from public.users u
  where u.auth_id = auth.uid() and u.id = $1
);
$$;

-- Helper to generate secure QR tokens
create or replace function public.generate_qr_token() returns text language sql stable as $$
  select encode(gen_random_bytes(16), 'hex');
$$;

create or replace function public.create_qr_code_for_delivery(p_delivery_id uuid, p_public_url text) returns uuid language plpgsql as $$
declare
  v_token text;
  v_id uuid;
begin
  loop
    v_token := public.generate_qr_token();
    exit when not exists (select 1 from public.qr_codes where token = v_token);
  end loop;
  insert into public.qr_codes (id, delivery_id, token, public_url, active, created_at)
  values (gen_random_uuid(), p_delivery_id, v_token, p_public_url, true, now()) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.find_qr_code_by_token(p_token text) returns table(
  id uuid,
  delivery_id uuid,
  public_url text,
  active boolean,
  created_at timestamptz
) language sql stable as $$
  select id, delivery_id, public_url, active, created_at from public.qr_codes where token = p_token and active;
$$;

-- Geolocation columns and metadata on existing tables
alter table public.deliveries add column if not exists latitude numeric(10,8);
alter table public.deliveries add column if not exists longitude numeric(11,8);
alter table public.digital_signatures add column if not exists latitude numeric(10,8);
alter table public.digital_signatures add column if not exists longitude numeric(11,8);
alter table public.expedition_photos add column if not exists latitude numeric(10,8);
alter table public.expedition_photos add column if not exists longitude numeric(11,8);
alter table public.delivery_photos add column if not exists latitude numeric(10,8);
alter table public.delivery_photos add column if not exists longitude numeric(11,8);
alter table public.occurrences add column if not exists latitude numeric(10,8);
alter table public.occurrences add column if not exists longitude numeric(11,8);

alter table public.expedition_photos add column if not exists captured_device text;
alter table public.expedition_photos add column if not exists captured_ip text;
alter table public.expedition_photos add column if not exists watermark_applied boolean not null default false;
alter table public.expedition_photos add column if not exists city text;
alter table public.expedition_photos add column if not exists state text;
alter table public.delivery_photos add column if not exists captured_device text;
alter table public.delivery_photos add column if not exists captured_ip text;
alter table public.delivery_photos add column if not exists watermark_applied boolean not null default false;
alter table public.delivery_photos add column if not exists city text;
alter table public.delivery_photos add column if not exists state text;

alter table public.customers add column if not exists portal_enabled boolean not null default true;
alter table public.customers add column if not exists portal_user_id uuid references public.users(id) on delete set null;

alter table public.expeditions add column if not exists responsible_user_id uuid references public.users(id) on delete set null;

alter table public.deliveries add column if not exists driver_user_id uuid references public.users(id) on delete set null;

-- Company support for existing tables
alter table public.users add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.customers add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.expeditions add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.expeditions add column if not exists customer_contact_done boolean not null default false;
alter table public.expeditions add column if not exists customer_contact_notes text;
alter table public.expeditions add column if not exists assembly_technician text;
alter table public.expedition_volumes add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.expedition_photos add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.deliveries add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.delivery_photos add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.digital_signatures add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.warranties add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.feedbacks add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.occurrences add column if not exists company_id uuid references public.companies(id) on delete set null;

-- Create delivery status history trigger
create or replace function public.log_delivery_status_change() returns trigger language plpgsql security definer set row_security = off as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.delivery_status_history (id, company_id, delivery_id, status, previous_status, changed_by, notes, created_at)
    values (
      gen_random_uuid(),
      new.company_id,
      new.id,
      new.status,
      old.status,
      (select id from public.users where auth_id = auth.uid() limit 1),
      null,
      now()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_delivery_status_history on public.deliveries;
create trigger trg_delivery_status_history
  after update on public.deliveries
  for each row when (old.status is distinct from new.status)
  execute function public.log_delivery_status_change();

-- Warranty auto-create trigger
-- Warranty auto-create trigger removed.
-- Warranty creation is now handled by application logic in DeliveryDetail.tsx.
-- The previous trigger caused conflicts when updating delivery records from the client.

-- Delivery checklist migration from JSON
insert into public.delivery_checklists (company_id, delivery_id, unloaded, installed, tested, working, trained, completed_at, created_at, updated_at)
select
  d.company_id,
  d.id,
  (d.checklist->>'unloaded')::boolean,
  (d.checklist->>'installed')::boolean,
  (d.checklist->>'tested')::boolean,
  (d.checklist->>'working')::boolean,
  (d.checklist->>'trained')::boolean,
  now(),
  now(),
  now()
from public.deliveries d
where d.checklist is not null
  and d.checklist <> '{}'
  and not exists (select 1 from public.delivery_checklists dc where dc.delivery_id = d.id);

-- Create views for dashboard and reporting
create or replace view public.vw_dashboard as
select
  count(distinct d.id) filter (where d.status in ('pendente','em_transito','chegada','instalacao','assinatura')) as open_deliveries,
  count(distinct d.id) filter (where d.status in ('entregue','finalizado','concluido')) as completed_deliveries,
  count(distinct w.id) as active_warranties,
  round(coalesce(avg(f.rating), 0), 1) as average_feedback,
  count(distinct f.id) as total_feedbacks,
  count(distinct q.id) as total_qr_codes,
  count(distinct o.id) as total_occurrences
from public.deliveries d
left join public.warranties w on w.delivery_id = d.id and w.status = 'active'
left join public.feedbacks f on f.delivery_id = d.id
left join public.qr_codes q on q.delivery_id = d.id
left join public.occurrences o on o.delivery_id = d.id;

drop view if exists public.vw_warranties cascade;
drop view if exists public.vw_deliveries cascade;

create view public.vw_deliveries as
select
  d.id,
  d.expedition_id,
  d.order_number,
  d.nf_number,
  d.status,
  d.customer_id,
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
  coalesce(d.nf_number, e.nf_number) as nf_number,
  w.company_id
from public.warranties w
left join public.customers c on c.id = w.customer_id
left join public.deliveries d on d.id = w.delivery_id
left join public.customers dc on dc.id = d.customer_id
left join public.expeditions e on e.id = w.expedition_id;

create or replace view public.vw_customer_summary as
select
  c.id,
  c.name,
  c.company_name,
  c.email,
  c.phone,
  c.address,
  c.city,
  c.state,
  c.portal_enabled,
  count(distinct d.id) as deliveries_count,
  count(distinct f.id) as feedback_count,
  count(distinct w.id) as warranties_count,
  c.company_id
from public.customers c
left join public.deliveries d on d.customer_id = c.id
left join public.feedbacks f on f.customer_id = c.id
left join public.warranties w on w.customer_id = c.id
group by c.id, c.name, c.company_name, c.email, c.phone, c.address, c.city, c.state, c.portal_enabled, c.company_id;

create or replace view public.vw_occurrences as
select
  o.id,
  o.delivery_id,
  o.expedition_id,
  o.customer_id,
  o.occurrence_type,
  o.description,
  o.status,
  o.occurred_at,
  o.resolved_at,
  o.created_at,
  c.name as customer_name,
  d.order_number,
  d.nf_number,
  u.name as reported_by_name,
  o.company_id
from public.occurrences o
left join public.customers c on c.id = o.customer_id
left join public.deliveries d on d.id = o.delivery_id
left join public.users u on u.id = o.reported_by;

-- RLS professional policies
alter table public.users enable row level security;
drop policy if exists users_select on public.users;
drop policy if exists users_insert on public.users;
drop policy if exists users_update on public.users;
drop policy if exists users_delete on public.users;
create policy users_select on public.users for select using (
  public.is_admin() or public.is_supervisor() or public.is_current_user(id)
);
create policy users_insert on public.users for insert with check (
  public.is_admin() or public.is_supervisor()
);
create policy users_update on public.users for update using (
  public.is_admin() or public.is_supervisor() or public.is_current_user(id)
) with check (
  public.is_admin() or public.is_supervisor() or public.is_current_user(id)
);
create policy users_delete on public.users for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.companies enable row level security;
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);

alter table public.customers enable row level security;
drop policy if exists customers_select on public.customers;
drop policy if exists customers_insert on public.customers;
drop policy if exists customers_update on public.customers;
drop policy if exists customers_delete on public.customers;
create policy customers_select on public.customers for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or portal_user_id = public.current_user_id()
);
create policy customers_insert on public.customers for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy customers_update on public.customers for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy customers_delete on public.customers for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.expeditions enable row level security;
drop policy if exists expeditions_select on public.expeditions;
drop policy if exists expeditions_insert on public.expeditions;
drop policy if exists expeditions_update on public.expeditions;
drop policy if exists expeditions_delete on public.expeditions;
create policy expeditions_select on public.expeditions for select using (
  auth.uid() is not null
);
create policy expeditions_insert on public.expeditions for insert with check (
  auth.uid() is not null
);
create policy expeditions_update on public.expeditions for update using (
  auth.uid() is not null
) with check (
  auth.uid() is not null
);
create policy expeditions_delete on public.expeditions for delete using (
  auth.uid() is not null
);

alter table public.expedition_volumes enable row level security;
drop policy if exists expedition_volumes_select on public.expedition_volumes;
drop policy if exists expedition_volumes_insert on public.expedition_volumes;
drop policy if exists expedition_volumes_update on public.expedition_volumes;
drop policy if exists expedition_volumes_delete on public.expedition_volumes;
create policy expedition_volumes_select on public.expedition_volumes for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy expedition_volumes_insert on public.expedition_volumes for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy expedition_volumes_update on public.expedition_volumes for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy expedition_volumes_delete on public.expedition_volumes for delete using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);

alter table public.expedition_photos enable row level security;
drop policy if exists expedition_photos_select on public.expedition_photos;
drop policy if exists expedition_photos_insert on public.expedition_photos;
drop policy if exists expedition_photos_update on public.expedition_photos;
drop policy if exists expedition_photos_delete on public.expedition_photos;
create policy expedition_photos_select on public.expedition_photos for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy expedition_photos_insert on public.expedition_photos for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy expedition_photos_update on public.expedition_photos for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy expedition_photos_delete on public.expedition_photos for delete using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);

alter table public.deliveries enable row level security;
drop policy if exists deliveries_select on public.deliveries;
drop policy if exists deliveries_insert on public.deliveries;
drop policy if exists deliveries_update on public.deliveries;
drop policy if exists deliveries_delete on public.deliveries;
create policy deliveries_select on public.deliveries for select using (
  auth.uid() is not null
);
create policy deliveries_insert on public.deliveries for insert with check (
  auth.uid() is not null
);
create policy deliveries_update on public.deliveries for update using (
  auth.uid() is not null
) with check (
  auth.uid() is not null
);
create policy deliveries_delete on public.deliveries for delete using (
  auth.uid() is not null
);

alter table public.delivery_photos enable row level security;
drop policy if exists delivery_photos_select on public.delivery_photos;
drop policy if exists delivery_photos_insert on public.delivery_photos;
drop policy if exists delivery_photos_update on public.delivery_photos;
drop policy if exists delivery_photos_delete on public.delivery_photos;
create policy delivery_photos_select on public.delivery_photos for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy delivery_photos_insert on public.delivery_photos for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy delivery_photos_update on public.delivery_photos for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy delivery_photos_delete on public.delivery_photos for delete using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);

alter table public.digital_signatures enable row level security;
drop policy if exists digital_signatures_select on public.digital_signatures;
drop policy if exists digital_signatures_insert on public.digital_signatures;
drop policy if exists digital_signatures_update on public.digital_signatures;
drop policy if exists digital_signatures_delete on public.digital_signatures;
create policy digital_signatures_select on public.digital_signatures for select using (
  auth.uid() is not null or public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy digital_signatures_insert on public.digital_signatures for insert with check (
  auth.uid() is not null or public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy digital_signatures_update on public.digital_signatures for update using (
  auth.uid() is not null or public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
) with check (
  auth.uid() is not null or public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy digital_signatures_delete on public.digital_signatures for delete using (
  auth.uid() is not null or public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);

alter table public.warranties enable row level security;
drop policy if exists warranties_select on public.warranties;
drop policy if exists warranties_insert on public.warranties;
drop policy if exists warranties_update on public.warranties;
drop policy if exists warranties_delete on public.warranties;
create policy warranties_select on public.warranties for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista() or customer_id = public.current_customer_id()
);
create policy warranties_insert on public.warranties for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy warranties_update on public.warranties for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or public.is_motorista()
);
create policy warranties_delete on public.warranties for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.feedbacks enable row level security;
drop policy if exists feedbacks_select on public.feedbacks;
drop policy if exists feedbacks_insert on public.feedbacks;
drop policy if exists feedbacks_update on public.feedbacks;
drop policy if exists feedbacks_delete on public.feedbacks;
create policy feedbacks_select on public.feedbacks for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or customer_id = public.current_customer_id()
);
create policy feedbacks_insert on public.feedbacks for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy feedbacks_update on public.feedbacks for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy feedbacks_delete on public.feedbacks for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.occurrences enable row level security;
drop policy if exists occurrences_select on public.occurrences;
drop policy if exists occurrences_insert on public.occurrences;
drop policy if exists occurrences_update on public.occurrences;
drop policy if exists occurrences_delete on public.occurrences;
create policy occurrences_select on public.occurrences for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or customer_id = public.current_customer_id()
);
create policy occurrences_insert on public.occurrences for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy occurrences_update on public.occurrences for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy occurrences_delete on public.occurrences for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.delivery_status_history enable row level security;
drop policy if exists delivery_status_history_select on public.delivery_status_history;
create policy delivery_status_history_select on public.delivery_status_history for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
drop policy if exists delivery_status_history_insert on public.delivery_status_history;
create policy delivery_status_history_insert on public.delivery_status_history for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);

alter table public.delivery_documents enable row level security;
drop policy if exists delivery_documents_select on public.delivery_documents;
drop policy if exists delivery_documents_insert on public.delivery_documents;
drop policy if exists delivery_documents_update on public.delivery_documents;
drop policy if exists delivery_documents_delete on public.delivery_documents;
create policy delivery_documents_select on public.delivery_documents for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or exists(select 1 from public.deliveries d where d.id = public.delivery_documents.delivery_id and d.customer_id = public.current_customer_id())
);
create policy delivery_documents_insert on public.delivery_documents for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy delivery_documents_update on public.delivery_documents for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy delivery_documents_delete on public.delivery_documents for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.qr_codes enable row level security;
drop policy if exists qr_codes_select on public.qr_codes;
drop policy if exists qr_codes_insert on public.qr_codes;
drop policy if exists qr_codes_update on public.qr_codes;
drop policy if exists qr_codes_delete on public.qr_codes;
create policy qr_codes_select on public.qr_codes for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or exists(select 1 from public.deliveries d where d.id = public.qr_codes.delivery_id and d.customer_id = public.current_customer_id())
);
create policy qr_codes_insert on public.qr_codes for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy qr_codes_update on public.qr_codes for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy qr_codes_delete on public.qr_codes for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.whatsapp_messages enable row level security;
drop policy if exists whatsapp_messages_select on public.whatsapp_messages;
drop policy if exists whatsapp_messages_insert on public.whatsapp_messages;
drop policy if exists whatsapp_messages_update on public.whatsapp_messages;
drop policy if exists whatsapp_messages_delete on public.whatsapp_messages;
create policy whatsapp_messages_select on public.whatsapp_messages for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or customer_id = public.current_customer_id()
);
create policy whatsapp_messages_insert on public.whatsapp_messages for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy whatsapp_messages_update on public.whatsapp_messages for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy whatsapp_messages_delete on public.whatsapp_messages for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.email_messages enable row level security;
drop policy if exists email_messages_select on public.email_messages;
drop policy if exists email_messages_insert on public.email_messages;
drop policy if exists email_messages_update on public.email_messages;
drop policy if exists email_messages_delete on public.email_messages;
create policy email_messages_select on public.email_messages for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or customer_id = public.current_customer_id()
);
create policy email_messages_insert on public.email_messages for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy email_messages_update on public.email_messages for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy email_messages_delete on public.email_messages for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.occurrence_files enable row level security;
drop policy if exists occurrence_files_select on public.occurrence_files;
drop policy if exists occurrence_files_insert on public.occurrence_files;
drop policy if exists occurrence_files_update on public.occurrence_files;
drop policy if exists occurrence_files_delete on public.occurrence_files;
create policy occurrence_files_select on public.occurrence_files for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy occurrence_files_insert on public.occurrence_files for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy occurrence_files_update on public.occurrence_files for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy occurrence_files_delete on public.occurrence_files for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.delivery_checklists enable row level security;
drop policy if exists delivery_checklists_select on public.delivery_checklists;
drop policy if exists delivery_checklists_insert on public.delivery_checklists;
drop policy if exists delivery_checklists_update on public.delivery_checklists;
drop policy if exists delivery_checklists_delete on public.delivery_checklists;
create policy delivery_checklists_select on public.delivery_checklists for select using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao() or exists(select 1 from public.deliveries d where d.id = public.delivery_checklists.delivery_id and d.customer_id = public.current_customer_id())
);
create policy delivery_checklists_insert on public.delivery_checklists for insert with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy delivery_checklists_update on public.delivery_checklists for update using (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
) with check (
  public.is_admin() or public.is_supervisor() or public.is_expedicao()
);
create policy delivery_checklists_delete on public.delivery_checklists for delete using (
  public.is_admin() or public.is_supervisor()
);

alter table public.audit_logs enable row level security;
drop policy if exists audit_logs_select on public.audit_logs;
drop policy if exists audit_logs_insert on public.audit_logs;
drop policy if exists audit_logs_update on public.audit_logs;
drop policy if exists audit_logs_delete on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select using (
  public.is_admin() or public.is_supervisor()
);
create policy audit_logs_insert on public.audit_logs for insert with check (
  public.is_admin() or public.is_supervisor()
);
create policy audit_logs_update on public.audit_logs for update using (
  public.is_admin() or public.is_supervisor()
) with check (
  public.is_admin() or public.is_supervisor()
);
create policy audit_logs_delete on public.audit_logs for delete using (
  public.is_admin() or public.is_supervisor()
);

-- Grant permissions to views for all authenticated users
grant select on public.vw_dashboard to anon, authenticated;
grant select on public.vw_deliveries to anon, authenticated;
grant select on public.vw_warranties to anon, authenticated;
grant select on public.vw_customer_summary to anon, authenticated;
grant select on public.vw_occurrences to anon, authenticated;

-- Storage buckets
DO $$
begin
  perform storage.create_bucket('expedition-photos', true);
exception when undefined_function then
  raise notice 'storage.create_bucket is not available in this environment';
when others then
  if sqlstate <> '42710' then
    raise;
  end if;
end;
$$;

DO $$
begin
  perform storage.create_bucket('delivery-photos', true);
exception when undefined_function then
  raise notice 'storage.create_bucket is not available in this environment';
when others then
  if sqlstate <> '42710' then
    raise;
  end if;
end;
$$;

DO $$
begin
  perform storage.create_bucket('occurrence-files', true);
exception when undefined_function then
  raise notice 'storage.create_bucket is not available in this environment';
when others then
  if sqlstate <> '42710' then
    raise;
  end if;
end;
$$;

DO $$
begin
  perform storage.create_bucket('documents', true);
exception when undefined_function then
  raise notice 'storage.create_bucket is not available in this environment';
when others then
  if sqlstate <> '42710' then
    raise;
  end if;
end;
$$;

DO $$
begin
  perform storage.create_bucket('signatures', true);
exception when undefined_function then
  raise notice 'storage.create_bucket is not available in this environment';
when others then
  if sqlstate <> '42710' then
    raise;
  end if;
end;
$$;

-- Storage object policies for supported buckets
DO $$
begin
  execute 'alter table if exists storage.objects enable row level security';
  execute 'drop policy if exists storage_objects_select on storage.objects';
  execute 'drop policy if exists storage_objects_insert on storage.objects';
  execute 'drop policy if exists storage_objects_delete on storage.objects';

  execute $q$
    create policy storage_objects_select on storage.objects for select using (
      bucket_id in ('expedition-photos', 'delivery-photos', 'occurrence-files', 'documents', 'signatures')
        and auth.uid() is not null
    )
  $q$;
  execute $q$
    create policy storage_objects_insert on storage.objects for insert with check (
      bucket_id in ('expedition-photos', 'delivery-photos', 'occurrence-files', 'documents', 'signatures')
        and auth.uid() is not null
    )
  $q$;
  execute $q$
    create policy storage_objects_delete on storage.objects for delete using (
      bucket_id in ('expedition-photos', 'delivery-photos', 'occurrence-files', 'documents', 'signatures')
        and auth.uid() is not null
    )
  $q$;
exception when insufficient_privilege then
  raise notice 'Skipping storage.objects RLS policy configuration because current role is not owner of storage.objects';
when undefined_function then
  raise notice 'storage.objects or related storage functions are not available in this environment';
when others then
  raise;
end;
$$;

-- Create additional indexes for performance
create index if not exists idx_customers_name on public.customers (name);
create index if not exists idx_expeditions_client_name on public.expeditions (client_name);
create index if not exists idx_deliveries_customer_id_status on public.deliveries (customer_id, status);
create index if not exists idx_warranties_start_date on public.warranties (start_date);
create index if not exists idx_qr_codes_active on public.qr_codes (active);

-- Audit triggers for new tables
drop trigger if exists audit_delivery_documents on public.delivery_documents;
create trigger audit_delivery_documents
  after insert or update or delete on public.delivery_documents
  for each row execute function public.log_table_changes();
drop trigger if exists audit_qr_codes on public.qr_codes;
create trigger audit_qr_codes
  after insert or update or delete on public.qr_codes
  for each row execute function public.log_table_changes();
drop trigger if exists audit_whatsapp_messages on public.whatsapp_messages;
create trigger audit_whatsapp_messages
  after insert or update or delete on public.whatsapp_messages
  for each row execute function public.log_table_changes();
drop trigger if exists audit_occurrence_files on public.occurrence_files;
create trigger audit_occurrence_files
  after insert or update or delete on public.occurrence_files
  for each row execute function public.log_table_changes();
drop trigger if exists audit_delivery_checklists on public.delivery_checklists;
create trigger audit_delivery_checklists
  after insert or update or delete on public.delivery_checklists
  for each row execute function public.log_table_changes();

-- Add signature_data column to deliveries if not exists
alter table public.deliveries add column if not exists signature_data text;
grant select, insert, update, delete on public.digital_signatures to anon;
grant select, insert, update, delete on public.digital_signatures to authenticated;

-- Notes:
-- 1) Este arquivo é idempotente e utiliza checks existentes para preservar dados atuais.
-- 2) As novas colunas e tabelas mantêm compatibilidade com a estrutura existente.
-- 3) RLS profissional foi aplicado para suportar ADMIN, SUPERVISOR, EXPEDICAO, MOTORISTA e CLIENTE.
