-- Reconcile legacy voice access with the canonical HLC tenancy model.
-- org_members is not the active workspace membership source.

DROP POLICY IF EXISTS "voice-audio select metadata workspace-scoped" ON storage.objects;
DROP POLICY IF EXISTS "voice-audio upload workspace-scoped" ON storage.objects;

CREATE POLICY voice_audio_select_workspace_members
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id='voice-audio'
  AND (storage.foldername(name))[1] IN (
    SELECT wm.workspace_id::text
    FROM public.workspace_members wm
    WHERE wm.user_id=(SELECT auth.uid())
  )
);

CREATE POLICY voice_audio_insert_workspace_members
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id='voice-audio'
  AND (storage.foldername(name))[1] IN (
    SELECT wm.workspace_id::text
    FROM public.workspace_members wm
    WHERE wm.user_id=(SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "voice_messages insert workspace members" ON public.voice_messages;
DROP POLICY IF EXISTS "voice_messages select workspace members" ON public.voice_messages;
DROP POLICY IF EXISTS "voice_messages update workspace members" ON public.voice_messages;

CREATE POLICY voice_messages_insert_workspace_members
ON public.voice_messages
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    WHERE wm.user_id=(SELECT auth.uid())
  )
);

CREATE POLICY voice_messages_select_workspace_members
ON public.voice_messages
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    WHERE wm.user_id=(SELECT auth.uid())
  )
);

CREATE POLICY voice_messages_update_workspace_members
ON public.voice_messages
FOR UPDATE
TO authenticated
USING (
  workspace_id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    WHERE wm.user_id=(SELECT auth.uid())
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    WHERE wm.user_id=(SELECT auth.uid())
  )
);
