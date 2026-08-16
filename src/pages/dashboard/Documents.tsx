import { useEffect, useState, type FormEvent } from "react";
import {
  getDocumentUrl,
  listDocuments,
  uploadDocument,
  type DocumentRecord,
} from "../../api/documents";
import { errorMessage } from "../../lib/errorMessage";

export default function Documents() {
  const [items, setItems] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setItems(await listDocuments());
  }

  useEffect(() => {
    listDocuments()
      .then(setItems)
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load documents.")))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await uploadDocument({
        entityType: String(form.get("entityType")),
        entityId: String(form.get("entityId")),
        sharingScope: String(form.get("sharingScope")),
        file,
      });
      await load();
      formElement.reset();
      setMessage("Evidence stored, linked to the selected HLC record, and ready for the sharing scope you chose.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to upload this file."));
    } finally {
      setBusy(false);
    }
  }

  async function open(item: DocumentRecord) {
    try {
      window.open(await getDocumentUrl(item.id, item.storage_path), "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to open this document."));
    }
  }

  return (
    <main className="hlc-documents-page" style={{ width: "min(980px,calc(100% - 32px))", margin: "32px auto", display: "grid", gap: 18 }}>
      <header style={heroStyle}>
        <p style={eyebrowStyle}>HLC RECORD EVIDENCE</p>
        <h1 style={{ margin: 0, color: "#fff", fontSize: "clamp(2rem,5vw,3.6rem)" }}>Documents, photos & short videos</h1>
        <p style={{ margin: 0, color: "#dbeafe", lineHeight: 1.65, fontWeight: 600 }}>Attach useful evidence to the correct HLC record. Good media helps the next person understand the job without guessing.</p>
      </header>

      <section style={guideStyle} aria-labelledby="media-guide-title">
        <div>
          <p style={guideEyebrowStyle}>BEFORE YOU UPLOAD</p>
          <h2 id="media-guide-title" style={{ margin: "4px 0 8px" }}>Show the problem like you are walking a technician through it.</h2>
          <p style={{ margin: 0, color: "#475569" }}>You do not need dozens of random pictures. A small, clear set is more useful.</p>
        </div>
        <div style={guideGridStyle}>
          <article style={guideCardStyle}><strong>1 · Start wide</strong><span>Take one photo that shows the room, area, roof section, appliance, fixture, or exterior location so the issue has context.</span></article>
          <article style={guideCardStyle}><strong>2 · Move closer</strong><span>Add clear close-ups of damage, leaks, cracks, stains, loose parts, error codes, or the exact area needing service.</span></article>
          <article style={guideCardStyle}><strong>3 · Capture labels</strong><span>When safe, photograph model/serial plates, equipment labels, breaker labels, or other identifiers that can help with parts and preparation.</span></article>
          <article style={guideCardStyle}><strong>4 · Use video when motion or sound matters</strong><span>Keep clips short. Move slowly and narrate what you are showing. Video is best for noises, intermittent movement, leaks, door/fixture operation, or a path through the property.</span></article>
        </div>
        <div style={privacyGuideStyle}><strong>Protect private information.</strong><span>Avoid faces when they are not needed, mail, IDs, payment information, passwords, security codes, computer screens, children, or unrelated private areas. Only upload material relevant to the HLC record.</span></div>
      </section>

      {error && <p role="alert" style={errorStyle}>{error}</p>}
      {message && <p role="status" style={successStyle}>{message}</p>}

      <form className="hlc-documents-form" onSubmit={submit} style={formStyle}>
        <div style={{ display: "grid", gap: 5 }}><p style={guideEyebrowStyle}>ATTACH TO A REAL HLC RECORD</p><h2 style={{ margin: 0 }}>Add evidence</h2><p style={{ margin: 0, color: "#64748b" }}>Choose the record and sharing level before selecting the file. This keeps media from becoming an unorganized camera roll.</p></div>
        <label style={labelStyle}>Related record type
          <select name="entityType" style={fieldStyle}>
            <option value="lead">Lead / service request</option>
            <option value="estimate">LeadScope estimate</option>
            <option value="job">Job</option>
            <option value="appointment">Appointment</option>
            <option value="contractor">Professional / provider</option>
            <option value="conversation">Conversation</option>
          </select>
        </label>
        <label style={labelStyle}>Related record ID<input name="entityId" required style={fieldStyle} placeholder="Paste or enter the HLC record ID" /></label>
        <label style={labelStyle}>Who should be able to see it?
          <select name="sharingScope" style={fieldStyle}>
            <option value="workspace">HLC workspace only</option>
            <option value="homeowner">Share with linked resident</option>
            <option value="contractor">Share with linked professional</option>
          </select>
        </label>
        <label style={uploadLabelStyle}>
          <span style={{ fontWeight: 1000, fontSize: 17 }}>Choose a document, photo, or short video</span>
          <span style={{ color: "#475569", lineHeight: 1.55 }}>Supported: PDF, Word, text, JPEG, PNG, WebP, MP4, MOV, and WebM. Maximum 25 MB per file. On iPhone, the picker can use your Camera, Photo Library, or Files depending on Safari options.</span>
          <input name="file" type="file" accept=".pdf,.docx,.txt,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" required style={{ marginTop: 4 }} />
        </label>
        <button disabled={busy} style={uploadButtonStyle}>{busy ? "Uploading securely…" : "Attach to HLC record →"}</button>
      </form>

      <section className="hlc-documents-list" style={{ display: "grid", gap: 12 }}>
        <div><p style={guideEyebrowStyle}>RECORD LIBRARY</p><h2 style={{ margin: 0 }}>Stored files</h2></div>
        {loading ? <p>Loading…</p> : items.length === 0 ? <p style={emptyStyle}>No documents or media yet. Attach the first useful piece of evidence above.</p> : items.map((item) => (
          <article className="hlc-document-card" key={item.id} style={fileCardStyle}>
            <button type="button" onClick={() => open(item)} style={fileButtonStyle}>{item.filename}</button>
            <span>{item.entity_type} · {item.entity_id}</span>
            <small>{item.sharing_scope} · {formatBytes(item.byte_size)} · {friendlyType(item.mime_type)}</small>
          </article>
        ))}
      </section>
    </main>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

function friendlyType(mime: string) {
  if (mime.startsWith("image/")) return "Photo";
  if (mime.startsWith("video/")) return "Video";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("wordprocessingml")) return "Word document";
  if (mime === "text/plain") return "Text";
  return "File";
}

const heroStyle = { display: "grid", gap: 10, padding: "clamp(24px,5vw,44px)", borderRadius: 24, background: "radial-gradient(circle at 10% 0%,rgba(14,165,233,.2),transparent 35%),linear-gradient(145deg,#050b14,#0b2345)", boxShadow: "0 24px 70px rgba(15,23,42,.18)" } as const;
const eyebrowStyle = { margin: 0, color: "#93c5fd", fontSize: 11, fontWeight: 900, letterSpacing: ".13em" } as const;
const guideStyle = { display: "grid", gap: 16, padding: "clamp(20px,4vw,30px)", border: "1px solid #bfdbfe", borderRadius: 20, background: "linear-gradient(145deg,#f8fbff,#eef6ff)" } as const;
const guideEyebrowStyle = { margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" } as const;
const guideGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 10 } as const;
const guideCardStyle = { display: "grid", gap: 6, padding: 15, border: "1px solid #dbeafe", borderRadius: 14, background: "rgba(255,255,255,.85)", color: "#334155" } as const;
const privacyGuideStyle = { display: "grid", gap: 4, padding: 14, borderRadius: 14, color: "#7c2d12", background: "#fff7ed", border: "1px solid #fed7aa" } as const;
const formStyle = { display: "grid", gap: 14, padding: "clamp(20px,4vw,30px)", border: "1px solid #dbe7f4", borderRadius: 20, background: "#fff", boxShadow: "0 18px 50px rgba(15,23,42,.07)" } as const;
const labelStyle = { display: "grid", gap: 6, fontWeight: 900, color: "#0f172a" } as const;
const fieldStyle = { width: "100%", minHeight: 46, boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 10, background: "#fbfdff", color: "#0f172a", font: "inherit" } as const;
const uploadLabelStyle = { display: "grid", gap: 8, padding: 18, border: "2px dashed #60a5fa", borderRadius: 16, background: "#f0f9ff", cursor: "pointer" } as const;
const uploadButtonStyle = { minHeight: 50, border: 0, borderRadius: 13, color: "#fff", background: "linear-gradient(135deg,#2563eb,#0ea5e9)", fontWeight: 1000, cursor: "pointer" } as const;
const fileCardStyle = { display: "grid", gap: 5, padding: 16, border: "1px solid #dbeafe", borderRadius: 14, background: "#fff" } as const;
const fileButtonStyle = { width: "fit-content", border: 0, padding: 0, background: "transparent", color: "#1d4ed8", fontWeight: 900, textAlign: "left", cursor: "pointer" } as const;
const errorStyle = { padding: 14, border: "1px solid #fecaca", borderRadius: 12, background: "#fef2f2", color: "#991b1b", fontWeight: 800 } as const;
const successStyle = { padding: 14, border: "1px solid #bbf7d0", borderRadius: 12, background: "#f0fdf4", color: "#166534", fontWeight: 800 } as const;
const emptyStyle = { padding: 18, border: "1px dashed #94a3b8", borderRadius: 14, background: "#f8fafc", color: "#475569" } as const;
