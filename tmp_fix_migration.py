from pathlib import Path
path = Path('migration.sql')
text = path.read_text(encoding='utf-8')
old = '''create or replace function public.warranty_auto_create() returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('entregue', 'finalizado', 'concluido') then
    if not exists (select 1 from public.warranties w where w.delivery_id = new.id) then
      insert into public.warranties (
        id,
        company_id,
        delivery_id,
        expedition_id,
        customer_id,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid(),
        new.company_id,
        new.id,
        new.expedition_id,
        new.customer_id,
        current_date,
        current_date + interval '90 days',
        'active',
        now(),
        now()
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_warranty_auto on public.deliveries;
create trigger trg_warranty_auto
  after update on public.deliveries
  for each row when (old.status is distinct from new.status)
  execute function public.warranty_auto_create();
'''
new = '''-- Warranty auto-create trigger removed.
-- Warranty creation is now handled by application logic in DeliveryDetail.tsx.
-- The previous trigger caused conflicts when updating delivery records from the client.
'''
if old not in text:
    raise SystemExit('Old block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('updated')
