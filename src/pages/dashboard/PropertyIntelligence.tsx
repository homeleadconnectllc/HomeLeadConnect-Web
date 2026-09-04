import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, Home, Wrench } from "lucide-react";
import { createResidentProperty, listResidentProperties, type ResidentProperty } from "../../api/ecosystemExtra";
import {
  createPropertyAsset,
  createPropertyAssetServiceEvent,
  listPropertyAssets,
  listPropertyAssetServiceEvents,
  type PropertyAsset,
  type PropertyAssetCategory,
  type PropertyAssetCondition,
  type PropertyAssetServiceEvent,
  type PropertyAssetServiceType,
} from "../../api/propertyAssets";
import { errorMessage } from "../../lib/errorMessage";

const categories: Array<{ value: PropertyAssetCategory; label: string }> = [
  ["hvac", "HVAC / heating & cooling"], ["water_heater", "Water heater"], ["roof", "Roof / exterior envelope"],
  ["plumbing", "Plumbing"], ["electrical", "Electrical"], ["appliance", "Appliance"], ["generator", "Generator"],
  ["solar", "Solar / storage"], ["irrigation", "Irrigation"], ["lawn_equipment", "Lawn equipment"],
  ["pool_spa", "Pool / spa"], ["security", "Security / access"], ["other", "Other equipment"],
].map(([value, label]) => ({ value: value as PropertyAssetCategory, label }));

const conditions: Array<{ value: PropertyAssetCondition; label: string }> = [
  ["unknown", "Unknown"], ["good", "Good"], ["monitor", "Monitor"], ["service_due", "Service due"],
  ["repair_needed", "Repair needed"], ["replace_soon", "Replace soon"], ["retired", "Retired"],
].map(([value, label]) => ({ value: value as PropertyAssetCondition, label }));

const serviceTypes: Array<{ value: PropertyAssetServiceType; label: string }> = [
  ["inspection", "Inspection"], ["maintenance", "Maintenance"], ["repair", "Repair"], ["replacement", "Replacement"],
  ["installation", "Installation"], ["warranty", "Warranty"], ["note", "Service note"],
].map(([value, label]) => ({ value: value as PropertyAssetServiceType, label }));

export default function PropertyIntelligence() {
  const [properties, setProperties] = useState<ResidentProperty[]>([]);
  const [assets, setAssets] = useState<PropertyAsset[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [serviceEvents, setServiceEvents] = useState<PropertyAssetServiceEvent[]>([]);
  const [serviceEventsForAssetId, setServiceEventsForAssetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [propertyForm, setPropertyForm] = useState({ label: "", address: "", city: "", state: "", zip: "" });
  const [assetForm, setAssetForm] = useState({ category: "hvac" as PropertyAssetCategory, label: "", manufacturer: "", modelNumber: "", serialNumber: "", installedOn: "", warrantyExpiresOn: "", lastServicedOn: "", nextServiceOn: "", condition: "unknown" as PropertyAssetCondition, notes: "" });
  const [serviceForm, setServiceForm] = useState({ eventType: "maintenance" as PropertyAssetServiceType, occurredOn: new Date().toISOString().slice(0, 10), providerName: "", cost: "", notes: "" });

  useEffect(() => {
    let active = true;
    Promise.all([listResidentProperties(), listPropertyAssets()])
      .then(([propertyRows, assetRows]) => {
        if (!active) return;
        setProperties(propertyRows);
        setAssets(assetRows);
        if (propertyRows[0]) setSelectedPropertyId(propertyRows[0].id);
      })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to load property intelligence.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedAssetId) return;
    let active = true;
    const assetId = selectedAssetId;
    listPropertyAssetServiceEvents(assetId)
      .then((rows) => {
        if (!active) return;
        setServiceEvents(rows);
        setServiceEventsForAssetId(assetId);
      })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to load service history.")); });
    return () => { active = false; };
  }, [selectedAssetId]);

  const selectedProperty = useMemo(() => properties.find((property) => property.id === selectedPropertyId) ?? null, [properties, selectedPropertyId]);
  const visibleAssets = useMemo(() => assets.filter((asset) => !selectedPropertyId || asset.property_id === selectedPropertyId), [assets, selectedPropertyId]);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId) ?? null, [assets, selectedAssetId]);
  const visibleServiceEvents = selectedAssetId && serviceEventsForAssetId === selectedAssetId ? serviceEvents : [];

  async function addProperty(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const created = await createResidentProperty({ label: propertyForm.label, address: propertyForm.address || null, city: propertyForm.city || null, state: propertyForm.state || null, zip: propertyForm.zip || null });
      setProperties((current) => [created, ...current]);
      setSelectedPropertyId(created.id);
      setSelectedAssetId("");
      setPropertyForm({ label: "", address: "", city: "", state: "", zip: "" });
      setMessage("Property added.");
    } catch (reason) { setError(errorMessage(reason, "Unable to add property.")); }
  }

  async function addAsset(event: FormEvent) {
    event.preventDefault(); if (!selectedPropertyId) return; setError(""); setMessage("");
    try {
      const created = await createPropertyAsset({ propertyId: selectedPropertyId, ...assetForm });
      setAssets((current) => [created, ...current]);
      setSelectedAssetId(created.id);
      setAssetForm({ category: "hvac", label: "", manufacturer: "", modelNumber: "", serialNumber: "", installedOn: "", warrantyExpiresOn: "", lastServicedOn: "", nextServiceOn: "", condition: "unknown", notes: "" });
      setMessage("Equipment record added.");
    } catch (reason) { setError(errorMessage(reason, "Unable to add equipment record.")); }
  }

  async function addServiceEvent(event: FormEvent) {
    event.preventDefault(); if (!selectedAssetId) return; setError(""); setMessage("");
    try {
      const created = await createPropertyAssetServiceEvent({ assetId: selectedAssetId, eventType: serviceForm.eventType, occurredOn: serviceForm.occurredOn, providerName: serviceForm.providerName, cost: serviceForm.cost ? Number(serviceForm.cost) : null, notes: serviceForm.notes });
      setServiceEvents((current) => serviceEventsForAssetId === selectedAssetId ? [created, ...current] : [created]);
      setServiceEventsForAssetId(selectedAssetId);
      setServiceForm({ eventType: "maintenance", occurredOn: new Date().toISOString().slice(0, 10), providerName: "", cost: "", notes: "" });
      setMessage("Service history recorded.");
    } catch (reason) { setError(errorMessage(reason, "Unable to record service history.")); }
  }

  return (
    <main className="hlc-command-center hlc-property-intelligence-page">
      <section className="hlc-command-hero">
        <div className="hlc-command-copy">
          <div className="hlc-command-kicker"><Home size={15} aria-hidden="true" />Property intelligence</div>
          <h1>Home systems, equipment & service history</h1>
          <p>Build a factual maintenance record for the property. HomeLead Connect never guesses age, condition, warranty or service history.</p>
        </div>
      </section>

      {loading && <p role="status">Loading property records…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

      <section className="hlc-workspace-grid" aria-label="Property setup">
        <form className="hlc-workspace-card hlc-property-form" onSubmit={addProperty}>
          <span className="hlc-workspace-copy"><strong>Add a property</strong><span>Service location or home profile.</span></span>
          <label>Property label<input required maxLength={160} value={propertyForm.label} onChange={(event) => setPropertyForm({ ...propertyForm, label: event.target.value })} placeholder="Home, rental, office…" /></label>
          <label>Address<input value={propertyForm.address} onChange={(event) => setPropertyForm({ ...propertyForm, address: event.target.value })} /></label>
          <label>City / locality<input value={propertyForm.city} onChange={(event) => setPropertyForm({ ...propertyForm, city: event.target.value })} /></label>
          <div className="hlc-inline-form-grid"><label>State / region<input value={propertyForm.state} onChange={(event) => setPropertyForm({ ...propertyForm, state: event.target.value })} /></label><label>Postal code<input value={propertyForm.zip} onChange={(event) => setPropertyForm({ ...propertyForm, zip: event.target.value })} /></label></div>
          <button type="submit">Add property</button>
        </form>

        <article className="hlc-workspace-card">
          <span className="hlc-workspace-copy"><strong>Choose property</strong><span>{properties.length} property record{properties.length === 1 ? "" : "s"}</span></span>
          <select value={selectedPropertyId} onChange={(event) => { setSelectedPropertyId(event.target.value); setSelectedAssetId(""); }}>
            <option value="">Choose property</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.label}</option>)}
          </select>
          {selectedProperty && <p>{[selectedProperty.address, selectedProperty.city, selectedProperty.state, selectedProperty.zip].filter(Boolean).join(", ") || "Address not recorded"}</p>}
        </article>
      </section>

      {selectedProperty && (
        <section className="hlc-dashboard-section">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Mechanical profile</span><h2>{selectedProperty.label} systems & equipment</h2><p>Track maintenance-critical equipment and infrastructure.</p></div><Wrench size={20} aria-hidden="true" /></div>
          <form className="hlc-property-asset-form" onSubmit={addAsset}>
            <label>Category<select value={assetForm.category} onChange={(event) => setAssetForm({ ...assetForm, category: event.target.value as PropertyAssetCategory })}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Equipment / system label<input required maxLength={160} value={assetForm.label} onChange={(event) => setAssetForm({ ...assetForm, label: event.target.value })} placeholder="Main furnace, roof, water heater…" /></label>
            <label>Condition<select value={assetForm.condition} onChange={(event) => setAssetForm({ ...assetForm, condition: event.target.value as PropertyAssetCondition })}>{conditions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Manufacturer<input value={assetForm.manufacturer} onChange={(event) => setAssetForm({ ...assetForm, manufacturer: event.target.value })} /></label>
            <label>Model<input value={assetForm.modelNumber} onChange={(event) => setAssetForm({ ...assetForm, modelNumber: event.target.value })} /></label>
            <label>Serial / identifier<input value={assetForm.serialNumber} onChange={(event) => setAssetForm({ ...assetForm, serialNumber: event.target.value })} /></label>
            <label>Installed<input type="date" value={assetForm.installedOn} onChange={(event) => setAssetForm({ ...assetForm, installedOn: event.target.value })} /></label>
            <label>Warranty expires<input type="date" value={assetForm.warrantyExpiresOn} onChange={(event) => setAssetForm({ ...assetForm, warrantyExpiresOn: event.target.value })} /></label>
            <label>Last serviced<input type="date" value={assetForm.lastServicedOn} onChange={(event) => setAssetForm({ ...assetForm, lastServicedOn: event.target.value })} /></label>
            <label>Next service<input type="date" value={assetForm.nextServiceOn} onChange={(event) => setAssetForm({ ...assetForm, nextServiceOn: event.target.value })} /></label>
            <label className="hlc-form-span-all">Notes<textarea maxLength={4000} rows={3} value={assetForm.notes} onChange={(event) => setAssetForm({ ...assetForm, notes: event.target.value })} /></label>
            <button type="submit">Add equipment record</button>
          </form>

          <div className="hlc-workspace-grid" style={{ marginTop: 20 }}>
            {visibleAssets.map((asset) => <button type="button" key={asset.id} className="hlc-workspace-card hlc-property-asset-card" onClick={() => setSelectedAssetId(asset.id)} aria-pressed={selectedAssetId === asset.id}>
              <span className="hlc-workspace-copy"><strong>{asset.label}</strong><span>{categories.find((item) => item.value === asset.asset_category)?.label || asset.asset_category} · {conditions.find((item) => item.value === asset.condition)?.label || asset.condition}</span></span>
              <small>{asset.manufacturer || "Manufacturer not recorded"}{asset.model_number ? ` · ${asset.model_number}` : ""}</small>
              {asset.next_service_on && <small>Next service: {new Date(`${asset.next_service_on}T12:00:00`).toLocaleDateString()}</small>}
            </button>)}
            {!visibleAssets.length && <p>No equipment records yet.</p>}
          </div>
        </section>
      )}

      {selectedAsset && (
        <section className="hlc-dashboard-section">
          <div className="hlc-section-heading"><div><span className="hlc-section-eyebrow">Maintenance timeline</span><h2>{selectedAsset.label} service history</h2></div><Activity size={20} aria-hidden="true" /></div>
          <form className="hlc-property-service-form" onSubmit={addServiceEvent}>
            <label>Event<select value={serviceForm.eventType} onChange={(event) => setServiceForm({ ...serviceForm, eventType: event.target.value as PropertyAssetServiceType })}>{serviceTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Date<input required type="date" value={serviceForm.occurredOn} onChange={(event) => setServiceForm({ ...serviceForm, occurredOn: event.target.value })} /></label>
            <label>Provider / technician<input value={serviceForm.providerName} onChange={(event) => setServiceForm({ ...serviceForm, providerName: event.target.value })} /></label>
            <label>Cost<input type="number" min="0" step="0.01" value={serviceForm.cost} onChange={(event) => setServiceForm({ ...serviceForm, cost: event.target.value })} /></label>
            <label className="hlc-form-span-all">Notes<textarea maxLength={4000} rows={3} value={serviceForm.notes} onChange={(event) => setServiceForm({ ...serviceForm, notes: event.target.value })} /></label>
            <button type="submit">Record service event</button>
          </form>
          <div className="hlc-activity-list" style={{ marginTop: 18 }}>
            {visibleServiceEvents.map((item) => <article key={item.id} className="hlc-activity-item"><strong>{serviceTypes.find((type) => type.value === item.event_type)?.label || item.event_type}</strong><span>{new Date(`${item.occurred_on}T12:00:00`).toLocaleDateString()}{item.provider_name ? ` · ${item.provider_name}` : ""}{item.cost != null ? ` · ${new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(item.cost)}` : ""}</span>{item.notes && <p>{item.notes}</p>}</article>)}
            {!visibleServiceEvents.length && <p>No service history recorded yet.</p>}
          </div>
        </section>
      )}
    </main>
  );
}
