-- Connected Core inbound identity ambiguity hardening.
-- Rehearsed first on hlc-reconciliation-test. This migration is intentionally
-- staged/unpromoted until the exact production candidate is owner-approved.
--
-- Legacy leads/contractors remain current communication subjects, but an
-- inbound endpoint must never be silently attached when more than one subject
-- matches the same canonical phone/email endpoint.

create or replace function public.resolve_communication_subject(
  p_workspace_id uuid,
  p_channel text,
  p_destination text
)
returns jsonb
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_channel text := lower(btrim(coalesce(p_channel,'')));
  v_destination text;
  v_match_count integer;
  v_result jsonb;
begin
  if v_channel='email' then
    v_destination := lower(btrim(coalesce(p_destination,'')));
  elsif v_channel in ('sms','call') then
    v_destination := regexp_replace(coalesce(p_destination,''),'[^0-9]','','g');
    if length(v_destination)=10 then
      v_destination := '1'||v_destination;
    elsif length(v_destination)=11 and left(v_destination,1)='1' then
      null;
    end if;
  else
    raise exception 'Unsupported communication channel.' using errcode='22023';
  end if;

  if v_destination='' then return null; end if;

  with candidates as (
    select jsonb_build_object('subject_type','lead','subject_id',l.id::text) as result
    from public.leads l
    where l.workspace_id=p_workspace_id
      and (
        (v_channel='email' and lower(btrim(coalesce(l.email,'')))=v_destination)
        or
        (v_channel in ('sms','call') and
          case
            when length(regexp_replace(coalesce(l.phone,''),'[^0-9]','','g'))=10
              then '1'||regexp_replace(coalesce(l.phone,''),'[^0-9]','','g')
            else regexp_replace(coalesce(l.phone,''),'[^0-9]','','g')
          end = v_destination)
      )
    union all
    select jsonb_build_object('subject_type','contractor','subject_id',c.id::text)
    from public.contractors c
    where c.workspace_id=p_workspace_id
      and (
        (v_channel='email' and lower(btrim(coalesce(c.email,'')))=v_destination)
        or
        (v_channel in ('sms','call') and
          case
            when length(regexp_replace(coalesce(c.phone,''),'[^0-9]','','g'))=10
              then '1'||regexp_replace(coalesce(c.phone,''),'[^0-9]','','g')
            else regexp_replace(coalesce(c.phone,''),'[^0-9]','','g')
          end = v_destination)
      )
  )
  select count(*) into v_match_count from candidates;

  if v_match_count=0 then return null; end if;
  if v_match_count>1 then
    return jsonb_build_object('status','ambiguous','candidate_count',v_match_count);
  end if;

  with candidates as (
    select jsonb_build_object('subject_type','lead','subject_id',l.id::text) as result
    from public.leads l
    where l.workspace_id=p_workspace_id
      and (
        (v_channel='email' and lower(btrim(coalesce(l.email,'')))=v_destination)
        or
        (v_channel in ('sms','call') and
          case
            when length(regexp_replace(coalesce(l.phone,''),'[^0-9]','','g'))=10
              then '1'||regexp_replace(coalesce(l.phone,''),'[^0-9]','','g')
            else regexp_replace(coalesce(l.phone,''),'[^0-9]','','g')
          end = v_destination)
      )
    union all
    select jsonb_build_object('subject_type','contractor','subject_id',c.id::text)
    from public.contractors c
    where c.workspace_id=p_workspace_id
      and (
        (v_channel='email' and lower(btrim(coalesce(c.email,'')))=v_destination)
        or
        (v_channel in ('sms','call') and
          case
            when length(regexp_replace(coalesce(c.phone,''),'[^0-9]','','g'))=10
              then '1'||regexp_replace(coalesce(c.phone,''),'[^0-9]','','g')
            else regexp_replace(coalesce(c.phone,''),'[^0-9]','','g')
          end = v_destination)
      )
  )
  select result into v_result from candidates limit 1;

  return v_result || jsonb_build_object('status','matched');
end;
$function$;

revoke all on function public.resolve_communication_subject(uuid,text,text) from public,anon,authenticated;
grant execute on function public.resolve_communication_subject(uuid,text,text) to service_role;
