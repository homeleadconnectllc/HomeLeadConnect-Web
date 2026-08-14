import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { listContractors, setProviderMapCoordinates } from "../../api/contractors";
import { useAuth } from "../../hooks/useAuth";
import { normalizeInternalRole } from "../../lib/accessPolicy";
import { errorMessage } from "../../lib/errorMessage";
import { supabase } from "../../lib/supabase";
import type { Contractor } from "../../lib/types/database";

type Point = { provider: Contractor; x: number; y: number };

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
    void supabase.from("profiles").select("role").eq("user_id", session.user.id).maybeSingle()
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
      return [provider.company_name, provider.contact_name, provider.specialty, provider.city, provider.state, provider.zip]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [providers, query, mappedOnly]);

  const mappedProviders = useMemo(() => filtered.filter(hasCoordinates), [filtered]);
  const points = useMemo(() => projectPoints(mappedProviders), [mappedProviders]);
  const selected = providers.find((provider) => provider.id === selectedId) ?? null;
  const canManageCoordinates = role === "owner" || role === "manager";

  async function saveCoordinates(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const lat = Number(latitude);
    const lng = Number(longitude);
    setBusy(true); setError(""); setMessage("");
    try {
      await setProviderMapCoordinates(selected.id, lat, lng);
      await reloadProviders(selected.id);
      setMessage("Provider map coordinates saved through the management-only HLC control.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save provider map coordinates."));
    } finally {
      setBusy(false);
    }
  }

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>HLC Network · canonical provider locations</p>
      <h1 style={{ margin: 0 }}>Provider map</h1>
      <p style={{ marginBottom: 0 }}>Pins use only coordinates explicitly stored in HLC. This map does not calculate nearest providers, ETA, routing, dispatch, or live location.</p>
    </header>

    <nav style={navStyle} aria-label="Provider network">
      <Link to="/network">Network</Link>
      <Link to="/providers">Directory</Link>
      <Link to="/map" aria-current="page">Map</Link>
      <Link to="/network/service-areas">Service areas</Link>
      <Link to="/network/availability">Availability</Link>
      <Link to="/network/saved">Saved providers</Link>
    </nav>

    <section style={filterStyle} aria-label="Map filters">
      <label style={fieldStyle}>Search providers, trades, or locations
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Painter, Harrisburg, 17101…" />
      </label>
      <label style={checkboxStyle}><input type="checkbox" checked={mappedOnly} onChange={(event) => setMappedOnly(event.target.checked)} /> Mapped locations only</label>
    </section>

    {loading && <p role="status">Loading provider map…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {message && <p role="status" style={successStyle}>{message}</p>}

    {!loading && <div style={layoutStyle}>
      <section style={mapPanelStyle} aria-label="Provider coordinate map">
        <div style={mapHeaderStyle}>
          <div><strong>{mappedProviders.length}</strong> mapped provider{mappedProviders.length === 1 ? "" : "s"}</div>
          <div>{filtered.length - mappedProviders.length} unmapped</div>
        </div>
        <div style={mapCanvasStyle}>
          <div aria-hidden="true" style={gridOverlayStyle} />
          {points.map(({ provider, x, y }) => <button
            key={provider.id}
            type="button"
            aria-label={`Select ${providerName(provider)} on map`}
            aria-pressed={selectedId === provider.id}
            title={`${providerName(provider)} · ${place(provider) || "location recorded by coordinates"}`}
            onClick={() => selectProvider(provider)}
            style={{ ...pinStyle, left: `${x}%`, top: `${y}%`, ...(selectedId === provider.id ? selectedPinStyle : {}) }}
          >
            <span aria-hidden="true">●</span>
          </button>)}
          {mappedProviders.length === 0 && <div style={emptyMapStyle}>
            <strong>No canonical map coordinates yet.</strong>
            <span>Provider cards remain available below. Owner/manager users can add verified coordinates without inventing a location.</span>
          </div>}
        </div>
        <p style={mapNoteStyle}>The canvas normalizes only the mapped providers currently in this filtered view. It is a record-location view, not a distance or routing engine.</p>
      </section>

      <section style={listPanelStyle} aria-label="Provider map list">
        <h2 style={{ marginTop: 0 }}>Providers</h2>
        <div style={providerListStyle}>
          {filtered.map((provider) => <button
            type="button"
            key={provider.id}
            onClick={() => selectProvider(provider)}
            aria-pressed={selectedId === provider.id}
            style={{ ...providerButtonStyle, ...(selectedId === provider.id ? selectedProviderStyle : {}) }}
          >
            <strong>{providerName(provider)}</strong>
            <span>{provider.specialty || "Trade not recorded"}</span>
            <span>{place(provider) || "Location not recorded"}</span>
            <small>{hasCoordinates(provider) ? "Mapped" : "Location not mapped yet"}</small>
          </button>)}
          {filtered.length === 0 && <p>No authorized provider records match these filters.</p>}
        </div>
      </section>
    </div>}

    {selected && <section style={detailStyle} aria-label="Selected provider map details">
      <div>
        <p style={eyebrowStyle}>Selected provider</p>
        <h2 style={{ margin: "4px 0 8px" }}>{providerName(selected)}</h2>
        <p>{selected.specialty || "Trade not recorded"} · {place(selected) || "Location not recorded"}</p>
        <div style={navStyle}>
          <Link to={`/providers/${selected.id}`}>Open provider record</Link>
          {hasCoordinates(selected) && <a target="_blank" rel="noreferrer" href={osmPageUrl(selected.latitude, selected.longitude)}>Open in OpenStreetMap</a>}
        </div>
      </div>

      {hasCoordinates(selected) ? <iframe
        title={`OpenStreetMap preview for ${providerName(selected)}`}
        src={osmEmbedUrl(selected.latitude, selected.longitude)}
        loading="lazy"
        referrerPolicy="no-referrer"
        style={iframeStyle}
      /> : <div style={unmappedPreviewStyle}><strong>Map preview unavailable</strong><span>This provider has no stored HLC coordinates.</span></div>}

      {canManageCoordinates && <form onSubmit={saveCoordinates} style={coordinateFormStyle}>
        <div><strong>Management map coordinates</strong><p style={{ margin: "4px 0 0", color: "#64748b" }}>Enter coordinates only from a verified provider/business location source. HLC does not geocode or infer them automatically.</p></div>
        <label style={fieldStyle}>Latitude<input type="number" step="any" min={-90} max={90} required value={latitude} onChange={(event) => setLatitude(event.target.value)} /></label>
        <label style={fieldStyle}>Longitude<input type="number" step="any" min={-180} max={180} required value={longitude} onChange={(event) => setLongitude(event.target.value)} /></label>
        <button type="submit" disabled={busy || !latitude || !longitude} style={primaryButtonStyle}>{busy ? "Saving location…" : "Save map location"}</button>
      </form>}
    </section>}
  </main>;
}

function hasCoordinates(provider: Contractor): provider is Contractor & { latitude: number; longitude: number } {
  return Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude);
}

function providerName(provider: Contractor) {
  return provider.company_name || provider.contact_name || `Provider ${provider.id}`;
}

function place(provider: Contractor) {
  return [provider.city, provider.state, provider.zip].filter(Boolean).join(", ");
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

function osmPageUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=14/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}`;
}

function osmEmbedUrl(lat: number, lng: number) {
  const delta = 0.035;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}

const pageStyle = { width: "min(1180px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 20 };
const heroStyle = { padding: "clamp(22px, 5vw, 40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#071827,#123a4a 58%,#164e63)" };
const eyebrowStyle = { margin: 0, color: "#0891b2", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".05em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14, alignItems: "center" };
const filterStyle = { display: "flex", gap: 16, flexWrap: "wrap" as const, alignItems: "end", padding: 16, border: "1px solid #cbd5e1", borderRadius: 14, background: "#fff" };
const fieldStyle = { display: "grid", gap: 6, minWidth: 220, fontWeight: 700 };
const checkboxStyle = { minHeight: 44, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, .8fr)", gap: 18 };
const mapPanelStyle = { minWidth: 0, border: "1px solid #cbd5e1", borderRadius: 18, background: "#fff", overflow: "hidden" };
const mapHeaderStyle = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderBottom: "1px solid #e2e8f0", color: "#334155" };
const mapCanvasStyle = { minHeight: 430, position: "relative" as const, overflow: "hidden", background: "linear-gradient(180deg,#e0f2fe,#f8fafc 46%,#dcfce7)" };
const gridOverlayStyle = { position: "absolute" as const, inset: 0, opacity: .3, backgroundImage: "linear-gradient(#64748b 1px,transparent 1px),linear-gradient(90deg,#64748b 1px,transparent 1px)", backgroundSize: "10% 10%" };
const pinStyle = { position: "absolute" as const, zIndex: 2, width: 34, height: 34, transform: "translate(-50%,-50%)", borderRadius: 999, border: "3px solid #fff", background: "#0f766e", color: "#fff", boxShadow: "0 4px 14px rgba(15,23,42,.32)", cursor: "pointer", fontSize: 18 };
const selectedPinStyle = { width: 42, height: 42, background: "#0f172a", outline: "3px solid #22d3ee" };
const emptyMapStyle = { position: "absolute" as const, inset: 24, display: "grid", placeContent: "center", gap: 8, textAlign: "center" as const, color: "#334155" };
const mapNoteStyle = { margin: 0, padding: "12px 16px", color: "#64748b", borderTop: "1px solid #e2e8f0", fontSize: 14 };
const listPanelStyle = { border: "1px solid #cbd5e1", borderRadius: 18, padding: 16, background: "#fff", minWidth: 0 };
const providerListStyle = { display: "grid", gap: 10, maxHeight: 520, overflowY: "auto" as const };
const providerButtonStyle = { minHeight: 44, display: "grid", gap: 3, textAlign: "left" as const, padding: 12, border: "1px solid #cbd5e1", borderRadius: 12, background: "#fff", color: "#0f172a", cursor: "pointer" };
const selectedProviderStyle = { borderColor: "#0891b2", boxShadow: "0 0 0 2px rgba(8,145,178,.18)", background: "#ecfeff" };
const detailStyle = { display: "grid", gap: 18, padding: 20, border: "1px solid #cbd5e1", borderRadius: 18, background: "#fff" };
const iframeStyle = { width: "100%", minHeight: 320, border: "1px solid #cbd5e1", borderRadius: 14 };
const unmappedPreviewStyle = { minHeight: 180, display: "grid", placeContent: "center", gap: 6, textAlign: "center" as const, border: "1px dashed #94a3b8", borderRadius: 14, background: "#f8fafc", color: "#475569" };
const coordinateFormStyle = { display: "flex", gap: 14, flexWrap: "wrap" as const, alignItems: "end", paddingTop: 16, borderTop: "1px solid #e2e8f0" };
const primaryButtonStyle = { minHeight: 44, padding: "10px 16px", border: "1px solid #0f172a", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 800 };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12, background: "#fff1f2" };
const successStyle = { color: "#166534", padding: 14, border: "1px solid #bbf7d0", borderRadius: 12, background: "#f0fdf4" };
