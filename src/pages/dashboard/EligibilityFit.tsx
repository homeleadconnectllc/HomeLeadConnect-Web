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
    <main className="hlc-eligibility-page hlc-ui-eligibility-fit-e0b965" >
      <header className="hlc-premium-panel hlc-ui-eligibility-fit-8185c2" >
        <p className="hlc-ui-eligibility-fit-65e965">HLC Work · Operational Matching</p>
        <h1 className="hlc-ui-eligibility-fit-a2c5d9">Eligibility &amp; Fit</h1>
        <p className="hlc-ui-eligibility-fit-ef9443">
          Review factual provider coverage, availability, trade, location, and recorded status before an offer, assignment, or scheduling decision. This operational evidence is separate from the Community swipe experience.
        </p>
        <div className="hlc-ui-eligibility-fit-ad6fec">
          <Link to="/work" className="hlc-ui-font-weight-cde913">Back to Work</Link>
          <Link to="/community/swipe" className="hlc-ui-font-weight-cde913">Open Community Swipe</Link>
          <Link to="/providers" className="hlc-ui-font-weight-cde913">Provider directory</Link>
        </div>
      </header>

      {error && <p role="alert" className="hlc-ui-eligibility-fit-767813">{error}</p>}

      <section className="hlc-ui-eligibility-fit-d63d21">
        {rows.map(({ provider, providerAreas, providerAvailability }) => {
          const name = provider.company_name || provider.contact_name || `Provider ${provider.id}`;
          const place = [provider.city, provider.state, provider.zip].filter(Boolean).join(", ");
          return (
            <article key={provider.id} className="hlc-premium-panel hlc-ui-padding-46e678" >
              <p className="hlc-ui-eligibility-fit-a755ce">{provider.specialty || "Trade not recorded"}</p>
              <h2 className="hlc-ui-margin-3e47b1"><Link to={`/providers/${provider.id}`}>{name}</Link></h2>
              <p className="hlc-ui-margin-3e47b1">{place || "Location not recorded"}</p>
              <p className="hlc-ui-margin-536fa5"><strong>Availability:</strong> {providerAvailability ? (providerAvailability.available ? "Available" : "Unavailable") : "Not declared"}</p>
              <p className="hlc-ui-margin-536fa5"><strong>Provider status:</strong> {provider.status || "Not recorded"}</p>
              <div className="hlc-ui-eligibility-fit-e71fea">
                {providerAreas.length ? providerAreas.slice(0, 4).map((area) => (
                  <span key={area.id} className="hlc-status-pill">{[area.city, area.state, area.zip].filter(Boolean).join(" · ") || "Service area recorded"}</span>
                )) : <span className="hlc-status-pill">No service area recorded</span>}
              </div>
            </article>
          );
        })}
        {!rows.length && !error && <div className="hlc-premium-empty"><h2>No provider fit evidence yet.</h2><p>Provider records will appear here when the HLC Network contains eligible provider data.</p></div>}
      </section>

      <section className="hlc-premium-callout hlc-ui-eligibility-fit-5fb1c4" >
        <h2 className="hlc-ui-margin-top-a0925a">Fit evidence is not an assignment.</h2>
        <p className="hlc-ui-margin-bottom-fa769a">A provider appearing here does not mean HLC selected, assigned, scheduled, endorsed, or guaranteed that provider. Offers, assignments, scheduling, pricing, and completion remain separate recorded workflow steps.</p>
      </section>
    </main>
  );
}
