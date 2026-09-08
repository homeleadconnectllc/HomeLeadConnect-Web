-- Root repair: approved professional applications must resolve to the existing
-- canonical public.contractors identity before contractor portal access is issued.
--
-- Safety rules:
--   * never create a second provider identity table;
--   * never resolve across workspaces;
--   * reuse one exact normalized-email match;
--   * fail closed on duplicate email matches or likely company/phone collisions;
--   * serialize resolution per workspace/email to prevent concurrent duplicates;
--   * issue contractor portal access for the resolved contractor_id only.

alter table public.professional_applications
  add column if not exists contractor_id bigint references public.contractors(id) on delete restrict,
  add column if not exists portal_invitation_id uuid references public.portal_invitations(id) on delete set null;

create index if not exists professional_applications_contractor_idx
  on public.professional_applications(workspace_id, contractor_id)
  where contractor_id is not null;

create or replace function public.approve_professional_application(
  p_application_id uuid
)
returns table(
  application_id uuid,
  contractor_id bigint,
  contractor_reused boolean,
  invitation_id uuid,
  invitation_token text,
  portal_link_exists boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_app public.professional_applications%rowtype;
  v_email text;
  v_phone text;
  v_org text;
  v_match_count integer;
  v_collision_count integer;
  v_contractor_id bigint;
  v_reused boolean := false;
  v_invitation_id uuid;
  v_token text;
  v_link_exists boolean := false;
begin
  if v_actor is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into v_app
  from public.professional_applications pa
  where pa.id = p_application_id
  for update;

  if not found then
    raise exception 'Professional application not found.' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.workspace_id = v_app.workspace_id
      and p.user_id = v_actor
      and lower(p.role) in ('owner','manager')
  ) then
    raise exception 'Owner or manager approval is required.' using errcode = '42501';
  end if;

  if v_app.status = 'declined' then
    raise exception 'A declined application cannot be approved without review.' using errcode = '22023';
  end if;

  v_email := lower(btrim(v_app.email));
  v_phone := regexp_replace(coalesce(v_app.phone, ''), '[^0-9]', '', 'g');
  v_org := lower(regexp_replace(btrim(v_app.organization_name), '\s+', ' ', 'g'));

  -- Serialize every resolver for the same workspace/email pair. This prevents
  -- two simultaneous approvals from both observing zero matches and inserting.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(v_app.workspace_id::text || '|' || v_email)
  );

  -- If this application was already bridged, preserve that exact canonical ID.
  if v_app.contractor_id is not null then
    select c.id into v_contractor_id
    from public.contractors c
    where c.id = v_app.contractor_id
      and c.workspace_id = v_app.workspace_id;

    if not found then
      raise exception 'Linked contractor is missing or belongs to another workspace.' using errcode = '23503';
    end if;
    v_reused := true;
  else
    select count(*), min(c.id)
      into v_match_count, v_contractor_id
    from public.contractors c
    where c.workspace_id = v_app.workspace_id
      and nullif(lower(btrim(c.email)), '') = v_email;

    if v_match_count > 1 then
      raise exception 'Multiple contractors already use this email in the workspace; resolve the duplicate records before approval.'
        using errcode = '23505';
    elsif v_match_count = 1 then
      v_reused := true;
    else
      -- Email is the only automatic reuse key. Company-name or phone matches are
      -- deliberately NOT auto-merged; they are ambiguity signals and fail closed.
      select count(*) into v_collision_count
      from public.contractors c
      where c.workspace_id = v_app.workspace_id
        and (
          (v_phone <> '' and regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g') = v_phone)
          or lower(regexp_replace(btrim(coalesce(c.company_name, '')), '\s+', ' ', 'g')) = v_org
        );

      if v_collision_count > 0 then
        raise exception 'A contractor with the same company name or phone may already exist; resolve that record before approval.'
          using errcode = '23505';
      end if;

      insert into public.contractors(
        workspace_id,
        company_name,
        contact_name,
        phone,
        email,
        specialty,
        provider_type
      ) values (
        v_app.workspace_id,
        btrim(v_app.organization_name),
        btrim(v_app.contact_name),
        btrim(v_app.phone),
        v_email,
        btrim(v_app.trade_categories),
        'contractor'
      )
      returning id into v_contractor_id;
    end if;

    update public.professional_applications
    set contractor_id = v_contractor_id,
        status = 'approved',
        reviewed_by = v_actor,
        reviewed_at = now(),
        updated_at = now()
    where id = v_app.id;
  end if;

  -- Existing accepted portal access wins. Do not create another identity/link.
  select exists (
    select 1
    from public.contractor_portal_links cpl
    where cpl.workspace_id = v_app.workspace_id
      and cpl.contractor_id = v_contractor_id
      and cpl.revoked_at is null
  ) into v_link_exists;

  if not v_link_exists then
    -- If this application already issued an unused invitation, revoke it before
    -- rotating a fresh token. The canonical contractor_id stays unchanged.
    if v_app.portal_invitation_id is not null then
      update public.portal_invitations pi
      set revoked_at = coalesce(pi.revoked_at, now())
      where pi.id = v_app.portal_invitation_id
        and pi.workspace_id = v_app.workspace_id
        and pi.contractor_id = v_contractor_id
        and pi.accepted_at is null;
    end if;

    v_token := encode(extensions.gen_random_bytes(32), 'hex');

    insert into public.portal_invitations(
      token_hash,
      portal_role,
      workspace_id,
      contractor_id,
      intended_email,
      issued_by,
      expires_at
    ) values (
      extensions.digest(v_token, 'sha256'),
      'contractor',
      v_app.workspace_id,
      v_contractor_id,
      v_email,
      v_actor,
      now() + interval '24 hours'
    )
    returning id into v_invitation_id;

    update public.professional_applications
    set contractor_id = v_contractor_id,
        portal_invitation_id = v_invitation_id,
        status = 'approved',
        reviewed_by = v_actor,
        reviewed_at = now(),
        updated_at = now()
    where id = v_app.id;

    insert into public.portal_access_events(
      workspace_id, actor_user_id, portal_role, action, entity_type, entity_id, details
    ) values (
      v_app.workspace_id,
      v_actor,
      'contractor',
      'professional_application_approved',
      'contractor',
      v_contractor_id::text,
      jsonb_build_object('application_id', v_app.id, 'invitation_id', v_invitation_id)
    );
  else
    update public.professional_applications
    set contractor_id = v_contractor_id,
        status = 'approved',
        reviewed_by = coalesce(reviewed_by, v_actor),
        reviewed_at = coalesce(reviewed_at, now()),
        updated_at = now()
    where id = v_app.id;
  end if;

  return query
  select v_app.id, v_contractor_id, v_reused, v_invitation_id, v_token, v_link_exists;
end;
$$;

revoke all on function public.approve_professional_application(uuid) from public, anon;
grant execute on function public.approve_professional_application(uuid) to authenticated, service_role;

comment on function public.approve_professional_application(uuid) is
  'Approves a professional application by resolving exactly one canonical public.contractors row in the same workspace, then issuing contractor portal access for that contractor_id. Exact email is the only automatic reuse key; likely company/phone collisions fail closed.';
