-- Management-only partner linkage by registered account email and referral status queue.

create or replace function public.create_partner_source_by_email(
  p_display_name text,
  p_organization_name text,
  p_account_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_role text;
  v_user_id uuid;
  v_id uuid;
begin
  select p.workspace_id,lower(coalesce(p.role,'')) into v_workspace,v_role
  from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  select u.id into v_user_id from auth.users u where lower(u.email)=lower(btrim(p_account_email)) limit 1;
  if v_user_id is null then raise exception 'No registered account matches that email.' using errcode='P0002'; end if;
  if length(btrim(coalesce(p_display_name,'')))<2 then raise exception 'Partner display name is required.' using errcode='22023'; end if;
  insert into public.partner_sources(workspace_id,display_name,organization_name,contact_email,linked_user_id,status,created_by)
  values(v_workspace,btrim(p_display_name),nullif(btrim(coalesce(p_organization_name,'')),''),lower(btrim(p_account_email)),v_user_id,'active',auth.uid())
  on conflict(workspace_id,linked_user_id) do update set display_name=excluded.display_name,organization_name=excluded.organization_name,contact_email=excluded.contact_email,status='active',updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_partner_source_by_email(text,text,text) from public, anon;
grant execute on function public.create_partner_source_by_email(text,text,text) to authenticated, service_role;

create or replace function public.list_partner_management_queue()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_role text;
  v_result jsonb;
begin
  select p.workspace_id,lower(coalesce(p.role,'')) into v_workspace,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  select jsonb_build_object(
    'sources',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'display_name',s.display_name,'organization_name',s.organization_name,'contact_email',s.contact_email,'status',s.status,'created_at',s.created_at) order by s.created_at desc) from public.partner_sources s where s.workspace_id=v_workspace),'[]'::jsonb),
    'referrals',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'partner_source_id',r.partner_source_id,'partner_name',s.display_name,'target_kind',r.target_kind,'referred_name',r.referred_name,'referred_email',r.referred_email,'referred_phone',r.referred_phone,'note',r.note,'status',r.status,'created_at',r.created_at,'updated_at',r.updated_at) order by r.created_at desc) from public.partner_referrals r join public.partner_sources s on s.id=r.partner_source_id and s.workspace_id=r.workspace_id where r.workspace_id=v_workspace),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.list_partner_management_queue() from public, anon;
grant execute on function public.list_partner_management_queue() to authenticated, service_role;
