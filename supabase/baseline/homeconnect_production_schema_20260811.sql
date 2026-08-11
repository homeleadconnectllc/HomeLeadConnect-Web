


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "causal";


ALTER SCHEMA "causal" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "internal";


ALTER SCHEMA "internal" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."lead_status" AS ENUM (
    'NEW',
    'CALL',
    'QUALIFIED',
    'BOOKED',
    'CLOSED',
    'SKIP'
);


ALTER TYPE "public"."lead_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "causal"."_ingest_lead_impl"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_source" "text", "p_event_type" "text", "p_request_payload" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'causal', 'public', 'extensions'
    AS $$
declare
  v_phone text;
  v_lead_id bigint;
  v_state_hash text;
begin
  -- normalize phone (SOURCE OF TRUTH)
  v_phone := regexp_replace(coalesce(p_phone,''), '\\D+', '', 'g');
  if v_phone = '' then
    raise exception 'phone required';
  end if;

  -- UPSERT lead (ONLY WRITER)
  insert into public.leads (
    workspace_id,
    phone,
    full_name,
    email,
    status,
    source
  )
  values (
    p_workspace_id,
    v_phone,
    p_full_name,
    p_email,
    coalesce(p_status,'new'),
    p_source
  )
  on conflict (workspace_id, phone)
  do update set
    full_name = coalesce(excluded.full_name, public.leads.full_name),
    email = coalesce(excluded.email, public.leads.email),
    status = excluded.status,
    source = coalesce(excluded.source, public.leads.source),
    updated_at = now()
  returning id into v_lead_id;

  -- deterministic hash (NO now())
  v_state_hash := encode(
    digest(
      jsonb_strip_nulls(
        jsonb_build_object(
          'workspace_id', p_workspace_id,
          'phone', v_phone,
          'event_type', coalesce(p_event_type,'lead_upsert'),
          'payload', p_request_payload
        )::text
      ),
      'sha256'
    ),
    'hex'
  );

  -- EVENT LOG (IDEMPOTENT)
  insert into causal.leads_state (
    workspace_id,
    state_hash,
    status,
    data
  )
  values (
    p_workspace_id,
    v_state_hash,
    p_status,
    jsonb_build_object(
      'lead_id', v_lead_id,
      'event_type', p_event_type,
      'request', p_request_payload
    )
  )
  on conflict (state_hash) do nothing;

  return v_lead_id;
end;
$$;


ALTER FUNCTION "causal"."_ingest_lead_impl"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_source" "text", "p_event_type" "text", "p_request_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "causal"."_ingest_lead_impl"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_notes" "text", "p_assigned_to" "uuid", "p_source" "text", "p_event_type" "text", "p_request_payload" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'causal', 'public', 'extensions'
    AS $$
declare
  v_phone text;
  v_lead_id bigint;
  v_state_hash text;
begin
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if v_phone = '' then raise exception 'phone required'; end if;

  insert into public.leads (workspace_id, phone, full_name, email, status, notes, assigned_to, source)
  values (p_workspace_id, v_phone, p_full_name, p_email, coalesce(p_status, 'new'), p_notes, p_assigned_to, p_source)
  on conflict (workspace_id, phone)
  do update set
    full_name=coalesce(excluded.full_name,public.leads.full_name),
    email=coalesce(excluded.email,public.leads.email),
    status=coalesce(excluded.status,public.leads.status),
    notes=coalesce(excluded.notes,public.leads.notes),
    assigned_to=coalesce(excluded.assigned_to,public.leads.assigned_to),
    source=coalesce(excluded.source,public.leads.source),
    updated_at=now()
  returning id into v_lead_id;

  v_state_hash := encode(
    extensions.digest(
      jsonb_strip_nulls(jsonb_build_object(
        'workspace_id',p_workspace_id,'phone',v_phone,
        'event_type',coalesce(p_event_type,'lead_upsert'),'payload',p_request_payload
      ))::text,
      'sha256'
    ),
    'hex'
  );

  insert into causal.leads_state(workspace_id,state_hash,status,data)
  values(p_workspace_id,v_state_hash,p_status,jsonb_build_object(
    'lead_id',v_lead_id,'event_type',p_event_type,'request',p_request_payload
  ))
  on conflict(state_hash) do nothing;

  return v_lead_id;
end;
$$;


ALTER FUNCTION "causal"."_ingest_lead_impl"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_notes" "text", "p_assigned_to" "uuid", "p_source" "text", "p_event_type" "text", "p_request_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "causal"."ingest_lead"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text", "p_assigned_to" "uuid" DEFAULT NULL::"uuid", "p_source" "text" DEFAULT NULL::"text", "p_last_contacted_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_next_follow_up_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_appointment_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_appointment_status" "text" DEFAULT NULL::"text", "p_assigned_until" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_priority" "text" DEFAULT NULL::"text", "p_priority_score" numeric DEFAULT NULL::numeric, "p_pipeline_stage_id" "uuid" DEFAULT NULL::"uuid", "p_pipeline_id" "uuid" DEFAULT NULL::"uuid", "p_organization_id" "uuid" DEFAULT NULL::"uuid", "p_first_name" "text" DEFAULT NULL::"text", "p_last_name" "text" DEFAULT NULL::"text", "p_score" integer DEFAULT NULL::integer, "p_archived" boolean DEFAULT NULL::boolean, "p_event_type" "text" DEFAULT 'lead_upsert'::"text", "p_request_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_phone text;
  v_state_hash text;
  v_lead_id bigint;
  v_payload jsonb;
BEGIN
  -- identity normalization: digits only
  v_phone := regexp_replace(coalesce(p_phone, ''), '\\D+', '', 'g');
  IF v_phone = '' THEN
    RAISE EXCEPTION 'phone is required';
  END IF;

  -- auth gate
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- enforce tenant membership
  IF NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.workspace_id = p_workspace_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- canonicalize payload FIRST (deterministic structure)
  v_payload := jsonb_build_object(
    'event_type', p_event_type,
    'workspace_id', p_workspace_id,
    'phone', v_phone,
    'request', jsonb_strip_nulls(coalesce(p_request_payload, '{}'::jsonb))
  );

  -- upsert lead
  INSERT INTO public.leads (
    workspace_id,
    phone,
    full_name,
    email,
    status,
    notes,
    assigned_to,
    source,
    last_contacted_at,
    next_follow_up_at,
    appointment_at,
    appointment_status,
    assigned_until,
    priority,
    priority_score,
    pipeline_stage_id,
    pipeline_id,
    organization_id,
    first_name,
    last_name,
    score,
    archived
  )
  VALUES (
    p_workspace_id,
    v_phone,
    p_full_name,
    p_email,
    p_status,
    p_notes,
    p_assigned_to,
    p_source,
    p_last_contacted_at,
    p_next_follow_up_at,
    p_appointment_at,
    p_appointment_status,
    p_assigned_until,
    p_priority,
    p_priority_score,
    p_pipeline_stage_id,
    p_pipeline_id,
    p_organization_id,
    p_first_name,
    p_last_name,
    p_score,
    p_archived
  )
  ON CONFLICT (workspace_id, phone)
  DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.leads.full_name),
    email = COALESCE(EXCLUDED.email, public.leads.email),
    status = COALESCE(EXCLUDED.status, public.leads.status),
    updated_at = clock_timestamp();

  SELECT l.id
  INTO v_lead_id
  FROM public.leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.phone = v_phone;

  -- FINAL canonical deterministic hash (explicit JSON normalization)
  v_state_hash := encode(
    digest(
      jsonb_strip_nulls(
        jsonb_build_object(
          'payload', p_request_payload,
          'event_type', coalesce(p_event_type, 'lead_upsert'),
          'workspace_id', p_workspace_id,
          'phone', v_phone
        )
      )::text,
      'sha256'
    ),
    'hex'
  );

  -- EVENT INSERT (idempotent)
  INSERT INTO causal.leads_state (
    workspace_id,
    state_hash,
    status,
    data
  )
  VALUES (
    p_workspace_id,
    v_state_hash,
    p_status,
    jsonb_build_object(
      'event_type', p_event_type,
      'lead_id', v_lead_id,
      'request', p_request_payload
    )
  )
  ON CONFLICT (state_hash) DO NOTHING;

  RETURN v_lead_id;
END;
$$;


ALTER FUNCTION "causal"."ingest_lead"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_notes" "text", "p_assigned_to" "uuid", "p_source" "text", "p_last_contacted_at" timestamp with time zone, "p_next_follow_up_at" timestamp with time zone, "p_appointment_at" timestamp with time zone, "p_appointment_status" "text", "p_assigned_until" timestamp with time zone, "p_priority" "text", "p_priority_score" numeric, "p_pipeline_stage_id" "uuid", "p_pipeline_id" "uuid", "p_organization_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_score" integer, "p_archived" boolean, "p_event_type" "text", "p_request_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "causal"."ingest_public_lead"("p_form_slug" "text", "p_phone" "text", "p_full_name" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_message" "text" DEFAULT NULL::"text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'causal', 'public', 'extensions'
    AS $$
declare
  v_workspace_id uuid;
  v_status text := 'new';
begin
  select pf.workspace_id
    into v_workspace_id
  from public.public_forms pf
  where pf.form_slug = p_form_slug
    and pf.enabled = true
  limit 1;

  if v_workspace_id is null then
    raise exception 'invalid form';
  end if;

  return causal._ingest_lead_impl(
    v_workspace_id,
    p_phone,
    p_full_name,
    p_email,
    v_status,
    p_message,       -- p_notes
    null,             -- p_assigned_to
    'carrd',
    'lead_upsert',
    jsonb_build_object(
      'message', p_message,
      'form_slug', p_form_slug
    )
  );
end;
$$;


ALTER FUNCTION "causal"."ingest_public_lead"("p_form_slug" "text", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_message" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."advance_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text", "p_request_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  current_status text;
  new_status text;
  v_now timestamptz := now();
BEGIN
  -- 1. RATE LIMIT (workspace-level throttle)
  PERFORM 1
  FROM public.workspace_rate_limits
  WHERE workspace_id = p_workspace_id
  FOR UPDATE;
  IF EXISTS (
    SELECT 1
    FROM public.workspace_rate_limits
    WHERE workspace_id = p_workspace_id
      AND last_request_at > now() - interval '250 ms'
  ) THEN
    RAISE EXCEPTION 'RATE_LIMITED';
  END IF;
  INSERT INTO public.workspace_rate_limits (workspace_id, last_request_at, request_count)
  VALUES (p_workspace_id, now(), 1)
  ON CONFLICT (workspace_id)
  DO UPDATE SET
    last_request_at = EXCLUDED.last_request_at,
    request_count = workspace_rate_limits.request_count + 1;

  -- 2. LOCK LEAD ROW
  SELECT l.status
  INTO current_status
  FROM public.leads l
  WHERE l.id = p_lead_id
    AND l.workspace_id = p_workspace_id
  FOR UPDATE;

  IF current_status IS NULL THEN
    RAISE EXCEPTION 'LEAD_NOT_FOUND_OR_TENANCY_MISMATCH';
  END IF;

  -- 3. IDEMPOTENCY CHECK
  IF EXISTS (
    SELECT 1
    FROM public.leads
    WHERE id = p_lead_id
      AND workspace_id = p_workspace_id
      AND advance_request_id = p_request_id
  ) THEN
    RETURN;
  END IF;

  -- 4. FSM RESOLUTION (NO CHANGE)
  new_status := public.resolve_lead_next_status(
    p_workspace_id,
    current_status,
    p_action_type
  );

  IF new_status IS NULL THEN
    -- FAILURE EVENT (OBSERVABILITY)
    INSERT INTO public.lead_events (
      workspace_id,
      lead_id,
      event_type,
      correlation_id,
      event_status,
      error_code,
      metadata
    ) VALUES (
      p_workspace_id,
      p_lead_id::text,
      'LEAD_ADVANCE_FAILED',
      p_request_id,
      'FAILED',
      'INVALID_TRANSITION',
      jsonb_build_object(
        'from_status', current_status,
        'action_type', p_action_type
      )
    );

    RAISE EXCEPTION 'INVALID_TRANSITION: % -> %',
      current_status, p_action_type;
  END IF;

  -- 5. ATOMIC WRITE
  UPDATE public.leads
  SET
    status = new_status,
    advance_request_id = p_request_id,
    updated_at = v_now
  WHERE id = p_lead_id
    AND workspace_id = p_workspace_id;

  -- 6. SUCCESS EVENT (OBSERVABILITY)
  INSERT INTO public.lead_events (
    workspace_id,
    lead_id,
    event_type,
    correlation_id,
    event_status,
    metadata
  ) VALUES (
    p_workspace_id,
    p_lead_id::text,
    'LEAD_ADVANCE_SUCCESS',
    p_request_id,
    'SUCCESS',
    jsonb_build_object(
      'from_status', current_status,
      'to_status', new_status,
      'action_type', p_action_type
    )
  );
END;
$$;


ALTER FUNCTION "public"."advance_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text", "p_request_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."advance_lead_expected"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text") RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
declare
  v_status_before text;
  v_status_after  text;
begin
  select l.status
    into v_status_before
  from public.leads l
  where l.id = p_lead_id
    and l.workspace_id = p_workspace_id;

  if v_status_before is null then
    raise exception 'LEAD_NOT_FOUND_OR_TENANCY_MISMATCH';
  end if;

  v_status_after := public.resolve_lead_next_status(v_status_before, p_action_type);

  if v_status_after is null then
    raise exception 'INVALID_TRANSITION';
  end if;

  return v_status_after;
end;
$$;


ALTER FUNCTION "public"."advance_lead_expected"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."advance_lead_legacy_direct"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_action_type" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  v_epoch bigint;
  v_next_buffer jsonb;
  v_next_lead_id uuid;
  v_rowcount int;
BEGIN
  -- 1) Serialize workspace execution
  PERFORM 1
  FROM public.crm_workspace_claims
  WHERE workspace_id = p_workspace_id
  FOR UPDATE;

  /*
    Define terminal/consumed states according to your kernel mapping.
    A lead is "consumed" when status is in this terminal set.
    Update only happens if current status is NOT terminal.
  */
  -- Adjust this set to exactly your app's terminal statuses.
  -- Using your earlier examples:
  -- consumed = {'CALL','QUALIFIED','BOOKED','CLOSED','SKIP'}
  -- so consumable/pending = everything else.
  UPDATE public.leads
  SET status = p_action_type,
      stage_updated_at = now()
  WHERE workspace_id = p_workspace_id
    AND id_uuid = p_lead_id
    AND status NOT IN ('CALL','QUALIFIED','BOOKED','CLOSED','SKIP');

  GET DIAGNOSTICS v_rowcount = ROW_COUNT;

  -- If the lead was already consumed (retry/double-click), return a stable snapshot anyway.
  -- Note: v_epoch is only advanced when we actually consume.
  IF v_rowcount = 0 THEN
    SELECT v.id_uuid
    INTO v_next_lead_id
    FROM public.leads v
    WHERE v.workspace_id = p_workspace_id
      AND v.status NOT IN ('CALL','QUALIFIED','BOOKED','CLOSED','SKIP')
    ORDER BY
      v.priority_score DESC NULLS LAST,
      v.created_at ASC,
      v.id ASC
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id_uuid', l.id_uuid,
        'id', l.id,
        'full_name', l.full_name,
        'phone', l.phone,
        'email', l.email,
        'status', l.status,
        'priority_score', l.priority_score,
        'created_at', l.created_at
      )
    ), '[]'::jsonb)
    INTO v_next_buffer
    FROM (
      SELECT *
      FROM public.leads l
      WHERE l.workspace_id = p_workspace_id
        AND l.status NOT IN ('CALL','QUALIFIED','BOOKED','CLOSED','SKIP')
      ORDER BY
        l.priority_score DESC NULLS LAST,
        l.created_at ASC,
        l.id ASC
      LIMIT 8
    ) l;

    -- No consumption occurred => no epoch bump. Return epoch as null so the client can decide.
    RETURN jsonb_build_object(
      'epoch', NULL,
      'next_buffer', v_next_buffer,
      'consumed_id', p_lead_id,
      'next_lead_id', v_next_lead_id,
      'idempotent', true
    );
  END IF;

  -- 2) Append causality event (epoch comes from lead_events.id)
  INSERT INTO public.lead_events (
    workspace_id,
    lead_id,
    event_type,
    payload
  )
  VALUES (
    p_workspace_id,
    p_lead_id::text,
    'LEAD_ADVANCED',
    jsonb_build_object('action_type', p_action_type)
  )
  RETURNING id INTO v_epoch;

  -- 3) Deterministic next buffer (projection)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id_uuid', l.id_uuid,
      'id', l.id,
      'full_name', l.full_name,
      'phone', l.phone,
      'email', l.email,
      'status', l.status,
      'priority_score', l.priority_score,
      'created_at', l.created_at
    )
  ), '[]'::jsonb)
  INTO v_next_buffer
  FROM (
    SELECT *
    FROM public.leads l
    WHERE l.workspace_id = p_workspace_id
      AND l.status NOT IN ('CALL','QUALIFIED','BOOKED','CLOSED','SKIP')
    ORDER BY
      l.priority_score DESC NULLS LAST,
      l.created_at ASC,
      l.id ASC
    LIMIT 8
  ) l;

  -- 4) Deterministic next lead pointer (first item)
  SELECT l.id_uuid
  INTO v_next_lead_id
  FROM public.leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.status NOT IN ('CALL','QUALIFIED','BOOKED','CLOSED','SKIP')
  ORDER BY
    l.priority_score DESC NULLS LAST,
    l.created_at ASC,
    l.id ASC
  LIMIT 1;

  RETURN jsonb_build_object(
    'epoch', v_epoch,
    'next_buffer', v_next_buffer,
    'consumed_id', p_lead_id,
    'next_lead_id', v_next_lead_id,
    'idempotent', false
  );
END;
$$;


ALTER FUNCTION "public"."advance_lead_legacy_direct"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_action_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."bootstrap_user_workspace"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_workspace_id uuid;
begin
  -- Create tenant root
  insert into public.workspaces (name, created_by)
  values ('Workspace', new.id)
  returning id into v_workspace_id;

  -- Create user ↔ workspace mapping
  insert into public.profiles (user_id, workspace_id, role)
  values (new.id, v_workspace_id, 'owner');

  return new;
end;
$$;


ALTER FUNCTION "public"."bootstrap_user_workspace"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_lead_urgency"("p_next_follow_up_at" timestamp with time zone, "p_stage_updated_at" timestamp with time zone, "p_status" "text") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
declare
  score integer := 0;
  hours_since_activity numeric;
  v_status text := lower(coalesce(p_status, ''));
begin
  -- If stage_updated_at is missing, treat as very stale
  if p_stage_updated_at is null then
    hours_since_activity := 999999;
  else
    hours_since_activity := extract(epoch from (now() - p_stage_updated_at)) / 3600;
  end if;

  -- Rule 1: overdue follow-up
  if p_next_follow_up_at is not null and p_next_follow_up_at < now() then
    score := score + 50;
  end if;

  -- Rule 2: no follow-up scheduled
  if p_next_follow_up_at is null then
    score := score + 15;
  end if;

  -- Rule 3: time decay from last activity
  if hours_since_activity < 24 then
    score := score + 5;
  elsif hours_since_activity < 72 then
    score := score + 10;
  else
    score := score + 20;
  end if;

  -- Rule 4: status modifiers
  case v_status
    when 'new' then score := score + 5;
    when 'contacted' then score := score + 10;
    when 'qualified' then score := score + 20;
    when 'booked' then score := score + 5;
    when 'closed' then score := 0;
    when '' then score := score + 5;
    else score := score + 5;
  end case;

  return score;
end;
$$;


ALTER FUNCTION "public"."calculate_lead_urgency"("p_next_follow_up_at" timestamp with time zone, "p_stage_updated_at" timestamp with time zone, "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_next_dial_window"("attempts" integer) RETURNS interval
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
begin
  return case 
    when attempts = 1 then interval '15 minutes'
    when attempts = 2 then interval '2 hours'
    when attempts = 3 then interval '8 hours'
    else interval '24 hours'
  end;
end;
$$;


ALTER FUNCTION "public"."calculate_next_dial_window"("attempts" integer) OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."leads_lead_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."leads_lead_number_seq" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" bigint NOT NULL,
    "lead_code" "text",
    "full_name" "text",
    "phone" "text" NOT NULL,
    "email" "text",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "workspace_id" "uuid" NOT NULL,
    "assigned_to" "uuid",
    "source" "text",
    "last_contacted_at" timestamp with time zone,
    "next_follow_up_at" timestamp with time zone,
    "priority" "text" DEFAULT 'low'::"text" NOT NULL,
    "stage_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "appointment_at" timestamp with time zone,
    "appointment_status" "text" DEFAULT 'Scheduled'::"text",
    "assigned_until" timestamp with time zone,
    "priority_score" numeric DEFAULT 0,
    "pipeline_stage_id" "uuid",
    "id_uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "first_name" "text",
    "last_name" "text",
    "score" integer DEFAULT 0,
    "lead_number" bigint DEFAULT "nextval"('"public"."leads_lead_number_seq"'::"regclass"),
    "request_id" "uuid",
    "pipeline_id" "uuid",
    "advance_request_id" "uuid",
    "stage" "text" DEFAULT 'NEW'::"text",
    "sla_status" "text" DEFAULT 'COMPLIANT'::"text",
    "claimed_at" timestamp with time zone,
    "sla_expires_at" timestamp with time zone,
    "conversion_score" integer DEFAULT 50,
    "intent_tags" "text"[] DEFAULT '{}'::"text"[],
    "attempt_count" integer DEFAULT 0,
    "next_eligible_dial_at" timestamp with time zone DEFAULT "now"(),
    "priority_weight" integer DEFAULT 100,
    CONSTRAINT "leads_appointment_status_check" CHECK ((("appointment_status" = ANY (ARRAY['Scheduled'::"text", 'Completed'::"text", 'No Show'::"text", 'Cancelled'::"text"])) OR ("appointment_status" IS NULL))),
    CONSTRAINT "leads_workspace_required" CHECK (("workspace_id" IS NOT NULL))
);

ALTER TABLE ONLY "public"."leads" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."call_lead"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_status" "text" DEFAULT 'contacted'::"text") RETURNS "public"."leads"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_now timestamptz := now();
  v_default_follow_up_at timestamptz := v_now + interval '24 hours';
  v_lead public.leads;
begin
  -- Workspace membership check (prevents updating leads in arbitrary workspaces)
  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Not a workspace member';
  end if;

  select *
    into v_lead
  from public.leads
  where workspace_id = p_workspace_id
    and id_uuid = p_lead_id
  for update;
  if v_lead.id_uuid is null then
    raise exception 'Lead not found';
  end if;
  if lower(coalesce(v_lead.status,'')) = 'closed' then
    raise exception 'Cannot call a closed lead';
  end if;
  update public.leads
     set status = coalesce(p_status, v_lead.status),
         stage_updated_at = v_now,
         last_contacted_at = v_now,
         next_follow_up_at = coalesce(v_lead.next_follow_up_at, v_default_follow_up_at),
         updated_at = v_now
   where workspace_id = p_workspace_id
     and id_uuid = p_lead_id
  returning * into v_lead;
  return v_lead;
end;
$$;


ALTER FUNCTION "public"."call_lead"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_pipeline"("p_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_limit int;
  v_count int;
begin
  select wps.pipeline_limit
    into v_limit
  from public.workspace_plan_status wps
  where wps.workspace_id = p_workspace_id
    and wps.is_active = true
  limit 1;

  if v_limit is null then
    return false;
  end if;

  select count(*)
    into v_count
  from public.pipelines p
  where p.workspace_id = p_workspace_id;

  return v_count < v_limit;
end;
$$;


ALTER FUNCTION "public"."can_create_pipeline"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_insert_lead"("p_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_limit int;
  v_count int;
begin
  select wps.lead_limit
    into v_limit
  from public.workspace_plan_status wps
  where wps.workspace_id = p_workspace_id
    and wps.is_active = true
  limit 1;

  if v_limit is null then
    return false;
  end if;

  select count(*)
    into v_count
  from public.leads l
  where l.workspace_id = p_workspace_id
    and l.archived = false;

  return v_count < v_limit;
end;
$$;


ALTER FUNCTION "public"."can_insert_lead"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."change_lead_stage"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_new_stage" "text", "p_request_id" "text" DEFAULT NULL::"text", "p_idempotency_key" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_old_stage text;
  v_new_stage text := p_new_stage;
BEGIN
  -- 1) AUTHZ: workspace membership
  IF NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.workspace_id = p_workspace_id
  ) THEN
    RAISE EXCEPTION 'Not a workspace member';
  END IF;

  -- 2) LOCK + VERIFY LEAD OWNERSHIP (tenant safety)
  SELECT l.status
  INTO v_old_stage
  FROM public.leads l
  WHERE l.id = p_lead_id
    AND l.workspace_id = p_workspace_id
  FOR UPDATE;

  IF v_old_stage IS NULL THEN
    RAISE EXCEPTION 'Lead not found in workspace';
  END IF;

  -- 2b) No-op guard (recommended)
  IF v_old_stage = v_new_stage THEN
    -- If you prefer "emit anyway", tell me and we’ll remove this block.
    RETURN;
  END IF;

  -- 3) UPDATE STATE
  UPDATE public.leads
  SET status = v_new_stage,
      stage_updated_at = now(),
      updated_at = now()
  WHERE id = p_lead_id
    AND workspace_id = p_workspace_id;

  -- 4) EMIT STRUCTURED TRANSITION EVENT (append-only ledger)
  INSERT INTO public.lead_transition_log (
    lead_id,
    workspace_id,
    from_state,
    to_state,
    event_type,
    request_id,
    idempotency_key,
    created_at
  )
  VALUES (
    p_lead_id,
    p_workspace_id,
    v_old_stage,
    v_new_stage,
    'lead.stage_changed',
    p_request_id,
    p_idempotency_key,
    now()
  );
END;
$$;


ALTER FUNCTION "public"."change_lead_stage"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_new_stage" "text", "p_request_id" "text", "p_idempotency_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_batch_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_batch_size" integer, "p_lease_minutes" integer) RETURNS TABLE("lead_id" bigint, "queue_id" bigint, "priority_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT q.id
    FROM public.lead_queue q
    WHERE q.workspace_id = p_workspace_id
      AND q.status = 'ready'
      AND (q.assigned_until IS NULL OR q.assigned_until < now())
    ORDER BY q.priority_score DESC, q.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  )
  UPDATE public.lead_queue q
  SET
    status = 'claimed',
    assigned_to = p_actor_id,
    assigned_until = now() + (p_lease_minutes || ' minutes')::interval,
    claimed_at = now(),
    updated_at = now()
  FROM candidates c
  WHERE q.id = c.id
  RETURNING q.lead_id, q.id, q.priority_score;
END;
$$;


ALTER FUNCTION "public"."claim_batch_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_batch_size" integer, "p_lease_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  v_success boolean;
BEGIN
  -- Ensure the row exists (optional approach shown below)
  -- If you prefer "row-priming" during lead insert, tell me and we’ll remove this.
  INSERT INTO public.crm_workspace_lead_claims (
    workspace_id, lead_id, lock_owner, claimed_at, expires_at
  )
  VALUES (
    p_workspace_id, p_lead_id, NULL, now(), NULL
  )
  ON CONFLICT (workspace_id, lead_id) DO NOTHING;

  UPDATE public.crm_workspace_lead_claims
  SET
    lock_owner = p_user_id,
    claimed_at = now(),
    expires_at = now() + interval '15 minutes'
  WHERE
    workspace_id = p_workspace_id
    AND lead_id = p_lead_id
    AND (
      lock_owner IS NULL
      OR expires_at < now()
    )
  RETURNING true INTO v_success;

  RETURN COALESCE(v_success, false);
END;
$$;


ALTER FUNCTION "public"."claim_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_live_call"("p_call_sid" "text", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_updated_rows integer;
begin
  update public.interaction_logs
  set status = 'in_progress',
      claimed_by = p_user_id,
      claimed_at = now()
  where external_call_sid = p_call_sid
    and status = 'ringing'
    and claimed_by is null;

  get diagnostics v_updated_rows = row_count;

  if v_updated_rows = 1 then
    return true;
  else
    return false;
  end if;
end;
$$;


ALTER FUNCTION "public"."claim_live_call"("p_call_sid" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_automation_job"("p_max_jobs_per_call" integer DEFAULT 1) RETURNS TABLE("id" "uuid", "workspace_id" "uuid", "job_type" "text", "status" "text", "retry_count" integer, "max_attempts" integer, "locked_at" timestamp with time zone, "locked_by" "uuid", "payload" "jsonb", "completed_at" timestamp with time zone, "failed_at" timestamp with time zone, "error_message" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
BEGIN
  RETURN QUERY
  WITH cte AS (
    SELECT j.*
    FROM public.automation_jobs j
    WHERE j.status = 'queued'
      AND j.retry_count < j.max_attempts
    ORDER BY j.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT COALESCE(p_max_jobs_per_call, 1)
  ), upd AS (
    UPDATE public.automation_jobs j
    SET
      status = 'processing',
      retry_count = j.retry_count + 1,
      locked_at = now(),
      locked_by = auth.uid(),
      error_message = NULL,
      updated_at = now()
    FROM cte
    WHERE j.id = cte.id
    RETURNING
      j.id, j.workspace_id, j.job_type, j.status,
      j.retry_count, j.max_attempts,
      j.locked_at, j.locked_by,
      j.payload,
      j.completed_at, j.failed_at, j.error_message
  )
  SELECT * FROM upd;
END;
$$;


ALTER FUNCTION "public"."claim_next_automation_job"("p_max_jobs_per_call" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."queue_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "run_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "claimed_by" "uuid",
    "lease_expires_at" timestamp with time zone,
    "attempt_no" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 5 NOT NULL,
    "priority" integer DEFAULT 1000 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "job_key" "text",
    CONSTRAINT "queue_jobs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'leased'::"text", 'running'::"text", 'success'::"text", 'failed'::"text", 'dead'::"text"])))
);


ALTER TABLE "public"."queue_jobs" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_job"("p_workspace_id" "uuid", "p_worker_id" "uuid", "p_lease_seconds" integer DEFAULT 45) RETURNS "public"."queue_jobs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_job public.queue_jobs%ROWTYPE;
BEGIN
  -- 1) Atomically pick a due, eligible job (and lock it)
  SELECT q.*
  INTO v_job
  FROM public.queue_jobs q
  WHERE q.workspace_id = p_workspace_id
    AND q.run_at <= now()
    AND q.status IN ('queued','failed')
    AND q.attempt_no < q.max_attempts
    AND (
      q.lease_expires_at IS NULL OR q.lease_expires_at < now()
    )
  ORDER BY q.priority ASC, q.run_at ASC, q.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_job.id IS NULL THEN
    -- no due job
    RETURN NULL;
  END IF;

  -- 2) Mark it leased (lease provides concurrency safety)
  UPDATE public.queue_jobs
  SET
    status = 'leased',
    claimed_by = p_worker_id,
    lease_expires_at = now() + make_interval(secs => p_lease_seconds),
    attempt_no = attempt_no + 1,
    updated_at = now()
  WHERE id = v_job.id
    AND workspace_id = p_workspace_id
    AND run_at <= now();

  -- 3) Return latest row
  SELECT * INTO v_job FROM public.queue_jobs WHERE id = v_job.id;
  RETURN v_job;
END;
$$;


ALTER FUNCTION "public"."claim_next_job"("p_workspace_id" "uuid", "p_worker_id" "uuid", "p_lease_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_job_global"("p_worker_id" "uuid", "p_lease_seconds" integer) RETURNS SETOF "public"."queue_jobs"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
BEGIN
  RETURN QUERY
  WITH eligible AS (
    SELECT q.*
    FROM public.queue_jobs q
    WHERE
      q.run_at <= now()
      AND q.status IN ('queued','failed')
      AND q.attempt_no < q.max_attempts
      AND (
        q.lease_expires_at IS NULL
        OR q.lease_expires_at <= now()
      )
  ),
  ranked AS (
    SELECT
      e.*,
      row_number() OVER (
        PARTITION BY e.workspace_id
        ORDER BY e.run_at ASC, e.created_at ASC
      ) AS local_rank
    FROM eligible e
  ),
  picked AS (
    SELECT r.id
    FROM ranked r
    ORDER BY r.local_rank ASC, r.run_at ASC, r.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.queue_jobs q
  SET
    status = 'leased',
    claimed_by = p_worker_id,
    lease_expires_at = now() + (p_lease_seconds || ' seconds')::interval,
    updated_at = now()
  FROM picked p
  WHERE q.id = p.id
  RETURNING q.*;
END;
$$;


ALTER FUNCTION "public"."claim_next_job_global"("p_worker_id" "uuid", "p_lease_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_lead"("workspace_uuid" "uuid", "agent_uuid" "uuid") RETURNS SETOF "public"."leads"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  update leads
  set assigned_to_agent_id = agent_uuid,
      status = 'claimed'
  where id = (
    select id from leads
    where workspace_id = workspace_uuid
      and (assigned_to_agent_id is null or assigned_to_agent_id='')
      and status='new'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
end;
$$;


ALTER FUNCTION "public"."claim_next_lead"("workspace_uuid" "uuid", "agent_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_lead_balanced"("workspace_uuid" "uuid", "agent_uuid" "uuid") RETURNS SETOF "public"."leads"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  target_lead_id uuid;
  is_agent_blocked boolean;
begin

  -- Workspace authorization
  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_uuid
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Not a workspace member';
  end if;

  -- Prevent agent double claiming
  select exists (
    select 1
    from public.leads
    where workspace_id = workspace_uuid
      and assigned_to = agent_uuid
      and status = 'claimed'
  )
  into is_agent_blocked;

  if is_agent_blocked then
    raise exception 'Agent session blocked. Please complete existing wrap workflows before claiming.';
  end if;

  select id
  into target_lead_id
  from public.leads
  where workspace_id = workspace_uuid
    and status = 'new'
    and assigned_to is null
  order by priority_weight desc, created_at asc
  limit 1
  for update skip locked;

  if target_lead_id is not null then
    return query
    update public.leads
    set
      status = 'claimed',
      assigned_to = agent_uuid,
      claimed_at = now(),
      updated_at = now()
    where id = target_lead_id
      and workspace_id = workspace_uuid
    returning *;
  end if;

end;
$$;


ALTER FUNCTION "public"."claim_next_lead_balanced"("workspace_uuid" "uuid", "agent_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_one_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_lease_minutes" integer) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_lead_id bigint;
begin
  select l.id
  into v_lead_id
  from public.leads l
  where l.workspace_id = p_workspace_id
    and l.archived = false
    and (l.assigned_until is null or l.assigned_until < now())
  order by l.priority_score desc, l.created_at asc
  for update skip locked
  limit 1;

  if v_lead_id is null then
    return null;
  end if;

  update public.leads
  set assigned_to = p_actor_id,
      assigned_until = now() + (p_lease_minutes || ' minutes')::interval
  where id = v_lead_id;

  return v_lead_id;
end;
$$;


ALTER FUNCTION "public"."claim_one_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_lease_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_workspace_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  INSERT INTO public.crm_workspace_lead_claims (
    workspace_id,
    lead_id,
    lock_owner,
    claimed_at,
    expires_at
  )
  VALUES (
    p_workspace_id,
    p_lead_id,
    p_user_id,
    now(),
    now() + interval '15 minutes'
  )
  ON CONFLICT (workspace_id, lead_id)
  DO UPDATE SET
    lock_owner = EXCLUDED.lock_owner,
    claimed_at = EXCLUDED.claimed_at,
    expires_at = EXCLUDED.expires_at
  WHERE
    public.crm_workspace_lead_claims.lock_owner IS NULL
    OR public.crm_workspace_lead_claims.expires_at < now();

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."claim_workspace_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_workspace_lock"("p_workspace_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  v_success boolean;
BEGIN
  UPDATE public.crm_workspace_claims
  SET
    lock_owner = p_user_id::text,
    locked_at = now(),
    expires_at = now() + interval '15 minutes'
  WHERE
    workspace_id = p_workspace_id
    AND (
      lock_owner IS NULL
      OR expires_at < now()
    )
  RETURNING true INTO v_success;

  RETURN COALESCE(v_success, false);
END;
$$;


ALTER FUNCTION "public"."claim_workspace_lock"("p_workspace_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_lead_dashboard_row"("p_lead_id" bigint) RETURNS TABLE("id" bigint, "full_name" "text", "phone" "text", "last_call_outcome" "text", "next_follow_up_at" timestamp with time zone, "priority_score" numeric, "queue_bucket" "text", "next_best_action" "text", "archived" boolean)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
with l as (
  select
    id,
    full_name,
    phone,
    last_contacted_at,
    next_follow_up_at,
    appointment_at,
    appointment_status,
    archived
  from public.leads
  where id = p_lead_id
),
last_call as (
  select
    lead_id,
    outcome as last_call_outcome
  from public.call_logs
  where lead_id = p_lead_id
  order by created_at desc
  limit 1
)
select
  l.id,
  l.full_name,
  l.phone,
  lc.last_call_outcome,
  l.next_follow_up_at,
  (
    coalesce(
      case lc.last_call_outcome
        when 'answered' then -20
        when 'left_message' then 10
        when 'busy' then 5
        when 'voicemail' then 15
        when 'no_answer' then 25
        else 0
      end,
      0
    )
    +
    case
      when l.appointment_at is not null
        and l.appointment_status = 'Scheduled'
        and l.appointment_at > now()
      then greatest(
        0,
        24 - extract(epoch from (l.appointment_at - now()))/3600
      )
      else 0
    end
  )::numeric as priority_score,
  case
    when l.appointment_at is not null
      and l.appointment_status = 'Scheduled'
      and l.appointment_at <= now() + interval '4 hours'
    then 'appointments'
    when lc.last_call_outcome in ('no_answer','voicemail')
    then 'call_now'
    when lc.last_call_outcome in ('left_message','busy')
    then 'today'
    else 'later'
  end as queue_bucket,
  case
    when l.appointment_at is not null
      and l.appointment_status = 'Scheduled'
      and l.appointment_at <= now() + interval '4 hours'
    then 'confirm_appointment'
    when lc.last_call_outcome = 'no_answer'
    then 'call_now'
    when lc.last_call_outcome = 'voicemail'
    then 'follow_up'
    when lc.last_call_outcome = 'busy'
    then 'wait'
    else 'call_now'
  end as next_best_action,
  l.archived
from l
left join last_call lc on lc.lead_id = l.id;
$$;


ALTER FUNCTION "public"."compute_lead_dashboard_row"("p_lead_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_priority_score"("p_lead_id" bigint) RETURNS numeric
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
declare
  v_score numeric := 0;
  v_last_outcome text;
  v_appointment_at timestamptz;
  v_appointment_status text;
begin
  select l.appointment_at, l.appointment_status
  into v_appointment_at, v_appointment_status
  from public.leads l
  where l.id = p_lead_id;

  select c.outcome
  into v_last_outcome
  from public.call_logs c
  where c.lead_id = p_lead_id
  order by c.created_at desc
  limit 1;

  v_score :=
    case v_last_outcome
      when 'answered' then -20
      when 'left_message' then 10
      when 'busy' then 5
      when 'voicemail' then 15
      when 'no_answer' then 25
      else 0
    end;

  if v_appointment_at is not null
     and v_appointment_status = 'Scheduled'
     and v_appointment_at > now() then

    v_score := v_score +
      greatest(0, 24 - extract(epoch from (v_appointment_at - now()))/3600);
  end if;

  return v_score;
end;
$$;


ALTER FUNCTION "public"."compute_priority_score"("p_lead_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_queue_priority"("p_lead_id" bigint) RETURNS numeric
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
DECLARE
  v_outcome text;
BEGIN
  SELECT c.outcome
    INTO v_outcome
  FROM public.call_logs c
  WHERE c.lead_id = p_lead_id
  ORDER BY c.created_at DESC
  LIMIT 1;

  RETURN (
    CASE v_outcome
      WHEN 'answered' THEN -20
      WHEN 'left_message' THEN 10
      WHEN 'busy' THEN 5
      WHEN 'voicemail' THEN 15
      WHEN 'no_answer' THEN 25
      ELSE 0
    END
  );
END;
$$;


ALTER FUNCTION "public"."compute_queue_priority"("p_lead_id" bigint) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint,
    "source_estimate_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "name" "text" NOT NULL,
    "contract_value" numeric NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "crm_jobs_contract_value_check" CHECK (("contract_value" >= (0)::numeric)),
    CONSTRAINT "crm_jobs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."crm_jobs" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_estimate_to_job"("p_estimate_id" "uuid") RETURNS "public"."crm_jobs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  v_user_id uuid;
  v_estimate public.estimates%rowtype;
  v_job public.crm_jobs%rowtype;
  v_lead_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_estimate
  from public.estimates e
  where e.id = p_estimate_id
  for update;

  if not found then
    raise exception 'Estimate not found';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_estimate.workspace_id
      and wm.user_id = v_user_id
  ) then
    raise exception 'Estimate not found';
  end if;

  if v_estimate.status <> 'accepted' then
    raise exception 'Only accepted estimates can be converted';
  end if;

  if exists (
    select 1 from public.crm_jobs j
    where j.source_estimate_id = v_estimate.id
  ) then
    raise exception 'Estimate has already been converted';
  end if;

  if v_estimate.lead_id is not null then
    select coalesce(
      nullif(btrim(l.full_name), ''),
      nullif(btrim(concat_ws(' ', l.first_name, l.last_name)), '')
    )
    into v_lead_name
    from public.leads l
    where l.id = v_estimate.lead_id
      and l.workspace_id = v_estimate.workspace_id;
  end if;

  insert into public.crm_jobs (
    workspace_id,
    lead_id,
    source_estimate_id,
    status,
    name,
    contract_value,
    created_by
  ) values (
    v_estimate.workspace_id,
    v_estimate.lead_id,
    v_estimate.id,
    'pending',
    case when v_lead_name is not null then v_lead_name || ' Job' else 'HLC Job' end,
    v_estimate.total,
    v_user_id
  )
  returning * into v_job;

  update public.estimates
  set status = 'converted',
      converted_to_job_at = now()
  where id = v_estimate.id;

  return v_job;
end;
$$;


ALTER FUNCTION "public"."convert_estimate_to_job"("p_estimate_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_lead_if_under_limit"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_full_name" "text", "p_email" "text", "p_pipeline_stage_id" "uuid") RETURNS TABLE("id" "uuid", "workspace_id" "uuid", "user_id" "uuid", "full_name" "text", "email" "text", "pipeline_stage_id" "uuid", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_limit int;
  v_count int;
begin
  -- 🔒 Serialize enforcement per workspace (prevents parallel bypass)
  perform pg_advisory_xact_lock(hashtext(p_workspace_id::text));

  -- 🔒 Fail-closed entitlement check
  select lead_limit
  into v_limit
  from workspace_plan_status
  where workspace_id = p_workspace_id
    and is_active = true;

  if v_limit is null then
    -- includes: missing entitlement row OR inactive plan
    raise exception 'ENTITLEMENT_NOT_FOUND_OR_INACTIVE';
  end if;

  -- Count current active leads
  select count(*)
  into v_count
  from leads_new
  where workspace_id = p_workspace_id
    and archived = false;

  if v_count >= v_limit then
    raise exception 'LEAD_LIMIT_REACHED';
  end if;

  return query
  insert into leads_new (
    workspace_id,
    user_id,
    full_name,
    email,
    pipeline_stage_id,
    archived,
    stage_updated_at,
    updated_at
  )
  values (
    p_workspace_id,
    p_user_id,
    p_full_name,
    p_email,
    p_pipeline_stage_id,
    false,
    now(),
    now()
  )
  returning
    id,
    workspace_id,
    user_id,
    full_name,
    email,
    pipeline_stage_id,
    created_at;
end;
$$;


ALTER FUNCTION "public"."create_lead_if_under_limit"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_full_name" "text", "p_email" "text", "p_pipeline_stage_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_workspace_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  SELECT wm.workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid()
  ORDER BY wm.created_at ASC
  LIMIT 1
$$;


ALTER FUNCTION "public"."current_workspace_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "text", "_event_type" "text", "_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.activity_log (
    workspace_id,
    entity_type,
    entity_id,
    event_type,
    payload
  )
  values (
    _workspace_id,
    _entity_type,
    _entity_id,
    _event_type,
    coalesce(_payload, '{}'::jsonb)
  );
end;
$$;


ALTER FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "text", "_event_type" "text", "_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "uuid", "_event_type" "text", "_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.activity_log (
    workspace_id,
    entity_type,
    entity_id,
    event_type,
    payload
  ) values (
    _workspace_id,
    _entity_type,
    _entity_id,
    _event_type,
    coalesce(_payload, '{}'::jsonb)
  );
end;
$$;


ALTER FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "uuid", "_event_type" "text", "_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_lead_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_events (
      lead_id,
      workspace_id,
      event_type,
      payload
    )
    VALUES (
      NEW.id::text,
      NEW.workspace_id,
      'lead.created',
      jsonb_build_object(
        'status', NEW.status,
        'pipeline_id', NEW.pipeline_id
      )
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.lead_events (
      lead_id,
      workspace_id,
      event_type,
      payload
    )
    VALUES (
      OLD.id::text,
      OLD.workspace_id,
      'lead.deleted',
      jsonb_build_object(
        'status', OLD.status
      )
    );
    RETURN OLD;
  END IF;

  -- UPDATE
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.lead_events (
      lead_id,
      workspace_id,
      event_type,
      payload
    )
    VALUES (
      NEW.id::text,
      NEW.workspace_id,
      'lead.status_changed',
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'pipeline_id', NEW.pipeline_id
      )
    );
  ELSE
    INSERT INTO public.lead_events (
      lead_id,
      workspace_id,
      event_type,
      payload
    )
    VALUES (
      NEW.id::text,
      NEW.workspace_id,
      'lead.updated',
      jsonb_build_object(
        'lead_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."emit_lead_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_lead_stage_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  old_index int;
  new_index int;
BEGIN
  -- Defensive normalization (should already be handled by the UPDATE above)
  IF OLD.status IS NULL THEN
    OLD.status := 'New';
  END IF;

  -- Map statuses to pipeline order
  old_index := CASE OLD.status
    WHEN 'New' THEN 1
    WHEN 'Contacted' THEN 2
    WHEN 'Qualified' THEN 3
    WHEN 'Booked' THEN 4
    WHEN 'Closed' THEN 5
    ELSE NULL
  END;

  new_index := CASE NEW.status
    WHEN 'New' THEN 1
    WHEN 'Contacted' THEN 2
    WHEN 'Qualified' THEN 3
    WHEN 'Booked' THEN 4
    WHEN 'Closed' THEN 5
    ELSE NULL
  END;

  -- Fail fast on invalid statuses
  IF old_index IS NULL THEN
    RAISE EXCEPTION 'Invalid existing lead status: %', OLD.status;
  END IF;

  IF new_index IS NULL THEN
    RAISE EXCEPTION 'Invalid lead status: %', NEW.status;
  END IF;

  -- Forward-only enforcement
  IF new_index < old_index THEN
    RAISE EXCEPTION 'Invalid stage transition: % -> %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_lead_stage_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_lead"("p_lead_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_workspace_id uuid;
  v_priority numeric;
BEGIN
  -- Resolve workspace from leads (queue row is workspace-scoped)
  SELECT l.workspace_id
    INTO v_workspace_id
  FROM public.leads l
  WHERE l.id = p_lead_id;

  -- If lead doesn't exist, do nothing
  IF v_workspace_id IS NULL THEN
    RETURN;
  END IF;

  v_priority := public.compute_queue_priority(p_lead_id);

  INSERT INTO public.lead_queue (
    lead_id,
    workspace_id,
    priority_score,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_lead_id,
    v_workspace_id,
    v_priority,
    'ready',
    now(),
    now()
  )
  ON CONFLICT (lead_id)
  DO UPDATE SET
    -- Freeze once claimed to avoid reshuffling an in-flight lease
    priority_score = CASE
      WHEN public.lead_queue.status = 'claimed' THEN public.lead_queue.priority_score
      ELSE EXCLUDED.priority_score
    END,

    status = CASE
      WHEN public.lead_queue.status = 'claimed' THEN public.lead_queue.status
      ELSE 'ready'
    END,

    -- Keep assigned lease stable for claimed rows; refresh timestamps otherwise
    assigned_to = CASE
      WHEN public.lead_queue.status = 'claimed' THEN public.lead_queue.assigned_to
      ELSE NULL
    END,
    assigned_until = CASE
      WHEN public.lead_queue.status = 'claimed' THEN public.lead_queue.assigned_until
      ELSE NULL
    END,

    claimed_at = CASE
      WHEN public.lead_queue.status = 'claimed' THEN public.lead_queue.claimed_at
      ELSE NULL
    END,

    updated_at = now();
END;
$$;


ALTER FUNCTION "public"."enqueue_lead"("p_lead_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_lead_job"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
begin
  insert into public.queue_jobs (
    workspace_id,
    job_type,
    payload,
    status,
    run_at
  ) values (
    new.workspace_id,
    'dial_lead',
    jsonb_build_object('lead_id', new.id),
    'queued',
    now()
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."enqueue_lead_job"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.queue_jobs (workspace_id, job_type, payload, job_key, status, run_at, priority)
  values (
    p_workspace_id,
    'route_lead',
    jsonb_build_object('lead_id', p_lead_id, 'workspace_id', p_workspace_id),
    (p_workspace_id::text || ':' || p_lead_id::text),
    'queued',
    now(),
    1000
  )
  on conflict on constraint queue_jobs_job_key_uq
  do nothing;

exception
  when undefined_table then
    perform public.route_lead(p_workspace_id, p_lead_id);
end;
$$;


ALTER FUNCTION "public"."enqueue_route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_lead_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  if new.lead_code is null then
    new.lead_code := 'HL-' || lpad(new.id::text, 4, '0');
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."generate_lead_code"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pipelines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."pipelines" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."pipelines" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pipeline_usage" WITH ("security_invoker"='on') AS
 SELECT "workspace_id",
    "count"(*) AS "pipeline_count"
   FROM "public"."pipelines" "p"
  GROUP BY "workspace_id";


ALTER VIEW "public"."pipeline_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_plan_status" (
    "workspace_id" "uuid" NOT NULL,
    "plan_key" "text" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "status" "text" DEFAULT 'free'::"text" NOT NULL,
    "lead_limit" integer DEFAULT 0 NOT NULL,
    "pipeline_limit" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "current_period_end" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workspace_plan_status" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."workspace_usage" WITH ("security_invoker"='on') AS
 SELECT "workspace_id",
    "count"(*) FILTER (WHERE ("archived" = false)) AS "active_leads"
   FROM "public"."leads" "l"
  GROUP BY "workspace_id";


ALTER VIEW "public"."workspace_usage" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."workspace_billing_state" WITH ("security_invoker"='on') AS
 SELECT "wps"."workspace_id",
    "wps"."plan_key",
    "wps"."lead_limit",
    "wps"."is_active",
    COALESCE("wu"."active_leads", (0)::bigint) AS "active_leads",
    ("wps"."lead_limit" - COALESCE("wu"."active_leads", (0)::bigint)) AS "leads_remaining",
    ((COALESCE("wps"."lead_limit", 0) - COALESCE("wu"."active_leads", (0)::bigint)) <= 0) AS "limit_reached"
   FROM ("public"."workspace_plan_status" "wps"
     LEFT JOIN "public"."workspace_usage" "wu" ON (("wu"."workspace_id" = "wps"."workspace_id")));


ALTER VIEW "public"."workspace_billing_state" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."workspace_pipeline_billing_state" WITH ("security_invoker"='on') AS
 SELECT "wps"."workspace_id",
    "wps"."plan_key",
    "wps"."pipeline_limit",
    "wps"."is_active",
    COALESCE("up"."pipeline_count", (0)::bigint) AS "pipeline_count",
    ("wps"."pipeline_limit" - COALESCE("up"."pipeline_count", (0)::bigint)) AS "pipelines_remaining",
    ((COALESCE("wps"."pipeline_limit", 0) - COALESCE("up"."pipeline_count", (0)::bigint)) <= 0) AS "limit_reached"
   FROM ("public"."workspace_plan_status" "wps"
     LEFT JOIN "public"."pipeline_usage" "up" ON (("up"."workspace_id" = "wps"."workspace_id")));


ALTER VIEW "public"."workspace_pipeline_billing_state" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."workspace_billing_pressure" WITH ("security_invoker"='on') AS
 SELECT COALESCE("l"."workspace_id", "p"."workspace_id") AS "workspace_id",
    COALESCE("l"."active_leads", (0)::bigint) AS "active_leads",
    COALESCE("l"."lead_limit", 0) AS "lead_limit",
    COALESCE("l"."leads_remaining", (0)::bigint) AS "leads_remaining",
    COALESCE("l"."limit_reached", false) AS "leads_limit_reached",
    COALESCE("p"."pipeline_count", (0)::bigint) AS "pipeline_count",
    COALESCE("p"."pipeline_limit", 0) AS "pipeline_limit",
    COALESCE("p"."pipelines_remaining", (0)::bigint) AS "pipelines_remaining",
    COALESCE("p"."limit_reached", false) AS "pipelines_limit_reached",
    (COALESCE("l"."limit_reached", false) OR COALESCE("p"."limit_reached", false)) AS "upgrade_needed"
   FROM ("public"."workspace_billing_state" "l"
     FULL JOIN "public"."workspace_pipeline_billing_state" "p" ON (("p"."workspace_id" = "l"."workspace_id")));


ALTER VIEW "public"."workspace_billing_pressure" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_billing_pressure"("p_workspace_id" "uuid") RETURNS SETOF "public"."workspace_billing_pressure"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select *
  from public.workspace_billing_pressure
  where workspace_id = p_workspace_id;
$$;


ALTER FUNCTION "public"."get_billing_pressure"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
select jsonb_build_object(
  'metrics', (
    select jsonb_build_object(
      'hot', count(*) filter (where l.status = 'Hot'),
      'active', count(*) filter (where l.status = 'Active'),
      'cold', count(*) filter (where l.status = 'Cold'),

      'appointments_today', count(*) filter (
        where l.appointment_at::date = current_date
          and l.appointment_status = 'Scheduled'
      ),

      'needs_attention', count(*) filter (
        where l.next_follow_up_at < now()
           or (l.appointment_at < now() and l.appointment_status = 'Scheduled')
      )
    )
    from public.leads l
    where l.workspace_id = p_workspace_id
      and l.archived = false
  ),

  'needs_attention', (
    select coalesce(jsonb_agg(x), '[]'::jsonb)
    from (
      select
        l.id as lead_id,
        l.full_name,
        l.status,
        l.next_follow_up_at,
        l.appointment_at
      from public.leads l
      where l.workspace_id = p_workspace_id
        and l.archived = false
        and (
          l.next_follow_up_at < now()
          or (l.appointment_at < now() and l.appointment_status = 'Scheduled')
        )
      order by l.next_follow_up_at asc nulls last
      limit 10
    ) x
  ),

  'appointments', (
    select coalesce(jsonb_agg(x), '[]'::jsonb)
    from (
      select
        l.id as lead_id,
        l.full_name,
        l.appointment_at,
        l.status
      from public.leads l
      where l.workspace_id = p_workspace_id
        and l.archived = false
        and l.appointment_status = 'Scheduled'
        and l.appointment_at between now() and now() + interval '72 hours'
      order by l.appointment_at asc
      limit 10
    ) x
  ),

  'leads', (
    select coalesce(jsonb_agg(x), '[]'::jsonb)
    from (
      select
        l.id as lead_id,
        l.full_name,
        l.status,
        l.next_follow_up_at,
        l.appointment_at
      from public.leads l
      where l.workspace_id = p_workspace_id
        and l.archived = false
      order by
        case
          when l.next_follow_up_at < now() then 0
          when l.next_follow_up_at < now() + interval '24 hours' then 1
          else 2
        end,
        l.next_follow_up_at asc nulls last
      limit 25
    ) x
  )
);
$$;


ALTER FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid", "p_limit" integer DEFAULT 50) RETURNS TABLE("id" bigint, "full_name" "text", "phone" "text", "last_call_outcome" "text", "next_follow_up_at" timestamp with time zone, "priority_score" numeric, "queue_bucket" "text", "next_best_action" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
with latest_calls as (
  select
    cl.lead_id,
    cl.outcome,
    cl.created_at
  from (
    select
      cl.lead_id,
      cl.outcome,
      cl.created_at,
      row_number() over (
        partition by cl.lead_id
        order by cl.created_at desc
      ) as rn
    from public.call_logs cl
  ) cl
  where cl.rn = 1
),
scored as (
  select
    lead.id,
    lead.full_name,
    lead.phone,
    lc.outcome as last_call_outcome,
    lead.next_follow_up_at,

    (
      coalesce(
        case lc.outcome
          when 'answered' then -20
          when 'left_message' then 10
          when 'busy' then 5
          when 'voicemail' then 15
          when 'no_answer' then 25
          else 0
        end,
        0
      )
      + case
          when lead.appointment_at is not null
               and lead.appointment_status = 'Scheduled'
               and lead.appointment_at > now() then
            greatest(
              0,
              24 - extract(epoch from (lead.appointment_at - now()))/3600
            )
          else 0
        end
    )::numeric as priority_score,

    case
      when lead.appointment_at is not null
           and lead.appointment_status = 'Scheduled'
           and lead.appointment_at <= now() + interval '4 hours'
      then 'appointments'
      when coalesce(
        case lc.outcome
          when 'no_answer' then 25
          when 'voicemail' then 15
          when 'left_message' then 10
          when 'busy' then 5
          when 'answered' then -20
          else 0
        end,
        0
      ) >= 20
      then 'call_now'
      when coalesce(
        case lc.outcome
          when 'no_answer' then 25
          when 'voicemail' then 15
          when 'left_message' then 10
          when 'busy' then 5
          when 'answered' then -20
          else 0
        end,
        0
      ) >= 5
      then 'today'
      else 'later'
    end as queue_bucket,

    /* next_best_action (deterministic rules only; does not affect queue_bucket) */
    case
      when lead.appointment_at is not null
           and lead.appointment_status = 'Scheduled'
           and lead.appointment_at <= now() + interval '4 hours'
      then 'Confirm upcoming appointment'

      when lc.outcome = 'no_answer'
      then 'Follow up with a call'

      when lc.outcome in ('voicemail')
      then 'Send a message after voicemail'

      when lc.outcome = 'left_message'
      then 'Attempt call again'

      when lc.outcome = 'busy'
      then 'Try calling again later'

      when lc.outcome = 'answered'
      then 'Proceed to next step'

      else
        'Reach out with a call'
    end as next_best_action

  from public.leads lead
  left join latest_calls lc on lc.lead_id = lead.id

  where lead.workspace_id = p_workspace_id
    and coalesce(lead.archived, false) = false
    and (
      lead.next_follow_up_at is null
      or lead.next_follow_up_at <= now()
    )
)
select
  s.id,
  s.full_name,
  s.phone,
  s.last_call_outcome,
  s.next_follow_up_at,
  s.priority_score,
  s.queue_bucket,
  s.next_best_action
from scored s
order by
  case s.queue_bucket
    when 'appointments' then 0
    when 'call_now' then 1
    when 'today' then 2
    else 3
  end,
  s.priority_score desc,
  s.id desc
limit p_limit;
$$;


ALTER FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_v2"("p_workspace_id" "uuid", "p_limit" integer DEFAULT 50) RETURNS TABLE("id" bigint, "id_uuid" "uuid", "full_name" "text", "phone" "text", "last_call_outcome" "text", "next_follow_up_at" timestamp with time zone, "priority_score" numeric, "queue_bucket" "text", "next_best_action" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
with latest_calls as (
  select
    cl.lead_id,
    cl.outcome,
    cl.created_at
  from (
    select
      cl.lead_id,
      cl.outcome,
      cl.created_at,
      row_number() over (
        partition by cl.lead_id
        order by cl.created_at desc
      ) as rn
    from public.call_logs cl
  ) cl
  where cl.rn = 1
),
scored as (
  select
    lead.id,
    lead.id_uuid,
    lead.full_name,
    lead.phone,
    lc.outcome as last_call_outcome,
    lead.next_follow_up_at,
    (
      coalesce(
        case lc.outcome
          when 'answered' then -20
          when 'left_message' then 10
          when 'busy' then 5
          when 'voicemail' then 15
          when 'no_answer' then 25
          else 0
        end,
        0
      )
      +
      case
        when lead.appointment_at is not null
         and lead.appointment_status = 'Scheduled'
         and lead.appointment_at > now()
        then greatest(
          0,
          24 - extract(epoch from (lead.appointment_at - now()))/3600
        )
        else 0
      end
    )::numeric as priority_score,
    case
      when lead.appointment_at is not null
       and lead.appointment_status = 'Scheduled'
       and lead.appointment_at <= now() + interval '4 hours'
      then 'appointments'
      when coalesce(
        case lc.outcome
          when 'no_answer' then 25
          when 'voicemail' then 15
          when 'left_message' then 10
          when 'busy' then 5
          when 'answered' then -20
          else 0
        end,
        0
      ) >= 20
      then 'call_now'
      when coalesce(
        case lc.outcome
          when 'no_answer' then 25
          when 'voicemail' then 15
          when 'left_message' then 10
          when 'busy' then 5
          when 'answered' then -20
          else 0
        end,
        0
      ) >= 5
      then 'today'
      else 'later'
    end as queue_bucket,
    case
      when lead.appointment_at is not null
       and lead.appointment_status = 'Scheduled'
       and lead.appointment_at <= now() + interval '4 hours'
      then 'Confirm upcoming appointment'
      when lc.outcome = 'no_answer'
      then 'Follow up with a call'
      when lc.outcome = 'voicemail'
      then 'Send a message after voicemail'
      when lc.outcome = 'left_message'
      then 'Attempt call again'
      when lc.outcome = 'busy'
      then 'Try calling again later'
      when lc.outcome = 'answered'
      then 'Proceed to next step'
      else 'Reach out with a call'
    end as next_best_action
  from public.leads lead
  left join latest_calls lc
    on lc.lead_id = lead.id
  where lead.workspace_id = p_workspace_id
    and coalesce(lead.archived,false) = false
    and (
      lead.next_follow_up_at is null
      or lead.next_follow_up_at <= now()
    )
)
select
  s.id,
  s.id_uuid,
  s.full_name,
  s.phone,
  s.last_call_outcome,
  s.next_follow_up_at,
  s.priority_score,
  s.queue_bucket,
  s.next_best_action
from scored s
order by
  case s.queue_bucket
    when 'appointments' then 0
    when 'call_now' then 1
    when 'today' then 2
    else 3
  end,
  s.priority_score desc,
  s.id desc
limit p_limit;
$$;


ALTER FUNCTION "public"."get_dashboard_v2"("p_workspace_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_lead"("p_workspace_id" "uuid") RETURNS SETOF "public"."leads"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT l.*
  FROM public.leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.archived = false
    AND l.status NOT IN ('closed-won','closed-lost')
    AND EXISTS (
      SELECT 1
      FROM public.workspace_members wm
      WHERE wm.workspace_id = p_workspace_id
        AND wm.user_id = auth.uid()
    )
  ORDER BY
    CASE l.priority
      WHEN 'hot' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
      ELSE 999
    END,
    COALESCE(l.next_follow_up_at, 'epoch'::timestamptz) ASC,
    l.created_at ASC
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_next_lead"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_lead_claimed"("p_workspace_id" "uuid", "p_lock_owner" "text", "p_lease_seconds" integer) RETURNS TABLE("id" integer, "workspace_id" "uuid", "status" "text", "name" "text", "phone" "text", "email" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  RETURN QUERY
  WITH selected_lead AS (
    SELECT
      l.id,
      l.workspace_id,
      l.status,
      l.id::text AS name,
      l.phone,
      l.email
    FROM public.leads l
    WHERE l.workspace_id = p_workspace_id
      AND NOT l.archived
      AND lower(l.status) IN ('new', 'follow-up', 'contacted')
      AND NOT EXISTS (
        SELECT 1
        FROM public.crm_workspace_lead_claims c
        WHERE c.lead_id = l.id
          AND c.workspace_id = p_workspace_id
          AND c.expires_at > now()
      )
    ORDER BY l.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  ),
  inserted_claim AS (
    INSERT INTO public.crm_workspace_lead_claims (
      lead_id,
      workspace_id,
      lock_owner,
      expires_at
    )
    SELECT
      s.id,
      s.workspace_id,
      p_lock_owner,
      now() + make_interval(secs => p_lease_seconds)
    FROM selected_lead s
    RETURNING lead_id, workspace_id
  )
  SELECT
    s.id,
    s.workspace_id,
    s.status,
    s.name,
    s.phone,
    s.email
  FROM selected_lead s
  INNER JOIN inserted_claim ic
    ON ic.lead_id = s.id
   AND ic.workspace_id = s.workspace_id;
END;
$$;


ALTER FUNCTION "public"."get_next_lead_claimed"("p_workspace_id" "uuid", "p_lock_owner" "text", "p_lease_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_upgrade_signal"("p_workspace_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select jsonb_build_object(
    'workspace_id', workspace_id,
    'upgrade_needed', upgrade_needed,

    'leads', jsonb_build_object(
      'limit_reached', leads_limit_reached,
      'remaining', leads_remaining,
      'limit', lead_limit,
      'used', active_leads
    ),

    'pipelines', jsonb_build_object(
      'limit_reached', pipelines_limit_reached,
      'remaining', pipelines_remaining,
      'limit', pipeline_limit,
      'used', pipeline_count
    )
  )
  from public.workspace_billing_pressure
  where workspace_id = p_workspace_id
  limit 1;
$$;


ALTER FUNCTION "public"."get_upgrade_signal"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_workspace_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT workspace_id
  FROM public.workspace_members
  WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_workspace_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_workspace_id uuid;
begin
  if exists (select 1 from public.profiles where user_id = new.id) then
    return new;
  end if;

  insert into public.workspaces (name, created_by)
  values (coalesce(new.raw_user_meta_data->>'company_name', 'My Workspace'), new.id)
  returning id into v_workspace_id;

  insert into public.profiles (user_id, workspace_id, full_name, avatar_url, role)
  values (
    new.id,
    v_workspace_id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'owner'
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user_onboarding"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hlc_guard_estimate_conversion_state"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if old.status = 'converted' then
    raise exception 'Converted estimates are immutable';
  end if;

  if new.status = 'converted' and old.status <> 'converted' then
    if not exists (
      select 1 from public.crm_jobs j where j.source_estimate_id = old.id
    ) then
      raise exception 'Estimate can only become converted through CRM job conversion';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."hlc_guard_estimate_conversion_state"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hlc_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."hlc_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hlc_validate_crm_job_links"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_estimate_workspace uuid;
  v_lead_workspace uuid;
begin
  select e.workspace_id into v_estimate_workspace
  from public.estimates e
  where e.id = new.source_estimate_id;

  if not found then
    raise exception 'Source estimate % is not available', new.source_estimate_id;
  end if;

  if v_estimate_workspace is distinct from new.workspace_id then
    raise exception 'CRM job and source estimate must belong to the same workspace';
  end if;

  if new.lead_id is not null then
    select l.workspace_id into v_lead_workspace
    from public.leads l
    where l.id = new.lead_id;

    if not found then
      raise exception 'Lead % is not available', new.lead_id;
    end if;

    if v_lead_workspace is distinct from new.workspace_id then
      raise exception 'CRM job and lead must belong to the same workspace';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."hlc_validate_crm_job_links"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hlc_validate_estimate_lead_workspace"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_lead_workspace uuid;
begin
  if new.lead_id is null then
    return new;
  end if;

  select l.workspace_id into v_lead_workspace
  from public.leads l
  where l.id = new.lead_id;

  if not found then
    raise exception 'Lead % is not available', new.lead_id;
  end if;

  if v_lead_workspace is distinct from new.workspace_id then
    raise exception 'Estimate and lead must belong to the same workspace';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."hlc_validate_estimate_lead_workspace"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hlc_validate_job_appointment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_job_workspace uuid;
  v_job_lead bigint;
  v_contractor_workspace uuid;
begin
  select j.workspace_id, j.lead_id
    into v_job_workspace, v_job_lead
  from public.crm_jobs j
  where j.id = new.job_id;

  if not found then
    raise exception 'CRM job is not available';
  end if;

  select c.workspace_id into v_contractor_workspace
  from public.contractors c
  where c.id = new.contractor_id;

  if not found then
    raise exception 'Contractor is not available';
  end if;

  if new.workspace_id is distinct from v_job_workspace
     or new.workspace_id is distinct from v_contractor_workspace then
    raise exception 'Appointment job and contractor must belong to the same workspace';
  end if;

  if new.lead_id is not null and new.lead_id is distinct from v_job_lead then
    raise exception 'Appointment lead must match the CRM job lead';
  end if;

  if tg_op = 'INSERT' and not exists (
      select 1 from public.job_assignments ja
      where ja.job_id = new.job_id
        and ja.contractor_id = new.contractor_id
        and ja.workspace_id = new.workspace_id
        and ja.status = 'accepted'
    ) then
      raise exception 'A job appointment requires an accepted contractor assignment';
  end if;

  if tg_op = 'UPDATE' and (
    new.workspace_id is distinct from old.workspace_id
    or new.job_id is distinct from old.job_id
    or new.contractor_id is distinct from old.contractor_id
    or new.lead_id is distinct from old.lead_id
    or new.appointment_date is distinct from old.appointment_date
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Appointment identity and schedule are immutable; cancel and create a replacement';
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status and not (
    old.status = 'scheduled'
    and new.status in ('completed', 'cancelled', 'no_show')
  ) then
    raise exception 'Invalid appointment status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."hlc_validate_job_appointment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hlc_validate_job_assignment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_job_workspace uuid;
  v_contractor_workspace uuid;
begin
  select j.workspace_id into v_job_workspace
  from public.crm_jobs j
  where j.id = new.job_id;

  if not found then
    raise exception 'CRM job is not available';
  end if;

  select c.workspace_id into v_contractor_workspace
  from public.contractors c
  where c.id = new.contractor_id;

  if not found then
    raise exception 'Contractor is not available';
  end if;

  if new.workspace_id is distinct from v_job_workspace
     or new.workspace_id is distinct from v_contractor_workspace then
    raise exception 'Assignment job and contractor must belong to the same workspace';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'offered' then
      raise exception 'New assignments must begin as offered';
    end if;
  else
    if new.workspace_id is distinct from old.workspace_id
       or new.job_id is distinct from old.job_id
       or new.contractor_id is distinct from old.contractor_id
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Assignment identity and history fields are immutable';
    end if;

    if new.status is distinct from old.status and not (
      (old.status = 'offered' and new.status in ('accepted', 'rejected', 'cancelled'))
      or (old.status = 'accepted' and new.status = 'cancelled')
    ) then
      raise exception 'Invalid assignment status transition from % to %', old.status, new.status;
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."hlc_validate_job_assignment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_agent_workload"("target_user_id" "uuid", "g_delta" integer, "hp_delta" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.agent_workload_state
  set 
    global_workload = greatest(0, global_workload + g_delta),
    high_priority_count = greatest(0, high_priority_count + hp_delta),
    last_assigned_at = case when g_delta > 0 then now() else last_assigned_at end
  where user_id = target_user_id;
end;
$$;


ALTER FUNCTION "public"."increment_agent_workload"("target_user_id" "uuid", "g_delta" integer, "hp_delta" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid") RETURNS TABLE("id" "uuid", "incident_key" "text", "status" "text", "severity" "text", "actual_state" "text", "expected_state" "text", "drift_fingerprint" "text", "run_id" "uuid", "notified_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
DECLARE
  v_incident_key text := p_workspace_id::text || ':' || p_lead_id::text || ':' || p_drift_type;
  v_row public.lead_drift_alerts%ROWTYPE;
BEGIN
  -- Lock the existing open incident row (if any) to avoid duplicate OPEN inserts.
  SELECT *
  INTO v_row
  FROM public.lead_drift_alerts
  WHERE incident_key = v_incident_key
    AND status = 'open'
  FOR UPDATE;

  IF FOUND THEN
    -- Update existing open incident (coalesce)
    UPDATE public.lead_drift_alerts l
    SET
      severity = CASE
        -- simple escalation logic for low/medium/high
        WHEN l.severity = p_severity THEN l.severity
        WHEN l.severity = 'high' THEN 'high'
        WHEN p_severity = 'high' THEN 'high'
        WHEN l.severity = 'medium' AND p_severity IN ('low','medium') THEN l.severity
        WHEN l.severity = 'low' AND p_severity IN ('low','medium') THEN p_severity
        ELSE p_severity
      END,
      actual_state = p_actual_state,
      expected_state = p_expected_state,
      drift_fingerprint = COALESCE(l.drift_fingerprint, p_drift_fingerprint),
      run_id = p_run_id,
      retry_count = l.retry_count,
      processed_at = l.processed_at
    WHERE l.id = v_row.id
    RETURNING
      l.id, l.incident_key, l.status, l.severity, l.actual_state,
      l.expected_state, l.drift_fingerprint, l.run_id, l.notified_at
    INTO id, incident_key, status, severity, actual_state, expected_state,
         drift_fingerprint, run_id, notified_at;

    RETURN NEXT;
  ELSE
    -- Insert first open incident
    INSERT INTO public.lead_drift_alerts (
      workspace_id,
      lead_id,
      drift_type,
      severity,
      actual_state,
      expected_state,
      drift_fingerprint,
      run_id,
      incident_key,
      status,
      retry_count,
      processed_at,
      created_at,
      notified_at
    )
    VALUES (
      p_workspace_id,
      p_lead_id,
      p_drift_type,
      p_severity,
      p_actual_state,
      p_expected_state,
      p_drift_fingerprint,
      p_run_id,
      v_incident_key,
      'open',
      0,
      NULL,
      now(),
      NULL
    )
    RETURNING
      id, incident_key, status, severity, actual_state, expected_state,
      drift_fingerprint, run_id, notified_at
    INTO id, incident_key, status, severity, actual_state, expected_state,
         drift_fingerprint, run_id, notified_at;

    RETURN NEXT;
  END IF;
END;
$$;


ALTER FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid", "p_oracle_log_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "status" "text", "severity" "text", "actual_state" "text", "expected_state" "text", "drift_fingerprint" "text", "notified_at" timestamp with time zone, "processed_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
DECLARE
  v_row public.lead_drift_alerts%ROWTYPE;
BEGIN
  SELECT *
  INTO v_row
  FROM public.lead_drift_alerts l
  WHERE l.workspace_id = p_workspace_id
    AND l.lead_id = p_lead_id
    AND l.drift_type = p_drift_type
    AND l.status = 'open'
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.lead_drift_alerts l
    SET
      severity =
        CASE
          WHEN l.severity = 'high' OR p_severity = 'high' THEN 'high'
          WHEN l.severity = 'medium' OR p_severity = 'medium' THEN 'medium'
          ELSE 'low'
        END,
      actual_state = p_actual_state,
      expected_state = p_expected_state,
      drift_fingerprint = COALESCE(l.drift_fingerprint, p_drift_fingerprint),
      run_id = p_run_id,
      oracle_log_id = COALESCE(p_oracle_log_id, l.oracle_log_id)
    WHERE l.id = v_row.id
    RETURNING
      l.id, l.status, l.severity, l.actual_state,
      l.expected_state, l.drift_fingerprint,
      l.notified_at, l.processed_at
    INTO
      id, status, severity, actual_state,
      expected_state, drift_fingerprint,
      notified_at, processed_at;

    RETURN NEXT;
  ELSE
    INSERT INTO public.lead_drift_alerts (
      workspace_id,
      lead_id,
      drift_type,
      severity,
      actual_state,
      expected_state,
      drift_fingerprint,
      run_id,
      oracle_log_id,
      status,
      retry_count,
      processed_at,
      notified_at,
      created_at
    )
    VALUES (
      p_workspace_id,
      p_lead_id,
      p_drift_type,
      p_severity,
      p_actual_state,
      p_expected_state,
      p_drift_fingerprint,
      p_run_id,
      p_oracle_log_id,
      'open',
      0,
      NULL,
      NULL,
      now()
    )
    RETURNING
      id, status, severity, actual_state,
      expected_state, drift_fingerprint,
      notified_at, processed_at
    INTO
      id, status, severity, actual_state,
      expected_state, drift_fingerprint,
      notified_at, processed_at;

    RETURN NEXT;
  END IF;

  RETURN;
END;
$$;


ALTER FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid", "p_oracle_log_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ingest_lead_status_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_event_type" "text", "p_request_id" "text", "p_idempotency_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- 1) IDENTITY + IDEMPOTENCY GUARD (BEFORE ANY MUTATION)
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.lead_transition_log
      WHERE lead_id = p_lead_id
        AND workspace_id = p_workspace_id
        AND idempotency_key = p_idempotency_key
        AND result = 'applied'
    ) THEN
      RETURN jsonb_build_object(
        'ok', true,
        'idempotent', true
      );
    END IF;
  END IF;

  -- 2) ATOMIC FSM TRANSITION (single SQL statement => single commit unit)
  WITH locked AS (
    SELECT *
    FROM public.leads
    WHERE id = p_lead_id
      AND workspace_id = p_workspace_id
    FOR UPDATE
  ),
  transition AS (
    SELECT
      l.id AS lead_id,
      l.workspace_id,
      l.status AS from_state,
      CASE
        WHEN l.status = 'new' AND p_event_type = 'MARK_CONTACTED' THEN 'contacted'
        WHEN l.status = 'contacted' AND p_event_type = 'MARK_QUALIFIED' THEN 'qualified'
        WHEN l.status = 'qualified' AND p_event_type = 'BOOK_APPOINTMENT' THEN 'booked'
        WHEN l.status = 'booked' AND p_event_type = 'CLOSE_WON' THEN 'closed_won'
        WHEN l.status = 'booked' AND p_event_type = 'CLOSE_LOST' THEN 'closed_lost'
        ELSE NULL
      END AS to_state
    FROM locked l
  ),
  decision AS (
    SELECT
      *,
      CASE
        WHEN to_state IS NULL THEN 'rejected'
        ELSE 'applied'
      END AS result
    FROM transition
  ),
  updated AS (
    UPDATE public.leads l
    SET status = d.to_state,
        stage_updated_at = now(),
        updated_at = now()
    FROM decision d
    WHERE l.id = d.lead_id
      AND d.result = 'applied'
    RETURNING l.id
  ),
  logged AS (
    INSERT INTO public.lead_transition_log (
      lead_id,
      workspace_id,
      from_state,
      to_state,
      event_type,
      result,
      reason,
      request_id,
      idempotency_key
    )
    SELECT
      d.lead_id,
      d.workspace_id,
      d.from_state,
      d.to_state,
      p_event_type,
      d.result,
      CASE WHEN d.result = 'rejected' THEN 'invalid_transition' ELSE NULL END,
      p_request_id,
      p_idempotency_key
    FROM decision d
    RETURNING lead_id
  )
  SELECT jsonb_build_object(
    'ok', true,
    'lead_id', p_lead_id,
    'status_changed', EXISTS (SELECT 1 FROM updated),
    'result', (SELECT result FROM decision LIMIT 1)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."ingest_lead_status_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_event_type" "text", "p_request_id" "text", "p_idempotency_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_agent_workload_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.agent_workload_state (user_id, workspace_id, global_workload, high_priority_count)
  values (new.user_id, new.organization_id, 0, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."initialize_agent_workload_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."lead_preprocess"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  -- Provide a baseline literal if missing entirely
  IF NEW.stage IS NULL THEN
    NEW.stage := 'NEW';
  END IF;

  -- 1. Try an exact match first without mutating or assuming data state
  IF NEW.pipeline_stage_id IS NULL THEN
    SELECT id INTO NEW.pipeline_stage_id
    FROM public.pipeline_stages
    WHERE name = NEW.stage
    LIMIT 1;
  END IF;

  -- 2. Safe fallback: case-insensitive query matching
  IF NEW.pipeline_stage_id IS NULL THEN
    SELECT id INTO NEW.pipeline_stage_id
    FROM public.pipeline_stages
    WHERE LOWER(name) = LOWER(NEW.stage)
    LIMIT 1;
  END IF;

  -- 3. High-availability baseline safety net
  IF NEW.pipeline_stage_id IS NULL THEN
    SELECT id INTO NEW.pipeline_stage_id
    FROM public.pipeline_stages
    WHERE name ILIKE 'new'
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."lead_preprocess"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leads_event_audit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
DECLARE
  new_jb jsonb;
  old_jb jsonb;
  diff_jb jsonb;
BEGIN
  new_jb := to_jsonb(NEW);
  old_jb := to_jsonb(OLD);

  -- UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- High-value stage change event only
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.crm_events (workspace_id, lead_id, event_type, payload)
      VALUES (
        NEW.workspace_id,
        NEW.id::text,
        'lead.stage_changed',
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;

    -- Generic update event
    -- Use a deterministic, contract-stable payload structure.
    -- (Avoid jsonb subtraction operators for compatibility.)
    diff_jb := jsonb_build_object(
      'changes', (
        SELECT COALESCE(jsonb_object_agg(k, v), '{}'::jsonb)
        FROM (
          SELECT
            key AS k,
            jsonb_build_object('from', old_jb->key, 'to', new_jb->key) AS v
          FROM jsonb_object_keys(new_jb) key
          WHERE (new_jb->key) IS DISTINCT FROM (old_jb->key)
        ) s
      )
    );

    INSERT INTO public.crm_events (workspace_id, lead_id, event_type, payload)
    VALUES (
      NEW.workspace_id,
      NEW.id::text,
      'lead.updated',
      diff_jb
    );

    RETURN NEW;
  END IF;

  -- INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.crm_events (workspace_id, lead_id, event_type, payload)
    VALUES (NEW.workspace_id, NEW.id::text, 'lead.created', to_jsonb(NEW));
    RETURN NEW;
  END IF;

  -- DELETE
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.crm_events (workspace_id, lead_id, event_type, payload)
    VALUES (OLD.workspace_id, OLD.id::text, 'lead.deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."leads_event_audit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leads_log_call"("p_lead_id" bigint, "p_outcome" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  insert into public.call_logs (
    workspace_id,
    lead_id,
    outcome,
    created_at
  )
  select
    l.workspace_id,
    l.id,
    p_outcome,
    now()
  from public.leads l
  where l.id = p_lead_id;

  update public.leads
  set
    last_contacted_at = now(),
    updated_at = now()
  where id = p_lead_id;
end;
$$;


ALTER FUNCTION "public"."leads_log_call"("p_lead_id" bigint, "p_outcome" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leads_workspace_broadcast_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_topic text;
BEGIN
  v_topic := 'workspace:' || COALESCE(NEW.workspace_id, OLD.workspace_id)::text || ':leads';

  PERFORM realtime.broadcast_changes(
    v_topic,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."leads_workspace_broadcast_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_job_failed"("p_job_id" "uuid", "p_worker_id" "uuid", "p_error" "jsonb" DEFAULT NULL::"jsonb", "p_default_retry_delay_seconds" integer DEFAULT 60) RETURNS "public"."queue_jobs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_job public.queue_jobs%ROWTYPE;
  v_should_retry boolean;
  v_retry_delay_seconds int;
  v_max_attempts int;
  v_new_status text;
BEGIN
  SELECT * INTO v_job
  FROM public.queue_jobs q
  WHERE q.id = p_job_id
  FOR UPDATE;

  IF v_job.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- lease/work ownership guard
  IF v_job.claimed_by IS DISTINCT FROM p_worker_id THEN
    RETURN NULL;
  END IF;

  -- only allow from running
  IF v_job.status <> 'running' THEN
    RETURN NULL;
  END IF;

  -- fetch policy (fallback defaults)
  SELECT
    COALESCE(rp.should_retry, false),
    COALESCE(rp.retry_delay_seconds, p_default_retry_delay_seconds),
    COALESCE(rp.max_attempts, v_job.max_attempts)
  INTO
    v_should_retry,
    v_retry_delay_seconds,
    v_max_attempts
  FROM public.retry_policies rp
  WHERE rp.job_type = v_job.job_type;

  -- if no policy row, use job max_attempts and no retry by default
  IF v_job.job_type IS NOT NULL AND v_max_attempts IS NULL THEN
    v_should_retry := false;
    v_retry_delay_seconds := p_default_retry_delay_seconds;
    v_max_attempts := v_job.max_attempts;
  END IF;

  IF v_should_retry = true AND v_job.attempt_no < v_max_attempts THEN
    v_new_status := 'failed';
  ELSE
    v_new_status := 'dead';
  END IF;

  -- update job
  IF v_new_status = 'failed' THEN
    UPDATE public.queue_jobs
    SET
      status = 'failed',
      claimed_by = NULL,
      lease_expires_at = NULL,
      run_at = now() + make_interval(secs => v_retry_delay_seconds),
      updated_at = now()
    WHERE id = p_job_id;
  ELSE
    UPDATE public.queue_jobs
    SET
      status = 'dead',
      claimed_by = NULL,
      lease_expires_at = NULL,
      updated_at = now()
    WHERE id = p_job_id;
  END IF;

  -- log attempt (optional audit row)
  INSERT INTO public.queue_job_attempts (workspace_id, queue_job_id, attempt_no, status, error)
  VALUES (
    v_job.workspace_id,
    v_job.id,
    v_job.attempt_no,
    v_new_status,
    p_error
  );

  RETURN (SELECT * FROM public.queue_jobs WHERE id = p_job_id);
END;
$$;


ALTER FUNCTION "public"."mark_job_failed"("p_job_id" "uuid", "p_worker_id" "uuid", "p_error" "jsonb", "p_default_retry_delay_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_job_running"("p_job_id" "uuid", "p_worker_id" "uuid") RETURNS "public"."queue_jobs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.queue_jobs q
  SET
    status = 'running',
    updated_at = now()
  WHERE q.id = p_job_id
    AND q.claimed_by = p_worker_id
    AND q.status = 'leased'
    AND (q.lease_expires_at IS NULL OR q.lease_expires_at > now());

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN (SELECT * FROM public.queue_jobs WHERE id = p_job_id);
END;
$$;


ALTER FUNCTION "public"."mark_job_running"("p_job_id" "uuid", "p_worker_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_job_success"("p_job_id" "uuid", "p_worker_id" "uuid") RETURNS "public"."queue_jobs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.queue_jobs q
  SET
    status = 'success',
    lease_expires_at = NULL,
    claimed_by = NULL,
    updated_at = now()
  WHERE q.id = p_job_id
    AND q.claimed_by = p_worker_id
    AND q.status = 'running';

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN (SELECT * FROM public.queue_jobs WHERE id = p_job_id);
END;
$$;


ALTER FUNCTION "public"."mark_job_success"("p_job_id" "uuid", "p_worker_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_queue_done"("p_queue_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  UPDATE public.lead_queue
  SET
    status = 'done',
    done_at = now(),
    updated_at = now()
  WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION "public"."mark_queue_done"("p_queue_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_queue_failed"("p_queue_id" bigint, "p_error" "text", "p_retry_seconds" integer DEFAULT 60) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  UPDATE public.lead_queue
  SET
    status = 'ready',
    assigned_until = now() + (p_retry_seconds || ' seconds')::interval,
    last_error = p_error,
    updated_at = now()
  WHERE id = p_queue_id;
END;
$$;


ALTER FUNCTION "public"."mark_queue_failed"("p_queue_id" bigint, "p_error" "text", "p_retry_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_workspace_dirty"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  INSERT INTO public.crm_workspace_dirty (workspace_id, dirty, updated_at)
  VALUES (NEW.workspace_id, true, now())
  ON CONFLICT (workspace_id)
  DO UPDATE SET dirty = true, updated_at = now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."mark_workspace_dirty"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_workspace_dirty_on_call_logs"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  SELECT l.workspace_id
  INTO v_workspace_id
  FROM public.leads l
  WHERE l.id = NEW.lead_id;

  IF v_workspace_id IS NOT NULL THEN
    INSERT INTO public.crm_workspace_dirty (workspace_id, dirty, updated_at)
    VALUES (v_workspace_id, true, now())
    ON CONFLICT (workspace_id)
    DO UPDATE SET dirty = true, updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."mark_workspace_dirty_on_call_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_workspace_dirty_on_leads"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  IF NEW.workspace_id IS NOT NULL THEN
    INSERT INTO public.crm_workspace_dirty (workspace_id, dirty, updated_at)
    VALUES (NEW.workspace_id, true, now())
    ON CONFLICT (workspace_id)
    DO UPDATE SET dirty = true, updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."mark_workspace_dirty_on_leads"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_pipeline_stage_id" "uuid") RETURNS "public"."leads"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
declare
  v_from_stage uuid;
  v_updated public.leads;
begin
  -- 1) Lock + fetch current state (prevents race conditions)
  select pipeline_stage_id
  into v_from_stage
  from public.leads
  where id = p_lead_id
    and workspace_id = p_workspace_id
  for update;

  if not found then
    raise exception 'Lead not found or not accessible';
  end if;

  -- 2) Update lead
  update public.leads
  set
    pipeline_stage_id = p_pipeline_stage_id,
    stage_updated_at = now()
  where id = p_lead_id
    and workspace_id = p_workspace_id
  returning * into v_updated;

  -- 3) Write event (atomic, guaranteed after update)
  insert into public.lead_events (
    lead_id,
    workspace_id,
    event_type,
    from_value,
    to_value,
    metadata
  )
  values (
    p_lead_id::text,
    p_workspace_id,
    'stage_changed',
    v_from_stage::text,
    p_pipeline_stage_id::text,
    jsonb_build_object('source', 'kanban_drag')
  );

  -- 4) return updated lead (UI contract preserved)
  return v_updated;
end;
$$;


ALTER FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_pipeline_stage_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_events" (
    "id" bigint NOT NULL,
    "lead_id" "text" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idempotency_key" "uuid",
    "correlation_id" "uuid",
    "event_status" "text",
    "error_code" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."lead_events" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_to_stage_id" "uuid", "p_source" "text" DEFAULT 'kanban'::"text") RETURNS "public"."lead_events"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
DECLARE
    v_lead_pipeline_stage_id UUID;
    v_from_stage_id UUID;
    v_from_stage_name TEXT;

    v_to_stage_id UUID;
    v_to_stage_name TEXT;

    v_event_payload JSONB;
    v_result public.lead_events;
    v_lead_workspace_id UUID;
    v_lead_pipeline_id UUID;
    v_to_pipeline_id UUID;
BEGIN
    -- 1) Lock and read lead (serialize concurrent moves for same lead row)
    SELECT
        l.pipeline_stage_id,
        l.workspace_id,
        ps.pipeline_id
    INTO
        v_lead_pipeline_stage_id,
        v_lead_workspace_id,
        v_lead_pipeline_id
    FROM public.leads l
    LEFT JOIN public.pipeline_stages ps
      ON ps.id = l.pipeline_stage_id
    WHERE l.id = p_lead_id
    FOR UPDATE;

    IF v_lead_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Lead % not found', p_lead_id;
    END IF;

    IF v_lead_workspace_id <> p_workspace_id THEN
        RAISE EXCEPTION 'Lead % does not belong to workspace %', p_lead_id, p_workspace_id;
    END IF;

    -- 2) Read destination stage (must exist)
    SELECT
        s.id,
        s.pipeline_id,
        s.name
    INTO
        v_to_stage_id,
        v_to_pipeline_id,
        v_to_stage_name
    FROM public.pipeline_stages s
    WHERE s.id = p_to_stage_id;

    IF v_to_stage_id IS NULL THEN
        RAISE EXCEPTION 'Destination stage % not found', p_to_stage_id;
    END IF;

    -- Validate destination stage belongs to the same workspace (via pipeline -> workspace)
    -- and/or same pipeline (so moves can't jump pipelines).
    IF v_lead_pipeline_id IS NOT NULL AND v_to_pipeline_id <> v_lead_pipeline_id THEN
        RAISE EXCEPTION 'Destination stage % is not in the same pipeline as lead %', p_to_stage_id, p_lead_id;
    END IF;

    -- If the lead currently has no stage, v_lead_pipeline_id is NULL.
    -- In that case we still need to validate workspace correctness via pipeline.workspace_id.
    IF v_lead_pipeline_id IS NULL THEN
        PERFORM 1
        FROM public.pipelines p
        WHERE p.id = v_to_pipeline_id
          AND p.workspace_id = p_workspace_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Destination stage % does not belong to workspace %', p_to_stage_id, p_workspace_id;
        END IF;
    ELSE
        -- Lead had a stage; ensure destination pipeline is for same workspace too.
        PERFORM 1
        FROM public.pipelines p
        WHERE p.id = v_to_pipeline_id
          AND p.workspace_id = p_workspace_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Destination stage % does not belong to workspace %', p_to_stage_id, p_workspace_id;
        END IF;
    END IF;

    -- 3) Read current stage (from_stage) if it exists
    v_from_stage_id := v_lead_pipeline_stage_id;

    IF v_from_stage_id IS NOT NULL THEN
        SELECT s.name
        INTO v_from_stage_name
        FROM public.pipeline_stages s
        WHERE s.id = v_from_stage_id;

        IF v_from_stage_name IS NULL THEN
            -- Lead references a stage id that no longer exists; treat as "no current stage"
            v_from_stage_id := NULL;
            v_from_stage_name := NULL;
        END IF;
    END IF;

    -- 4) Build immutable payload
    v_event_payload :=
        jsonb_build_object(
            'from_stage', CASE
                WHEN v_from_stage_id IS NULL THEN NULL
                ELSE jsonb_build_object(
                    'id', v_from_stage_id::text,
                    'name', v_from_stage_name
                )
            END,
            'to_stage', jsonb_build_object(
                'id', v_to_stage_id::text,
                'name', v_to_stage_name
            ),
            'source', COALESCE(p_source, 'kanban')
        );

    -- 5) Update lead: only stage + timestamps
    UPDATE public.leads
    SET
        pipeline_stage_id = p_to_stage_id,
        stage_updated_at = now(),
        updated_at = now()
    WHERE id = p_lead_id
      AND workspace_id = p_workspace_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead % update failed (workspace mismatch?)', p_lead_id;
    END IF;

    -- 6) Insert exactly one event
    INSERT INTO public.lead_events (
        lead_id,
        workspace_id,
        event_type,
        payload,
        metadata
    )
    VALUES (
        p_lead_id::text,
        p_workspace_id,
        'stage_changed',
        v_event_payload,
        NULL
    )
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_to_stage_id" "uuid", "p_source" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" "uuid", "p_to_stage_id" "uuid", "p_workspace_id" "uuid", "p_source" "text", "p_mutation_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
declare
  v_lead public.leads%rowtype;
  v_from_stage_id uuid;
  v_exists_event boolean;
begin
  -- 1) Idempotency guard: if mutation already applied, return current lead state
  --    IMPORTANT: dedupe by (leadId + mutationId) is usually strongest.
  select exists (
    select 1
    from public.lead_events e
    where e.lead_id = p_lead_id
      and e.payload ->> 'mutation_id' = p_mutation_id::text
  )
  into v_exists_event;

  if v_exists_event then
    select * into v_lead
    from public.leads
    where id = p_lead_id
      and workspace_id = p_workspace_id;

    -- If the lead is gone (race with delete), return null-ish payload
    if v_lead.id is null then
      return jsonb_build_object('id', p_lead_id, 'mutation_id', p_mutation_id, 'updated', false);
    end if;

    return jsonb_build_object(
      'id', v_lead.id,
      'mutation_id', p_mutation_id,
      'updated', false
    );
  end if;

  -- 2) Lock the lead row only
  select * into v_lead
  from public.leads
  where id = p_lead_id
    and workspace_id = p_workspace_id
  for update;

  if v_lead.id is null then
    raise exception 'Lead not found in workspace' using errcode = 'P0001';
  end if;

  v_from_stage_id := v_lead.pipeline_stage_id;

  -- 3) Validate transition target stage exists
  --    If you have a pipeline_stages table, validate it here.
  --    If not needed, remove this block.
  if not exists (
    select 1
    from public.pipeline_stages s
    where s.id = p_to_stage_id
  ) then
    raise exception 'Target stage does not exist' using errcode = 'P0002';
  end if;

  -- 4) Perform atomic update
  update public.leads
  set pipeline_stage_id = p_to_stage_id
  where id = p_lead_id
    and workspace_id = p_workspace_id
    and pipeline_stage_id is distinct from p_to_stage_id;

  -- 5) Insert immutable audit event (inside same transaction)
  insert into public.lead_events(
    lead_id,
    event_type,
    payload,
    created_at
  )
  values (
    p_lead_id,
    'lead_moved',
    jsonb_build_object(
      'source', p_source,
      'from_stage_id', v_from_stage_id,
      'to_stage_id', p_to_stage_id,
      'mutation_id', p_mutation_id
    ),
    now()
  );

  -- 6) Return updated lead id + mutation id (helps optimistic reconciliation)
  select * into v_lead
  from public.leads
  where id = p_lead_id;

  return jsonb_build_object(
    'id', v_lead.id,
    'mutation_id', p_mutation_id,
    'updated', true,
    'updated_at', v_lead.updated_at
  );
end;
$$;


ALTER FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" "uuid", "p_to_stage_id" "uuid", "p_workspace_id" "uuid", "p_source" "text", "p_mutation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."perform_dashboard_action"("p_lead_id" bigint, "p_action" "text", "p_actor_id" "uuid", "p_request_id" "uuid" DEFAULT "gen_random_uuid"()) RETURNS TABLE("id" bigint, "full_name" "text", "phone" "text", "last_call_outcome" "text", "next_follow_up_at" timestamp with time zone, "priority_score" numeric, "queue_bucket" "text", "next_best_action" "text", "archived" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_lead public.leads%rowtype;
  v_has_request boolean;
begin
  -- 1. IDEMPOTENCY CHECK
  select exists (
    select 1
    from public.call_logs
    where request_id = p_request_id
  ) into v_has_request;

  if v_has_request then
    return query
    select *
    from public.compute_lead_dashboard_row(p_lead_id);
    return;
  end if;

  -- 2. LOCK LEAD
  select *
  into v_lead
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'Lead not found';
  end if;

  -- 3. WORKFLOW GUARDS
  if v_lead.archived then
    raise exception 'Action not allowed: lead is archived';
  end if;

  -- Prevent calling a lead that is currently snoozed (optional strict mode).
  if p_action = 'call'
     and v_lead.next_follow_up_at is not null
     and v_lead.next_follow_up_at > now() then
    raise exception 'Action not allowed: lead is snoozed';
  end if;

  if p_action in ('snooze','complete','call','sms') then
    null; -- allow; all other guards handled above
  end if;

  -- 4. ACTION EXECUTION
  if p_action = 'call' then
    insert into public.call_logs (
      lead_id,
      outcome,
      created_at,
      workspace_id,
      request_id
    )
    select
      p_lead_id,
      'call_attempted',
      now(),
      l.workspace_id,
      p_request_id
    from public.leads l
    where l.id = p_lead_id;

    update public.leads
    set last_contacted_at = now()
    where id = p_lead_id;

  elsif p_action = 'snooze' then
    if v_lead.archived then
      raise exception 'Action not allowed: lead is archived';
    end if;

    update public.leads
    set next_follow_up_at = now() + interval '60 minutes'
    where id = p_lead_id;

  elsif p_action = 'complete' then
    -- v_lead.archived is already checked above; keep explicit for clarity
    update public.leads
    set archived = true
    where id = p_lead_id;

  elsif p_action = 'sms' then
    -- hook point
    null;

  else
    raise exception 'Invalid action: %', p_action;
  end if;

  -- 5. RETURN FRESH STATE (NO DRIFT)
  return query
  select *
  from public.compute_lead_dashboard_row(p_lead_id);
end;
$$;


ALTER FUNCTION "public"."perform_dashboard_action"("p_lead_id" bigint, "p_action" "text", "p_actor_id" "uuid", "p_request_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recompute_dirty_workspaces"("max_workspaces" integer DEFAULT 200) RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
DECLARE
  v_count integer := 0;
  v_ws uuid;
BEGIN
  FOR v_ws IN
    SELECT wd.workspace_id
    FROM public.crm_workspace_dirty wd
    WHERE wd.dirty = true
    ORDER BY wd.updated_at ASC
    LIMIT max_workspaces
  LOOP
    PERFORM public.recompute_workspace_metrics(v_ws);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."recompute_dirty_workspaces"("max_workspaces" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recompute_lead_priority"("p_lead_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  -- compute from canonical inputs
  -- e.g. SELECT public.compute_priority_score(...)

  UPDATE public.leads
  SET priority_score = public.compute_priority_score(p_lead_id),
      updated_at = now()
  WHERE id = p_lead_id;
END;
$$;


ALTER FUNCTION "public"."recompute_lead_priority"("p_lead_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recompute_workspace_metrics"("target_workspace" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  INSERT INTO public.crm_workspace_metrics (
    workspace_id,
    total_leads,
    new_leads,
    contacted_leads,
    qualified_leads,
    leads_last_7_days,
    total_calls,
    updated_at
  )
  SELECT
    l.workspace_id,
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE l.status = 'new') AS new_leads,
    COUNT(*) FILTER (WHERE l.status = 'contacted') AS contacted_leads,
    COUNT(*) FILTER (WHERE l.status = 'qualified') AS qualified_leads,
    COUNT(*) FILTER (WHERE l.created_at >= now() - interval '7 days') AS leads_last_7_days,
    (
      SELECT COUNT(*)
      FROM public.call_logs cl
      WHERE cl.lead_id IN (
        SELECT id
        FROM public.leads l2
        WHERE l2.workspace_id = l.workspace_id
      )
    ) AS total_calls,
    now() AS updated_at
  FROM public.leads l
  WHERE l.workspace_id = target_workspace
  GROUP BY l.workspace_id
  ON CONFLICT (workspace_id)
  DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    new_leads = EXCLUDED.new_leads,
    contacted_leads = EXCLUDED.contacted_leads,
    qualified_leads = EXCLUDED.qualified_leads,
    leads_last_7_days = EXCLUDED.leads_last_7_days,
    total_calls = EXCLUDED.total_calls,
    updated_at = now();

  -- If the workspace has no leads anymore, ensure metrics row still exists as zeros.
  IF NOT EXISTS (
    SELECT 1 FROM public.crm_workspace_metrics m WHERE m.workspace_id = target_workspace
  ) THEN
    INSERT INTO public.crm_workspace_metrics (workspace_id, updated_at)
    VALUES (target_workspace, now())
    ON CONFLICT (workspace_id) DO NOTHING;
  END IF;

  DELETE FROM public.crm_workspace_dirty
  WHERE workspace_id = target_workspace;
END;
$$;


ALTER FUNCTION "public"."recompute_workspace_metrics"("target_workspace" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_lead_urgency"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  new.urgency_score := public.calculate_lead_urgency(
    new.next_follow_up_at,
    new.stage_updated_at,
    new.status
  )::numeric;
  return new;
end;
$$;


ALTER FUNCTION "public"."refresh_lead_urgency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."release_expired_lead_claims"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.crm_workspace_lead_claims
  SET
    lock_owner = NULL,
    claimed_at = NULL,
    expires_at = NULL
  WHERE expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;


ALTER FUNCTION "public"."release_expired_lead_claims"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "lead_id" bigint,
    "contractor_id" bigint NOT NULL,
    "organization_id" "uuid",
    "appointment_date" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "notes" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reschedule_job_appointment"("p_appointment_id" bigint, "p_appointment_date" timestamp with time zone, "p_notes" "text" DEFAULT NULL::"text") RETURNS "public"."appointments"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_existing public.appointments%rowtype;
  v_replacement public.appointments%rowtype;
begin
  if p_appointment_date is null then
    raise exception 'Replacement appointment date is required';
  end if;

  select * into v_existing
  from public.appointments a
  where a.id = p_appointment_id
    and a.status = 'scheduled'
  for update;

  if not found then
    raise exception 'Scheduled appointment is not available';
  end if;

  update public.appointments
  set status = 'cancelled'
  where id = v_existing.id;

  insert into public.appointments (
    workspace_id,
    job_id,
    lead_id,
    contractor_id,
    organization_id,
    appointment_date,
    status,
    notes,
    created_by
  ) values (
    v_existing.workspace_id,
    v_existing.job_id,
    v_existing.lead_id,
    v_existing.contractor_id,
    v_existing.organization_id,
    p_appointment_date,
    'scheduled',
    coalesce(p_notes, v_existing.notes),
    (select auth.uid())
  )
  returning * into v_replacement;

  return v_replacement;
end;
$$;


ALTER FUNCTION "public"."reschedule_job_appointment"("p_appointment_id" bigint, "p_appointment_date" timestamp with time zone, "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_lead_next_status"("p_workspace_id" "uuid", "p_from_status" "text", "p_action_type" "text" DEFAULT 'CALL'::"text") RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
  SELECT t.to_status
  FROM public.lead_stage_transitions_v2 t
  WHERE t.workspace_id = p_workspace_id
    AND t.from_status = p_from_status
  LIMIT 1;
$$;


ALTER FUNCTION "public"."resolve_lead_next_status"("p_workspace_id" "uuid", "p_from_status" "text", "p_action_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."retry_policies_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."retry_policies_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_agent uuid;
  v_assigned uuid;
  v_attempts int := 0;
begin
  -- bounded attempts to avoid infinite loops
  while v_attempts < 5 and v_assigned is null loop
    v_attempts := v_attempts + 1;

    -- 1) pick best eligible agent (capacity + idle + fairness + priority)
    select om.user_id
      into v_agent
    from org_members om
    where om.organization_id = p_workspace_id
      and /* agent is active in last X minutes */
          om.last_active_at >= now() - interval '5 minutes'
      and /* under max capacity */
          (select count(*) from crm_workspace_lead_claims c
            where c.workspace_id = p_workspace_id
              and c.locked_at > now() - interval '5 minutes'
              and c.user_id = om.user_id) < om.max_capacity
    order by
      /* least active leads */ 1,
      /* longest idle time */ 2,
      /* fairness weight / round robin */ 3
    limit 1;

    -- 2) claim atomically
    begin
      v_assigned := public.claim_workspace_lead(p_workspace_id, p_lead_id, v_agent);
    exception when others then
      -- if your claim function signals failure via exception, handle it here
      v_assigned := null;
    end;

    -- if claim succeeded, loop ends
  end loop;

  return v_assigned; -- may be null if no agents available
end;
$$;


ALTER FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_max_attempts" integer DEFAULT 5) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_attempts int := 0;
  v_assigned_agent uuid;

  -- lead signals
  v_lead_created_at timestamptz;
  v_lead_priority text;
  v_lead_next_follow_up_at timestamptz;
  v_lead_archived boolean;

  -- lead scoring components
  v_freshness_component numeric;
  v_priority_component numeric;
  v_followup_component numeric;
  v_staleness_component numeric;
  v_sla_component numeric;
  v_lead_score numeric;

  -- agent selection
  v_best_agent uuid;

  v_now timestamptz := now();
begin
  -- Workspace authorization guard (must be early)
  if p_workspace_id is null or auth.uid() is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Not a workspace member';
  end if;

  if p_workspace_id is null or p_lead_id is null then
    return null;
  end if;

  -- Early exit: lead already actively claimed
  select cl.lock_owner
    into v_assigned_agent
  from public.crm_workspace_lead_claims cl
  where cl.workspace_id = p_workspace_id
    and cl.lead_id = p_lead_id
    and cl.expires_at > v_now
    and cl.lock_owner is not null
  order by cl.claimed_at desc
  limit 1;

  if v_assigned_agent is not null then
    return v_assigned_agent;
  end if;

  -- Load lead signals
  select l.created_at, l.priority, l.next_follow_up_at, l.archived
    into v_lead_created_at, v_lead_priority, v_lead_next_follow_up_at, v_lead_archived
  from public.leads l
  where l.workspace_id = p_workspace_id
    and l.id = p_lead_id
  limit 1;

  if v_lead_archived is true then
    return null;
  end if;

  -- Lead score components
  v_freshness_component := greatest(
    0,
    100 - (extract(epoch from (v_now - v_lead_created_at)) / 3600)::numeric
  );

  v_priority_component := case
    when lower(coalesce(v_lead_priority, '')) in ('high','urgent') then 100
    when lower(coalesce(v_lead_priority, '')) = 'medium' then 30
    else 0
  end;

  v_followup_component := case
    when v_lead_next_follow_up_at is not null and v_lead_next_follow_up_at <= v_now then 30
    else 0
  end;

  v_staleness_component := case
    when v_lead_next_follow_up_at is not null and v_lead_next_follow_up_at <= v_now then 50
    else
      greatest(0, (extract(epoch from (v_now - v_lead_created_at)) / 3600)::numeric / 6)
  end;

  -- ✅ SLA escalation tiers
  v_sla_component := 0;

  -- Age-based escalation (minutes since created_at)
  v_sla_component := v_sla_component + case
    when (extract(epoch from (v_now - v_lead_created_at)) / 60) >= 30 then 120
    when (extract(epoch from (v_now - v_lead_created_at)) / 60) >= 15 then 70
    when (extract(epoch from (v_now - v_lead_created_at)) / 60) >= 5 then 25
    else 0
  end;

  -- Follow-up overdue escalation
  v_sla_component := v_sla_component + case
    when v_lead_next_follow_up_at is not null and v_now - v_lead_next_follow_up_at >= interval '30 minutes' then 180
    when v_lead_next_follow_up_at is not null and v_now - v_lead_next_follow_up_at >= interval '15 minutes' then 110
    when v_lead_next_follow_up_at is not null and v_now - v_lead_next_follow_up_at >= interval '5 minutes' then 55
    else 0
  end;

  -- Due-ness hard bump
  v_sla_component := v_sla_component + case
    when v_lead_next_follow_up_at is not null and v_lead_next_follow_up_at <= v_now then 40
    else 0
  end;

  v_lead_score := v_priority_component + v_freshness_component + v_followup_component + v_staleness_component + v_sla_component;

  -- Retry loop
  while v_attempts < coalesce(p_max_attempts, 5) loop
    v_attempts := v_attempts + 1;

    -- Select best agent by combined score
    select om2.user_id
      into v_best_agent
    from public.org_members om2
    where om2.organization_id = p_workspace_id
    order by
      (
        -- workload penalty: count active assigned leads
        (
          100
          - (
              select count(*)
              from public.leads l2
              where l2.workspace_id = p_workspace_id
                and l2.assigned_to = om2.user_id
                and l2.archived = false
                and (l2.assigned_until is null or l2.assigned_until > v_now)
          )::numeric * 20
        )
        -- fairness rotation: time since last claim for this agent
        + (
            extract(epoch from (v_now - coalesce(
              (select max(c2.claimed_at)
               from public.crm_workspace_lead_claims c2
               where c2.workspace_id = p_workspace_id
                 and c2.lock_owner = om2.user_id),
              to_timestamp(0)
            ))) / 60
          )
        -- lead bias
        + v_lead_score
      ) desc
    limit 1;

    if v_best_agent is null then
      return null;
    end if;

    begin
      perform public.claim_workspace_lead(p_workspace_id, p_lead_id, v_best_agent);
    exception
      when others then
        null;
    end;

    -- verify active claim
    select cl.lock_owner
      into v_assigned_agent
    from public.crm_workspace_lead_claims cl
    where cl.workspace_id = p_workspace_id
      and cl.lead_id = p_lead_id
      and cl.expires_at > v_now
      and cl.lock_owner is not null
    order by cl.claimed_at desc
    limit 1;

    if v_assigned_agent is not null then
      return v_assigned_agent;
    end if;
  end loop;

  return null;
end;
$$;


ALTER FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_max_attempts" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_automation_job_failed"("p_job_id" "uuid", "p_error" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
BEGIN
  UPDATE public.automation_jobs
  SET status = 'failed',
      failed_at = now(),
      error_message = p_error,
      updated_at = now()
  WHERE id = p_job_id;
END;
$$;


ALTER FUNCTION "public"."set_automation_job_failed"("p_job_id" "uuid", "p_error" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_automation_job_success"("p_job_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
BEGIN
  UPDATE public.automation_jobs
  SET status = 'success',
      completed_at = now(),
      error_message = NULL,
      updated_at = now()
  WHERE id = p_job_id;
END;
$$;


ALTER FUNCTION "public"."set_automation_job_success"("p_job_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_default_followup"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  if NEW.next_follow_up is null then
    NEW.next_follow_up := now() + interval '24 hours';
  end if;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."set_default_followup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_queue_jobs_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_queue_jobs_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_stage_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  if (new.status is distinct from old.status) then
    new.stage_updated_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_stage_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."should_prompt_upgrade"("p_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(upgrade_needed, false)
  from public.workspace_billing_pressure
  where workspace_id = p_workspace_id
  limit 1;
$$;


ALTER FUNCTION "public"."should_prompt_upgrade"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_public_service_request"("p_form_slug" "text", "p_request_id" "uuid", "p_full_name" "text", "p_phone" "text", "p_email" "text" DEFAULT NULL::"text", "p_project_details" "text" DEFAULT NULL::"text") RETURNS TABLE("lead_id" bigint, "accepted" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $_$
declare
  v_form public.public_forms%rowtype;
  v_lead_id bigint;
begin
  if p_request_id is null then
    raise exception 'A request identifier is required.' using errcode = '22023';
  end if;

  select * into v_form
  from public.public_forms
  where form_slug = btrim(p_form_slug)
    and enabled = true;

  if not found then
    raise exception 'This request form is unavailable.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Enter your name.' using errcode = '22023';
  end if;
  if char_length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) < 10 then
    raise exception 'Enter a valid phone number.' using errcode = '22023';
  end if;
  if p_email is not null and btrim(p_email) <> '' and p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_project_details, ''))) < 10 then
    raise exception 'Tell us briefly what service you need.' using errcode = '22023';
  end if;

  select l.id into v_lead_id
  from public.leads l
  where l.workspace_id = v_form.workspace_id
    and l.request_id = p_request_id;

  if v_lead_id is null then
    v_lead_id := causal._ingest_lead_impl(
      v_form.workspace_id,
      p_phone,
      btrim(p_full_name),
      nullif(btrim(coalesce(p_email, '')), ''),
      'new',
      btrim(p_project_details),
      null,
      v_form.source,
      'public_service_request',
      jsonb_build_object('form_slug', v_form.form_slug, 'request_id', p_request_id)
    );

    update public.leads
    set request_id = coalesce(request_id, p_request_id)
    where id = v_lead_id;
  end if;

  return query select v_lead_id, true;
end;
$_$;


ALTER FUNCTION "public"."submit_public_service_request"("p_form_slug" "text", "p_request_id" "uuid", "p_full_name" "text", "p_phone" "text", "p_email" "text", "p_project_details" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."switch_current_workspace"("p_workspace_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.workspace_members wm
    where wm.user_id = auth.uid() and wm.workspace_id = p_workspace_id
  ) then
    raise exception 'You are not a member of that workspace.' using errcode = '42501';
  end if;
  update public.profiles set workspace_id = p_workspace_id where user_id = auth.uid();
  if not found then
    raise exception 'Your profile is unavailable.' using errcode = 'P0002';
  end if;
  return p_workspace_id;
end;
$$;


ALTER FUNCTION "public"."switch_current_workspace"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_lead_pipeline_stage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  -- 1. Guard clause
  IF NEW.status IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Resolve pipeline stage strictly within pipeline scope
  SELECT ps.id
  INTO NEW.pipeline_stage_id
  FROM public.pipeline_stages ps
  WHERE ps.pipeline_id = NEW.pipeline_id
    AND LOWER(TRIM(ps.name)) = LOWER(TRIM(NEW.status))
  ORDER BY ps.position ASC
  LIMIT 1;

  -- 3. HARD FAIL if mapping does not exist (critical production safety)
  IF NEW.pipeline_stage_id IS NULL THEN
    RAISE EXCEPTION
      'Pipeline stage mapping missing: pipeline_id=% status=%',
      NEW.pipeline_id,
      NEW.status;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_lead_pipeline_stage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_auth_context"() RETURNS json
    LANGUAGE "sql"
    SET "search_path" TO 'pg_catalog', 'auth'
    AS $$
  select json_build_object(
    'auth_uid', auth.uid(),
    'jwt_sub', (auth.jwt() ->> 'sub'),
    'jwt_role', (auth.jwt() ->> 'role')
  );
$$;


ALTER FUNCTION "public"."test_auth_context"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_lead_created_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Prevent accidental duplicate creation (defensive)
  if exists (
    select 1
    from public.lead_events
    where lead_id = NEW.id::text
      and workspace_id = NEW.workspace_id
      and event_type = 'lead_created'
  ) then
    return NEW;
  end if;

  insert into public.lead_events (
    lead_id,
    workspace_id,
    event_type,
    payload,
    metadata,
    created_at,
    idempotency_key
  ) values (
    NEW.id::text,
    NEW.workspace_id,
    'lead_created',
    '{}'::jsonb,
    null,
    now(),
    NEW.id_uuid
  );

  return NEW;
end;
$$;


ALTER FUNCTION "public"."trg_lead_created_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_leads_route_on_new"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (
    TG_OP = 'INSERT'
    AND NEW.status = 'NEW'::lead_status
  )
  OR (
    TG_OP = 'UPDATE'
    AND OLD.status IS DISTINCT FROM NEW.status
    AND NEW.status = 'NEW'::lead_status
  )
  THEN
    PERFORM public.enqueue_route_lead(
      NEW.workspace_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_leads_route_on_new"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_set_lead_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  if new.lead_number is null then
    new.lead_number := nextval('public.leads_lead_number_seq');
  end if;

  if new.lead_code is null or btrim(new.lead_code) = '' then
    new.lead_code :=
      'HLC-' ||
      to_char(current_timestamp, 'YYMM') ||
      '-' ||
      lpad(new.lead_number::text, 5, '0');
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."trg_set_lead_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_lead_priority_from_call_logs"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
BEGIN
  INSERT INTO public.queue_jobs (
    workspace_id,
    job_type,
    payload,
    status,
    run_at,
    attempt_no,
    max_attempts,
    priority,
    job_key,
    created_at,
    updated_at
  )
  VALUES (
    NEW.workspace_id,
    'recompute_lead_priority',
    jsonb_build_object('lead_id', NEW.lead_id),
    'pending',
    now(),
    0,
    5,
    10,
    'lead:' || NEW.lead_id || ':recompute_priority',
    now(),
    now()
  )
  ON CONFLICT (job_key)
  DO UPDATE SET
    run_at = EXCLUDED.run_at,
    updated_at = now(),
    status = 'pending';

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_lead_priority_from_call_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_lead_priority_from_leads"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'auth'
    AS $$
begin
  -- recompute directly in the base table row
  update public.leads l
  set priority_score = public.compute_priority_score(NEW.id)
  where l.id = NEW.id;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."update_lead_priority_from_leads"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "source" "text",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_waitlist_entry"("p_workspace_id" "uuid", "p_email" "text", "p_source" "text", "p_ip_address" "text", "p_user_agent" "text") RETURNS "public"."waitlist"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_row public.waitlist;
begin
  -- Basic validation
  if p_workspace_id is null then
    raise exception 'workspace_id is required';
  end if;

  if p_email is null or btrim(p_email) = '' then
    raise exception 'email is required';
  end if;

  -- Normalize email a bit (optional)
  p_email := lower(btrim(p_email));

  -- UPSERT
  insert into public.waitlist (
    workspace_id,
    email,
    source,
    ip_address,
    user_agent,
    created_at,
    updated_at
  )
  values (
    p_workspace_id,
    p_email,
    p_source,
    p_ip_address,
    p_user_agent,
    now(),
    now()
  )
  on conflict (workspace_id, email)
  do update set
    source = coalesce(excluded.source, public.waitlist.source),
    ip_address = coalesce(excluded.ip_address, public.waitlist.ip_address),
    user_agent = coalesce(excluded.user_agent, public.waitlist.user_agent),
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;


ALTER FUNCTION "public"."upsert_waitlist_entry"("p_workspace_id" "uuid", "p_email" "text", "p_source" "text", "p_ip_address" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "causal"."leads_state" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "state_hash" "text" NOT NULL,
    "status" "text",
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "causal"."leads_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."lead_frames" (
    "execution_id" "text" NOT NULL,
    "state_hash" "text" NOT NULL,
    "module" "text",
    "layer" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "internal"."lead_frames" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."system_memory_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "actor" "text" DEFAULT 'system'::"text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "internal"."system_memory_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "internal"."system_memory_ledger" (
    "lead_id" bigint NOT NULL,
    "presence_key" "text" NOT NULL,
    "window_end_bucket" bigint NOT NULL,
    "cognitive_state" "jsonb" NOT NULL,
    "story_arcs" "jsonb" NOT NULL,
    "dashboard_snapshot" "jsonb" NOT NULL,
    "interaction_snapshot" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "internal"."system_memory_ledger" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_workload_state" (
    "user_id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "global_workload" integer DEFAULT 0,
    "high_priority_count" integer DEFAULT 0,
    "last_assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agent_workload_state" OWNER TO "postgres";


ALTER TABLE "public"."appointments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."appointments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."automation_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_type" "text" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "retry_count" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 5 NOT NULL,
    "locked_at" timestamp with time zone,
    "locked_by" "uuid",
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "error_message" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "automation_jobs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'processing'::"text", 'success'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."automation_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brand_context" (
    "workspace_id" "uuid" NOT NULL,
    "brand_name" "text",
    "tagline" "text",
    "logo_url" "text",
    "banner_url" "text",
    "contact_phone" "text",
    "contact_email" "text"
);


ALTER TABLE "public"."brand_context" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_profile" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "business_name" "text",
    "owner_name" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "logo_url" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."business_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."call_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint NOT NULL,
    "outcome" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "request_id" "uuid"
);


ALTER TABLE "public"."call_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."call_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "lock_owner" "text" NOT NULL,
    "current_lead_id" bigint,
    "dial_state" "text" DEFAULT 'ready'::"text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_action_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_error" "text",
    CONSTRAINT "call_sessions_dial_state_check" CHECK (("dial_state" = ANY (ARRAY['ready'::"text", 'dialing'::"text", 'in_call'::"text", 'waiting_outcome'::"text", 'paused'::"text", 'ended'::"text"]))),
    CONSTRAINT "call_sessions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'idle'::"text", 'paused'::"text", 'ended'::"text"])))
);


ALTER TABLE "public"."call_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contractors" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "company_name" "text",
    "contact_name" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "status" "text",
    "updated_at" timestamp with time zone,
    "specialty" "text",
    "license_number" "text"
);


ALTER TABLE "public"."contractors" OWNER TO "postgres";


ALTER TABLE "public"."contractors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contractors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."crm_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" "text",
    "event_type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."crm_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_workspace_claims" (
    "workspace_id" "uuid" NOT NULL,
    "locked_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "lock_owner" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."crm_workspace_claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_workspace_dirty" (
    "workspace_id" "uuid" NOT NULL,
    "dirty" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."crm_workspace_dirty" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_workspace_lead_claims" (
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint NOT NULL,
    "lock_owner" "uuid",
    "claimed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."crm_workspace_lead_claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_workspace_metrics" (
    "workspace_id" "uuid" NOT NULL,
    "total_leads" integer DEFAULT 0 NOT NULL,
    "new_leads" integer DEFAULT 0 NOT NULL,
    "contacted_leads" integer DEFAULT 0 NOT NULL,
    "qualified_leads" integer DEFAULT 0 NOT NULL,
    "leads_last_7_days" integer DEFAULT 0 NOT NULL,
    "total_calls" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."crm_workspace_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_members" (
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "skills" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "org_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."org_members" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."current_user_org" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "organization_id"
   FROM "public"."org_members" "om"
  WHERE ("user_id" = "auth"."uid"());


ALTER VIEW "public"."current_user_org" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_key" "text" NOT NULL,
    "name" "text",
    "subject" "text",
    "html" "text",
    "text" "text",
    "variables" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."estimate_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "estimate_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "unit_cost" numeric NOT NULL,
    "sort_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "estimate_lines_quantity_check" CHECK (("quantity" >= (0)::numeric)),
    CONSTRAINT "estimate_lines_sort_order_check" CHECK (("sort_order" >= 0)),
    CONSTRAINT "estimate_lines_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric))
);


ALTER TABLE "public"."estimate_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."estimates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "markup_percent" numeric DEFAULT 0 NOT NULL,
    "subtotal" numeric DEFAULT 0 NOT NULL,
    "markup_amount" numeric DEFAULT 0 NOT NULL,
    "total" numeric DEFAULT 0 NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "converted_to_job_at" timestamp with time zone,
    CONSTRAINT "estimates_markup_amount_check" CHECK (("markup_amount" >= (0)::numeric)),
    CONSTRAINT "estimates_markup_percent_check" CHECK (("markup_percent" >= (0)::numeric)),
    CONSTRAINT "estimates_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'accepted'::"text", 'rejected'::"text", 'converted'::"text"]))),
    CONSTRAINT "estimates_subtotal_check" CHECK (("subtotal" >= (0)::numeric)),
    CONSTRAINT "estimates_total_check" CHECK (("total" >= (0)::numeric))
);


ALTER TABLE "public"."estimates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follow_ups" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "lead_id" "uuid",
    "assigned_user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "scheduled_for" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "notes" "text",
    "follow_up_type" "text" DEFAULT 'call'::"text"
);


ALTER TABLE "public"."follow_ups" OWNER TO "postgres";


ALTER TABLE "public"."follow_ups" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."follow_ups_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."hlcx2" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hlcx2" OWNER TO "postgres";


ALTER TABLE "public"."hlcx2" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."hlcx2_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interaction_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" DEFAULT '00000000-0000-0000-0000-000000000000'::"uuid",
    "lead_id" "uuid",
    "interaction_type" "text" DEFAULT 'OUTBOUND_CALL'::"text",
    "sanitized_destination" "text" NOT NULL,
    "initiated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'ringing'::"text",
    "claimed_by" "uuid",
    "claimed_at" timestamp with time zone
);


ALTER TABLE "public"."interaction_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "contractor_id" bigint NOT NULL,
    "status" "text" DEFAULT 'offered'::"text" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "job_assignments_status_check" CHECK (("status" = ANY (ARRAY['offered'::"text", 'accepted'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."job_assignments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."job_state_trace" WITH ("security_invoker"='on') AS
 SELECT "id",
    "workspace_id",
    "status",
    "attempt_no",
    "max_attempts",
    "claimed_by",
    "lease_expires_at",
        CASE
            WHEN ("attempt_no" >= "max_attempts") THEN 'dead'::"text"
            WHEN (("claimed_by" IS NOT NULL) AND ("lease_expires_at" IS NOT NULL) AND ("lease_expires_at" > "now"())) THEN 'leased'::"text"
            WHEN (("claimed_by" IS NOT NULL) AND (("lease_expires_at" IS NULL) OR ("lease_expires_at" <= "now"()))) THEN 'zombie'::"text"
            WHEN ("claimed_by" IS NULL) THEN 'unowned'::"text"
            ELSE 'invalid'::"text"
        END AS "canonical_state"
   FROM "public"."queue_jobs";


ALTER VIEW "public"."job_state_trace" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint,
    "user_id" "uuid",
    "activity_type" "text" NOT NULL,
    "outcome" "text",
    "notes" "text",
    "duration_seconds" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "appointment_id" bigint,
    "request_id" "uuid"
);


ALTER TABLE "public"."lead_activities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."lead_code_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."lead_code_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_drift_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint NOT NULL,
    "drift_type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "actual_state" "text",
    "expected_state" "text",
    "oracle_log_id" bigint,
    "oracle_created_at" timestamp with time zone,
    "run_id" "uuid" NOT NULL,
    "signature" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "retry_count" integer DEFAULT 0 NOT NULL,
    "notified_at" timestamp with time zone,
    "processed_at" timestamp with time zone,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "drift_fingerprint" "text",
    "last_notified_severity" "text",
    CONSTRAINT "lead_drift_alerts_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'processing'::"text", 'notified'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."lead_drift_alerts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."lead_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."lead_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."lead_events_id_seq" OWNED BY "public"."lead_events"."id";



CREATE OR REPLACE VIEW "public"."lead_health" WITH ("security_invoker"='on') AS
 SELECT "id" AS "lead_id",
    "workspace_id",
    "status",
    "pipeline_id",
    "pipeline_stage_id",
    "assigned_to",
    "next_follow_up_at",
    "stage_updated_at",
    (EXTRACT(epoch FROM ("now"() - "stage_updated_at")) / (3600)::numeric) AS "stage_age_hours",
        CASE
            WHEN (("next_follow_up_at" < "now"()) OR ("stage_updated_at" < ("now"() - '72:00:00'::interval))) THEN 'HOT'::"text"
            WHEN ("next_follow_up_at" <= ("now"() + '72:00:00'::interval)) THEN 'ACTIVE'::"text"
            ELSE 'COLD'::"text"
        END AS "health_bucket"
   FROM "public"."leads" "l"
  WHERE ("archived" = false);


ALTER VIEW "public"."lead_health" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "payload" "jsonb",
    "attempts" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."raw_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ts" bigint NOT NULL,
    "lead_id" "text" NOT NULL,
    "presence_key" "text" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."raw_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."lead_stage_conversion_matrix" WITH ("security_invoker"='on') AS
 WITH "transitions" AS (
         SELECT "raw_events"."workspace_id",
            ("raw_events"."payload" #>> '{old,status}'::"text"[]) AS "from_status",
            ("raw_events"."payload" #>> '{new,status}'::"text"[]) AS "to_status"
           FROM "public"."raw_events"
          WHERE (("raw_events"."event_type" = 'lead.stage_changed'::"text") AND (("raw_events"."payload" #>> '{old,status}'::"text"[]) IS NOT NULL) AND (("raw_events"."payload" #>> '{new,status}'::"text"[]) IS NOT NULL))
        ), "counts" AS (
         SELECT "transitions"."workspace_id",
            "transitions"."from_status",
            "transitions"."to_status",
            "count"(*) AS "transition_count"
           FROM "transitions"
          GROUP BY "transitions"."workspace_id", "transitions"."from_status", "transitions"."to_status"
        ), "exits" AS (
         SELECT "counts"."workspace_id",
            "counts"."from_status",
            ("sum"("counts"."transition_count"))::bigint AS "total_exits"
           FROM "counts"
          GROUP BY "counts"."workspace_id", "counts"."from_status"
        )
 SELECT "c"."workspace_id",
    "c"."from_status",
    "c"."to_status",
    "c"."transition_count",
    "e"."total_exits",
    ((("c"."transition_count")::numeric / (NULLIF("e"."total_exits", 0))::numeric))::numeric(20,4) AS "conversion_rate"
   FROM ("counts" "c"
     JOIN "exits" "e" ON ((("e"."workspace_id" = "c"."workspace_id") AND ("e"."from_status" = "c"."from_status"))));


ALTER VIEW "public"."lead_stage_conversion_matrix" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."lead_stage_history" WITH ("security_invoker"='on') AS
 WITH "normalized" AS (
         SELECT "ce"."id" AS "crm_event_id",
            "ce"."workspace_id",
            "ce"."lead_id",
            "ce"."created_at" AS "event_time",
            "ce"."event_type",
            "ce"."payload",
            COALESCE(("ce"."payload" ->> 'status'::"text"), (("ce"."payload" -> 'new'::"text") ->> 'status'::"text"), (("ce"."payload" -> 'lead'::"text") ->> 'status'::"text"), ("ce"."payload" ->> 'stage'::"text"), ("ce"."payload" ->> 'pipeline_stage'::"text")) AS "status_from_event"
           FROM "public"."crm_events" "ce"
          WHERE ("ce"."lead_id" IS NOT NULL)
        ), "status_dedup" AS (
         SELECT "normalized"."workspace_id",
            "normalized"."lead_id",
            "normalized"."event_time",
            "normalized"."event_type",
            "normalized"."status_from_event" AS "to_status",
            "lag"("normalized"."status_from_event") OVER (PARTITION BY "normalized"."workspace_id", "normalized"."lead_id" ORDER BY "normalized"."event_time", "normalized"."crm_event_id") AS "from_status"
           FROM "normalized"
        )
 SELECT "workspace_id",
    "lead_id",
    "from_status",
    "to_status",
    "event_time",
    "event_type"
   FROM "status_dedup"
  WHERE (("to_status" IS NOT NULL) AND (("from_status" IS NULL) OR ("from_status" IS DISTINCT FROM "to_status")))
  ORDER BY "workspace_id", "lead_id", "event_time";


ALTER VIEW "public"."lead_stage_history" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."raw_events_typed" WITH ("security_invoker"='on') AS
 SELECT "id",
    "workspace_id",
    "lead_id",
    "event_type",
    "payload",
    "ts",
    "to_timestamp"(((("ts")::numeric / 1000.0))::double precision) AS "event_time"
   FROM "public"."raw_events";


ALTER VIEW "public"."raw_events_typed" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."lead_stage_timeline" WITH ("security_invoker"='on') AS
 WITH "created" AS (
         SELECT "raw_events_typed"."workspace_id",
            "raw_events_typed"."lead_id",
            "to_timestamp"(((("raw_events_typed"."ts")::numeric / 1000.0))::double precision) AS "event_time",
            'lead.created'::"text" AS "event_type",
            COALESCE(("raw_events_typed"."payload" #>> '{new,status}'::"text"[]), ("raw_events_typed"."payload" #>> '{new,stage}'::"text"[]), ("raw_events_typed"."payload" #>> '{status}'::"text"[]), 'New'::"text") AS "to_status"
           FROM "public"."raw_events_typed"
          WHERE ("raw_events_typed"."event_type" = 'lead.created'::"text")
        ), "stage_changed" AS (
         SELECT "raw_events_typed"."workspace_id",
            "raw_events_typed"."lead_id",
            "to_timestamp"(((("raw_events_typed"."ts")::numeric / 1000.0))::double precision) AS "event_time",
            'lead.stage_changed'::"text" AS "event_type",
            ("raw_events_typed"."payload" #>> '{new,status}'::"text"[]) AS "to_status"
           FROM "public"."raw_events_typed"
          WHERE ("raw_events_typed"."event_type" = 'lead.stage_changed'::"text")
        ), "timeline" AS (
         SELECT "stage_changed"."workspace_id",
            "stage_changed"."lead_id",
            "stage_changed"."event_time",
            "stage_changed"."event_type",
            "stage_changed"."to_status"
           FROM "stage_changed"
        UNION ALL
         SELECT "created"."workspace_id",
            "created"."lead_id",
            "created"."event_time",
            "created"."event_type",
            "created"."to_status"
           FROM "created"
        )
 SELECT "workspace_id",
    "lead_id",
    "event_time",
    "event_type",
    "to_status" AS "stage",
    "lead"("to_status") OVER (PARTITION BY "workspace_id", "lead_id" ORDER BY "event_time") AS "next_stage",
    "lead"("event_time") OVER (PARTITION BY "workspace_id", "lead_id" ORDER BY "event_time") AS "next_event_time"
   FROM "timeline"
  WHERE ("to_status" IS NOT NULL);


ALTER VIEW "public"."lead_stage_timeline" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."lead_stage_timing" WITH ("security_invoker"='on') AS
 SELECT "workspace_id",
    "lead_id",
    "event_type",
    "ts",
    "payload"
   FROM "public"."raw_events"
  WHERE ("event_type" = ANY (ARRAY['lead.stage_changed'::"text", 'lead.created'::"text"]));


ALTER VIEW "public"."lead_stage_timing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_stage_transitions_v2" (
    "id" bigint NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "from_status" "text" NOT NULL,
    "to_status" "text" NOT NULL
);


ALTER TABLE "public"."lead_stage_transitions_v2" OWNER TO "postgres";


ALTER TABLE "public"."lead_stage_transitions_v2" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."lead_stage_transitions_v2_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."lead_time_in_stage" WITH ("security_invoker"='on') AS
 SELECT "workspace_id",
    "lead_id",
    "stage" AS "status",
    "event_time" AS "stage_entered_at",
    "next_event_time" AS "stage_left_at",
    (EXTRACT(epoch FROM ("next_event_time" - "event_time")))::bigint AS "time_in_stage_seconds"
   FROM "public"."lead_stage_timeline"
  WHERE ("next_event_time" IS NOT NULL);


ALTER VIEW "public"."lead_time_in_stage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_transition_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "from_state" "text" NOT NULL,
    "to_state" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."lead_transition_log" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."lead_urgency_intelligence" WITH ("security_invoker"='on') AS
 SELECT "id_uuid",
    "workspace_id",
    "pipeline_id",
    "pipeline_stage_id",
    "next_follow_up_at",
    "priority_score",
        CASE
            WHEN ("next_follow_up_at" IS NULL) THEN 'NO_FOLLOW_UP'::"text"
            WHEN ("next_follow_up_at" < "now"()) THEN 'OVERDUE'::"text"
            WHEN ("next_follow_up_at" < ("now"() + '24:00:00'::interval)) THEN 'DUE_TODAY'::"text"
            ELSE 'FUTURE'::"text"
        END AS "follow_up_bucket"
   FROM "public"."leads" "l";


ALTER VIEW "public"."lead_urgency_intelligence" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."lead_velocity_analytics" WITH ("security_invoker"='on') AS
 WITH "latest_transitions" AS (
         SELECT DISTINCT ON ("lead_transition_log"."lead_id") "lead_transition_log"."lead_id",
            "lead_transition_log"."created_at" AS "transitioned_at",
            "lead_transition_log"."to_state"
           FROM "public"."lead_transition_log"
          ORDER BY "lead_transition_log"."lead_id", "lead_transition_log"."created_at" DESC
        )
 SELECT "l"."id_uuid" AS "lead_id",
    "l"."workspace_id",
    "l"."full_name",
    COALESCE("t"."to_state", "l"."stage") AS "stage",
    "l"."conversion_score",
    COALESCE("t"."transitioned_at", "l"."created_at") AS "current_stage_entered_at",
    (EXTRACT(epoch FROM ("now"() - COALESCE("t"."transitioned_at", "l"."created_at"))) / 86400.0) AS "days_in_current_stage"
   FROM ("public"."leads" "l"
     LEFT JOIN "latest_transitions" "t" ON (("l"."id_uuid" = "t"."lead_id")));


ALTER VIEW "public"."lead_velocity_analytics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leads_artifact" WITH ("security_invoker"='on') AS
 SELECT "id",
    "state_hash",
    "status",
    "data"
   FROM "causal"."leads_state" "s";


ALTER VIEW "public"."leads_artifact" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leads_stage_normalized" WITH ("security_invoker"='on') AS
 SELECT "id",
    "workspace_id",
    COALESCE("status", 'New'::"text") AS "status",
    "created_at",
    "updated_at",
    "stage_updated_at"
   FROM "public"."leads";


ALTER VIEW "public"."leads_stage_normalized" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leads_funnel_snapshot" WITH ("security_invoker"='on') AS
 SELECT "workspace_id",
    "status",
    "count"(*) AS "lead_count"
   FROM "public"."leads_stage_normalized"
  GROUP BY "workspace_id", "status";


ALTER VIEW "public"."leads_funnel_snapshot" OWNER TO "postgres";


ALTER TABLE "public"."leads" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."leads_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."leads_new" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "status" "text" DEFAULT 'new'::"text",
    "user_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."leads_new" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads_new" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leads_time_in_stage_stats" WITH ("security_invoker"='on') AS
 SELECT "workspace_id",
    "status",
    "count"(*) AS "observations",
    ("avg"("time_in_stage_seconds"))::numeric(20,2) AS "avg_time_in_stage_seconds",
    ("percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("time_in_stage_seconds")::double precision)))::bigint AS "median_time_in_stage_seconds",
    ("percentile_cont"((0.9)::double precision) WITHIN GROUP (ORDER BY (("time_in_stage_seconds")::double precision)))::bigint AS "p90_time_in_stage_seconds"
   FROM "public"."lead_time_in_stage"
  GROUP BY "workspace_id", "status";


ALTER VIEW "public"."leads_time_in_stage_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leads_velocity" WITH ("security_invoker"='on') AS
 WITH "created_events" AS (
         SELECT "raw_events"."workspace_id",
            ("to_timestamp"(((("raw_events"."ts")::numeric / 1000.0))::double precision))::"date" AS "created_date"
           FROM "public"."raw_events"
          WHERE ("raw_events"."event_type" = 'lead.created'::"text")
        )
 SELECT "workspace_id",
    "created_date",
    "count"(*) AS "leads_created",
    ("avg"("count"(*)) OVER (PARTITION BY "workspace_id" ORDER BY "created_date" ROWS BETWEEN 6 PRECEDING AND CURRENT ROW))::numeric(20,2) AS "leads_created_rolling_7d_avg"
   FROM "created_events"
  GROUP BY "workspace_id", "created_date";


ALTER VIEW "public"."leads_velocity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "brand_name" "text" DEFAULT 'HomeLead Connect'::"text",
    "brand_tagline" "text" DEFAULT 'AI Lead Routing CRM'::"text",
    "logo_url" "text" DEFAULT 'LOGO_PLACEHOLDER'::"text",
    "banner_url" "text" DEFAULT 'BANNER_PLACEHOLDER'::"text",
    "designed_by" "text" DEFAULT 'Dion Diamond'::"text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pipeline_stages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pipeline_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pipeline_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "price_cents" integer NOT NULL,
    "currency" "text" DEFAULT 'usd'::"text" NOT NULL,
    "interval" "text" DEFAULT 'month'::"text" NOT NULL,
    "lead_limit" integer DEFAULT 0 NOT NULL,
    "pipeline_limit" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_price_id" "text"
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'owner'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_step" "text" DEFAULT 'start'::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_slug" "text" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT true,
    "source" "text" DEFAULT 'carrd'::"text"
);


ALTER TABLE "public"."public_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."queue_job_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "queue_job_id" "uuid" NOT NULL,
    "attempt_no" integer NOT NULL,
    "status" "text" NOT NULL,
    "error" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "queue_job_attempts_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'leased'::"text", 'running'::"text", 'success'::"text", 'failed'::"text", 'dead'::"text"])))
);


ALTER TABLE "public"."queue_job_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retry_policies" (
    "job_type" "text" NOT NULL,
    "should_retry" boolean DEFAULT true NOT NULL,
    "retry_delay_seconds" integer DEFAULT 60 NOT NULL,
    "max_attempts" integer DEFAULT 5 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."retry_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scripts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."scripts" OWNER TO "postgres";


ALTER TABLE "public"."scripts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."scripts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_price_id" "text",
    "plan_key" "text" NOT NULL,
    "status" "text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "full_name" "text",
    "email" "text",
    "role" "text" DEFAULT 'agent'::"text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'agent'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_funnel_counts" WITH ("security_invoker"='on') AS
 SELECT "ps"."name" AS "stage_name",
    "ps"."position" AS "stage_position",
    "count"("l"."id") AS "lead_count"
   FROM ("public"."pipeline_stages" "ps"
     LEFT JOIN "public"."leads" "l" ON (("l"."pipeline_stage_id" = "ps"."id")))
  GROUP BY "ps"."id", "ps"."name", "ps"."position"
  ORDER BY "ps"."position";


ALTER VIEW "public"."v_funnel_counts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_lead_event_stream" WITH ("security_invoker"='on') AS
 SELECT "id",
    "lead_id",
    "workspace_id",
    "event_type",
    "payload",
    "created_at"
   FROM "public"."lead_events"
  ORDER BY "workspace_id", "id";


ALTER VIEW "public"."v_lead_event_stream" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_lead_event_timeline" WITH ("security_invoker"='on') AS
 SELECT "e"."id" AS "event_id",
    "e"."workspace_id",
    "e"."lead_id",
    "l"."full_name",
    "e"."event_type",
    "e"."payload",
    "e"."created_at"
   FROM ("public"."crm_events" "e"
     LEFT JOIN "public"."leads" "l" ON ((("l"."id")::"text" = "e"."lead_id")))
  ORDER BY "e"."created_at" DESC;


ALTER VIEW "public"."v_lead_event_timeline" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "lead_id" bigint,
    "appointment_id" bigint,
    "generated_from_text" "text" NOT NULL,
    "audio_bucket" "text" DEFAULT 'voice-audio'::"text" NOT NULL,
    "audio_object_name" "text" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "error_message" "text",
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "voice_messages_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'processing'::"text", 'ready'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."voice_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "ip_hash" "text" NOT NULL,
    "minute_start" timestamp with time zone NOT NULL,
    "request_count" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."waitlist_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."worker_job_states" (
    "state" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."worker_job_states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."workspace_members" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_rate_limits" (
    "workspace_id" "uuid" NOT NULL,
    "last_request_at" timestamp with time zone,
    "request_count" integer DEFAULT 0
);

ALTER TABLE ONLY "public"."workspace_rate_limits" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


ALTER TABLE ONLY "public"."lead_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."lead_events_id_seq"'::"regclass");



ALTER TABLE ONLY "causal"."leads_state"
    ADD CONSTRAINT "leads_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "internal"."lead_frames"
    ADD CONSTRAINT "lead_frames_pkey" PRIMARY KEY ("execution_id");



ALTER TABLE ONLY "internal"."system_memory_events"
    ADD CONSTRAINT "system_memory_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "internal"."system_memory_ledger"
    ADD CONSTRAINT "system_memory_ledger_pkey" PRIMARY KEY ("lead_id", "window_end_bucket", "presence_key");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_workload_state"
    ADD CONSTRAINT "agent_workload_state_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_jobs"
    ADD CONSTRAINT "automation_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_context"
    ADD CONSTRAINT "brand_context_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."business_profile"
    ADD CONSTRAINT "business_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_profile"
    ADD CONSTRAINT "business_profile_workspace_id_key" UNIQUE ("workspace_id");



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."call_sessions"
    ADD CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contractors"
    ADD CONSTRAINT "contractors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crm_events"
    ADD CONSTRAINT "crm_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crm_jobs"
    ADD CONSTRAINT "crm_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crm_jobs"
    ADD CONSTRAINT "crm_jobs_source_estimate_unique" UNIQUE ("source_estimate_id");



ALTER TABLE ONLY "public"."crm_workspace_claims"
    ADD CONSTRAINT "crm_workspace_claims_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."crm_workspace_dirty"
    ADD CONSTRAINT "crm_workspace_dirty_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."crm_workspace_lead_claims"
    ADD CONSTRAINT "crm_workspace_lead_claims_pkey" PRIMARY KEY ("workspace_id", "lead_id");



ALTER TABLE ONLY "public"."crm_workspace_metrics"
    ADD CONSTRAINT "crm_workspace_metrics_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_template_key_key" UNIQUE ("template_key");



ALTER TABLE ONLY "public"."estimate_lines"
    ADD CONSTRAINT "estimate_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follow_ups"
    ADD CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hlcx2"
    ADD CONSTRAINT "hlcx2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interaction_logs"
    ADD CONSTRAINT "interaction_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_drift_alerts"
    ADD CONSTRAINT "lead_drift_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_events"
    ADD CONSTRAINT "lead_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_queue"
    ADD CONSTRAINT "lead_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_stage_transitions_v2"
    ADD CONSTRAINT "lead_stage_transitions_unique_edge" UNIQUE ("workspace_id", "from_status", "to_status");



ALTER TABLE ONLY "public"."lead_stage_transitions_v2"
    ADD CONSTRAINT "lead_stage_transitions_v2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_stage_transitions_v2"
    ADD CONSTRAINT "lead_stage_transitions_v2_unique" UNIQUE ("workspace_id", "from_status");



ALTER TABLE ONLY "public"."lead_transition_log"
    ADD CONSTRAINT "lead_transition_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_id_uuid_unique" UNIQUE ("id_uuid");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_lead_code_unique" UNIQUE ("lead_code");



ALTER TABLE ONLY "public"."leads_new"
    ADD CONSTRAINT "leads_new_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_workspace_lead_number_unique" UNIQUE ("workspace_id", "lead_number");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_workspace_phone_unique" UNIQUE ("workspace_id", "phone");



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_pkey" PRIMARY KEY ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_pipeline_id_position_key" UNIQUE ("pipeline_id", "position");



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pipelines"
    ADD CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_stripe_price_id_key" UNIQUE ("stripe_price_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."public_forms"
    ADD CONSTRAINT "public_forms_form_slug_key" UNIQUE ("form_slug");



ALTER TABLE ONLY "public"."public_forms"
    ADD CONSTRAINT "public_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."queue_job_attempts"
    ADD CONSTRAINT "queue_job_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."queue_jobs"
    ADD CONSTRAINT "queue_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."raw_events"
    ADD CONSTRAINT "raw_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retry_policies"
    ADD CONSTRAINT "retry_policies_pkey" PRIMARY KEY ("job_type");



ALTER TABLE ONLY "public"."scripts"
    ADD CONSTRAINT "scripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_active_workspace_uniq" UNIQUE ("workspace_id", "stripe_subscription_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "unique_pipeline_stage_name" UNIQUE ("pipeline_id", "name");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."voice_messages"
    ADD CONSTRAINT "voice_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist_rate_limits"
    ADD CONSTRAINT "waitlist_rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist_rate_limits"
    ADD CONSTRAINT "waitlist_rate_limits_unique" UNIQUE ("workspace_id", "ip_hash", "minute_start");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_workspace_email_unique" UNIQUE ("workspace_id", "email");



ALTER TABLE ONLY "public"."worker_job_states"
    ADD CONSTRAINT "worker_job_states_pkey" PRIMARY KEY ("state");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("workspace_id", "user_id");



ALTER TABLE ONLY "public"."workspace_plan_status"
    ADD CONSTRAINT "workspace_plan_status_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."workspace_rate_limits"
    ADD CONSTRAINT "workspace_rate_limits_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "leads_state_hash_unique" ON "causal"."leads_state" USING "btree" ("state_hash");



CREATE INDEX "system_memory_events_entity_idx" ON "internal"."system_memory_events" USING "btree" ("entity_type", "entity_id");



CREATE UNIQUE INDEX "system_memory_events_request_id_uniq" ON "internal"."system_memory_events" USING "btree" ("request_id");



CREATE INDEX "system_memory_events_workspace_idx" ON "internal"."system_memory_events" USING "btree" ("workspace_id");



CREATE INDEX "system_memory_ledger_lead_idx" ON "internal"."system_memory_ledger" USING "btree" ("lead_id");



CREATE INDEX "system_memory_ledger_presence_idx" ON "internal"."system_memory_ledger" USING "btree" ("presence_key");



CREATE INDEX "system_memory_ledger_window_idx" ON "internal"."system_memory_ledger" USING "btree" ("window_end_bucket");



CREATE INDEX "activity_log_workspace_created_at_idx" ON "public"."activity_log" USING "btree" ("workspace_id", "created_at" DESC);



CREATE INDEX "appointments_appointment_date_idx" ON "public"."appointments" USING "btree" ("appointment_date");



CREATE INDEX "appointments_contractor_id_idx" ON "public"."appointments" USING "btree" ("contractor_id");



CREATE INDEX "appointments_created_by_idx" ON "public"."appointments" USING "btree" ("created_by");



CREATE INDEX "appointments_job_id_idx" ON "public"."appointments" USING "btree" ("job_id");



CREATE INDEX "appointments_lead_id_idx" ON "public"."appointments" USING "btree" ("lead_id");



CREATE INDEX "appointments_organization_id_idx" ON "public"."appointments" USING "btree" ("organization_id");



CREATE INDEX "appointments_status_idx" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "appointments_workspace_id_idx" ON "public"."appointments" USING "btree" ("workspace_id");



CREATE INDEX "automation_jobs_queue_idx" ON "public"."automation_jobs" USING "btree" ("status", "created_at");



CREATE INDEX "call_logs_lead_id_created_at_idx" ON "public"."call_logs" USING "btree" ("lead_id", "created_at" DESC);



CREATE INDEX "call_logs_lead_id_idx" ON "public"."call_logs" USING "btree" ("lead_id");



CREATE UNIQUE INDEX "call_logs_request_id_uniq" ON "public"."call_logs" USING "btree" ("request_id") WHERE ("request_id" IS NOT NULL);



CREATE INDEX "call_logs_workspace_id_created_at_idx" ON "public"."call_logs" USING "btree" ("workspace_id", "created_at" DESC);



CREATE INDEX "contractors_workspace_id_idx" ON "public"."contractors" USING "btree" ("workspace_id");



CREATE INDEX "contractors_workspace_specialty_idx" ON "public"."contractors" USING "btree" ("workspace_id", "specialty");



CREATE INDEX "crm_jobs_created_by_idx" ON "public"."crm_jobs" USING "btree" ("created_by");



CREATE INDEX "crm_jobs_lead_id_idx" ON "public"."crm_jobs" USING "btree" ("lead_id");



CREATE INDEX "crm_jobs_status_idx" ON "public"."crm_jobs" USING "btree" ("status");



CREATE INDEX "crm_jobs_workspace_id_idx" ON "public"."crm_jobs" USING "btree" ("workspace_id");



CREATE INDEX "crm_workspace_dirty_dirty_idx" ON "public"."crm_workspace_dirty" USING "btree" ("dirty");



CREATE INDEX "estimate_lines_estimate_id_idx" ON "public"."estimate_lines" USING "btree" ("estimate_id");



CREATE INDEX "estimates_created_by_idx" ON "public"."estimates" USING "btree" ("created_by");



CREATE INDEX "estimates_lead_id_idx" ON "public"."estimates" USING "btree" ("lead_id");



CREATE INDEX "estimates_status_idx" ON "public"."estimates" USING "btree" ("status");



CREATE INDEX "estimates_workspace_id_idx" ON "public"."estimates" USING "btree" ("workspace_id");



CREATE INDEX "follow_ups_assigned_user_id_idx" ON "public"."follow_ups" USING "btree" ("assigned_user_id");



CREATE INDEX "follow_ups_lead_id_idx" ON "public"."follow_ups" USING "btree" ("lead_id");



CREATE INDEX "follow_ups_scheduled_for_idx" ON "public"."follow_ups" USING "btree" ("scheduled_for");



CREATE INDEX "follow_ups_status_idx" ON "public"."follow_ups" USING "btree" ("status");



CREATE INDEX "idx_agent_workload_lookup" ON "public"."agent_workload_state" USING "btree" ("workspace_id", "high_priority_count", "global_workload");



CREATE INDEX "idx_business_profile_workspace" ON "public"."business_profile" USING "btree" ("workspace_id");



CREATE INDEX "idx_call_logs_workspace_id" ON "public"."call_logs" USING "btree" ("workspace_id");



CREATE INDEX "idx_interaction_logs_queue_status" ON "public"."interaction_logs" USING "btree" ("status", "initiated_at" DESC);



CREATE INDEX "idx_lead_claims_workspace_lead_expires" ON "public"."crm_workspace_lead_claims" USING "btree" ("workspace_id", "lead_id", "expires_at");



CREATE INDEX "idx_lead_claims_workspace_lock_owner_claimed_at" ON "public"."crm_workspace_lead_claims" USING "btree" ("workspace_id", "lock_owner", "claimed_at");



CREATE INDEX "idx_lead_log_realtime_lookup" ON "public"."lead_transition_log" USING "btree" ("lead_id", "created_at" DESC);



CREATE INDEX "idx_leads_assigned" ON "public"."leads" USING "btree" ("assigned_to");



CREATE INDEX "idx_leads_concurrency_guard" ON "public"."leads" USING "btree" ("workspace_id", "status", "assigned_to", "priority_weight", "created_at" DESC) WHERE (("status" = 'new'::"text") AND ("assigned_to" IS NULL));



CREATE INDEX "idx_leads_org" ON "public"."leads" USING "btree" ("organization_id");



CREATE INDEX "idx_leads_recovery_lookup" ON "public"."leads" USING "btree" ("status", "next_eligible_dial_at") WHERE ("status" = 'failed'::"text");



CREATE INDEX "idx_leads_route_workload" ON "public"."leads" USING "btree" ("workspace_id", "assigned_to", "archived", "assigned_until");



CREATE INDEX "idx_leads_sla_lookup" ON "public"."leads" USING "btree" ("sla_status", "stage") WHERE ("stage" = 'NEW'::"text");



CREATE INDEX "idx_leads_status" ON "public"."leads" USING "btree" ("status");



CREATE INDEX "idx_leads_workspace" ON "public"."leads" USING "btree" ("workspace_id");



CREATE INDEX "idx_leads_workspace_assigned_to_until" ON "public"."leads" USING "btree" ("workspace_id", "assigned_to", "assigned_until") WHERE ("archived" = false);



CREATE INDEX "idx_leads_workspace_created" ON "public"."leads" USING "btree" ("workspace_id", "created_at" DESC);



CREATE INDEX "idx_leads_workspace_stage" ON "public"."leads" USING "btree" ("workspace_id", "stage");



CREATE INDEX "idx_leads_workspace_status_balanced" ON "public"."leads" USING "btree" ("workspace_id", "status") WHERE ("status" = 'new'::"text");



CREATE INDEX "idx_members_lookup" ON "public"."workspace_members" USING "btree" ("user_id", "workspace_id");



CREATE INDEX "idx_org_members_skills" ON "public"."org_members" USING "gin" ("skills");



CREATE INDEX "idx_profiles_workspace" ON "public"."profiles" USING "btree" ("workspace_id");



CREATE INDEX "idx_raw_events_lead_ts" ON "public"."raw_events" USING "btree" ("lead_id", "ts" DESC);



CREATE INDEX "idx_raw_events_presence_ts" ON "public"."raw_events" USING "btree" ("presence_key", "ts" DESC);



CREATE INDEX "idx_raw_events_workspace" ON "public"."raw_events" USING "btree" ("workspace_id");



CREATE INDEX "idx_workspaces_created_by" ON "public"."workspaces" USING "btree" ("created_by");



CREATE INDEX "interaction_logs_claimed_by_idx" ON "public"."interaction_logs" USING "btree" ("claimed_by");



CREATE INDEX "interaction_logs_lead_id_idx" ON "public"."interaction_logs" USING "btree" ("lead_id");



CREATE INDEX "interaction_logs_workspace_id_idx" ON "public"."interaction_logs" USING "btree" ("workspace_id");



CREATE INDEX "job_assignments_contractor_id_idx" ON "public"."job_assignments" USING "btree" ("contractor_id");



CREATE INDEX "job_assignments_created_by_idx" ON "public"."job_assignments" USING "btree" ("created_by");



CREATE INDEX "job_assignments_job_id_idx" ON "public"."job_assignments" USING "btree" ("job_id");



CREATE UNIQUE INDEX "job_assignments_one_active_per_job_idx" ON "public"."job_assignments" USING "btree" ("job_id") WHERE ("status" = ANY (ARRAY['offered'::"text", 'accepted'::"text"]));



CREATE INDEX "job_assignments_status_idx" ON "public"."job_assignments" USING "btree" ("status");



CREATE INDEX "job_assignments_workspace_id_idx" ON "public"."job_assignments" USING "btree" ("workspace_id");



CREATE INDEX "lead_activities_lead_id_idx" ON "public"."lead_activities" USING "btree" ("lead_id");



CREATE INDEX "lead_activities_user_id_idx" ON "public"."lead_activities" USING "btree" ("user_id");



CREATE INDEX "lead_activities_workspace_id_idx" ON "public"."lead_activities" USING "btree" ("workspace_id");



CREATE INDEX "lead_drift_alerts_claim_idx" ON "public"."lead_drift_alerts" USING "btree" ("status", "created_at");



CREATE INDEX "lead_drift_alerts_notified_lookup" ON "public"."lead_drift_alerts" USING "btree" ("workspace_id", "signature", "notified_at" DESC) WHERE ("status" = 'notified'::"text");



CREATE UNIQUE INDEX "lead_drift_alerts_signature_uniq" ON "public"."lead_drift_alerts" USING "btree" ("signature") WHERE ("status" = ANY (ARRAY['open'::"text", 'processing'::"text"]));



CREATE INDEX "lead_drift_alerts_workspace_claim_idx" ON "public"."lead_drift_alerts" USING "btree" ("workspace_id", "status", "created_at");



CREATE INDEX "lead_events_lead_id_order_idx" ON "public"."lead_events" USING "btree" ("lead_id", "id");



CREATE UNIQUE INDEX "lead_events_unique_mutation_per_lead" ON "public"."lead_events" USING "btree" ("lead_id", (("payload" ->> 'mutation_id'::"text")));



CREATE INDEX "lead_events_workspace_id_order_idx" ON "public"."lead_events" USING "btree" ("workspace_id", "id");



CREATE UNIQUE INDEX "lead_events_workspace_idempotency_key_uniq" ON "public"."lead_events" USING "btree" ("workspace_id", "idempotency_key") WHERE ("idempotency_key" IS NOT NULL);



CREATE INDEX "lead_queue_workspace_status_idx" ON "public"."lead_queue" USING "btree" ("workspace_id", "status");



CREATE INDEX "lead_transition_log_actor_id_idx" ON "public"."lead_transition_log" USING "btree" ("actor_id");



CREATE INDEX "lead_transition_log_workspace_id_idx" ON "public"."lead_transition_log" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "leads_advance_request_unique" ON "public"."leads" USING "btree" ("workspace_id", "advance_request_id");



CREATE INDEX "leads_appointment_status_idx" ON "public"."leads" USING "btree" ("workspace_id", "archived", "appointment_status");



CREATE INDEX "leads_id_uuid_idx" ON "public"."leads" USING "btree" ("id_uuid");



CREATE INDEX "leads_next_follow_up_idx" ON "public"."leads" USING "btree" ("next_follow_up_at");



CREATE INDEX "leads_priority_idx" ON "public"."leads" USING "btree" ("priority");



CREATE UNIQUE INDEX "leads_request_id_uniq" ON "public"."leads" USING "btree" ("request_id");



CREATE INDEX "leads_stage_updated_at_idx" ON "public"."leads" USING "btree" ("stage_updated_at");



CREATE INDEX "leads_workspace_appointment_at_idx" ON "public"."leads" USING "btree" ("workspace_id", "appointment_at") WHERE ("archived" = false);



CREATE INDEX "leads_workspace_appointment_date_idx" ON "public"."leads" USING "btree" ("workspace_id", "archived", "appointment_at");



CREATE INDEX "leads_workspace_archived_idx" ON "public"."leads" USING "btree" ("workspace_id", "archived");



CREATE INDEX "leads_workspace_assigned_to_idx" ON "public"."leads" USING "btree" ("workspace_id", "assigned_to") WHERE ("archived" = false);



CREATE INDEX "leads_workspace_next_follow_up_at_idx" ON "public"."leads" USING "btree" ("workspace_id", "next_follow_up_at") WHERE ("archived" = false);



CREATE INDEX "leads_workspace_priority_idx" ON "public"."leads" USING "btree" ("workspace_id", "priority_score" DESC, "created_at") WHERE ("archived" = false);



CREATE UNIQUE INDEX "leads_workspace_request_id_unique" ON "public"."leads" USING "btree" ("workspace_id", "request_id") WHERE ("request_id" IS NOT NULL);



CREATE INDEX "leads_workspace_status_created_idx" ON "public"."leads" USING "btree" ("workspace_id", "status", "created_at" DESC);



CREATE INDEX "leads_workspace_status_idx" ON "public"."leads" USING "btree" ("workspace_id", "status");



CREATE INDEX "org_members_user_id_idx" ON "public"."org_members" USING "btree" ("user_id");



CREATE INDEX "pipeline_stages_pipeline_position_idx" ON "public"."pipeline_stages" USING "btree" ("pipeline_id", "position");



CREATE INDEX "pipelines_workspace_id_created_at_idx" ON "public"."pipelines" USING "btree" ("workspace_id", "created_at" DESC);



CREATE INDEX "public_forms_enabled_idx" ON "public"."public_forms" USING "btree" ("enabled") WHERE ("enabled" = true);



CREATE INDEX "queue_jobs_claim_idx" ON "public"."queue_jobs" USING "btree" ("workspace_id", "status", "run_at", "priority", "created_at");



CREATE UNIQUE INDEX "queue_jobs_dedupe" ON "public"."queue_jobs" USING "btree" ("workspace_id", "job_type", (("payload" ->> 'lead_id'::"text")));



CREATE UNIQUE INDEX "queue_jobs_job_key_uq" ON "public"."queue_jobs" USING "btree" ("job_key") WHERE ("job_key" IS NOT NULL);



CREATE INDEX "queue_jobs_lease_idx" ON "public"."queue_jobs" USING "btree" ("workspace_id", "lease_expires_at");



CREATE INDEX "subscriptions_workspace_id_idx" ON "public"."subscriptions" USING "btree" ("workspace_id");



CREATE INDEX "waitlist_rate_limits_idx" ON "public"."waitlist_rate_limits" USING "btree" ("workspace_id", "ip_hash", "minute_start");



CREATE INDEX "waitlist_workspace_email_idx" ON "public"."waitlist" USING "btree" ("workspace_id", "email");



CREATE INDEX "workspace_members_user_id_created_at_idx" ON "public"."workspace_members" USING "btree" ("user_id", "created_at");



CREATE INDEX "workspace_plan_status_plan_key_idx" ON "public"."workspace_plan_status" USING "btree" ("plan_key");



CREATE OR REPLACE TRIGGER "trg_system_memory_ledger_updated_at" BEFORE UPDATE ON "internal"."system_memory_ledger" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "appointments_set_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_set_updated_at"();



CREATE OR REPLACE TRIGGER "appointments_validate_job" BEFORE INSERT OR UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_validate_job_appointment"();



CREATE OR REPLACE TRIGGER "appointments_validate_job_schedule" BEFORE INSERT OR UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_validate_job_appointment"();



CREATE OR REPLACE TRIGGER "crm_jobs_set_updated_at" BEFORE UPDATE ON "public"."crm_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_set_updated_at"();



CREATE OR REPLACE TRIGGER "crm_jobs_validate_links" BEFORE INSERT OR UPDATE OF "workspace_id", "lead_id", "source_estimate_id" ON "public"."crm_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_validate_crm_job_links"();



CREATE OR REPLACE TRIGGER "email_templates_set_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "estimate_lines_set_updated_at" BEFORE UPDATE ON "public"."estimate_lines" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_set_updated_at"();



CREATE OR REPLACE TRIGGER "estimates_guard_conversion_state" BEFORE UPDATE ON "public"."estimates" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_guard_estimate_conversion_state"();



CREATE OR REPLACE TRIGGER "estimates_set_updated_at" BEFORE UPDATE ON "public"."estimates" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_set_updated_at"();



CREATE OR REPLACE TRIGGER "estimates_validate_lead_workspace" BEFORE INSERT OR UPDATE OF "workspace_id", "lead_id" ON "public"."estimates" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_validate_estimate_lead_workspace"();



CREATE OR REPLACE TRIGGER "job_assignments_set_updated_at" BEFORE UPDATE ON "public"."job_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_set_updated_at"();



CREATE OR REPLACE TRIGGER "job_assignments_validate" BEFORE INSERT OR UPDATE ON "public"."job_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."hlc_validate_job_assignment"();



CREATE OR REPLACE TRIGGER "lead_created_event_trigger" AFTER INSERT ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."trg_lead_created_event"();



CREATE OR REPLACE TRIGGER "lead_preprocess_trigger" BEFORE INSERT OR UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."lead_preprocess"();



CREATE OR REPLACE TRIGGER "queue_jobs_updated_at_trg" BEFORE UPDATE ON "public"."queue_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_queue_jobs_updated_at"();



CREATE OR REPLACE TRIGGER "retry_policies_set_updated_at_trg" BEFORE UPDATE ON "public"."retry_policies" FOR EACH ROW EXECUTE FUNCTION "public"."retry_policies_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_lead_code" BEFORE INSERT ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."trg_set_lead_code"();



CREATE OR REPLACE TRIGGER "tr_init_agent_workload" AFTER INSERT ON "public"."org_members" FOR EACH ROW EXECUTE FUNCTION "public"."initialize_agent_workload_cache"();



CREATE OR REPLACE TRIGGER "trg_call_logs_priority" AFTER INSERT OR UPDATE OF "outcome", "created_at", "lead_id" ON "public"."call_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_lead_priority_from_call_logs"();



CREATE OR REPLACE TRIGGER "trg_mark_workspace_dirty_call_logs" AFTER INSERT OR DELETE OR UPDATE ON "public"."call_logs" FOR EACH ROW EXECUTE FUNCTION "public"."mark_workspace_dirty_on_call_logs"();



CREATE OR REPLACE TRIGGER "trg_mark_workspace_dirty_leads" AFTER INSERT OR DELETE OR UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."mark_workspace_dirty_on_leads"();



CREATE OR REPLACE TRIGGER "trg_profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_workspaces_set_updated_at" BEFORE UPDATE ON "public"."workspaces" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_workload_state"
    ADD CONSTRAINT "agent_workload_state_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."crm_jobs"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."automation_jobs"
    ADD CONSTRAINT "automation_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");



ALTER TABLE ONLY "public"."business_profile"
    ADD CONSTRAINT "business_profile_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."call_logs"
    ADD CONSTRAINT "call_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contractors"
    ADD CONSTRAINT "contractors_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");



ALTER TABLE ONLY "public"."crm_jobs"
    ADD CONSTRAINT "crm_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."crm_jobs"
    ADD CONSTRAINT "crm_jobs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."crm_jobs"
    ADD CONSTRAINT "crm_jobs_source_estimate_id_fkey" FOREIGN KEY ("source_estimate_id") REFERENCES "public"."estimates"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."crm_jobs"
    ADD CONSTRAINT "crm_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."estimate_lines"
    ADD CONSTRAINT "estimate_lines_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."follow_ups"
    ADD CONSTRAINT "follow_ups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id_uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interaction_logs"
    ADD CONSTRAINT "interaction_logs_claimed_by_fkey" FOREIGN KEY ("claimed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interaction_logs"
    ADD CONSTRAINT "interaction_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id_uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interaction_logs"
    ADD CONSTRAINT "interaction_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."crm_jobs"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."lead_transition_log"
    ADD CONSTRAINT "lead_transition_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lead_transition_log"
    ADD CONSTRAINT "lead_transition_log_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id_uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_transition_log"
    ADD CONSTRAINT "lead_transition_log_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads_new"
    ADD CONSTRAINT "leads_new_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pipelines"
    ADD CONSTRAINT "pipelines_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_forms"
    ADD CONSTRAINT "public_forms_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");



ALTER TABLE ONLY "public"."queue_job_attempts"
    ADD CONSTRAINT "queue_job_attempts_queue_job_id_fkey" FOREIGN KEY ("queue_job_id") REFERENCES "public"."queue_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."queue_job_attempts"
    ADD CONSTRAINT "queue_job_attempts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."queue_jobs"
    ADD CONSTRAINT "queue_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_key_fkey" FOREIGN KEY ("plan_key") REFERENCES "public"."plans"("key");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."voice_messages"
    ADD CONSTRAINT "voice_messages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");



ALTER TABLE ONLY "public"."waitlist_rate_limits"
    ADD CONSTRAINT "waitlist_rate_limits_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_plan_status"
    ADD CONSTRAINT "workspace_plan_status_plan_key_fkey" FOREIGN KEY ("plan_key") REFERENCES "public"."plans"("key");



ALTER TABLE ONLY "public"."workspace_plan_status"
    ADD CONSTRAINT "workspace_plan_status_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "causal"."leads_state" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "state is workspace-scoped" ON "causal"."leads_state" FOR SELECT TO "authenticated" USING (("workspace_id" = (("auth"."jwt"() ->> 'workspace_id'::"text"))::"uuid"));



CREATE POLICY "frames are read-only" ON "internal"."lead_frames" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "internal"."lead_frames" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "internal"."system_memory_ledger" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow workspace read/write access" ON "public"."interaction_logs" USING (("workspace_id" = '00000000-0000-0000-0000-000000000000'::"uuid"));



CREATE POLICY "Org members: delete by admin" ON "public"."org_members" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "org_members"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Org members: insert by admin" ON "public"."org_members" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "org_members"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Org members: read for member" ON "public"."org_members" FOR SELECT TO "authenticated" USING (("organization_id" IN ( SELECT "om2"."organization_id"
   FROM "public"."org_members" "om2"
  WHERE ("om2"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members: update by admin" ON "public"."org_members" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "org_members"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "org_members"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Organizations: members can delete" ON "public"."organizations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "organizations"."id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Organizations: members can insert" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "Organizations: members can update" ON "public"."organizations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "organizations"."id") AND ("om"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "organizations"."id") AND ("om"."user_id" = "auth"."uid"())))));



CREATE POLICY "Organizations: members can view" ON "public"."organizations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."org_members" "om"
  WHERE (("om"."organization_id" = "organizations"."id") AND ("om"."user_id" = "auth"."uid"())))));



CREATE POLICY "Secure workspace audit log access" ON "public"."lead_transition_log" TO "authenticated" USING (("workspace_id" = ( SELECT "p"."workspace_id"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = ( SELECT "auth"."uid"() AS "uid"))
 LIMIT 1)));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_log: members can select their org" ON "public"."activity_log" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "org_members"."organization_id"
   FROM "public"."org_members"
  WHERE ("org_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "activity_log_delete_workspace" ON "public"."activity_log" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "activity_log"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "activity_log_insert_workspace" ON "public"."activity_log" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "activity_log"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "activity_log_select_workspace" ON "public"."activity_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "activity_log"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "activity_log_update_workspace" ON "public"."activity_log" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "activity_log"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "activity_log"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."agent_workload_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointments_insert_workspace_members" ON "public"."appointments" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "appointments_select_workspace_members" ON "public"."appointments" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "appointments_update_workspace_members" ON "public"."appointments" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."automation_jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "automation_jobs insert workspace members" ON "public"."automation_jobs" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));



CREATE POLICY "automation_jobs select workspace members" ON "public"."automation_jobs" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));



CREATE POLICY "automation_jobs update workspace members" ON "public"."automation_jobs" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"())))) WITH CHECK (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."brand_context" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."call_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "call_logs: delete by workspace member" ON "public"."call_logs" FOR DELETE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



CREATE POLICY "call_logs: insert by workspace member" ON "public"."call_logs" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



CREATE POLICY "call_logs: select by workspace member" ON "public"."call_logs" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



CREATE POLICY "call_logs: update by workspace member" ON "public"."call_logs" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"())))) WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."call_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contractors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contractors_delete" ON "public"."contractors" FOR DELETE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "contractors_insert" ON "public"."contractors" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "contractors_select" ON "public"."contractors" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "contractors_update" ON "public"."contractors" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."crm_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "crm_events_delete_workspace" ON "public"."crm_events" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_events_insert_workspace" ON "public"."crm_events" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_events_select_workspace" ON "public"."crm_events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_events_update_workspace" ON "public"."crm_events" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."crm_jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "crm_jobs_select_workspace_members" ON "public"."crm_jobs" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "crm_jobs_update_workspace_members" ON "public"."crm_jobs" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."crm_workspace_claims" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "crm_workspace_claims_delete_workspace" ON "public"."crm_workspace_claims" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_workspace_claims_insert_workspace" ON "public"."crm_workspace_claims" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_workspace_claims_select_workspace" ON "public"."crm_workspace_claims" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_workspace_claims_update_workspace" ON "public"."crm_workspace_claims" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."crm_workspace_dirty" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crm_workspace_lead_claims" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "crm_workspace_lead_claims_delete_workspace" ON "public"."crm_workspace_lead_claims" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_lead_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_workspace_lead_claims_insert_workspace" ON "public"."crm_workspace_lead_claims" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_lead_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_workspace_lead_claims_select_workspace" ON "public"."crm_workspace_lead_claims" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_lead_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "crm_workspace_lead_claims_update_workspace" ON "public"."crm_workspace_lead_claims" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_lead_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "crm_workspace_lead_claims"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."crm_workspace_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deny_leads_insert" ON "public"."leads_new" FOR INSERT TO "authenticated" WITH CHECK (false);



ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "email_templates_read_active" ON "public"."email_templates" FOR SELECT TO "authenticated" USING (("is_active" = true));



ALTER TABLE "public"."estimate_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "estimate_lines_delete_workspace_members" ON "public"."estimate_lines" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."estimates" "e"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "e"."workspace_id")))
  WHERE (("e"."id" = "estimate_lines"."estimate_id") AND ("e"."status" <> 'converted'::"text") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "estimate_lines_insert_workspace_members" ON "public"."estimate_lines" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."estimates" "e"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "e"."workspace_id")))
  WHERE (("e"."id" = "estimate_lines"."estimate_id") AND ("e"."status" <> 'converted'::"text") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "estimate_lines_select_workspace_members" ON "public"."estimate_lines" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."estimates" "e"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "e"."workspace_id")))
  WHERE (("e"."id" = "estimate_lines"."estimate_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "estimate_lines_update_workspace_members" ON "public"."estimate_lines" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."estimates" "e"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "e"."workspace_id")))
  WHERE (("e"."id" = "estimate_lines"."estimate_id") AND ("e"."status" <> 'converted'::"text") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."estimates" "e"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "e"."workspace_id")))
  WHERE (("e"."id" = "estimate_lines"."estimate_id") AND ("e"."status" <> 'converted'::"text") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."estimates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "estimates_delete_workspace_members" ON "public"."estimates" FOR DELETE TO "authenticated" USING ((("status" <> 'converted'::"text") AND ("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "estimates_insert_workspace_members" ON "public"."estimates" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "estimates_select_workspace_members" ON "public"."estimates" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "estimates_update_workspace_members" ON "public"."estimates" FOR UPDATE TO "authenticated" USING ((("status" <> 'converted'::"text") AND ("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."follow_ups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "follow_ups_delete_workspace" ON "public"."follow_ups" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id_uuid" = "follow_ups"."lead_id") AND ("l"."workspace_id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids"))))));



CREATE POLICY "follow_ups_insert_workspace" ON "public"."follow_ups" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id_uuid" = "follow_ups"."lead_id") AND ("l"."workspace_id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids"))))));



CREATE POLICY "follow_ups_select_workspace" ON "public"."follow_ups" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id_uuid" = "follow_ups"."lead_id") AND ("l"."workspace_id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids"))))));



CREATE POLICY "follow_ups_update_workspace" ON "public"."follow_ups" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id_uuid" = "follow_ups"."lead_id") AND ("l"."workspace_id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id_uuid" = "follow_ups"."lead_id") AND ("l"."workspace_id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids"))))));



ALTER TABLE "public"."hlcx2" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interaction_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "job_assignments_insert_workspace_members" ON "public"."job_assignments" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND ("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "job_assignments_select_workspace_members" ON "public"."job_assignments" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "job_assignments_update_workspace_members" ON "public"."job_assignments" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."lead_activities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lead_activities_delete" ON "public"."lead_activities" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_activities"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "lead_activities_insert" ON "public"."lead_activities" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_activities"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "lead_activities_select" ON "public"."lead_activities" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_activities"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "lead_activities_update" ON "public"."lead_activities" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_activities"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_activities"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."lead_drift_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lead_events_delete_workspace" ON "public"."lead_events" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "lead_events_insert_workspace" ON "public"."lead_events" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "lead_events_select_workspace" ON "public"."lead_events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "lead_events_update_workspace" ON "public"."lead_events" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_events"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."lead_queue" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lead_select" ON "public"."leads" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("workspace_id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids"))));



ALTER TABLE "public"."lead_stage_transitions_v2" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_transition_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_delete_workspace_members" ON "public"."leads" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "leads"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "leads_insert_plan_limit_active_only" ON "public"."leads" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "leads"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND "public"."can_insert_lead"("workspace_id")));



CREATE POLICY "leads_insert_workspace_members" ON "public"."leads" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "leads"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."leads_new" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_update_workspace_members" ON "public"."leads" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "leads"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "leads"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "member_select" ON "public"."workspace_members" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."org_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pipeline_stages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pipeline_stages_delete_workspace" ON "public"."pipeline_stages" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."pipelines" "p"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "p"."workspace_id")))
  WHERE (("p"."id" = "pipeline_stages"."pipeline_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "pipeline_stages_insert_workspace" ON "public"."pipeline_stages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."pipelines" "p"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "p"."workspace_id")))
  WHERE (("p"."id" = "pipeline_stages"."pipeline_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "pipeline_stages_select_workspace" ON "public"."pipeline_stages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."pipelines" "p"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "p"."workspace_id")))
  WHERE (("p"."id" = "pipeline_stages"."pipeline_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "pipeline_stages_update_workspace" ON "public"."pipeline_stages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."pipelines" "p"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "p"."workspace_id")))
  WHERE (("p"."id" = "pipeline_stages"."pipeline_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."pipelines" "p"
     JOIN "public"."workspace_members" "wm" ON (("wm"."workspace_id" = "p"."workspace_id")))
  WHERE (("p"."id" = "pipeline_stages"."pipeline_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."pipelines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pipelines_delete_workspace" ON "public"."pipelines" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "pipelines"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "pipelines_insert_plan_limit" ON "public"."pipelines" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "pipelines"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))) AND "public"."can_create_pipeline"("workspace_id")));



CREATE POLICY "pipelines_insert_workspace" ON "public"."pipelines" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "pipelines"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "pipelines_select_workspace" ON "public"."pipelines" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "pipelines"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "pipelines_update_workspace" ON "public"."pipelines" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "pipelines"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "pipelines"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "plans_select" ON "public"."plans" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."public_forms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_forms_delete_workspace" ON "public"."public_forms" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "public_forms"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "public_forms_insert_workspace" ON "public"."public_forms" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "public_forms"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "public_forms_select_workspace" ON "public"."public_forms" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "public_forms"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "public_forms_update_workspace" ON "public"."public_forms" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "public_forms"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "public_forms"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."queue_job_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."queue_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."raw_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retry_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scripts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_full_access" ON "public"."agent_workload_state" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "stage_transitions_insert_workspace_members" ON "public"."lead_stage_transitions_v2" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_stage_transitions_v2"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "stage_transitions_select_workspace_members" ON "public"."lead_stage_transitions_v2" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "lead_stage_transitions_v2"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions backend delete" ON "public"."subscriptions" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "subscriptions backend update" ON "public"."subscriptions" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "subscriptions backend write" ON "public"."subscriptions" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "subscriptions_no_user_delete" ON "public"."subscriptions" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "subscriptions_no_user_update" ON "public"."subscriptions" FOR UPDATE TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "subscriptions_no_user_write" ON "public"."subscriptions" FOR INSERT TO "authenticated" WITH CHECK (false);



CREATE POLICY "subscriptions_select_own_workspace" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "p"."workspace_id"
   FROM "public"."profiles" "p"
  WHERE ("p"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users read own" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "users update own" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."voice_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "voice_messages insert workspace members" ON "public"."voice_messages" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));



CREATE POLICY "voice_messages select workspace members" ON "public"."voice_messages" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));



CREATE POLICY "voice_messages update workspace members" ON "public"."voice_messages" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"())))) WITH CHECK (("workspace_id" IN ( SELECT "w"."id"
   FROM ("public"."workspaces" "w"
     JOIN "public"."org_members" "om" ON (("om"."organization_id" = "w"."id")))
  WHERE ("om"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waitlist_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."worker_job_states" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workspace members can create business profile" ON "public"."business_profile" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "business_profile"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "workspace members can insert sessions" ON "public"."call_sessions" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



CREATE POLICY "workspace members can select sessions" ON "public"."call_sessions" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



CREATE POLICY "workspace members can update business profile" ON "public"."business_profile" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "business_profile"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "business_profile"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "workspace members can update sessions" ON "public"."call_sessions" FOR UPDATE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"())))) WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



CREATE POLICY "workspace members can view business profile" ON "public"."business_profile" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "business_profile"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workspace_members_delete" ON "public"."workspace_members" FOR DELETE TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "workspace_members_insert" ON "public"."workspace_members" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "workspace_metrics_select" ON "public"."crm_workspace_metrics" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "wm"."workspace_id"
   FROM "public"."workspace_members" "wm"
  WHERE ("wm"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."workspace_plan_status" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workspace_plan_status backend delete" ON "public"."workspace_plan_status" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "workspace_plan_status backend update" ON "public"."workspace_plan_status" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "workspace_plan_status backend write" ON "public"."workspace_plan_status" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "workspace_plan_status_no_user_delete" ON "public"."workspace_plan_status" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "workspace_plan_status_no_user_update" ON "public"."workspace_plan_status" FOR UPDATE TO "authenticated" USING (false) WITH CHECK (false);



CREATE POLICY "workspace_plan_status_no_user_write" ON "public"."workspace_plan_status" FOR INSERT TO "authenticated" WITH CHECK (false);



CREATE POLICY "workspace_plan_status_select_own" ON "public"."workspace_plan_status" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "p"."workspace_id"
   FROM "public"."profiles" "p"
  WHERE ("p"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."workspace_rate_limits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workspace_rate_limits_delete_workspace_members" ON "public"."workspace_rate_limits" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspace_rate_limits"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "workspace_rate_limits_insert_workspace_members" ON "public"."workspace_rate_limits" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspace_rate_limits"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "workspace_rate_limits_select_workspace_members" ON "public"."workspace_rate_limits" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspace_rate_limits"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "workspace_rate_limits_update_workspace_members" ON "public"."workspace_rate_limits" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspace_rate_limits"."workspace_id") AND ("wm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspace_rate_limits"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "workspace_select" ON "public"."workspaces" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("id" IN ( SELECT "public"."get_user_workspace_ids"() AS "get_user_workspace_ids"))));



ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workspaces_select_own" ON "public"."workspaces" FOR SELECT TO "authenticated" USING (("id" = "public"."current_workspace_id"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."leads";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "causal"."_ingest_lead_impl"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_source" "text", "p_event_type" "text", "p_request_payload" "jsonb") FROM PUBLIC;



REVOKE ALL ON FUNCTION "causal"."_ingest_lead_impl"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_notes" "text", "p_assigned_to" "uuid", "p_source" "text", "p_event_type" "text", "p_request_payload" "jsonb") FROM PUBLIC;



REVOKE ALL ON FUNCTION "causal"."ingest_lead"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_notes" "text", "p_assigned_to" "uuid", "p_source" "text", "p_last_contacted_at" timestamp with time zone, "p_next_follow_up_at" timestamp with time zone, "p_appointment_at" timestamp with time zone, "p_appointment_status" "text", "p_assigned_until" timestamp with time zone, "p_priority" "text", "p_priority_score" numeric, "p_pipeline_stage_id" "uuid", "p_pipeline_id" "uuid", "p_organization_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_score" integer, "p_archived" boolean, "p_event_type" "text", "p_request_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "causal"."ingest_lead"("p_workspace_id" "uuid", "p_phone" "text", "p_full_name" "text", "p_email" "text", "p_status" "text", "p_notes" "text", "p_assigned_to" "uuid", "p_source" "text", "p_last_contacted_at" timestamp with time zone, "p_next_follow_up_at" timestamp with time zone, "p_appointment_at" timestamp with time zone, "p_appointment_status" "text", "p_assigned_until" timestamp with time zone, "p_priority" "text", "p_priority_score" numeric, "p_pipeline_stage_id" "uuid", "p_pipeline_id" "uuid", "p_organization_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_score" integer, "p_archived" boolean, "p_event_type" "text", "p_request_payload" "jsonb") TO "service_role";


























































































































































































REVOKE ALL ON FUNCTION "public"."advance_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text", "p_request_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."advance_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text", "p_request_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."advance_lead_expected"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."advance_lead_expected"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_action_type" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."advance_lead_legacy_direct"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_action_type" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."advance_lead_legacy_direct"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_action_type" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."bootstrap_user_workspace"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."bootstrap_user_workspace"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."calculate_lead_urgency"("p_next_follow_up_at" timestamp with time zone, "p_stage_updated_at" timestamp with time zone, "p_status" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."calculate_lead_urgency"("p_next_follow_up_at" timestamp with time zone, "p_stage_updated_at" timestamp with time zone, "p_status" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."calculate_next_dial_window"("attempts" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."calculate_next_dial_window"("attempts" integer) TO "service_role";



GRANT ALL ON SEQUENCE "public"."leads_lead_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."leads_lead_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."leads_lead_number_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."leads" TO "service_role";



REVOKE ALL ON FUNCTION "public"."call_lead"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_status" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."call_lead"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_status" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."call_lead"("p_workspace_id" "uuid", "p_lead_id" "uuid", "p_status" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."can_create_pipeline"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_create_pipeline"("p_workspace_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."can_create_pipeline"("p_workspace_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."can_insert_lead"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_insert_lead"("p_workspace_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."can_insert_lead"("p_workspace_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."change_lead_stage"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_new_stage" "text", "p_request_id" "text", "p_idempotency_key" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."change_lead_stage"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_new_stage" "text", "p_request_id" "text", "p_idempotency_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."change_lead_stage"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_new_stage" "text", "p_request_id" "text", "p_idempotency_key" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_batch_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_batch_size" integer, "p_lease_minutes" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_batch_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_batch_size" integer, "p_lease_minutes" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."claim_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_live_call"("p_call_sid" "text", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_live_call"("p_call_sid" "text", "p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_next_automation_job"("p_max_jobs_per_call" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_next_automation_job"("p_max_jobs_per_call" integer) TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."queue_jobs" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."queue_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."queue_jobs" TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_next_job"("p_workspace_id" "uuid", "p_worker_id" "uuid", "p_lease_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_next_job"("p_workspace_id" "uuid", "p_worker_id" "uuid", "p_lease_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_next_job_global"("p_worker_id" "uuid", "p_lease_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_next_job_global"("p_worker_id" "uuid", "p_lease_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_next_lead"("workspace_uuid" "uuid", "agent_uuid" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_next_lead"("workspace_uuid" "uuid", "agent_uuid" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."claim_next_lead"("workspace_uuid" "uuid", "agent_uuid" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_next_lead_balanced"("workspace_uuid" "uuid", "agent_uuid" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_next_lead_balanced"("workspace_uuid" "uuid", "agent_uuid" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."claim_next_lead_balanced"("workspace_uuid" "uuid", "agent_uuid" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_one_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_lease_minutes" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_one_dialer"("p_workspace_id" "uuid", "p_actor_id" "uuid", "p_lease_minutes" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_workspace_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_workspace_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."claim_workspace_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_workspace_lock"("p_workspace_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_workspace_lock"("p_workspace_id" "uuid", "p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."compute_lead_dashboard_row"("p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."compute_lead_dashboard_row"("p_lead_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."compute_priority_score"("p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."compute_priority_score"("p_lead_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."compute_queue_priority"("p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."compute_queue_priority"("p_lead_id" bigint) TO "service_role";



GRANT ALL ON TABLE "public"."crm_jobs" TO "service_role";
GRANT SELECT ON TABLE "public"."crm_jobs" TO "authenticated";



GRANT UPDATE("status") ON TABLE "public"."crm_jobs" TO "authenticated";



GRANT UPDATE("name") ON TABLE "public"."crm_jobs" TO "authenticated";



REVOKE ALL ON FUNCTION "public"."convert_estimate_to_job"("p_estimate_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."convert_estimate_to_job"("p_estimate_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_estimate_to_job"("p_estimate_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_lead_if_under_limit"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_full_name" "text", "p_email" "text", "p_pipeline_stage_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_lead_if_under_limit"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_full_name" "text", "p_email" "text", "p_pipeline_stage_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."create_lead_if_under_limit"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_full_name" "text", "p_email" "text", "p_pipeline_stage_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."current_workspace_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_workspace_id"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "text", "_event_type" "text", "_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "text", "_event_type" "text", "_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "uuid", "_event_type" "text", "_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."emit_event"("_workspace_id" "uuid", "_entity_type" "text", "_entity_id" "uuid", "_event_type" "text", "_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."emit_lead_event"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."emit_lead_event"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_lead_stage_transition"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_lead_stage_transition"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enqueue_lead"("p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enqueue_lead"("p_lead_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."enqueue_lead_job"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enqueue_lead_job"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enqueue_route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enqueue_route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_lead_code"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_lead_code"() TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pipelines" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pipelines" TO "authenticated";
GRANT ALL ON TABLE "public"."pipelines" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pipeline_usage" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pipeline_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."pipeline_usage" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_plan_status" TO "service_role";
GRANT SELECT ON TABLE "public"."workspace_plan_status" TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_usage" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_usage" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_billing_state" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_billing_state" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_billing_state" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_pipeline_billing_state" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_pipeline_billing_state" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_pipeline_billing_state" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_billing_pressure" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_billing_pressure" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_billing_pressure" TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_billing_pressure"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_billing_pressure"("p_workspace_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_billing_pressure"("p_workspace_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid", "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid", "p_limit" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_dashboard"("p_workspace_id" "uuid", "p_limit" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_dashboard_v2"("p_workspace_id" "uuid", "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_v2"("p_workspace_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_v2"("p_workspace_id" "uuid", "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_next_lead"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_next_lead"("p_workspace_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_next_lead"("p_workspace_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_next_lead_claimed"("p_workspace_id" "uuid", "p_lock_owner" "text", "p_lease_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_next_lead_claimed"("p_workspace_id" "uuid", "p_lock_owner" "text", "p_lease_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_upgrade_signal"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_upgrade_signal"("p_workspace_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_upgrade_signal"("p_workspace_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_user_workspace_ids"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_workspace_ids"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_user_workspace_ids"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user_onboarding"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "supabase_auth_admin";



REVOKE ALL ON FUNCTION "public"."hlc_guard_estimate_conversion_state"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."hlc_guard_estimate_conversion_state"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."hlc_set_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."hlc_set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."hlc_validate_crm_job_links"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."hlc_validate_crm_job_links"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."hlc_validate_estimate_lead_workspace"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."hlc_validate_estimate_lead_workspace"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hlc_validate_job_appointment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hlc_validate_job_appointment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hlc_validate_job_assignment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hlc_validate_job_assignment"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."increment_agent_workload"("target_user_id" "uuid", "g_delta" integer, "hp_delta" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_agent_workload"("target_user_id" "uuid", "g_delta" integer, "hp_delta" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid", "p_oracle_log_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."ingest_lead_drift_event"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_drift_type" "text", "p_severity" "text", "p_actual_state" "text", "p_expected_state" "text", "p_drift_fingerprint" "text", "p_run_id" "uuid", "p_oracle_log_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."ingest_lead_status_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_event_type" "text", "p_request_id" "text", "p_idempotency_key" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."ingest_lead_status_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_event_type" "text", "p_request_id" "text", "p_idempotency_key" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."initialize_agent_workload_cache"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."initialize_agent_workload_cache"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."lead_preprocess"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."lead_preprocess"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."leads_event_audit"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."leads_event_audit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."leads_log_call"("p_lead_id" bigint, "p_outcome" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."leads_log_call"("p_lead_id" bigint, "p_outcome" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."leads_workspace_broadcast_trigger"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."leads_workspace_broadcast_trigger"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_job_failed"("p_job_id" "uuid", "p_worker_id" "uuid", "p_error" "jsonb", "p_default_retry_delay_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_job_failed"("p_job_id" "uuid", "p_worker_id" "uuid", "p_error" "jsonb", "p_default_retry_delay_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_job_running"("p_job_id" "uuid", "p_worker_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_job_running"("p_job_id" "uuid", "p_worker_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_job_success"("p_job_id" "uuid", "p_worker_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_job_success"("p_job_id" "uuid", "p_worker_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_queue_done"("p_queue_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_queue_done"("p_queue_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_queue_failed"("p_queue_id" bigint, "p_error" "text", "p_retry_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_queue_failed"("p_queue_id" bigint, "p_error" "text", "p_retry_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_workspace_dirty"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_workspace_dirty"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_workspace_dirty_on_call_logs"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_workspace_dirty_on_call_logs"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_workspace_dirty_on_leads"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_workspace_dirty_on_leads"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_pipeline_stage_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_pipeline_stage_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."lead_events" TO "service_role";
GRANT SELECT ON TABLE "public"."lead_events" TO "authenticated";



REVOKE ALL ON FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_to_stage_id" "uuid", "p_source" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" bigint, "p_workspace_id" "uuid", "p_to_stage_id" "uuid", "p_source" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" "uuid", "p_to_stage_id" "uuid", "p_workspace_id" "uuid", "p_source" "text", "p_mutation_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."move_lead_to_stage_event"("p_lead_id" "uuid", "p_to_stage_id" "uuid", "p_workspace_id" "uuid", "p_source" "text", "p_mutation_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."perform_dashboard_action"("p_lead_id" bigint, "p_action" "text", "p_actor_id" "uuid", "p_request_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."perform_dashboard_action"("p_lead_id" bigint, "p_action" "text", "p_actor_id" "uuid", "p_request_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."perform_dashboard_action"("p_lead_id" bigint, "p_action" "text", "p_actor_id" "uuid", "p_request_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."recompute_dirty_workspaces"("max_workspaces" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recompute_dirty_workspaces"("max_workspaces" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."recompute_lead_priority"("p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recompute_lead_priority"("p_lead_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."recompute_workspace_metrics"("target_workspace" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recompute_workspace_metrics"("target_workspace" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."refresh_lead_urgency"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."refresh_lead_urgency"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."release_expired_lead_claims"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."release_expired_lead_claims"() TO "service_role";



GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



REVOKE ALL ON FUNCTION "public"."reschedule_job_appointment"("p_appointment_id" bigint, "p_appointment_date" timestamp with time zone, "p_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."reschedule_job_appointment"("p_appointment_id" bigint, "p_appointment_date" timestamp with time zone, "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reschedule_job_appointment"("p_appointment_id" bigint, "p_appointment_date" timestamp with time zone, "p_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."resolve_lead_next_status"("p_workspace_id" "uuid", "p_from_status" "text", "p_action_type" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."resolve_lead_next_status"("p_workspace_id" "uuid", "p_from_status" "text", "p_action_type" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."retry_policies_set_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."retry_policies_set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_max_attempts" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_max_attempts" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."route_lead"("p_workspace_id" "uuid", "p_lead_id" bigint, "p_max_attempts" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."set_automation_job_failed"("p_job_id" "uuid", "p_error" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_automation_job_failed"("p_job_id" "uuid", "p_error" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_automation_job_success"("p_job_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_automation_job_success"("p_job_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_default_followup"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_default_followup"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_queue_jobs_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_queue_jobs_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_stage_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_stage_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."should_prompt_upgrade"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."should_prompt_upgrade"("p_workspace_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."submit_public_service_request"("p_form_slug" "text", "p_request_id" "uuid", "p_full_name" "text", "p_phone" "text", "p_email" "text", "p_project_details" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."submit_public_service_request"("p_form_slug" "text", "p_request_id" "uuid", "p_full_name" "text", "p_phone" "text", "p_email" "text", "p_project_details" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_public_service_request"("p_form_slug" "text", "p_request_id" "uuid", "p_full_name" "text", "p_phone" "text", "p_email" "text", "p_project_details" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_public_service_request"("p_form_slug" "text", "p_request_id" "uuid", "p_full_name" "text", "p_phone" "text", "p_email" "text", "p_project_details" "text") TO "anon";



REVOKE ALL ON FUNCTION "public"."switch_current_workspace"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."switch_current_workspace"("p_workspace_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."switch_current_workspace"("p_workspace_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."sync_lead_pipeline_stage"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_lead_pipeline_stage"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."test_auth_context"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."test_auth_context"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_auth_context"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_lead_created_event"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_lead_created_event"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_leads_route_on_new"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_leads_route_on_new"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_set_lead_code"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_set_lead_code"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_lead_priority_from_call_logs"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_lead_priority_from_call_logs"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_lead_priority_from_leads"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_lead_priority_from_leads"() TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."waitlist" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_waitlist_entry"("p_workspace_id" "uuid", "p_email" "text", "p_source" "text", "p_ip_address" "text", "p_user_agent" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_waitlist_entry"("p_workspace_id" "uuid", "p_email" "text", "p_source" "text", "p_ip_address" "text", "p_user_agent" "text") TO "service_role";












GRANT SELECT ON TABLE "causal"."leads_state" TO "anon";
GRANT SELECT ON TABLE "causal"."leads_state" TO "authenticated";
GRANT INSERT,UPDATE ON TABLE "causal"."leads_state" TO "service_role";















GRANT ALL ON TABLE "internal"."system_memory_ledger" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."activity_log" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."agent_workload_state" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."agent_workload_state" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_workload_state" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appointments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appointments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appointments_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."automation_jobs" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."automation_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_jobs" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."brand_context" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."brand_context" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_context" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."business_profile" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."business_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."business_profile" TO "service_role";



GRANT INSERT("workspace_id") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("business_name"),UPDATE("business_name") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("owner_name"),UPDATE("owner_name") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("phone"),UPDATE("phone") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("email"),UPDATE("email") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("website"),UPDATE("website") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("address"),UPDATE("address") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("city"),UPDATE("city") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("state"),UPDATE("state") ON TABLE "public"."business_profile" TO "authenticated";



GRANT INSERT("zip"),UPDATE("zip") ON TABLE "public"."business_profile" TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."call_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."call_logs" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."call_sessions" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."call_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."call_sessions" TO "service_role";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."contractors" TO "authenticated";
GRANT ALL ON TABLE "public"."contractors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contractors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contractors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contractors_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_events" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_events" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_events" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_claims" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_workspace_claims" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_dirty" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_dirty" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_workspace_dirty" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_lead_claims" TO "anon";
GRANT ALL ON TABLE "public"."crm_workspace_lead_claims" TO "service_role";
GRANT SELECT ON TABLE "public"."crm_workspace_lead_claims" TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_metrics" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."crm_workspace_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_workspace_metrics" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."org_members" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."org_members" TO "authenticated";
GRANT ALL ON TABLE "public"."org_members" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."current_user_org" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."current_user_org" TO "authenticated";
GRANT ALL ON TABLE "public"."current_user_org" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."email_templates" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."estimate_lines" TO "service_role";
GRANT SELECT,INSERT,DELETE ON TABLE "public"."estimate_lines" TO "authenticated";



GRANT UPDATE("description") ON TABLE "public"."estimate_lines" TO "authenticated";



GRANT UPDATE("quantity") ON TABLE "public"."estimate_lines" TO "authenticated";



GRANT UPDATE("unit_cost") ON TABLE "public"."estimate_lines" TO "authenticated";



GRANT UPDATE("sort_order") ON TABLE "public"."estimate_lines" TO "authenticated";



GRANT ALL ON TABLE "public"."estimates" TO "service_role";
GRANT SELECT,INSERT,DELETE ON TABLE "public"."estimates" TO "authenticated";



GRANT UPDATE("lead_id") ON TABLE "public"."estimates" TO "authenticated";



GRANT UPDATE("status") ON TABLE "public"."estimates" TO "authenticated";



GRANT UPDATE("markup_percent") ON TABLE "public"."estimates" TO "authenticated";



GRANT UPDATE("subtotal") ON TABLE "public"."estimates" TO "authenticated";



GRANT UPDATE("markup_amount") ON TABLE "public"."estimates" TO "authenticated";



GRANT UPDATE("total") ON TABLE "public"."estimates" TO "authenticated";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."follow_ups" TO "authenticated";
GRANT ALL ON TABLE "public"."follow_ups" TO "service_role";



GRANT ALL ON SEQUENCE "public"."follow_ups_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."follow_ups_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."follow_ups_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."hlcx2" TO "anon";
GRANT ALL ON TABLE "public"."hlcx2" TO "authenticated";
GRANT ALL ON TABLE "public"."hlcx2" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hlcx2_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hlcx2_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hlcx2_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."interaction_logs" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."interaction_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."interaction_logs" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN,UPDATE ON TABLE "public"."job_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."job_assignments" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."job_state_trace" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."job_state_trace" TO "authenticated";
GRANT ALL ON TABLE "public"."job_state_trace" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_activities" TO "anon";
GRANT ALL ON TABLE "public"."lead_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lead_code_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lead_code_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lead_code_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_drift_alerts" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_drift_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_drift_alerts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lead_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lead_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lead_events_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_health" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_health" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_health" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_queue" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_queue" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."raw_events" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."raw_events" TO "authenticated";
GRANT ALL ON TABLE "public"."raw_events" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_conversion_matrix" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_conversion_matrix" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_stage_conversion_matrix" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_history" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_history" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_stage_history" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."raw_events_typed" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."raw_events_typed" TO "authenticated";
GRANT ALL ON TABLE "public"."raw_events_typed" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_timeline" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_stage_timeline" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_timing" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_stage_timing" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_stage_timing" TO "service_role";



GRANT ALL ON TABLE "public"."lead_stage_transitions_v2" TO "service_role";
GRANT SELECT ON TABLE "public"."lead_stage_transitions_v2" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."lead_stage_transitions_v2_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lead_stage_transitions_v2_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lead_stage_transitions_v2_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_time_in_stage" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_time_in_stage" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_time_in_stage" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_transition_log" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_transition_log" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_transition_log" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_urgency_intelligence" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_urgency_intelligence" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_urgency_intelligence" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_velocity_analytics" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."lead_velocity_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_velocity_analytics" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_artifact" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_artifact" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_artifact" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_stage_normalized" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_stage_normalized" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_stage_normalized" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_funnel_snapshot" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_funnel_snapshot" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_funnel_snapshot" TO "service_role";



GRANT ALL ON SEQUENCE "public"."leads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."leads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."leads_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_new" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_new" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_time_in_stage_stats" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_time_in_stage_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_time_in_stage_stats" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_velocity" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."leads_velocity" TO "authenticated";
GRANT ALL ON TABLE "public"."leads_velocity" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."organizations" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pipeline_stages" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pipeline_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."pipeline_stages" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."plans" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT UPDATE("full_name") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("avatar_url") ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."public_forms" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."public_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."public_forms" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."queue_job_attempts" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."queue_job_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."queue_job_attempts" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."retry_policies" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."retry_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."retry_policies" TO "service_role";



GRANT ALL ON TABLE "public"."scripts" TO "anon";
GRANT ALL ON TABLE "public"."scripts" TO "authenticated";
GRANT ALL ON TABLE "public"."scripts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."scripts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."scripts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."scripts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";
GRANT SELECT ON TABLE "public"."subscriptions" TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."v_funnel_counts" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."v_funnel_counts" TO "authenticated";
GRANT ALL ON TABLE "public"."v_funnel_counts" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."v_lead_event_stream" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."v_lead_event_stream" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lead_event_stream" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."v_lead_event_timeline" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."v_lead_event_timeline" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lead_event_timeline" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."voice_messages" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."voice_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_messages" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."waitlist_rate_limits" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."waitlist_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist_rate_limits" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."worker_job_states" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."worker_job_states" TO "authenticated";
GRANT ALL ON TABLE "public"."worker_job_states" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_members" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_members" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_members" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_rate_limits" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_rate_limits" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspaces" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































