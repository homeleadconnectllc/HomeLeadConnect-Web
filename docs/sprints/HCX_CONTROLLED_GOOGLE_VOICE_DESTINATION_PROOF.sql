-- Run in the non-production consolidation project only, inside BEGIN/ROLLBACK.
-- This checks contact lookup and the real compliance RPC without placing a call,
-- enabling a provider, or writing persistent test data.
begin;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd021','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','controlled-voice-fixture@invalid.example','!',now());
insert into public.workspaces(id,name,created_by)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd022','Controlled Voice fixture',
  '48e50f8e-e9e1-4af2-8fd9-9255663dd021');
insert into public.workspace_members(workspace_id,user_id,role)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd022','48e50f8e-e9e1-4af2-8fd9-9255663dd021','owner')
on conflict do nothing;
insert into public.profiles(user_id,workspace_id,full_name,role)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd021','48e50f8e-e9e1-4af2-8fd9-9255663dd022',
  'Controlled Voice fixture','owner')
on conflict(user_id) do update set workspace_id=excluded.workspace_id;
insert into public.leads(id,workspace_id,phone,email,full_name)
values(984021,'48e50f8e-e9e1-4af2-8fd9-9255663dd022','7175854761',
  'controlled-voice-recipient@invalid.example','Controlled Voice destination');

set local role authenticated;
select set_config('request.jwt.claim.sub','48e50f8e-e9e1-4af2-8fd9-9255663dd021',true);
do $proof$
declare v_result jsonb; v_check public.communication_compliance_checks%rowtype;
begin
  v_result:=public.evaluate_communication_compliance('lead','984021','call','service','outbound',
    false,false,false,'google_voice');
  select * into v_check from public.communication_compliance_checks
    where id=(v_result->>'id')::uuid;
  if v_check.subject_type<>'lead' or v_check.subject_id<>'984021'
    or v_check.provider_name<>'google_voice' or v_check.channel<>'call'
    or v_check.decision<>'BLOCK' or not (v_check.reasons?'provider_not_connected') then
    raise exception 'Controlled Google Voice check did not retain selected lead and block unconfigured provider';
  end if;
  if (select regexp_replace(phone,'[() .-]','','g') from public.leads
      where id=v_check.subject_id::bigint and workspace_id=v_check.workspace_id)<>'7175854761' then
    raise exception 'Compliance check resolved a different contact destination';
  end if;
end $proof$;
reset role;
select 'controlled-destination-policy-pass' as proof;
rollback;
