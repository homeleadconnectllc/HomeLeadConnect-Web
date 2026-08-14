import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  addLinkedProviderService,
  addLinkedProviderServiceArea,
  getContractorPortalData,
  getLinkedProviderSetup,
  removeLinkedProviderService,
  removeLinkedProviderServiceArea,
  setLinkedProviderAvailability,
  type LinkedProviderSetup,
} from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";

export default function ContractorPortalServices() {
  const [contractorId, setContractorId] = useState<number | null>(null);
  const [setup, setSetup] = useState<LinkedProviderSetup>({ services: [], service_areas: [], availability: null });
  const [serviceName, setServiceName] = useState("");
  const [area, setArea] = useState({ city: "", state: "PA", zip: "", radiusMiles: "25" });
  const [availability, setAvailability] = useState({ available: true, note: "", nextAvailableAt: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(id?: number) {
    const activeId = id ?? contractorId;
    if (!activeId) return;
    const result = await getLinkedProviderSetup(activeId);
    setSetup(result);
    setAvailability({
      available: result.availability?.available ?? true,
      note: result.availability?.note || "",
      nextAvailableAt: result.availability?.next_available_at ? toLocalInput(result.availability.next_available_at) : "",
    });
  }

  useEffect(() => {
    let active = true;
    getContractorPortalData()
      .then(async (portal) => {
        const id = portal.links[0]?.contractor_id ?? null;
        if (!active) return;
        setContractorId(id);
        if (id) {
          const result = await getLinkedProviderSetup(id);
          if (!active) return;
          setSetup(result);
          setAvailability({
            available: result.availability?.available ?? true,
            note: result.availability?.note || "",
            nextAvailableAt: result.availability?.next_available_at ? toLocalInput(result.availability.next_available_at) : "",
          });
        }
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load professional service settings.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); await load(); setMessage(success); }
    catch (reason) { setError(errorMessage(reason, "Unable to update professional settings.")); }
    finally { setBusy(false); }
  }

  async function addService(event: FormEvent) {
    event.preventDefault(); if (!contractorId) return;
    await run(async () => { await addLinkedProviderService(contractorId, serviceName); setServiceName(""); }, "Service added.");
  }

  async function addArea(event: FormEvent) {
    event.preventDefault(); if (!contractorId) return;
    await run(async () => {
      await addLinkedProviderServiceArea(contractorId, { city: area.city, state: area.state, zip: area.zip, radiusMiles: Number(area.radiusMiles) });
      setArea({ city: "", state: "PA", zip: "", radiusMiles: "25" });
    }, "Service area added.");
  }

  async function saveAvailability(event: FormEvent) {
    event.preventDefault(); if (!contractorId) return;
    await run(() => setLinkedProviderAvailability(contractorId, availability), "Availability saved.");
  }

  return <main style={pageStyle}>
    <header style={heroStyle}><p style={eyebrowStyle}>Professional portal</p><h1 style={{ margin: 0 }}>Services, service areas & availability</h1><p style={{ marginBottom: 0 }}>These are provider-declared operational facts. HLC does not turn them into ranking, verification, nearest-provider claims, dispatch or guaranteed availability.</p></header>
    <nav aria-label="Professional portal sections" style={navStyle}><Link to="/contractor-portal">Work dashboard</Link><Link to="/contractor-portal/profile">Business profile</Link><Link to="/contractor-portal/services" aria-current="page">Services & availability</Link><Link to="/messages">Messages</Link><Link to="/contractor-portal/documents">Documents</Link></nav>
    {loading && <p role="status">Loading professional settings…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {message && <p role="status" style={successStyle}>{message}</p>}
    {!loading && !contractorId && <section style={cardStyle}><h2>No linked professional profile</h2><p>An active contractor/provider portal link is required.</p></section>}

    {contractorId && <>
      <section style={cardStyle}><h2>Declared services</h2>
        <form onSubmit={addService} style={rowStyle}><label style={fieldStyle}>Service<input required minLength={2} value={serviceName} onChange={(event) => setServiceName(event.target.value)} placeholder="Painting, HVAC repair, moving…" /></label><button disabled={busy} style={primaryButtonStyle}>Add service</button></form>
        {setup.services.length === 0 ? <p>No services declared yet.</p> : setup.services.map((service) => <div key={service.id} style={itemStyle}><span><strong>{service.service_name}</strong> · {service.active ? "active" : "inactive"}</span><button type="button" disabled={busy} onClick={() => void run(() => removeLinkedProviderService(contractorId, service.id), "Service removed.")}>Remove</button></div>)}
      </section>

      <section style={cardStyle}><h2>Declared service areas</h2><p>Radius is a provider-declared coverage value only. The Map uses explicit stored coordinates separately and does not infer distance from this field.</p>
        <form onSubmit={addArea} style={gridStyle}><label style={fieldStyle}>City<input value={area.city} onChange={(event) => setArea({ ...area, city: event.target.value })} /></label><label style={fieldStyle}>State<input value={area.state} onChange={(event) => setArea({ ...area, state: event.target.value })} /></label><label style={fieldStyle}>ZIP<input value={area.zip} onChange={(event) => setArea({ ...area, zip: event.target.value })} /></label><label style={fieldStyle}>Declared radius (miles)<input type="number" min={0} max={500} value={area.radiusMiles} onChange={(event) => setArea({ ...area, radiusMiles: event.target.value })} /></label><button disabled={busy} style={primaryButtonStyle}>Add service area</button></form>
        {setup.service_areas.length === 0 ? <p>No service areas declared yet.</p> : setup.service_areas.map((serviceArea) => <div key={serviceArea.id} style={itemStyle}><span><strong>{[serviceArea.city, serviceArea.state, serviceArea.zip].filter(Boolean).join(", ") || "Area"}</strong>{serviceArea.radius_miles != null ? ` · ${serviceArea.radius_miles} mi declared radius` : ""}</span><button type="button" disabled={busy} onClick={() => void run(() => removeLinkedProviderServiceArea(contractorId, serviceArea.id), "Service area removed.")}>Remove</button></div>)}
      </section>

      <form onSubmit={saveAvailability} style={cardStyle}><h2>Availability</h2><label style={checkboxStyle}><input type="checkbox" checked={availability.available} onChange={(event) => setAvailability({ ...availability, available: event.target.checked })} /> Currently accepting HLC work</label><label style={fieldStyle}>Availability note<textarea rows={3} value={availability.note} onChange={(event) => setAvailability({ ...availability, note: event.target.value })} placeholder="Optional provider-declared note" /></label><label style={fieldStyle}>Next available date/time<input type="datetime-local" value={availability.nextAvailableAt} onChange={(event) => setAvailability({ ...availability, nextAvailableAt: event.target.value })} /></label><button disabled={busy} style={primaryButtonStyle}>{busy ? "Saving…" : "Save availability"}</button></form>
    </>}
  </main>;
}

function toLocalInput(value: string) { const date = new Date(value); const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return shifted.toISOString().slice(0, 16); }

const pageStyle = { width: "min(980px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px,5vw,40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#818cf8", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { display: "grid", gap: 14, padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff" };
const rowStyle = { display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "end" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, alignItems: "end" };
const fieldStyle = { display: "grid", gap: 6, fontWeight: 700 };
const checkboxStyle = { display: "flex", gap: 8, alignItems: "center", fontWeight: 700 };
const itemStyle = { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const, alignItems: "center", padding: 12, border: "1px solid #e2e8f0", borderRadius: 12 };
const primaryButtonStyle = { minHeight: 44, width: "fit-content", padding: "10px 16px", border: "1px solid #0f172a", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 900 };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12 };
const successStyle = { color: "#166534", padding: 14, border: "1px solid #bbf7d0", borderRadius: 12 };
