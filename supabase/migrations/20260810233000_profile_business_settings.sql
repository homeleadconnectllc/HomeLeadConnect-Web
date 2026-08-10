alter table public.business_profile
  add constraint business_profile_workspace_id_fkey
  foreign key (workspace_id) references public.workspaces(id) on delete cascade;

alter table public.business_profile
  add constraint business_profile_workspace_id_key unique (workspace_id);

create policy "workspace members can create business profile"
on public.business_profile
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = business_profile.workspace_id
      and wm.user_id = auth.uid()
  )
);

grant update (full_name, avatar_url) on public.profiles to authenticated;

grant insert (
  workspace_id,
  business_name,
  owner_name,
  phone,
  email,
  website,
  address,
  city,
  state,
  zip
) on public.business_profile to authenticated;

grant update (
  business_name,
  owner_name,
  phone,
  email,
  website,
  address,
  city,
  state,
  zip
) on public.business_profile to authenticated;
