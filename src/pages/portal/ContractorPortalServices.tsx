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

  return <main className="hlc-ui-page-d2e8ad">
    <header className="hlc-ui-hero-b4d8d2"><p className="hlc-ui-eyebrow-321b33">Professional portal</p><h1 className="hlc-ui-margin-ab79ea">Services, service areas & availability</h1><p className="hlc-ui-margin-bottom-fa769a">These are provider-declared operational facts. HLC does not turn them into ranking, verification, nearest-provider claims, dispatch or guaranteed availability.</p></header>
    <nav aria-label="Professional portal sections" className="hlc-ui-nav-c3daa7"><Link to="/contractor-portal">Work dashboard</Link><Link to="/contractor-portal/profile">Business profile</Link><Link to="/contractor-portal/services" aria-current="page">Services & availability</Link><Link to="/messages">Messages</Link><Link to="/contractor-portal/documents">Documents</Link></nav>
    {loading && <p role="status">Loading professional settings…</p>}
    {error && <p role="alert" className="hlc-ui-error-260ca0">{error}</p>}
    {message && <p role="status" className="hlc-ui-success-a1fdef">{message}</p>}
    {!loading && !contractorId && <section className="hlc-ui-card-3215d5"><h2>No linked professional profile</h2><p>An active contractor/provider portal link is required.</p></section>}

    {contractorId && <>
      <section className="hlc-ui-card-3215d5"><h2>Declared services</h2>
        <form onSubmit={addService} className="hlc-ui-row-4e4882"><label className="hlc-ui-field-082906">Service<input required minLength={2} value={serviceName} onChange={(event) => setServiceName(event.target.value)} placeholder="Painting, HVAC repair, moving…" /></label><button disabled={busy} className="hlc-ui-primaryButton-f28891">Add service</button></form>
        {setup.services.length === 0 ? <p>No services declared yet.</p> : setup.services.map((service) => <div key={service.id} className="hlc-ui-item-3a0d46"><span><strong>{service.service_name}</strong> · {service.active ? "active" : "inactive"}</span><button type="button" disabled={busy} onClick={() => void run(() => removeLinkedProviderService(contractorId, service.id), "Service removed.")}>Remove</button></div>)}
      </section>

      <section className="hlc-ui-card-3215d5"><h2>Declared service areas</h2><p>Radius is a provider-declared coverage value only. The Map uses explicit stored coordinates separately and does not infer distance from this field.</p>
        <form onSubmit={addArea} className="hlc-ui-grid-1bfa11"><label className="hlc-ui-field-082906">City<input value={area.city} onChange={(event) => setArea({ ...area, city: event.target.value })} /></label><label className="hlc-ui-field-082906">State<input value={area.state} onChange={(event) => setArea({ ...area, state: event.target.value })} /></label><label className="hlc-ui-field-082906">ZIP<input value={area.zip} onChange={(event) => setArea({ ...area, zip: event.target.value })} /></label><label className="hlc-ui-field-082906">Declared radius (miles)<input type="number" min={0} max={500} value={area.radiusMiles} onChange={(event) => setArea({ ...area, radiusMiles: event.target.value })} /></label><button disabled={busy} className="hlc-ui-primaryButton-f28891">Add service area</button></form>
        {setup.service_areas.length === 0 ? <p>No service areas declared yet.</p> : setup.service_areas.map((serviceArea) => <div key={serviceArea.id} className="hlc-ui-item-3a0d46"><span><strong>{[serviceArea.city, serviceArea.state, serviceArea.zip].filter(Boolean).join(", ") || "Area"}</strong>{serviceArea.radius_miles != null ? ` · ${serviceArea.radius_miles} mi declared radius` : ""}</span><button type="button" disabled={busy} onClick={() => void run(() => removeLinkedProviderServiceArea(contractorId, serviceArea.id), "Service area removed.")}>Remove</button></div>)}
      </section>

      <form onSubmit={saveAvailability} className="hlc-ui-card-3215d5"><h2>Availability</h2><label className="hlc-ui-checkbox-886c5c"><input type="checkbox" checked={availability.available} onChange={(event) => setAvailability({ ...availability, available: event.target.checked })} /> Currently accepting HLC work</label><label className="hlc-ui-field-082906">Availability note<textarea rows={3} value={availability.note} onChange={(event) => setAvailability({ ...availability, note: event.target.value })} placeholder="Optional provider-declared note" /></label><label className="hlc-ui-field-082906">Next available date/time<input type="datetime-local" value={availability.nextAvailableAt} onChange={(event) => setAvailability({ ...availability, nextAvailableAt: event.target.value })} /></label><button disabled={busy} className="hlc-ui-primaryButton-f28891">{busy ? "Saving…" : "Save availability"}</button></form>
    </>}
  </main>;
}

function toLocalInput(value: string) { const date = new Date(value); const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return shifted.toISOString().slice(0, 16); }
