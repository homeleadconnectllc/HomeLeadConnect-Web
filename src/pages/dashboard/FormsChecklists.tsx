import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { checklistRegistry, formRegistry, type FormContext } from "../../data/formsChecklists";

const contexts: { id: "all" | FormContext; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lead", label: "Leads" },
  { id: "estimate", label: "Estimates" },
  { id: "job", label: "Jobs" },
  { id: "appointment", label: "Appointments" },
  { id: "provider", label: "Professionals" },
  { id: "community", label: "Community" },
  { id: "finance", label: "Finance" },
  { id: "general", label: "General" },
];

export default function FormsChecklists() {
  const [context, setContext] = useState<"all" | FormContext>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const forms = useMemo(() => formRegistry.filter((form) => {
    const contextMatches = context === "all" || form.context === context;
    const queryMatches = !normalizedQuery || `${form.title} ${form.purpose} ${form.context}`.toLowerCase().includes(normalizedQuery);
    return contextMatches && queryMatches;
  }), [context, normalizedQuery]);

  const checklists = useMemo(() => checklistRegistry.filter((checklist) => {
    const contextMatches = context === "all" || checklist.context === context;
    const queryMatches = !normalizedQuery || `${checklist.title} ${checklist.purpose} ${checklist.context}`.toLowerCase().includes(normalizedQuery);
    return contextMatches && queryMatches;
  }), [context, normalizedQuery]);

  return <main className="hlc-resources-workspace">
    <header className="hlc-resources-header">
      <div>
        <p className="hlc-resources-kicker">OPERATING TEMPLATES</p>
        <h1>Forms & Checklists</h1>
        <p>Use one governed library for intake, estimates, jobs, professional onboarding, approvals, evidence and repeatable completion steps. These definitions are wired into the app now; persistent submissions and checklist completion records are the next backend gate.</p>
      </div>
      <div className="hlc-resources-summary" aria-label="Forms and checklists summary">
        <span><strong>{formRegistry.length}</strong><small>Form templates</small></span>
        <span><strong>{checklistRegistry.length}</strong><small>Checklist templates</small></span>
        <span><strong>Shared</strong><small>Source of truth</small></span>
      </div>
    </header>

    <nav className="hlc-resources-commandbar" aria-label="Resource navigation">
      <Link to="/help">Help Center</Link>
      <Link to="/tutorials">Tutorials</Link>
      <Link to="/rules">Rules & Safety</Link>
      <Link className="is-active" to="/resources/forms">Forms & Checklists</Link>
      <Link to="/documents">Documents</Link>
      <Link to="/call-center">Call Center</Link>
    </nav>

    <section className="hlc-resources-ledger" aria-label="Forms and checklists filters">
      <div className="hlc-resources-section-head"><div><span>FIND A TEMPLATE</span><h2>Filter by workflow context</h2></div></div>
      <label>Search templates<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search forms, checklists, purpose…" /></label>
      <div className="hlc-account-inline-links" role="group" aria-label="Template context filters">
        {contexts.map((item) => <button type="button" className={context === item.id ? "is-active" : ""} key={item.id} onClick={() => setContext(item.id)}>{item.label}</button>)}
      </div>
    </section>

    <section className="hlc-resources-ledger" aria-labelledby="hlc-forms-heading">
      <div className="hlc-resources-section-head"><div><span>FORM REGISTRY</span><h2 id="hlc-forms-heading">Forms</h2></div><strong>{forms.length}</strong></div>
      <div className="hlc-resources-row-list">
        {forms.length === 0 ? <p>No forms match this filter.</p> : forms.map((form, index) => <article className="hlc-resource-row" key={form.id}>
          <span className="hlc-resource-index">{String(index + 1).padStart(2, "0")}</span>
          <div className="hlc-resource-copy">
            <h3>{form.title}</h3>
            <p>{form.purpose}</p>
            <small>{form.context} · {form.audience.join(" / ")} · {form.fields.length} fields{form.approvalRequired ? " · approval required" : ""}</small>
            <ul>{form.fields.map((field) => <li key={field.id}>{field.label}{field.required ? " · Required" : ""}{field.type === "signature" ? " · Signature-capable field (provider/backend not yet connected)" : ""}</li>)}</ul>
          </div>
          <div className="hlc-resource-actions">
            {form.context === "lead" && <Link to="/leads">Open Leads</Link>}
            {form.context === "estimate" && <Link to="/estimator">Open Estimates</Link>}
            {form.context === "job" && <Link to="/jobs">Open Jobs</Link>}
            {form.context === "provider" && <Link to="/contractor-portal">Professional Portal</Link>}
            <Link to="/documents">Documents</Link>
          </div>
        </article>)}
      </div>
    </section>

    <section className="hlc-resources-ledger" aria-labelledby="hlc-checklists-heading">
      <div className="hlc-resources-section-head"><div><span>CHECKLIST REGISTRY</span><h2 id="hlc-checklists-heading">Checklists</h2></div><strong>{checklists.length}</strong></div>
      <div className="hlc-resources-row-list">
        {checklists.length === 0 ? <p>No checklists match this filter.</p> : checklists.map((checklist, index) => <article className="hlc-resource-row" key={checklist.id}>
          <span className="hlc-resource-index">{String(index + 1).padStart(2, "0")}</span>
          <div className="hlc-resource-copy">
            <h3>{checklist.title}</h3>
            <p>{checklist.purpose}</p>
            <small>{checklist.context} · {checklist.audience.join(" / ")}</small>
            <ol>{checklist.items.map((item) => <li key={item.id}>{item.label}{item.required ? " · Required" : " · Optional"}{item.evidence ? ` · Evidence: ${item.evidence}` : ""}</li>)}</ol>
          </div>
          <div className="hlc-resource-actions">
            {checklist.context === "lead" && <Link to="/leads">Open Leads</Link>}
            {checklist.context === "estimate" && <Link to="/estimator">Open Estimates</Link>}
            {checklist.context === "job" && <Link to="/jobs">Open Jobs</Link>}
            {checklist.context === "provider" && <Link to="/contractor-portal">Professional Portal</Link>}
          </div>
        </article>)}
      </div>
    </section>

    <section className="hlc-resources-escalation">
      <div><span>IMPLEMENTATION BOUNDARY</span><h2>Template visibility is wired; submissions are not yet complete.</h2></div>
      <p>This screen exposes the canonical form/checklist definitions inside HLC. The next gate is durable submission state, completion evidence, permissions, record attachment, audit history, and workflow enforcement. Until those exist, HLC must not claim a checklist was completed or a form was signed merely because the template is visible.</p>
    </section>
  </main>;
}
