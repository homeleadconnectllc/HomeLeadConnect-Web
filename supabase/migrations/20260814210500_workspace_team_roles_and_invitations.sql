alter table public.workspace_members add column if not exists role text;

update public.workspace_members wm
set role = case
  when exists (select 1 from public.workspaces w where w.id=wm.workspace_id and w.created_by=wm.user_id) then 'owner'
  else coalesce((select lower(p.role) from public.profiles p where p.user_id=wm.user_id and p.workspace_id=wm.workspace_id limit 1),'technician')
end
where role is null;

alter table public.workspace_members alter column role set default 'technician';
alter table public.workspace_members alter column role set not null;
alter table public.workspace_members drop constraint if exists workspace_members_role_check;
alter table public.workspace_members add constraint workspace_members_role_check check (role in ('owner','manager','technician'));

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash bytea not null unique,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  intended_email text not null,
  role text not null check (role in ('manager','technician')),
  issued_by uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid,
  revoked_at timestamptz
);

alter table public.workspace_invitations enable row level security;
revoke all on table public.workspace_invitations from anon, authenticated;
grant select on table public.workspace_invitations to authenticated;

drop policy if exists workspace_invitations_management_select on public.workspace_invitations;
create policy workspace_invitations_management_select on public.workspace_invitations
for select to authenticated
using (exists (
  select 1 from public.workspace_members wm
  where wm.workspace_id=workspace_invitations.workspace_id
    and wm.user_id=auth.uid()
    and wm.role in ('owner','manager')
));

create or replace function public.handle_new_user_onboarding()
returns trigger language plpgsql security definer set search_path to ''
as $function$
declare v_workspace_id uuid; v_company_name text;
begin
  if exists (select 1 from public.profiles where user_id=new.id) then return new; end if;
  v_company_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'company_name','')), '');
  insert into public.workspaces(name,created_by) values(coalesce(v_company_name,'My Workspace'),new.id) returning id into v_workspace_id;
  insert into public.profiles(user_id,workspace_id,full_name,avatar_url,role)
  values(new.id,v_workspace_id,nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name','')),''),nullif(btrim(coalesce(new.raw_user_meta_data->>'avatar_url','')),''),'owner');
  insert into public.workspace_members(workspace_id,user_id,role) values(v_workspace_id,new.id,'owner')
  on conflict (workspace_id,user_id) do update set role='owner';
  return new;
end;
$function$;

create or replace function public.switch_current_workspace(p_workspace_id uuid)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare v_role text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select wm.role into v_role from public.workspace_members wm where wm.user_id=auth.uid() and wm.workspace_id=p_workspace_id;
  if v_role is null then raise exception 'You are not a member of that workspace.' using errcode='42501'; end if;
  update public.profiles set workspace_id=p_workspace_id,role=v_role where user_id=auth.uid();
  if not found then raise exception 'Your profile is unavailable.' using errcode='P0002'; end if;
  return p_workspace_id;
end;
$function$;

create or replace function public.create_workspace_invitation(p_intended_email text,p_role text,p_expires_in_minutes integer default 1440)
returns table(invitation_id uuid,invitation_token text,intended_email text,invited_role text,expires_at timestamptz)
language plpgsql security definer set search_path to ''
as $function$
declare v_workspace_id uuid; v_actor_role text; v_token text; v_id uuid; v_expires timestamptz;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if p_intended_email is null or btrim(p_intended_email) !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Enter a valid invitation email.' using errcode='22023'; end if;
  p_role := lower(btrim(p_role));
  if p_role not in ('manager','technician') then raise exception 'Invalid team role.' using errcode='22023'; end if;
  if p_expires_in_minutes < 10 or p_expires_in_minutes > 10080 then raise exception 'Invitation lifetime must be between 10 minutes and 7 days.' using errcode='22023'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  select wm.role into v_actor_role from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid();
  if v_actor_role not in ('owner','manager') then raise exception 'Team administration requires an owner or manager role.' using errcode='42501'; end if;
  if v_actor_role='manager' and p_role='manager' then raise exception 'Only an owner can invite another manager.' using errcode='42501'; end if;
  v_token := encode(extensions.gen_random_bytes(32),'hex');
  v_expires := now()+make_interval(mins=>p_expires_in_minutes);
  insert into public.workspace_invitations(token_hash,workspace_id,intended_email,role,issued_by,expires_at)
  values(extensions.digest(v_token,'sha256'),v_workspace_id,lower(btrim(p_intended_email)),p_role,auth.uid(),v_expires) returning id into v_id;
  return query select v_id,v_token,lower(btrim(p_intended_email)),p_role,v_expires;
end;
$function$;

create or replace function public.accept_workspace_invitation(p_invitation_token text)
returns table(workspace_id uuid,workspace_name text,member_role text)
language plpgsql security definer set search_path to ''
as $function$
declare v_inv public.workspace_invitations%rowtype; v_email text; v_workspace_name text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users where id=auth.uid();
  select * into v_inv from public.workspace_invitations where token_hash=extensions.digest(p_invitation_token,'sha256') for update;
  if not found then raise exception 'Invitation is invalid.' using errcode='22023'; end if;
  if v_inv.revoked_at is not null then raise exception 'Invitation was revoked.' using errcode='42501'; end if;
  if v_inv.accepted_at is not null then raise exception 'Invitation was already used.' using errcode='42501'; end if;
  if v_inv.expires_at<=now() then raise exception 'Invitation has expired.' using errcode='42501'; end if;
  if v_email is distinct from lower(v_inv.intended_email) then raise exception 'Sign in with the invited email address.' using errcode='42501'; end if;
  insert into public.workspace_members(workspace_id,user_id,role) values(v_inv.workspace_id,auth.uid(),v_inv.role)
  on conflict (workspace_id,user_id) do update set role=excluded.role;
  update public.profiles set workspace_id=v_inv.workspace_id,role=v_inv.role where user_id=auth.uid();
  update public.workspace_invitations set accepted_at=now(),accepted_by=auth.uid() where id=v_inv.id;
  select w.name into v_workspace_name from public.workspaces w where w.id=v_inv.workspace_id;
  return query select v_inv.workspace_id,v_workspace_name,v_inv.role;
end;
$function$;

create or replace function public.revoke_workspace_invitation(p_invitation_id uuid)
returns void language plpgsql security definer set search_path to ''
as $function$
declare v_workspace_id uuid; v_invite_role text; v_actor_role text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select wi.workspace_id,wi.role into v_workspace_id,v_invite_role from public.workspace_invitations wi where wi.id=p_invitation_id;
  if v_workspace_id is null then raise exception 'Invitation not found.' using errcode='P0002'; end if;
  select wm.role into v_actor_role from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid();
  if v_actor_role not in ('owner','manager') then raise exception 'Team administration requires an owner or manager role.' using errcode='42501'; end if;
  if v_actor_role='manager' and v_invite_role='manager' then raise exception 'Only an owner can revoke a manager invitation.' using errcode='42501'; end if;
  update public.workspace_invitations set revoked_at=now() where id=p_invitation_id and accepted_at is null and revoked_at is null;
end;
$function$;

create or replace function public.get_workspace_team()
returns table(user_id uuid,email text,full_name text,member_role text,joined_at timestamptz)
language plpgsql security definer set search_path to ''
as $function$
declare v_workspace_id uuid; v_actor_role text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  select wm.role into v_actor_role from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid();
  if v_actor_role not in ('owner','manager') then raise exception 'Team administration requires an owner or manager role.' using errcode='42501'; end if;
  return query select wm.user_id,u.email,p.full_name,wm.role,wm.created_at
  from public.workspace_members wm left join auth.users u on u.id=wm.user_id left join public.profiles p on p.user_id=wm.user_id
  where wm.workspace_id=v_workspace_id order by case wm.role when 'owner' then 1 when 'manager' then 2 else 3 end,wm.created_at;
end;
$function$;

create or replace function public.remove_workspace_member(p_user_id uuid)
returns void language plpgsql security definer set search_path to ''
as $function$
declare v_workspace_id uuid; v_actor_role text; v_target_role text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if p_user_id=auth.uid() then raise exception 'Use account settings to leave a workspace.' using errcode='22023'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  select wm.role into v_actor_role from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid();
  select wm.role into v_target_role from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=p_user_id;
  if v_target_role is null then raise exception 'Team member not found.' using errcode='P0002'; end if;
  if v_target_role='owner' then raise exception 'The workspace owner cannot be removed.' using errcode='42501'; end if;
  if v_actor_role='manager' and v_target_role<>'technician' then raise exception 'Managers can remove technicians only.' using errcode='42501'; end if;
  if v_actor_role not in ('owner','manager') then raise exception 'Team administration requires an owner or manager role.' using errcode='42501'; end if;
  delete from public.workspace_members where workspace_id=v_workspace_id and user_id=p_user_id;
end;
$function$;

revoke all on function public.create_workspace_invitation(text,text,integer) from public,anon;
revoke all on function public.accept_workspace_invitation(text) from public,anon;
revoke all on function public.revoke_workspace_invitation(uuid) from public,anon;
revoke all on function public.get_workspace_team() from public,anon;
revoke all on function public.remove_workspace_member(uuid) from public,anon;
grant execute on function public.create_workspace_invitation(text,text,integer) to authenticated;
grant execute on function public.accept_workspace_invitation(text) to authenticated;
grant execute on function public.revoke_workspace_invitation(uuid) to authenticated;
grant execute on function public.get_workspace_team() to authenticated;
grant execute on function public.remove_workspace_member(uuid) to authenticated;
