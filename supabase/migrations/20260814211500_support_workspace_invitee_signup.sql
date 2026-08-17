create or replace function public.handle_new_user_onboarding()
returns trigger language plpgsql security definer set search_path to ''
as $function$
declare v_workspace_id uuid; v_company_name text; v_account_type text;
begin
  if exists (select 1 from public.profiles where user_id=new.id) then return new; end if;
  v_account_type := lower(coalesce(new.raw_user_meta_data->>'account_type','company_owner'));
  if v_account_type='workspace_invitee' then return new; end if;
  v_company_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'company_name','')), '');
  insert into public.workspaces(name,created_by) values(coalesce(v_company_name,'My Workspace'),new.id) returning id into v_workspace_id;
  insert into public.profiles(user_id,workspace_id,full_name,avatar_url,role)
  values(new.id,v_workspace_id,nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name','')),''),nullif(btrim(coalesce(new.raw_user_meta_data->>'avatar_url','')),''),'owner');
  insert into public.workspace_members(workspace_id,user_id,role) values(v_workspace_id,new.id,'owner')
  on conflict (workspace_id,user_id) do update set role='owner';
  return new;
end;
$function$;

create or replace function public.accept_workspace_invitation(p_invitation_token text)
returns table(workspace_id uuid,workspace_name text,member_role text)
language plpgsql security definer set search_path to ''
as $function$
declare v_inv public.workspace_invitations%rowtype; v_email text; v_workspace_name text; v_full_name text; v_avatar_url text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select lower(email),nullif(btrim(coalesce(raw_user_meta_data->>'full_name','')),''),nullif(btrim(coalesce(raw_user_meta_data->>'avatar_url','')),'')
  into v_email,v_full_name,v_avatar_url from auth.users where id=auth.uid();
  select * into v_inv from public.workspace_invitations where token_hash=extensions.digest(p_invitation_token,'sha256') for update;
  if not found then raise exception 'Invitation is invalid.' using errcode='22023'; end if;
  if v_inv.revoked_at is not null then raise exception 'Invitation was revoked.' using errcode='42501'; end if;
  if v_inv.accepted_at is not null then raise exception 'Invitation was already used.' using errcode='42501'; end if;
  if v_inv.expires_at<=now() then raise exception 'Invitation has expired.' using errcode='42501'; end if;
  if v_email is distinct from lower(v_inv.intended_email) then raise exception 'Sign in with the invited email address.' using errcode='42501'; end if;
  insert into public.workspace_members(workspace_id,user_id,role) values(v_inv.workspace_id,auth.uid(),v_inv.role)
  on conflict (workspace_id,user_id) do update set role=excluded.role;
  insert into public.profiles(user_id,workspace_id,full_name,avatar_url,role)
  values(auth.uid(),v_inv.workspace_id,v_full_name,v_avatar_url,v_inv.role)
  on conflict (user_id) do update set workspace_id=excluded.workspace_id,role=excluded.role,
    full_name=coalesce(public.profiles.full_name,excluded.full_name),avatar_url=coalesce(public.profiles.avatar_url,excluded.avatar_url);
  update public.workspace_invitations set accepted_at=now(),accepted_by=auth.uid() where id=v_inv.id;
  select w.name into v_workspace_name from public.workspaces w where w.id=v_inv.workspace_id;
  return query select v_inv.workspace_id,v_workspace_name,v_inv.role;
end;
$function$;
