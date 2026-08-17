import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listContractors } from "../../api/contractors";
import { listProviderAvailability, listServiceAreas } from "../../api/ecosystemRecords";
import { errorMessage } from "../../lib/errorMessage";
import type { Contractor } from "../../lib/types/database";

type ServiceArea = { contractor_id: number; city?: string | null; state?: string | null; zip?: string | null; id: string | number };
type Availability = { contractor_id: number; available: boolean; note?: string | null };

export default function EligibilityFit() {
  const [providers, setProviders] = useState<Contractor[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([listContractors({}), listServiceAreas(), listProviderAvailability()])
      .then(([providerRows, areaRows, availabilityRows]) => {
        if (!active) return;
        setProviders(providerRows);
        setAreas(areaRows as ServiceArea[]);
        setAvailability(availabilityRows as Availability[]);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason, "Unable to load provider eligibility evidence."));
      });
    return () => { active = false; };
  }, []);

  const rows = useMemo(() => providers.map((provider) => {
    const providerAreas = areas.filter((area) => area.contractor_id === provider.id);
    const providerAvailability = availability.find((row) => row.contractor_id === provider.id);
    return { provider, providerAreas, providerAvailability };
  }), [providers, areas, availability]);

  return (
    <main className="hlc-eligibility-page" style={{ width: "min(1120px, calc(100% - 28px))", margin: "34px auto 76px" }}>
      <header className="hlc-premium-panel" style={{ padding: 28, marginBottom: 22, textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#2563eb" }}>HLC Network · Operations</p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2rem, 5vw, 4rem)" }}>Eligibility &amp; Fit</h1>
        <p style={{ margin: "0 auto", maxWidth: 760, color: "#475569" }}>
          Review factual provider coverage, availability, trade, location, and recorded status before an offer, assignment, or scheduling decision. This operational evidence is separate from the Community swipe experience.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
          <Link to="/matching" style={{ fontWeight: 800 }}>Open Community Matching</Link>
          <Link to="/providers" style={{ fontWeight: 800 }}>Provider directory</Link>
        </div>
      </header>

      {error && <p role="alert" style={{ padding: 14, borderRadius: 14, background: "#fff1f2", color: "#9f1239" }}>{error}</p>}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
        {rows.map(({ provider, providerAreas, providerAvailability }) => {
          const name = provider.company_name || provider.contact_name || `Provider ${provider.id}`;
          const place = [provider.city, provider.state, provider.zip].filter(Boolean).join(", ");
          return (
            <article key={provider.id} className="hlc-premium-panel" style={{ padding: 20 }}>
              <p style={{ margin: "0 0 5px", color: "#2563eb", fontWeight: 900, fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".08em" }}>{provider.specialty || "Trade not recorded"}</p>
              <h2 style={{ margin: "0 0 8px" }}><Link to={`/providers/${provider.id}`}>{name}</Link></h2>
              <p style={{ margin: "0 0 8px" }}>{place || "Location not recorded"}</p>
              <p style={{ margin: "0 0 10px" }}><strong>Availability:</strong> {providerAvailability ? (providerAvailability.available ? "Available" : "Unavailable") : "Not declared"}</p>
              <p style={{ margin: "0 0 10px" }}><strong>Provider status:</strong> {provider.status || "Not recorded"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {providerAreas.length ? providerAreas.slice(0, 4).map((area) => (
                  <span key={area.id} className="hlc-status-pill">{[area.city, area.state, area.zip].filter(Boolean).join(" · ") || "Service area recorded"}</span>
                )) : <span className="hlc-status-pill">No service area recorded</span>}
              </div>
            </article>
          );
        })}
        {!rows.length && !error && <div className="hlc-premium-empty"><h2>No provider fit evidence yet.</h2><p>Provider records will appear here when the HLC Network contains eligible provider data.</p></div>}
      </section>

      <section className="hlc-premium-callout" style={{ marginTop: 24, padding: 22 }}>
        <h2 style={{ marginTop: 0 }}>Fit evidence is not an assignment.</h2>
        <p style={{ marginBottom: 0 }}>A provider appearing here does not mean HLC selected, assigned, scheduled, endorsed, or guaranteed that provider. Offers, assignments, scheduling, pricing, and completion remain separate recorded workflow steps.</p>
      </section>
    </main>
  );
}
