create or replace function public.set_linked_provider_availability(p_contractor_id bigint, p_available boolean, p_note text, p_next_available_at timestamptz)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := (select auth.uid()); v_workspace uuid;
begin
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  insert into public.provider_availability(workspace_id,contractor_id,available,note,next_available_at,updated_at)
  values(v_workspace,p_contractor_id,p_available,nullif(btrim(coalesce(p_note,'')),''),p_next_available_at,now())
  on conflict (contractor_id) do update set workspace_id=excluded.workspace_id,available=excluded.available,note=excluded.note,next_available_at=excluded.next_available_at,updated_at=now();
end;
$$;

revoke all on function public.set_linked_provider_availability(bigint,boolean,text,timestamptz) from public,anon;
grant execute on function public.set_linked_provider_availability(bigint,boolean,text,timestamptz) to authenticated,service_role;
