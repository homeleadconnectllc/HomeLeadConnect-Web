-- E3 CONNECT Roleplay staged runtime foundation.
-- Source-control only until exercised in an authorized isolated Supabase environment.
-- Browser clients may read only their own sessions. Trusted scoring/coaching writes are server-only.

create table if not exists public.academy_roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null check (length(trim(scenario_id)) > 0),
  variant text not null check (variant in ('master','quick','standard','warm','professional','high-touch')),
  teacher text not null check (teacher in ('kendrell','dion','diamond')),
  transcript jsonb not null default '[]'::jsonb check (jsonb_typeof(transcript) = 'array'),
  score integer not null check (score between 0 and 100),
  rubric_scores jsonb not null default '{}'::jsonb check (jsonb_typeof(rubric_scores) = 'object'),
  strengths text[] not null default '{}',
  mistakes text[] not null default '{}',
  coaching text[] not null default '{}',
  recommended_disposition_id text,
  recommendation_reason text,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists academy_roleplay_sessions_user_created_idx
  on public.academy_roleplay_sessions (user_id, created_at desc);
create index if not exists academy_roleplay_sessions_user_scenario_idx
  on public.academy_roleplay_sessions (user_id, scenario_id, created_at desc);

alter table public.academy_roleplay_sessions enable row level security;
revoke all on public.academy_roleplay_sessions from anon, authenticated;
grant select on public.academy_roleplay_sessions to authenticated;

drop policy if exists academy_roleplay_sessions_read_own on public.academy_roleplay_sessions;
create policy academy_roleplay_sessions_read_own on public.academy_roleplay_sessions
for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.academy_record_roleplay_session(
  p_user_id uuid,
  p_scenario_id text,
  p_variant text,
  p_teacher text,
  p_transcript jsonb,
  p_score integer,
  p_rubric_scores jsonb,
  p_strengths text[],
  p_mistakes text[],
  p_coaching text[],
  p_recommended_disposition_id text default null,
  p_recommendation_reason text default null,
  p_passed boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session_id uuid;
begin
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'valid Academy user required';
  end if;
  if length(trim(coalesce(p_scenario_id, ''))) = 0 then
    raise exception 'scenario_id required';
  end if;
  if p_variant not in ('master','quick','standard','warm','professional','high-touch') then
    raise exception 'valid CONNECT variant required';
  end if;
  if p_teacher not in ('kendrell','dion','diamond') then
    raise exception 'valid HLC teacher required';
  end if;
  if p_score < 0 or p_score > 100 then
    raise exception 'score must be between 0 and 100';
  end if;
  if jsonb_typeof(coalesce(p_transcript, '[]'::jsonb)) <> 'array' then
    raise exception 'transcript must be an array';
  end if;
  if jsonb_typeof(coalesce(p_rubric_scores, '{}'::jsonb)) <> 'object' then
    raise exception 'rubric_scores must be an object';
  end if;

  insert into public.academy_roleplay_sessions (
    user_id, scenario_id, variant, teacher, transcript, score, rubric_scores,
    strengths, mistakes, coaching, recommended_disposition_id,
    recommendation_reason, passed
  ) values (
    p_user_id, trim(p_scenario_id), p_variant, p_teacher,
    coalesce(p_transcript, '[]'::jsonb), p_score, coalesce(p_rubric_scores, '{}'::jsonb),
    coalesce(p_strengths, '{}'), coalesce(p_mistakes, '{}'), coalesce(p_coaching, '{}'),
    nullif(trim(coalesce(p_recommended_disposition_id, '')), ''),
    nullif(trim(coalesce(p_recommendation_reason, '')), ''), p_passed
  ) returning id into v_session_id;

  return v_session_id;
end;
$$;

revoke all on function public.academy_record_roleplay_session(uuid,text,text,text,jsonb,integer,jsonb,text[],text[],text[],text,text,boolean)
  from public, anon, authenticated;
grant execute on function public.academy_record_roleplay_session(uuid,text,text,text,jsonb,integer,jsonb,text[],text[],text[],text,text,boolean)
  to service_role;

comment on function public.academy_record_roleplay_session(uuid,text,text,text,jsonb,integer,jsonb,text[],text[],text[],text,text,boolean) is
  'Trusted server-only E3 CONNECT roleplay recorder. Browser roles cannot submit scores, coaching, transcripts, or CRM disposition recommendations.';
