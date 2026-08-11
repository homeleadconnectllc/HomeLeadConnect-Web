create or replace function public.hlc_enforce_contractor_assignment_decision()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.status is distinct from old.status and old.status='offered' and new.status in ('accepted','rejected') then
    if auth.uid() is null or not exists(
      select 1 from public.contractor_portal_links cpl
      where cpl.user_id=auth.uid() and cpl.workspace_id=new.workspace_id
        and cpl.contractor_id=new.contractor_id and cpl.revoked_at is null
    ) then
      raise exception 'The linked contractor must accept or reject this offer through the contractor portal.' using errcode='42501';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists job_assignments_contractor_decision on public.job_assignments;
create trigger job_assignments_contractor_decision
before update of status on public.job_assignments
for each row execute function public.hlc_enforce_contractor_assignment_decision();

revoke all on function public.hlc_enforce_contractor_assignment_decision() from public,anon,authenticated;

create or replace function public.hlc_log_public_intake_activity()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.request_id is not null
    and new.source='public_website'
    and (tg_op='INSERT' or old.request_id is distinct from new.request_id)
    and not exists(select 1 from public.lead_activities la where la.workspace_id=new.workspace_id and la.request_id=new.request_id)
  then
    insert into public.lead_activities(workspace_id,lead_id,activity_type,outcome,notes,request_id)
    values(new.workspace_id,new.id,'public_intake','accepted','Public service request accepted into the canonical CRM.',new.request_id);
  end if;
  return new;
end; $$;

drop trigger if exists leads_log_public_intake_activity on public.leads;
create trigger leads_log_public_intake_activity
after insert or update of request_id on public.leads
for each row execute function public.hlc_log_public_intake_activity();

revoke all on function public.hlc_log_public_intake_activity() from public,anon,authenticated;
