import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { listContractors, setProviderMapCoordinates } from "../../api/contractors";
import { useAuth } from "../../hooks/useAuth";
import { normalizeInternalRole } from "../../lib/accessPolicy";
import { errorMessage } from "../../lib/errorMessage";
import { supabase } from "../../lib/supabase";
import type { Contractor } from "../../lib/types/database";

type Point = { provider: Contractor; x: number; y: number };

const RECORD_ACCENTS = ["#38BDF8", "#2DD4BF", "#FBBF24", "#FB923C", "#60A5FA", "#34D399", "#A78BFA"];
const verifiedPinStyle: CSSProperties = {};
const approximatePinStyle: CSSProperties = {};
const selectedPinStyle = {
  zIndex: 4,
  transform: "translate(-50%,-50%) scale(1.14)",
  outline: "2px solid rgba(255,255,255,.9)",
  outlineOffset: 3,
  boxShadow: "0 0 0 5px rgba(255,255,255,.08), 0 10px 26px rgba(0,0,0,.42)",
};

export default function ProviderMap() {
  const { session } = useAuth();
  const [providers, setProviders] = useState<Contractor[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [mappedOnly, setMappedOnly] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function selectProvider(provider: Contractor | null) {
    setSelectedId(provider?.id ?? null);
    setLatitude(provider?.latitude == null ? "" : String(provider.latitude));
    setLongitude(provider?.longitude == null ? "" : String(provider.longitude));
  }

  async function reloadProviders(preferredId?: number | null) {
    const rows = await listContractors({});
    setProviders(rows);
    const preferred = rows.find((provider) => provider.id === preferredId) ?? rows[0] ?? null;
    selectProvider(preferred);
  }

  useEffect(() => {
    let active = true;
    void listContractors({})
      .then((rows) => {
        if (!active) return;
        setProviders(rows);
        const first = rows[0] ?? null;
        setSelectedId(first?.id ?? null);
        setLatitude(first?.latitude == null ? "" : String(first.latitude));
        setLongitude(first?.longitude == null ? "" : String(first.longitude));
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load the provider map.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const roleRequest = supabase.from("profiles").select("role").eq("user_id", session.user.id).maybeSingle();
    void Promise.resolve(roleRequest)
      .then(({ data, error: profileError }) => {
        if (!active) return;
        if (profileError) throw profileError;
        setRole(normalizeInternalRole(data?.role));
      })
      .catch(() => { if (active) setRole(null); });
    return () => { active = false; };
  }, [session]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return providers.filter((provider) => {
      const mapped = hasCoordinates(provider);
      if (mappedOnly && !mapped) return false;
      if (!needle) return true;
      return [provider.company_name, provider.contact_name, provider.specialty, provider.address, provider.city, provider.state, provider.zip]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [providers, query, mappedOnly]);

  const mappedProviders = useMemo(() => filtered.filter(hasCoordinates), [filtered]);
  const verifiedCount = mappedProviders.filter((provider) => provider.coordinate_accuracy === "verified").length;
  const approximateCount = mappedProviders.filter((provider) => provider.coordinate_accuracy === "approximate").length;
  const points = useMemo(() => projectPoints(mappedProviders), [mappedProviders]);
  const selected = providers.find((provider) => provider.id === selectedId) ?? null;
  const canManageCoordinates = role === "owner" || role === "manager";

  async function saveCoordinates(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const lat = Number(latitude);
    const lng = Number(longitude);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await setProviderMapCoordinates(selected.id, lat, lng);
      await reloadProviders(selected.id);
      setMessage("Verified map point saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save the verified map point."));
    } finally {
      setBusy(false);
    }
  }

  return <main className="hlc-network-map-workspace">
    <header className="hlc-network-map-header">
      <div>
        <p className="hlc-network-map-kicker">NETWORK INTELLIGENCE</p>
        <h1>Provider Map</h1>
        <p>Find providers by company, trade, city, state, ZIP, or recorded business address. Exact map points are shown only when HLC has a verified location.</p>
      </div>
      <div className="hlc-network-map-summary" aria-label="Provider map summary">
        <span><strong>{filtered.length}</strong><small>Visible providers</small></span>
        <span><strong>{mappedProviders.length}</strong><small>Mapped</small></span>
        <span><strong>{verifiedCount}</strong><small>Verified</small></span>
        <span><strong>{approximateCount}</strong><small>Approximate</small></span>
      </div>
    </header>

    <nav className="hlc-network-route-rail" aria-label="Provider network">
      <Link to="/network">Network</Link>
      <Link to="/providers">Directory</Link>
      <Link to="/map" aria-current="page">Map</Link>
      <Link to="/network/service-areas">Service areas</Link>
      <Link to="/network/availability">Availability</Link>
      <Link to="/network/saved">Saved providers</Link>
    </nav>

    <section className="hlc-network-map-filterbar" aria-label="Map filters">
      <label>Search provider, trade, city, state, ZIP, or address
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="HVAC, mover, cleaner, Harrisburg, 17101…" />
      </label>
      <label className="hlc-network-map-toggle"><input type="checkbox" checked={mappedOnly} onChange={(event) => setMappedOnly(event.target.checked)} /> Mapped locations only</label>
    </section>

    {loading && <p className="hlc-network-map-state" role="status">Loading provider map…</p>}
    {error && <p className="hlc-network-map-state is-error" role="alert">{error}</p>}
    {message && <p className="hlc-network-map-state is-success" role="status">{message}</p>}

    {!loading && <div className="hlc-network-map-console">
      <section className="hlc-network-map-canvas-panel" aria-label="Provider coordinate map">
        <div className="hlc-network-map-canvas-head">
          <div><strong>{mappedProviders.length}</strong> mapped · {verifiedCount} verified · {approximateCount} approximate</div>
          <div>{filtered.length - mappedProviders.length} unmapped</div>
        </div>
        <div className="hlc-network-map-canvas">
          <div aria-hidden="true" className="hlc-network-map-grid" />
          {points.map(({ provider, x, y }) => {
            const accent = providerAccent(provider);
            const selectedPin = selectedId === provider.id;
            const accuracyClass = provider.coordinate_accuracy === "approximate" ? "is-approximate" : "is-verified";
            const confidenceStyle = provider.coordinate_accuracy === "approximate" ? approximatePinStyle : verifiedPinStyle;
            const style = { ...confidenceStyle, ...(selectedPin ? selectedPinStyle : {}), "--record-accent": accent, left: `${x}%`, top: `${y}%` } as CSSProperties;
            return <button
              key={provider.id}
              type="button"
              aria-label={`Select ${providerName(provider)} on map, ${coordinateLabel(provider)}`}
              aria-pressed={selectedPin}
              title={`${providerName(provider)} · ${coordinateLabel(provider)} · ${place(provider) || "location recorded by coordinates"}`}
              onClick={() => selectProvider(provider)}
              className={`hlc-network-map-pin ${accuracyClass} ${selectedPin ? "is-selected" : ""}`}
              style={style}
            ><span className="hlc-network-map-pin-core" aria-hidden="true">{providerInitials(provider)}</span></button>;
          })}
          {mappedProviders.length === 0 && <div className="hlc-network-map-empty">
            <strong>No mapped providers yet.</strong>
            <span>Select a provider from the list. Use its recorded address first; exact coordinates are an advanced management-only verification step.</span>
          </div>}
        </div>
        <p className="hlc-network-map-legend"><strong>Solid</strong> = verified exact location. <strong>Dashed</strong> = approximate city/ZIP area. Colors identify providers/trades only.</p>
      </section>

      <aside className="hlc-network-provider-queue" aria-label="Provider map list">
        <div className="hlc-network-section-head"><div><span>RECORD QUEUE</span><h2>Providers</h2></div><strong>{filtered.length}</strong></div>
        <div className="hlc-network-provider-list">
          {filtered.map((provider) => {
            const style = { "--record-accent": providerAccent(provider) } as CSSProperties;
            return <button
              type="button"
              key={provider.id}
              onClick={() => selectProvider(provider)}
              aria-pressed={selectedId === provider.id}
              className={`hlc-network-provider-row ${selectedId === provider.id ? "is-selected" : ""}`}
              style={style}
            >
              <span><strong>{providerName(provider)}</strong><small>{provider.specialty || "Trade not recorded"}</small></span>
              <span><strong>{providerAddress(provider) || "Location not recorded"}</strong><small>{hasCoordinates(provider) ? coordinateLabel(provider) : "Exact map point not verified"}</small></span>
            </button>;
          })}
          {filtered.length === 0 && <p className="hlc-network-map-empty-copy">No authorized provider records match these filters.</p>}
        </div>
      </aside>
    </div>}

    {selected && <section className="hlc-network-map-inspector" aria-label="Selected provider map details">
      <div className="hlc-network-map-inspector-copy">
        <p className="hlc-network-map-kicker">SELECTED PROVIDER</p>
        <h2>{providerName(selected)}</h2>
        <p>{selected.specialty || "Trade not recorded"}</p>
        <p><strong>Recorded location:</strong> {providerAddress(selected) || "No address recorded yet"}</p>
        {hasCoordinates(selected) && <p className="hlc-network-map-accuracy"><strong>{coordinateLabel(selected)}.</strong> {coordinateDescription(selected)}</p>}
        <div className="hlc-network-map-actions">
          <Link to={`/providers/${selected.id}`}>Open provider record</Link>
          {providerAddress(selected) && <a target="_blank" rel="noreferrer" href={osmSearchUrl(selected)}>Open recorded address in map</a>}
          {hasCoordinates(selected) && <a target="_blank" rel="noreferrer" href={osmPageUrl(selected.latitude, selected.longitude)}>Open exact saved map point</a>}
        </div>
      </div>

      {hasCoordinates(selected) ? <iframe
        title={`${coordinateLabel(selected)} OpenStreetMap preview for ${providerName(selected)}`}
        src={osmEmbedUrl(selected.latitude, selected.longitude)}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="hlc-network-map-preview"
      /> : <div className="hlc-network-map-unmapped"><strong>No verified map point yet</strong><span>Use the provider's recorded address first. Exact coordinates are optional advanced verification.</span></div>}

      {canManageCoordinates && <details className="hlc-network-coordinate-advanced">
        <summary>Advanced: verify exact map point</summary>
        <form onSubmit={saveCoordinates} className="hlc-network-coordinate-form">
          <div><strong>Exact coordinates</strong><p>Only use this when a trustworthy source gives the exact point. Normal location work should use the provider address above.</p></div>
          <label>Latitude<input type="number" step="any" min={-90} max={90} required value={latitude} onChange={(event) => setLatitude(event.target.value)} /></label>
          <label>Longitude<input type="number" step="any" min={-180} max={180} required value={longitude} onChange={(event) => setLongitude(event.target.value)} /></label>
          <button type="submit" disabled={busy || !latitude || !longitude}>{busy ? "Saving location…" : "Save verified exact point"}</button>
        </form>
      </details>}
    </section>}
  </main>;
}

function hasCoordinates(provider: Contractor): provider is Contractor & { latitude: number; longitude: number } {
  return Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude);
}

function providerName(provider: Contractor) {
  return provider.company_name || provider.contact_name || `Provider ${provider.id}`;
}

function providerInitials(provider: Contractor) {
  const words = providerName(provider).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "P";
  return `${words[0]?.charAt(0) || ""}${words[1]?.charAt(0) || ""}`.toUpperCase();
}

function providerAccent(provider: Contractor) {
  const specialty = String(provider.specialty || "").toLowerCase();
  if (/(plumb|water)/.test(specialty)) return "#38BDF8";
  if (/(hvac|heating|cooling|climate)/.test(specialty)) return "#2DD4BF";
  if (/(electric)/.test(specialty)) return "#FBBF24";
  if (/(roof|exterior|siding|gutter)/.test(specialty)) return "#FB923C";
  if (/(paint|finish|drywall)/.test(specialty)) return "#60A5FA";
  if (/(clean|janitor|maid)/.test(specialty)) return "#34D399";
  if (/(move|moving|mover)/.test(specialty)) return "#A78BFA";
  if (/(handyman|repair|maintenance)/.test(specialty)) return "#60A5FA";
  if (/(landscape|lawn|yard)/.test(specialty)) return "#34D399";
  const key = `${provider.id}:${provider.company_name || ""}:${provider.contact_name || ""}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
  return RECORD_ACCENTS[Math.abs(hash) % RECORD_ACCENTS.length];
}

function place(provider: Contractor) {
  return [provider.city, provider.state, provider.zip].filter(Boolean).join(", ");
}

function providerAddress(provider: Contractor) {
  return [provider.address, provider.city, provider.state, provider.zip].filter(Boolean).join(", ");
}

function coordinateLabel(provider: Contractor) {
  if (provider.coordinate_accuracy === "verified") return "Verified map location";
  if (provider.coordinate_accuracy === "approximate") return "Approximate area";
  return "Stored map location";
}

function coordinateDescription(provider: Contractor) {
  if (provider.coordinate_accuracy === "verified") return "HLC records this point as an owner/manager-verified exact location.";
  if (provider.coordinate_accuracy === "approximate") return "This point represents a city or ZIP area, not a live provider location.";
  return "HLC has stored coordinates, but no confidence classification is available for this older record.";
}

function projectPoints(providers: Array<Contractor & { latitude: number; longitude: number }>): Point[] {
  if (providers.length === 0) return [];
  if (providers.length === 1) return [{ provider: providers[0], x: 50, y: 50 }];
  const lats = providers.map((provider) => provider.latitude);
  const lngs = providers.map((provider) => provider.longitude);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lngSpan = Math.max(maxLng - minLng, 0.01);
  return providers.map((provider) => ({
    provider,
    x: 7 + ((provider.longitude - minLng) / lngSpan) * 86,
    y: 93 - ((provider.latitude - minLat) / latSpan) * 86,
  }));
}

function osmSearchUrl(provider: Contractor) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(providerAddress(provider))}`;
}

function osmPageUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=14/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}`;
}

function osmEmbedUrl(lat: number, lng: number) {
  const delta = 0.035;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}
