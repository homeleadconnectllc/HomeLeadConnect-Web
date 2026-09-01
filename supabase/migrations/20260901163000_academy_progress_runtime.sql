-- E2 Academy + Arcade staged runtime foundation.
-- Source-control only until exercised in an isolated Supabase environment.
-- Browser clients may read their own learning records, but all writes are RPC-only.

create table if not exists public.academy_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp_total integer not null default 0 check (xp_total >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (length(trim(module_id)) > 0),
  activity_type text not null check (activity_type in ('lesson','practice','simulation','assessment')),
  attempt_number integer not null check (attempt_number >= 1),
  completed boolean not null default false,
  score numeric,
  threshold numeric,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, module_id, activity_type, attempt_number)
);

create table if not exists public.academy_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (length(trim(module_id)) > 0),
  assessment_id text not null check (length(trim(assessment_id)) > 0),
  score numeric not null,
  threshold numeric not null check (threshold > 0),
  teacher text not null check (teacher in ('kendrell','dion','diamond')),
  assessed_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, module_id, assessment_id),
  check (score >= threshold)
);

alter table public.academy_progress enable row level security;
alter table public.academy_attempts enable row level security;
alter table public.academy_certifications enable row level security;

revoke all on public.academy_progress from anon, authenticated;
revoke all on public.academy_attempts from anon, authenticated;
revoke all on public.academy_certifications from anon, authenticated;

grant select on public.academy_progress to authenticated;
grant select on public.academy_attempts to authenticated;
grant select on public.academy_certifications to authenticated;

drop policy if exists academy_progress_read_own on public.academy_progress;
create policy academy_progress_read_own on public.academy_progress
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists academy_attempts_read_own on public.academy_attempts;
create policy academy_attempts_read_own on public.academy_attempts
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists academy_certifications_read_own on public.academy_certifications;
create policy academy_certifications_read_own on public.academy_certifications
for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.academy_record_activity(
  p_module_id text,
  p_activity_type text,
  p_completed boolean default true,
  p_score numeric default null,
  p_threshold numeric default null,
  p_assessment_id text default null,
  p_teacher text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt integer;
  v_base_xp integer;
  v_xp integer := 0;
  v_certified boolean := false;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if length(trim(coalesce(p_module_id, ''))) = 0 then
    raise exception 'module_id required';
  end if;
  if p_activity_type not in ('lesson','practice','simulation') then
    raise exception 'unsupported academy activity';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_module_id || ':' || p_activity_type, 0));

  select coalesce(max(attempt_number), 0) + 1
    into v_attempt
    from public.academy_attempts
   where user_id = v_user_id
     and module_id = p_module_id
     and activity_type = p_activity_type;

  v_base_xp := case p_activity_type
    when 'lesson' then 10
    when 'practice' then 20
    when 'simulation' then 30
    else 0
  end;

  if p_completed then
    v_xp := case
      when v_attempt = 1 then v_base_xp
      when v_attempt = 2 then floor(v_base_xp * 0.25)::integer
      else 0
    end;
  end if;

  insert into public.academy_attempts (
    user_id, module_id, activity_type, attempt_number, completed, score, threshold, xp_awarded
  ) values (
    v_user_id, p_module_id, p_activity_type, v_attempt, p_completed, p_score, p_threshold, v_xp
  );

  insert into public.academy_progress (user_id, xp_total, updated_at)
  values (v_user_id, v_xp, now())
  on conflict (user_id) do update
    set xp_total = public.academy_progress.xp_total + excluded.xp_total,
        updated_at = now();

  if v_certified then
    insert into public.academy_certifications (
      user_id, module_id, assessment_id, score, threshold, teacher, assessed_at
    ) values (
      v_user_id, p_module_id, trim(p_assessment_id), p_score, p_threshold, p_teacher, now()
    )
    on conflict (user_id, module_id, assessment_id) do update
      set score = excluded.score,
          threshold = excluded.threshold,
          teacher = excluded.teacher,
          assessed_at = excluded.assessed_at;
  end if;

  return jsonb_build_object(
    'module_id', p_module_id,
    'activity_type', p_activity_type,
    'attempt_number', v_attempt,
    'xp_awarded', v_xp,
    'certified', v_certified
  );
end;
$$;

revoke all on function public.academy_record_activity(text,text,boolean,numeric,numeric,text,text) from public, anon;
grant execute on function public.academy_record_activity(text,text,boolean,numeric,numeric,text,text) to authenticated;

comment on function public.academy_record_activity(text,text,boolean,numeric,numeric,text,text) is
  'Authenticated E2 learning activity recorder. Assessment and application outcomes require a trusted server-side source.';

create or replace function public.academy_record_assessment(
  p_user_id uuid,
  p_module_id text,
  p_assessment_id text,
  p_score numeric,
  p_threshold numeric,
  p_teacher text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt integer;
  v_xp integer;
  v_certified boolean := p_score >= p_threshold;
begin
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'valid Academy user required';
  end if;
  if length(trim(coalesce(p_module_id, ''))) = 0 then
    raise exception 'module_id required';
  end if;
  if length(trim(coalesce(p_assessment_id, ''))) = 0 then
    raise exception 'assessment_id required';
  end if;
  if p_score is null or p_threshold is null or p_threshold <= 0 then
    raise exception 'assessment score and positive threshold required';
  end if;
  if p_teacher not in ('kendrell','dion','diamond') then
    raise exception 'valid HLC teacher required for certification';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_module_id || ':assessment', 0));

  select coalesce(max(attempt_number), 0) + 1
    into v_attempt
    from public.academy_attempts
   where user_id = p_user_id
     and module_id = p_module_id
     and activity_type = 'assessment';

  v_xp := case
    when v_attempt = 1 then 40
    when v_attempt = 2 then 10
    else 0
  end;

  insert into public.academy_attempts (
    user_id, module_id, activity_type, attempt_number, completed, score, threshold, xp_awarded
  ) values (
    p_user_id, p_module_id, 'assessment', v_attempt, true, p_score, p_threshold, v_xp
  );

  insert into public.academy_progress (user_id, xp_total, updated_at)
  values (p_user_id, v_xp, now())
  on conflict (user_id) do update
    set xp_total = public.academy_progress.xp_total + excluded.xp_total,
        updated_at = now();

  if v_certified then
    insert into public.academy_certifications (
      user_id, module_id, assessment_id, score, threshold, teacher, assessed_at
    ) values (
      p_user_id, p_module_id, trim(p_assessment_id), p_score, p_threshold, p_teacher, now()
    )
    on conflict (user_id, module_id, assessment_id) do update
      set score = excluded.score,
          threshold = excluded.threshold,
          teacher = excluded.teacher,
          assessed_at = excluded.assessed_at;
  end if;

  return jsonb_build_object(
    'module_id', p_module_id,
    'activity_type', 'assessment',
    'attempt_number', v_attempt,
    'xp_awarded', v_xp,
    'certified', v_certified
  );
end;
$$;

revoke all on function public.academy_record_assessment(uuid,text,text,numeric,numeric,text) from public, anon, authenticated;
grant execute on function public.academy_record_assessment(uuid,text,text,numeric,numeric,text) to service_role;

comment on function public.academy_record_assessment(uuid,text,text,numeric,numeric,text) is
  'Trusted server-only E2 assessment recorder. Browser roles cannot submit scores, thresholds, teachers, or certifications.';
