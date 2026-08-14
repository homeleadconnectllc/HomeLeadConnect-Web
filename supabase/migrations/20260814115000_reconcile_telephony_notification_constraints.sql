alter table public.notifications drop constraint if exists notifications_notification_type_check;
alter table public.notifications add constraint notifications_notification_type_check check (notification_type = any(array[
  'assignment_offered'::text,
  'appointment_scheduled'::text,
  'appointment_completed'::text,
  'appointment_cancelled'::text,
  'appointment_no_show'::text,
  'message_received'::text,
  'incoming_call'::text,
  'missed_call'::text,
  'voicemail'::text
]));

alter table public.notifications drop constraint if exists notifications_related_entity_type_check;
alter table public.notifications add constraint notifications_related_entity_type_check check (related_entity_type = any(array[
  'assignment'::text,
  'appointment'::text,
  'conversation'::text,
  'call_session'::text
]));
