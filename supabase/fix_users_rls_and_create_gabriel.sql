-- Fix RLS helper functions for the users table and create the admin user Gabriel.
-- Run this in the Supabase SQL editor against your project.

create or replace function public.current_user_id() returns uuid
language sql stable security definer set row_security = off as $$
select u.id
from public.users u
where u.auth_id = auth.uid()
limit 1;
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

insert into public.users (name, email, role, status)
values ('gabriel', 'teste@fenix.com', 'admin', 'Ativo')
on conflict (email) do update
set
  name = excluded.name,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();
