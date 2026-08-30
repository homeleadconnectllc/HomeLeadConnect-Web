-- Harden partner-management SECURITY DEFINER RPCs against stale profile workspace/role state.
-- These functions already require a management role; this migration additionally requires
-- an active workspace_members row for the authenticated user before any read or mutation.

create or replace function public.list_partner_management_queue()
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.workspace_id, lower(coalesce(p.role,''))
    into v_workspace, v_role
  from public.profiles p
  where p.user_id = auth.uid();

  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_workspace
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  select jsonb_build_object(
    'sources', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id',s.id,
          'display_name',s.display_name,
          'organization_name',s.organization_name,
          'contact_email',s.contact_email,
          'status',s.status,
          'created_at',s.created_at
        ) order by s.created_at desc
      )
      from public.partner_sources s
      where s.workspace_id = v_workspace
    ), '[]'::jsonb),
    'referrals', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id',r.id,
          'partner_source_id',r.partner_source_id,
          'partner_name',s.display_name,
          'target_kind',r.target_kind,
          'referred_name',r.referred_name,
          'referred_email',r.referred_email,
          'referred_phone',r.referred_phone,
          'note',r.note,
          'status',r.status,
          'created_at',r.created_at,
          'updated_at',r.updated_at
        ) order by r.created_at desc
      )
      from public.partner_referrals r
      join public.partner_sources s
        on s.id = r.partner_source_id
       and s.workspace_id = r.workspace_id
      where r.workspace_id = v_workspace
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$function$;

create or replace function public.set_partner_referral_status(
  p_referral_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  if p_status not in ('recorded','reviewing','qualified','converted','closed','declined') then
    raise exception 'Unsupported referral status.' using errcode='22023';
  end if;

  select p.workspace_id, lower(coalesce(p.role,''))
    into v_workspace, v_role
  from public.profiles p
  where p.user_id = auth.uid();

  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_workspace
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  update public.partner_referrals
  set status = p_status,
      updated_at = now()
  where id = p_referral_id
    and workspace_id = v_workspace;

  if not found then
    raise exception 'Referral is not in the current workspace.' using errcode='42501';
  end if;
end;
$function$;
