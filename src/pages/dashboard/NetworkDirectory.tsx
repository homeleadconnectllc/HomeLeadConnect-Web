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
import "../../styles/network-directory-visual.css";

type AvailabilityFilter = "all" | "available" | "unavailable" | "undeclared";

type ProviderEvidence = {
  provider: Contractor;
  services: ProviderService[];
  areas: ServiceArea[];
  availability: ProviderAvailability | null;
  saved: boolean;
};

const tradeVisuals = {
  painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=720&q=82",
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=720&q=82",
  remodeling: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=720&q=82",
  default: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=720&q=82",
} as const;

function text(value: unknown) {
  return String(value ?? "").trim();
}

function providerName(provider: Contractor) {
  return text(provider.company_name) || text(provider.contact_name) || `Provider ${provider.id}`;
}

function providerTradeLabel(provider: Contractor, rows: ProviderService[]) {
  return text(provider.specialty) || rows.map((row) => text(row.service_name)).filter(Boolean).join(" · ") || "Trade not recorded";
}

function providerVisual(label: string) {
  const normalized = label.toLowerCase();
  if (/(paint|drywall)/.test(normalized)) return tradeVisuals.painting;
  if (/(clean|janitor)/.test(normalized)) return tradeVisuals.cleaning;
  if (/(remodel|roof|hvac|plumb|electric|carpentry|repair|handyman|construct|floor|window|door)/.test(normalized)) return tradeVisuals.remodeling;
  return tradeVisuals.default;
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
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
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

  const filterFields = <>
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
  </>;

  return <main className="hlc-command-center hlc-network-directory hlc-s3-network-directory">
    <section className="hlc-command-hero">
      <div className="hlc-command-copy">
        <div className="hlc-command-kicker"><UsersRound size={15} aria-hidden="true" />HLC Network</div>
        <h1>{savedOnly ? "Saved providers" : "Provider directory"}</h1>
        <p>Search workspace provider records by trade, service territory and declared availability. HLC does not infer availability when a provider has not declared it.</p>
      </div>
    </section>

    <section className="hlc-s3-network-search" aria-label="Provider search">
      <label>Search providers
        <span className="hlc-input-with-icon"><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, provider, trade, city or ZIP" /></span>
      </label>
      <div className="hlc-s3-network-view-toggle" aria-label="Network view">
        <Link to="/providers" aria-current={!savedOnly ? "page" : undefined}>List</Link>
        <Link to="/map">Map</Link>
      </div>
    </section>

    <section className="hlc-settings-section hlc-s3-network-filters-desktop" aria-label="Provider discovery filters">
      {filterFields}
    </section>

    <details className="hlc-s3-network-filter-sheet">
      <summary>Filters</summary>
      <div className="hlc-s3-network-filter-sheet-panel" aria-label="Provider discovery filters">
        <div className="hlc-s3-network-filter-sheet-head"><strong>Filter providers</strong><span>Trade, location and availability</span></div>
        {filterFields}
        <button type="button" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>Show {visible.length} providers</button>
      </div>
    </details>

    <nav className="hlc-account-inline-links hlc-s3-network-tools" aria-label="Network tools">
      <Link to="/matching">Matching</Link>
      <Link to="/network/service-areas">Manage service areas</Link>
      <Link to="/network/availability">Manage availability</Link>
      <Link to="/network/saved">Saved providers</Link>
    </nav>

    {loading && <p role="status">Loading provider evidence…</p>}
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

    {!loading && <section className="hlc-phone-list hlc-s3-provider-results" aria-label={`${visible.length} matching provider records`}>
      {visible.map(({ provider, services: providerServices, areas: providerAreas, availability: providerAvailability, saved: isSaved }) => {
        const locationLabel = [text(provider.city), text(provider.state), text(provider.zip)].filter(Boolean).join(", ");
        const state = providerAvailability ? (providerAvailability.available ? "Declared available" : "Declared unavailable") : "Availability not declared";
        const tradeLabel = providerTradeLabel(provider, providerServices);
        const secondaryActions = <>
          {provider.phone && <a href={`tel:${provider.phone}`}>Call</a>}
          {provider.email && <a href={`mailto:${provider.email}`}>Email</a>}
          <Link to="/jobs">Work &amp; offers</Link>
        </>;
        return <article className="hlc-phone-row hlc-s3-provider-row" key={provider.id}>
          <div className="hlc-network-provider-visual" aria-hidden="true">
            <img src={providerVisual(tradeLabel)} alt="" loading="lazy" />
            <span className="hlc-network-provider-badge">{tradeLabel}</span>
          </div>
          <div className="hlc-network-provider-body">
            <div>
              <strong><Link to={`/providers/${provider.id}`}>{providerName(provider)}</Link></strong>
              <span>{tradeLabel}</span>
              <small><MapPin size={13} aria-hidden="true" /> {locationLabel || providerAreas.map((row) => [row.city, row.state, row.zip].filter(Boolean).join(", ")).filter(Boolean).join(" · ") || "Service territory not recorded"}</small>
              <small className="hlc-network-provider-evidence">{state}{providerAvailability?.next_available_at ? ` · next ${new Date(providerAvailability.next_available_at).toLocaleString()}` : ""}</small>
            </div>
            <div className="hlc-account-inline-links hlc-s3-provider-actions">
              <Link to={`/providers/${provider.id}`}>View profile</Link>
              <button type="button" disabled={busyProvider === Number(provider.id)} onClick={() => void toggleSaved(Number(provider.id))}><Bookmark size={14} aria-hidden="true" /> {isSaved ? "Unsave" : "Save"}</button>
              <span className="hlc-s3-provider-secondary-desktop">{secondaryActions}</span>
              <details className="hlc-s3-provider-more"><summary>More</summary><div>{secondaryActions}</div></details>
            </div>
          </div>
        </article>;
      })}
      {visible.length === 0 && !error && <div className="hlc-network-empty" data-empty-state="true"><UsersRound size={28} aria-hidden="true" /><strong>No providers match the selected evidence filters.</strong><span>Adjust trade, location, or availability filters to widen the provider evidence shown here.</span></div>}
    </section>}
  </main>;
}
