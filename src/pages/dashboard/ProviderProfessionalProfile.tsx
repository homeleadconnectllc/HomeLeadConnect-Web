import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContractor } from "../../api/contractors";
import { listProviderAvailability, listServiceAreas, type ProviderAvailability, type ServiceArea } from "../../api/ecosystemRecords";
import { listProviderServices, type ProviderService } from "../../api/ecosystemExtra";
import type { Contractor } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

function text(value: unknown) { return String(value ?? "").trim(); }
function displayName(provider: Contractor) { return text(provider.contact_name) || text(provider.company_name) || `Provider ${provider.id}`; }
function initials(provider: Contractor) {
  const words = displayName(provider).split(/\s+/).filter(Boolean).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase()).join("") || "HLC";
}

export default function ProviderProfessionalProfile() {
  const { providerId } = useParams();
  const id = Number(providerId);
  const [provider, setProvider] = useState<Contractor | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [availability, setAvailability] = useState<ProviderAvailability | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) { setError("Provider profile is unavailable."); return; }
    Promise.all([getContractor(id), listProviderServices(), listServiceAreas(), listProviderAvailability()])
      .then(([providerRow, serviceRows, areaRows, availabilityRows]) => {
        setProvider(providerRow);
        setServices(serviceRows.filter((row) => Number(row.contractor_id) === id));
        setAreas(areaRows.filter((row) => Number(row.contractor_id) === id));
        setAvailability(availabilityRows.find((row) => Number(row.contractor_id) === id) ?? null);
      })
      .catch((reason) => setError(errorMessage(reason, "Provider profile could not be loaded.")));
  }, [id]);

  const location = useMemo(() => provider ? [provider.city, provider.state, provider.zip].filter(Boolean).join(", ") : "", [provider]);

  if (error) return <main className="hlc-provider-profile-page"><p role="alert" className="hlc-provider-profile-error">{error}</p><Link to="/providers">Back to providers</Link></main>;
  if (!provider) return <main className="hlc-provider-profile-page"><p role="status">Loading professional profile…</p></main>;

  return <main className="hlc-provider-profile-page">
    <nav className="hlc-provider-profile-back"><Link to="/providers">← Provider network</Link></nav>
    <header className="hlc-provider-profile-hero">
      <div className="hlc-provider-profile-avatar" aria-label={`${displayName(provider)} profile photo not added`}><span>{initials(provider)}</span></div>
      <div className="hlc-provider-profile-identity">
        <p className="hlc-provider-profile-kicker">PROFESSIONAL PROFILE</p>
        <h1>{displayName(provider)}</h1>
        {provider.company_name && provider.contact_name && <p className="hlc-provider-profile-company">{provider.company_name}</p>}
        <p className="hlc-provider-profile-occupation">{provider.specialty || "Occupation / trade not recorded"}</p>
        <p>{location || "Service location not recorded"}</p>
      </div>
      <div className="hlc-provider-profile-status">
        <strong>{availability ? (availability.available ? "Available" : "Unavailable") : "Availability not declared"}</strong>
        <span>{provider.status || "Provider status not recorded"}</span>
      </div>
    </header>

    <section className="hlc-provider-profile-grid" aria-label="Professional profile details">
      <article className="hlc-provider-profile-section">
        <h2>About</h2>
        <p>This profile represents the professional identity attached to this HLC provider record. A personal bio has not been added yet.</p>
        <dl>
          <div><dt>Occupation / trade</dt><dd>{provider.specialty || "Not recorded"}</dd></div>
          <div><dt>License</dt><dd>{provider.license_number || "Not recorded"}</dd></div>
          <div><dt>Insurance verification</dt><dd>Not recorded in this provider profile</dd></div>
          <div><dt>Profile photo</dt><dd>Not added</dd></div>
        </dl>
      </article>

      <article className="hlc-provider-profile-section">
        <h2>Skills & services</h2>
        {services.length > 0 ? <div className="hlc-provider-profile-tags">{services.map((service) => <span key={service.id}>{service.service_name}</span>)}</div> : <p>No additional skills or services are recorded yet.</p>}
      </article>

      <article className="hlc-provider-profile-section">
        <h2>Service area</h2>
        {areas.length > 0 ? <ul>{areas.map((area) => <li key={area.id}>{[area.city, area.state, area.zip].filter(Boolean).join(", ") || "Area recorded"}{area.radius_miles ? ` · ${area.radius_miles} mi radius` : ""}</li>)}</ul> : <p>{location || "Service territory not recorded"}</p>}
      </article>

      <article className="hlc-provider-profile-section">
        <h2>Connect</h2>
        <div className="hlc-provider-profile-actions">
          {provider.phone && <a href={`tel:${provider.phone}`}>Call</a>}
          {provider.email && <a href={`mailto:${provider.email}`}>Email</a>}
          {provider.website && <a href={provider.website} target="_blank" rel="noreferrer">Website</a>}
          <Link to="/jobs">Work & offers</Link>
        </div>
      </article>
    </section>

    <p className="hlc-provider-profile-disclosure">HLC only shows credentials, availability and service information actually recorded in the workspace. Missing profile photo, insurance, biography, skills or credential evidence is shown as not recorded rather than inferred.</p>
  </main>;
}
