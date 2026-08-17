drop policy if exists voice_note_objects_insert on storage.objects;
drop policy if exists voice_note_objects_select on storage.objects;
drop policy if exists voice_note_objects_cleanup_orphan on storage.objects;

create policy voice_note_objects_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'communication-voice-notes'
  and exists (
    select 1
    from public.conversation_participants cp
    join public.conversations c on c.id = cp.conversation_id
    where cp.user_id = (select auth.uid())
      and cp.conversation_id::text = (storage.foldername(objects.name))[2]
      and c.workspace_id::text = (storage.foldername(objects.name))[1]
      and c.closed_at is null
  )
);

create policy voice_note_objects_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'communication-voice-notes'
  and exists (
    select 1
    from public.conversation_participants cp
    join public.conversations c on c.id = cp.conversation_id
    where cp.user_id = (select auth.uid())
      and cp.conversation_id::text = (storage.foldername(objects.name))[2]
      and c.workspace_id::text = (storage.foldername(objects.name))[1]
  )
);

create policy voice_note_objects_cleanup_orphan
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'communication-voice-notes'
  and exists (
    select 1
    from public.conversation_participants cp
    join public.conversations c on c.id = cp.conversation_id
    where cp.user_id = (select auth.uid())
      and cp.conversation_id::text = (storage.foldername(objects.name))[2]
      and c.workspace_id::text = (storage.foldername(objects.name))[1]
  )
  and not exists (
    select 1 from public.voice_notes vn where vn.storage_path = objects.name
  )
);
