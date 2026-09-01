-- E4 Resources + Sourcing staged runtime. Source-control only until isolated verification.
create table if not exists public.resource_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id text not null check (length(trim(resource_id)) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

create table if not exists public.material_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  category text not null check (category in ('paint','plumbing','electrical','lumber','landscape','maintenance')),
  quantity numeric check (quantity is null or quantity >= 0),
  state text not null check (state in ('needed','considering','purchased','on_site','used','returned')),
  supplier_id text,
  job_id uuid references public.crm_jobs(id) on delete set null,
  notes text check (notes is null or length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists material_plan_items_user_updated_idx on public.material_plan_items(user_id, updated_at desc);
create index if not exists material_plan_items_job_id_idx on public.material_plan_items(job_id);

alter table public.resource_saves enable row level security;
alter table public.material_plan_items enable row level security;
revoke all on public.resource_saves, public.material_plan_items from anon, authenticated;
grant select on public.resource_saves, public.material_plan_items to authenticated;

drop policy if exists resource_saves_read_own on public.resource_saves;
create policy resource_saves_read_own on public.resource_saves for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists material_plan_items_read_own on public.material_plan_items;
create policy material_plan_items_read_own on public.material_plan_items for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.resource_set_saved(p_resource_id text, p_saved boolean)
returns void language plpgsql security definer set search_path to '' as $$
declare v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if length(trim(coalesce(p_resource_id,''))) not between 1 and 100 then raise exception 'valid resource required'; end if;
  if p_saved then
    insert into public.resource_saves(user_id,resource_id) values(v_user_id,trim(p_resource_id)) on conflict do nothing;
  else
    delete from public.resource_saves where user_id=v_user_id and resource_id=trim(p_resource_id);
  end if;
end; $$;

create or replace function public.resource_save_material_item(p_id uuid,p_name text,p_category text,p_quantity numeric,p_state text,p_supplier_id text default null,p_job_id uuid default null,p_notes text default null)
returns uuid language plpgsql security definer set search_path to '' as $$
declare v_user_id uuid := (select auth.uid()); v_id uuid := coalesce(p_id,gen_random_uuid());
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if length(trim(coalesce(p_name,''))) not between 1 and 120 then raise exception 'valid material name required'; end if;
  if p_category not in ('paint','plumbing','electrical','lumber','landscape','maintenance') then raise exception 'valid category required'; end if;
  if p_state not in ('needed','considering','purchased','on_site','used','returned') then raise exception 'valid material state required'; end if;
  if p_quantity is not null and p_quantity < 0 then raise exception 'quantity cannot be negative'; end if;
  if p_job_id is not null and not exists (
    select 1 from public.crm_jobs j join public.workspace_members wm on wm.workspace_id=j.workspace_id
    where j.id=p_job_id and wm.user_id=v_user_id and wm.role in ('owner','manager','technician')
  ) then raise exception 'authorized job required'; end if;
  insert into public.material_plan_items(id,user_id,name,category,quantity,state,supplier_id,job_id,notes)
  values(v_id,v_user_id,trim(p_name),p_category,p_quantity,p_state,nullif(trim(coalesce(p_supplier_id,'')),''),p_job_id,nullif(trim(coalesce(p_notes,'')),''))
  on conflict(id) do update set name=excluded.name,category=excluded.category,quantity=excluded.quantity,state=excluded.state,supplier_id=excluded.supplier_id,job_id=excluded.job_id,notes=excluded.notes,updated_at=now()
  where public.material_plan_items.user_id=v_user_id;
  if not exists(select 1 from public.material_plan_items where id=v_id and user_id=v_user_id) then raise exception 'material item not authorized'; end if;
  return v_id;
end; $$;

revoke all on function public.resource_set_saved(text,boolean) from public,anon,authenticated;
revoke all on function public.resource_save_material_item(uuid,text,text,numeric,text,text,uuid,text) from public,anon,authenticated;
grant execute on function public.resource_set_saved(text,boolean) to authenticated;
grant execute on function public.resource_save_material_item(uuid,text,text,numeric,text,text,uuid,text) to authenticated;
