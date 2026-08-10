-- HLC Workstream #2: deterministic job assignment and appointment scheduling.

-- Contractor records participating in CRM operations must have an owning workspace.
alter table public.contractors
  alter column workspace_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contractors_workspace_id_fkey'
      and conrelid = 'public.contractors'::regclass
  ) then
    alter table public.contractors
      add constraint contractors_workspace_id_fkey
      foreign key (workspace_id) references public.workspaces(id);
  end if;
end $$;

create index if not exists contractors_workspace_id_idx
  on public.contractors (workspace_id);

create index if not exists contractors_workspace_specialty_idx
  on public.contractors (workspace_id, specialty);

-- Preserve every offer and reassignment as history. Only offered and accepted
-- assignments are exclusive active assignments.
create table if not exists public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  job_id uuid not null references public.crm_jobs(id),
  contractor_id bigint not null references public.contractors(id),
  status text not null default 'offered'
    check (status in ('offered', 'accepted', 'rejected', 'cancelled')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_assignments_workspace_id_idx
  on public.job_assignments (workspace_id);

create index if not exists job_assignments_job_id_idx
  on public.job_assignments (job_id, created_at desc);

create index if not exists job_assignments_contractor_id_idx
  on public.job_assignments (contractor_id);

create unique index if not exists job_assignments_one_active_per_job_idx
  on public.job_assignments (job_id)
  where status in ('offered', 'accepted');

drop trigger if exists job_assignments_set_updated_at on public.job_assignments;
create trigger job_assignments_set_updated_at
before update on public.job_assignments
for each row execute function public.hlc_set_updated_at();

create or replace function public.hlc_validate_job_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_job_workspace uuid;
  v_contractor_workspace uuid;
begin
  select j.workspace_id into v_job_workspace
  from public.crm_jobs j
  where j.id = new.job_id;

  if not found then
    raise exception 'CRM job is not available';
  end if;

  select c.workspace_id into v_contractor_workspace
  from public.contractors c
  where c.id = new.contractor_id;

  if not found then
    raise exception 'Contractor is not available';
  end if;

  if new.workspace_id is distinct from v_job_workspace
     or new.workspace_id is distinct from v_contractor_workspace then
    raise exception 'Assignment job and contractor must belong to the same workspace';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'offered' then
      raise exception 'New assignments must begin as offered';
    end if;
  else
    if new.workspace_id is distinct from old.workspace_id
       or new.job_id is distinct from old.job_id
       or new.contractor_id is distinct from old.contractor_id
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Assignment identity and history fields are immutable';
    end if;

    if new.status is distinct from old.status and not (
      (old.status = 'offered' and new.status in ('accepted', 'rejected', 'cancelled'))
      or (old.status = 'accepted' and new.status = 'cancelled')
    ) then
      raise exception 'Invalid assignment status transition from % to %', old.status, new.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists job_assignments_validate on public.job_assignments;
create trigger job_assignments_validate
before insert or update on public.job_assignments
for each row execute function public.hlc_validate_job_assignment();

alter table public.job_assignments enable row level security;

drop policy if exists job_assignments_select_workspace_members on public.job_assignments;
drop policy if exists job_assignments_insert_workspace_members on public.job_assignments;
drop policy if exists job_assignments_update_workspace_members on public.job_assignments;

create policy job_assignments_select_workspace_members
on public.job_assignments for select to authenticated
using (
  workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

create policy job_assignments_insert_workspace_members
on public.job_assignments for insert to authenticated
with check (
  created_by = (select auth.uid())
  and workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

create policy job_assignments_update_workspace_members
on public.job_assignments for update to authenticated
using (
  workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
)
with check (
  workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

grant select, insert, update on public.job_assignments to authenticated;
grant select, insert, update, delete on public.job_assignments to service_role;

-- Repair the existing appointments domain and make each occurrence job-linked.
alter table public.appointments
  add column if not exists workspace_id uuid,
  add column if not exists job_id uuid;

update public.appointments
set workspace_id = organization_id
where workspace_id is null;

alter table public.appointments
  alter column workspace_id set not null,
  alter column job_id set not null,
  alter column contractor_id set not null,
  alter column appointment_date set not null,
  alter column status set default 'scheduled',
  alter column status set not null,
  alter column created_by set default auth.uid(),
  alter column created_by set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_workspace_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_workspace_id_fkey foreign key (workspace_id) references public.workspaces(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'appointments_job_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_job_id_fkey foreign key (job_id) references public.crm_jobs(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'appointments_contractor_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_contractor_id_fkey foreign key (contractor_id) references public.contractors(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'appointments_lead_id_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_lead_id_fkey foreign key (lead_id) references public.leads(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'appointments_created_by_fkey' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_created_by_fkey foreign key (created_by) references auth.users(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'appointments_status_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_status_check check (status in ('scheduled', 'completed', 'cancelled', 'no_show'));
  end if;
end $$;

create index if not exists appointments_workspace_id_idx
  on public.appointments (workspace_id);

create index if not exists appointments_job_id_idx
  on public.appointments (job_id, appointment_date);

create index if not exists appointments_contractor_id_idx
  on public.appointments (contractor_id, appointment_date);

create index if not exists appointments_lead_id_idx
  on public.appointments (lead_id)
  where lead_id is not null;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.hlc_set_updated_at();

create or replace function public.hlc_validate_job_appointment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_job_workspace uuid;
  v_job_lead bigint;
  v_contractor_workspace uuid;
begin
  select j.workspace_id, j.lead_id
    into v_job_workspace, v_job_lead
  from public.crm_jobs j
  where j.id = new.job_id;

  if not found then
    raise exception 'CRM job is not available';
  end if;

  select c.workspace_id into v_contractor_workspace
  from public.contractors c
  where c.id = new.contractor_id;

  if not found then
    raise exception 'Contractor is not available';
  end if;

  if new.workspace_id is distinct from v_job_workspace
     or new.workspace_id is distinct from v_contractor_workspace then
    raise exception 'Appointment job and contractor must belong to the same workspace';
  end if;

  if new.lead_id is not null and new.lead_id is distinct from v_job_lead then
    raise exception 'Appointment lead must match the CRM job lead';
  end if;

  if tg_op = 'INSERT' and not exists (
      select 1 from public.job_assignments ja
      where ja.job_id = new.job_id
        and ja.contractor_id = new.contractor_id
        and ja.workspace_id = new.workspace_id
        and ja.status = 'accepted'
    ) then
      raise exception 'A job appointment requires an accepted contractor assignment';
  end if;

  if tg_op = 'UPDATE' and (
    new.workspace_id is distinct from old.workspace_id
    or new.job_id is distinct from old.job_id
    or new.contractor_id is distinct from old.contractor_id
    or new.lead_id is distinct from old.lead_id
    or new.appointment_date is distinct from old.appointment_date
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Appointment identity and schedule are immutable; cancel and create a replacement';
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status and not (
    old.status = 'scheduled'
    and new.status in ('completed', 'cancelled', 'no_show')
  ) then
    raise exception 'Invalid appointment status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_validate_job_schedule on public.appointments;
create trigger appointments_validate_job_schedule
before insert or update on public.appointments
for each row execute function public.hlc_validate_job_appointment();

drop policy if exists appointments_select_workspace_members on public.appointments;
drop policy if exists appointments_insert_workspace_members on public.appointments;
drop policy if exists appointments_update_workspace_members on public.appointments;

create policy appointments_select_workspace_members
on public.appointments for select to authenticated
using (
  workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

create policy appointments_insert_workspace_members
on public.appointments for insert to authenticated
with check (
  created_by = (select auth.uid())
  and workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

create policy appointments_update_workspace_members
on public.appointments for update to authenticated
using (
  workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
)
with check (
  workspace_id in (
    select wm.workspace_id from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

revoke all on public.appointments from anon;
revoke delete on public.appointments from authenticated;
grant select, insert, update on public.appointments to authenticated;
grant select, insert, update, delete on public.appointments to service_role;
grant usage, select on sequence public.appointments_id_seq to authenticated, service_role;
