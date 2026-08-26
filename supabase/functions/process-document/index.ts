import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const MODEL = Deno.env.get("OPENAI_DOCUMENT_MODEL") || "gpt-5.6-terra";
const MAX_BYTES = 25 * 1024 * 1024;
const SUPPORTED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type ExtractionField = {
  field_key: string;
  proposed_value: string;
  confidence: number | null;
  source_page: number | null;
  source_hint: string | null;
};

function base64(bytes: Uint8Array) {
  let output = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    output += String.fromCharCode(
      ...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)),
    );
  }
  return btoa(output);
}

function responseText(payload: unknown) {
  const pieces: string[] = [];
  const output = (payload as { output?: unknown[] })?.output ?? [];
  for (const item of output) {
    const content = (item as { content?: unknown[] })?.content ?? [];
    for (const part of content) {
      const value = part as { type?: string; text?: string };
      if (value.type === "output_text" && typeof value.text === "string") {
        pieces.push(value.text);
      }
    }
  }
  return pieces.join("").trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  const authorization = request.headers.get("Authorization");

  if (!url || !anonKey || !serviceKey) {
    return json({ error: "HLC runtime configuration is incomplete." }, 503);
  }
  if (!authorization) {
    return json({ error: "Authentication is required." }, 401);
  }
  if (!openAiKey) {
    return json({ error: "Document processor provider is not configured." }, 503);
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Authentication is required." }, 401);
  }

  let body: { jobId?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (!body.jobId) {
    return json({ error: "jobId is required." }, 400);
  }

  const { data: job, error: jobError } = await userClient
    .from("document_processing_jobs")
    .select("id,workspace_id,document_id,processing_kind,status,requested_by")
    .eq("id", body.jobId)
    .maybeSingle();
  if (jobError) {
    return json({ error: "Unable to load processing job." }, 500);
  }
  if (!job) {
    return json({ error: "Processing job not found." }, 404);
  }
  if (job.status !== "queued") {
    return json({ error: "Only queued document jobs can be processed." }, 409);
  }

  const { data: membership } = await userClient
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", job.workspace_id)
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!membership) {
    return json({ error: "Workspace membership is required." }, 403);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: document, error: documentError } = await admin
    .from("documents")
    .select("id,workspace_id,filename,storage_path,mime_type,byte_size")
    .eq("id", job.document_id)
    .eq("workspace_id", job.workspace_id)
    .maybeSingle();
  if (documentError || !document) {
    return json({ error: "Document record is unavailable." }, 404);
  }
  if (!SUPPORTED.has(document.mime_type)) {
    return json(
      { error: "Document processing currently supports PDF, JPEG, PNG, and WebP files." },
      415,
    );
  }
  if (!document.byte_size || document.byte_size > MAX_BYTES) {
    return json({ error: "Document exceeds the 25 MB processing limit." }, 413);
  }

  const startedAt = new Date().toISOString();
  const { error: startError } = await admin
    .from("document_processing_jobs")
    .update({
      status: "processing",
      processor: `openai:${MODEL}`,
      processing_started_at: startedAt,
      error_message: null,
      updated_at: startedAt,
    })
    .eq("id", job.id)
    .eq("status", "queued");
  if (startError) {
    return json({ error: "Unable to start document processing." }, 500);
  }

  try {
    const { data: blob, error: downloadError } = await admin.storage
      .from("hlc-documents")
      .download(document.storage_path);
    if (downloadError || !blob) {
      throw new Error("storage_download_failed");
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
      throw new Error("invalid_file_size");
    }
    const encoded = base64(bytes);
    const filePart = document.mime_type.startsWith("image/")
      ? {
          type: "input_image",
          image_url: `data:${document.mime_type};base64,${encoded}`,
          detail: "high",
        }
      : {
          type: "input_file",
          file_data: encoded,
          filename: document.filename,
        };

    const prompt = `Extract useful structured fields from this ${job.processing_kind} document for human review. Do not infer missing values. Use concise snake_case field keys. proposed_value must be the literal value visible in the source. Confidence is 0 to 1, or null when unavailable. source_page is 1-based for PDFs when identifiable, otherwise null. source_hint is a short locator or null. Return no more than 80 fields.`;

    const provider = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }, filePart],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "hlc_document_extraction",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                fields: {
                  type: "array",
                  maxItems: 80,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      field_key: { type: "string" },
                      proposed_value: { type: "string" },
                      confidence: {
                        anyOf: [
                          { type: "number", minimum: 0, maximum: 1 },
                          { type: "null" },
                        ],
                      },
                      source_page: {
                        anyOf: [
                          { type: "integer", minimum: 1 },
                          { type: "null" },
                        ],
                      },
                      source_hint: {
                        anyOf: [{ type: "string" }, { type: "null" }],
                      },
                    },
                    required: [
                      "field_key",
                      "proposed_value",
                      "confidence",
                      "source_page",
                      "source_hint",
                    ],
                  },
                },
              },
              required: ["fields"],
            },
          },
        },
        max_output_tokens: 5000,
      }),
    });

    if (!provider.ok) {
      throw new Error(
        `provider_http_${provider.status}:${(await provider.text()).slice(0, 300)}`,
      );
    }

    const payload = await provider.json();
    const raw = responseText(payload);
    if (!raw) {
      throw new Error("provider_empty_response");
    }
    const parsed = JSON.parse(raw) as { fields?: ExtractionField[] };
    const fields = (parsed.fields ?? [])
      .filter(
        (field) =>
          typeof field?.field_key === "string" &&
          field.field_key.trim() &&
          typeof field.proposed_value === "string",
      )
      .slice(0, 80);

    await admin
      .from("document_extraction_fields")
      .delete()
      .eq("processing_job_id", job.id);

    if (fields.length) {
      const rows = fields.map((field) => ({
        workspace_id: job.workspace_id,
        processing_job_id: job.id,
        document_id: job.document_id,
        field_key: field.field_key.trim().slice(0, 120),
        proposed_value: field.proposed_value,
        confidence: field.confidence,
        source_page: field.source_page,
        source_hint: field.source_hint?.slice(0, 500) ?? null,
      }));
      const { error: insertError } = await admin
        .from("document_extraction_fields")
        .insert(rows);
      if (insertError) {
        throw new Error(`field_persist_failed:${insertError.code}`);
      }
    }

    const finishedAt = new Date().toISOString();
    const { error: finishError } = await admin
      .from("document_processing_jobs")
      .update({
        status: "review_required",
        processing_finished_at: finishedAt,
        updated_at: finishedAt,
        processor_job_id:
          typeof (payload as { id?: unknown }).id === "string"
            ? (payload as { id: string }).id
            : null,
      })
      .eq("id", job.id);
    if (finishError) {
      throw new Error(`job_finalize_failed:${finishError.code}`);
    }

    await admin.from("document_events").insert({
      workspace_id: job.workspace_id,
      document_id: job.document_id,
      actor_user_id: userData.user.id,
      action: "processing_completed",
      details: {
        processing_job_id: job.id,
        processor: `openai:${MODEL}`,
        field_count: fields.length,
      },
    });

    return json({
      jobId: job.id,
      status: "review_required",
      fieldCount: fields.length,
      model: MODEL,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.slice(0, 500)
        : "document_processing_failed";
    const failedAt = new Date().toISOString();
    await admin
      .from("document_processing_jobs")
      .update({
        status: "failed",
        error_message: message,
        processing_finished_at: failedAt,
        updated_at: failedAt,
      })
      .eq("id", job.id);
    await admin.from("document_events").insert({
      workspace_id: job.workspace_id,
      document_id: job.document_id,
      actor_user_id: userData.user.id,
      action: "processing_failed",
      details: { processing_job_id: job.id, error: message },
    });
    console.error("Document processing failed", message);
    return json({ error: "Document processing failed.", jobId: job.id }, 502);
  }
});
