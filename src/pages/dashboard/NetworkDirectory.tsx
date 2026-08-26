import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MapPin, Search, UsersRound } from "lucide-react";
import { listContractors } from "../../api/contractors";
import {
  listProviderAvailability,
  listSavedProviderIds,
  listServiceAreas,
  setProviderSaved,
  type ProviderAvailability,
  type ServiceArea,
} from "../../api/ecosystemRecords";
import { listProviderServices, type ProviderService } from "../../api/ecosystemExtra";
import { errorMessage } from "../../lib/errorMessage";
import type { Contractor } from "../../lib/types/database";

type AvailabilityFilter = "all" | "available" | "unavailable" | "undeclared";

type ProviderEvidence = {
  provider: Contractor;
  services: ProviderService[];
  areas: ServiceArea[];
  availability: ProviderAvailability | null;
  saved: boolean;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function providerName(provider: Contractor) {
  return text(provider.company_name) || text(provider.contact_name) || `Provider ${provider.id}`;
}

export default function NetworkDirectory({ savedOnly = false }: { savedOnly?: boolean }) {
  const [providers, setProviders] = useState<Contractor[]>([]);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [availability, setAvailability] = useState<ProviderAvailability[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [trade, setTrade] = useState("all");
  const [location, setLocation] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyProvider, setBusyProvider] = useState<number | null>(null);

  async function load() {
    setError("");
    try {
      const [providerRows, serviceRows, areaRows, availabilityRows, savedIds] = await Promise.all([
        listContractors({}),
        listProviderServices(),
        listServiceAreas(),
        listProviderAvailability(),
        listSavedProviderIds(),
      ]);
      setProviders(providerRows);
      setServices(serviceRows);
      setAreas(areaRows);
      setAvailability(availabilityRows);
      setSaved(savedIds);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load the provider network."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const evidence = useMemo<ProviderEvidence[]>(() => providers.map((provider) => ({
    provider,
    services: services.filter((row) => Number(row.contractor_id) === Number(provider.id)),
    areas: areas.filter((row) => Number(row.contractor_id) === Number(provider.id)),
    availability: availability.find((row) => Number(row.contractor_id) === Number(provider.id)) ?? null,
    saved: saved.has(Number(provider.id)),
  })), [providers, services, areas, availability, saved]);

  const trades = useMemo(() => Array.from(new Set(evidence.flatMap(({ provider, services: rows }) => [
    text(provider.specialty),
    ...rows.map((row) => text(row.service_name)),
  ]).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [evidence]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const locationNeedle = location.trim().toLowerCase();
    return evidence.filter((item) => {
      if (savedOnly && !item.saved) return false;
      const providerTrade = [text(item.provider.specialty), ...item.services.map((row) => text(row.service_name))];
      if (trade !== "all" && !providerTrade.some((value) => value.toLowerCase() === trade.toLowerCase())) return false;

      const availabilityState: AvailabilityFilter = item.availability
        ? (item.availability.available ? "available" : "unavailable")
        : "undeclared";
      if (availabilityFilter !== "all" && availabilityState !== availabilityFilter) return false;

      const locationValues = [
        text(item.provider.city), text(item.provider.state), text(item.provider.zip),
        ...item.areas.flatMap((row) => [text(row.city), text(row.state), text(row.zip)]),
      ].filter(Boolean).join(" ").toLowerCase();
      if (locationNeedle && !locationValues.includes(locationNeedle)) return false;

      if (!needle) return true;
      const searchable = [
        providerName(item.provider), text(item.provider.specialty), text(item.provider.city), text(item.provider.state), text(item.provider.zip),
        ...item.services.map((row) => text(row.service_name)),
      ].join(" ").toLowerCase();
      return searchable.includes(needle);
    });
  }, [availabilityFilter, evidence, location, query, savedOnly, trade]);

  async function toggleSaved(providerId: number) {
    setBusyProvider(providerId);
    setError("");
    try {
      await setProviderSaved(providerId, !saved.has(providerId));
      setSaved((current) => {
        const next = new Set(current);
        if (next.has(providerId)) next.delete(providerId); else next.add(providerId);
        return next;
      });
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update saved providers."));
    } finally {
      setBusyProvider(null);
    }
  }

  return <main className="hlc-command-center hlc-network-directory">
    <section className="hlc-command-hero">
      <div className="hlc-command-copy">
        <div className="hlc-command-kicker"><UsersRound size={15} aria-hidden="true" />HLC Network</div>
        <h1>{savedOnly ? "Saved providers" : "Provider directory"}</h1>
        <p>Search workspace provider records by trade, service territory and declared availability. HLC does not infer availability when a provider has not declared it.</p>
      </div>
    </section>

    <section className="hlc-settings-section" aria-label="Provider discovery filters">
      <label>Search providers
        <span className="hlc-input-with-icon"><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, provider, trade, city or ZIP" /></span>
      </label>
      <label>Trade or service
        <select value={trade} onChange={(event) => setTrade(event.target.value)}>
          <option value="all">All trades</option>
          {trades.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>Location
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, state or ZIP" />
      </label>
      <label>Availability evidence
        <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}>
          <option value="all">All states</option>
          <option value="available">Declared available</option>
          <option value="unavailable">Declared unavailable</option>
          <option value="undeclared">Not declared</option>
        </select>
      </label>
    </section>

    <nav className="hlc-account-inline-links" aria-label="Network tools">
      <Link to="/network/map">Map</Link>
      <Link to="/matching">Matching</Link>
      <Link to="/network/service-areas">Manage service areas</Link>
      <Link to="/network/availability">Manage availability</Link>
      <Link to="/network/saved">Saved providers</Link>
    </nav>

    {loading && <p role="status">Loading provider evidence…</p>}
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

    {!loading && <section className="hlc-phone-list" aria-label={`${visible.length} matching provider records`}>
      {visible.map(({ provider, services: providerServices, areas: providerAreas, availability: providerAvailability, saved: isSaved }) => {
        const locationLabel = [text(provider.city), text(provider.state), text(provider.zip)].filter(Boolean).join(", ");
        const state = providerAvailability ? (providerAvailability.available ? "Declared available" : "Declared unavailable") : "Availability not declared";
        return <article className="hlc-phone-row" key={provider.id}>
          <div>
            <strong><Link to={`/providers/${provider.id}`}>{providerName(provider)}</Link></strong>
            <span>{text(provider.specialty) || providerServices.map((row) => row.service_name).join(" · ") || "Trade not recorded"}</span>
            <small><MapPin size={13} aria-hidden="true" /> {locationLabel || providerAreas.map((row) => [row.city, row.state, row.zip].filter(Boolean).join(", ")).filter(Boolean).join(" · ") || "Service territory not recorded"}</small>
            <small>{state}{providerAvailability?.next_available_at ? ` · next ${new Date(providerAvailability.next_available_at).toLocaleString()}` : ""}</small>
          </div>
          <div className="hlc-account-inline-links">
            <Link to={`/providers/${provider.id}`}>View profile</Link>
            {provider.phone && <a href={`tel:${provider.phone}`}>Call</a>}
            {provider.email && <a href={`mailto:${provider.email}`}>Email</a>}
            <Link to="/jobs">Work &amp; offers</Link>
            <button type="button" disabled={busyProvider === Number(provider.id)} onClick={() => void toggleSaved(Number(provider.id))}><Bookmark size={14} aria-hidden="true" /> {isSaved ? "Unsave" : "Save"}</button>
          </div>
        </article>;
      })}
      {visible.length === 0 && !error && <p>No providers match the selected evidence filters.</p>}
    </section>}
  </main>;
}
