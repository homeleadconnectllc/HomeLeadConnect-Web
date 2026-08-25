import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { uploadDocument } from "../../api/documents";
import { errorMessage } from "../../lib/errorMessage";

const allowedRecordTypes = new Set(["lead", "estimate", "job", "appointment", "contractor", "conversation"]);

export default function DocumentScan() {
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const requestedType = searchParams.get("entityType") || "";
  const requestedId = searchParams.get("entityId") || "";
  const initialType = allowedRecordTypes.has(requestedType) ? requestedType : "lead";

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
      formElement.reset();
      setMessage("Scan source stored securely on the selected HLC record. OCR extraction has not been run; review the source document directly until processing is connected.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to store this scan source."));
    } finally {
      setBusy(false);
    }
  }

  return <main className="hlc-documents-workspace">
    <header className="hlc-documents-header">
      <div>
        <p className="hlc-documents-kicker">SCAN INTAKE</p>
        <h1>Capture a document</h1>
        <p>Use your phone camera, photo library, or an existing PDF to keep source evidence attached to the correct HLC record. HLC stores the source now; OCR and structured extraction remain a separate review-controlled processing step.</p>
      </div>
      <div className="hlc-documents-summary" aria-label="Scan capability status">
        <span><strong>Ready</strong><small>Camera/file capture</small></span>
        <span><strong>Ready</strong><small>Secure record storage</small></span>
        <span><strong>Pending</strong><small>OCR extraction</small></span>
        <span><strong>Required</strong><small>Human review</small></span>
      </div>
    </header>

    <nav className="hlc-resources-commandbar" aria-label="Scan navigation">
      <Link to="/documents">Document Library</Link>
      <Link to="/resources/forms">Forms & Checklists</Link>
    </nav>

    {error && <p role="alert" className="hlc-documents-status is-error">{error}</p>}
    {message && <p role="status" className="hlc-documents-status is-success">{message}</p>}

    <div className="hlc-documents-console">
      <section className="hlc-documents-intake" aria-labelledby="scan-source-heading">
        <div className="hlc-documents-section-head"><div><span>SOURCE CAPTURE</span><h2 id="scan-source-heading">Store the original first</h2></div><small>No invented extraction</small></div>
        <form className="hlc-documents-form" onSubmit={submit}>
          <label>Related record type
            <select name="entityType" defaultValue={initialType}>
              <option value="lead">Lead / service request</option>
              <option value="estimate">Estimate</option>
              <option value="job">Job</option>
              <option value="appointment">Appointment</option>
              <option value="contractor">Professional / provider</option>
              <option value="conversation">Conversation</option>
            </select>
          </label>
          <label>Related record ID<input name="entityId" required defaultValue={requestedId} placeholder="HLC record ID" /></label>
          <label>Sharing scope
            <select name="sharingScope" defaultValue="workspace">
              <option value="workspace">HLC workspace only</option>
              <option value="homeowner">Share with linked resident</option>
              <option value="contractor">Share with linked professional</option>
            </select>
          </label>
          <label className="hlc-documents-file-input">
            <strong>Photograph or choose the source</strong>
            <span>On supported phones, the camera option can be offered directly. PDF and image sources are stored as originals before any future OCR step.</span>
            <input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" capture="environment" required />
          </label>
          <button disabled={busy}>{busy ? "Storing source…" : "Store scan source"}</button>
        </form>
      </section>

      <aside className="hlc-documents-guidance" aria-labelledby="scan-review-heading">
        <div className="hlc-documents-section-head"><div><span>PROCESS CONTROL</span><h2 id="scan-review-heading">What happens next</h2></div></div>
        <div className="hlc-documents-guidance-list">
          <div className="hlc-documents-guidance-row"><strong>1</strong><div><h3>Store original</h3><p>The source file is preserved on the authorized HLC record.</p></div></div>
          <div className="hlc-documents-guidance-row"><strong>2</strong><div><h3>OCR when connected</h3><p>A future trusted processor may propose extracted text and fields. It must not silently overwrite source evidence.</p></div></div>
          <div className="hlc-documents-guidance-row"><strong>3</strong><div><h3>Human review</h3><p>Low-confidence or financial fields require confirmation before becoming canonical business data.</p></div></div>
          <div className="hlc-documents-guidance-row"><strong>4</strong><div><h3>Attach structured result</h3><p>Approved extraction can later feed the linked Job, Estimate, Finance, or provider record.</p></div></div>
        </div>
      </aside>
    </div>
  </main>;
}
