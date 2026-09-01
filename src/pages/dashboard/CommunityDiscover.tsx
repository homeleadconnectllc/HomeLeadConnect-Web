import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listContractors } from "../../api/contractors";
import { listProviderAvailability, listSavedProviderIds, listServiceAreas, setProviderSaved } from "../../api/ecosystemRecords";
import { errorMessage } from "../../lib/errorMessage";
import type { Contractor } from "../../lib/types/database";

type Area = { id: string | number; contractor_id: number; city?: string | null; state?: string | null; zip?: string | null };
type Availability = { contractor_id: number; available: boolean };

function displayName(provider: Contractor) {
  return provider.company_name || provider.contact_name || `Provider ${provider.id}`;
}

function initials(provider: Contractor) {
  return displayName(provider).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "HLC";
}

export default function CommunityDiscover() {
  const [providers, setProviders] = useState<Contractor[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([listContractors({}), listServiceAreas(), listProviderAvailability(), listSavedProviderIds()])
      .then(([providerRows, areaRows, availabilityRows, savedIds]) => {
        if (!active) return;
        setProviders(providerRows);
        setAreas(areaRows as Area[]);
        setAvailability(availabilityRows as Availability[]);
        setSaved(savedIds);
      })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to load Community discovery.")); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return providers;
    return providers.filter((provider) => [provider.company_name, provider.contact_name, provider.specialty, provider.city, provider.state]
      .filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [providers, query]);

  async function toggleSaved(providerId: number) {
    const nextSaved = !saved.has(providerId);
    setBusyId(providerId);
    setError("");
    try {
      await setProviderSaved(providerId, nextSaved);
      setSaved((previous) => {
        const next = new Set(previous);
        if (nextSaved) next.add(providerId); else next.delete(providerId);
        return next;
      });
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update saved providers."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="hlc-community-workspace" style={{ width: "min(1180px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · DISCOVER</p>
          <h1>Find people worth knowing.</h1>
          <p>Browse recorded HLC provider profiles by trade and service area. Discovery can lead to a saved profile or Community connection later; it never assigns real work.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community discovery navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/community/swipe">Swipe Match</Link>
        <Link to="/network/map">Map</Link>
        <Link to="/network/saved">Saved</Link>
      </nav>

      <section className="hlc-premium-panel" style={{ padding: 18, marginTop: 18 }}>
        <label htmlFor="community-discover-search" style={{ display: "grid", gap: 8, fontWeight: 800 }}>
          Search Community providers
          <input id="community-discover-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Trade, business, city, or state" style={{ minHeight: 48 }} />
        </label>
      </section>

      {error && <p role="alert" className="hlc-match-alert">{error}</p>}

      <section aria-label="Community provider results" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 270px), 1fr))", gap: 16, marginTop: 18 }}>
        {visible.map((provider) => {
          const providerAreas = areas.filter((area) => area.contractor_id === provider.id);
          const available = availability.find((row) => row.contractor_id === provider.id);
          const isSaved = saved.has(provider.id);
          return (
            <article key={provider.id} className="hlc-premium-panel" style={{ overflow: "hidden" }}>
              <div aria-hidden="true" style={{ minHeight: 150, display: "grid", placeItems: "center", background: "linear-gradient(145deg, #0a1d35, #164e7a)", color: "white", fontSize: "2.4rem", fontWeight: 900 }}>{initials(provider)}</div>
              <div style={{ padding: 18 }}>
                <p style={{ margin: "0 0 5px", color: "#2563eb", fontWeight: 900 }}>{provider.specialty || "HLC Network provider"}</p>
                <h2 style={{ margin: "0 0 8px" }}>{displayName(provider)}</h2>
                <p style={{ margin: "0 0 8px" }}>{[provider.city, provider.state].filter(Boolean).join(", ") || "Service area available on profile"}</p>
                <p style={{ margin: "0 0 12px" }}><strong>Availability:</strong> {available ? (available.available ? "Available" : "Unavailable") : "Not posted"}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                  {providerAreas.slice(0, 3).map((area) => <span className="hlc-status-pill" key={area.id}>{[area.city, area.state, area.zip].filter(Boolean).join(" · ") || "Service area"}</span>)}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <Link to={`/providers/${provider.id}`} style={{ fontWeight: 900 }}>View profile</Link>
                  <button type="button" onClick={() => void toggleSaved(provider.id)} disabled={busyId === provider.id} style={{ minHeight: 44 }}>
                    {busyId === provider.id ? "Saving…" : isSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!visible.length && !error && <div className="hlc-premium-empty"><h2>No matching Community providers.</h2><p>Try a broader trade or location search.</p></div>}
      </section>

      <section className="hlc-premium-callout" style={{ marginTop: 22, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Connection requests are a separate step.</h2>
        <p style={{ marginBottom: 0 }}>This Discover foundation intentionally does not open private messages or assign work. Those actions require the Community relationship and entitlement layers defined by the locked HLC architecture.</p>
      </section>
    </main>
  );
}
