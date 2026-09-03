import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HOMELEAD_SCRIPT_LIBRARY,
  RESIDENT_DIRECTORY_RESOURCES,
  RESOURCE_TRUST_RULES,
  ROLE_RESOURCE_CATEGORIES,
  type ResourceAudience,
  type RoleResource,
} from "../../data/roleResourceCatalog";

type PortalResourcesProps = {
  audience: Exclude<ResourceAudience, "shared">;
};

const portalBack: Record<PortalResourcesProps["audience"], string> = {
  resident: "/homeowner-portal",
  professional: "/contractor-portal",
  partner: "/partner-portal",
  internal: "/resources",
};

const audienceTitle: Record<PortalResourcesProps["audience"], string> = {
  resident: "Resident resources",
  professional: "Professional resources",
  partner: "Partner resources",
  internal: "HomeLead Connect playbook",
};

function availableResources(audience: PortalResourcesProps["audience"]): readonly RoleResource[] {
  if (audience === "resident") return RESIDENT_DIRECTORY_RESOURCES;
  if (audience === "internal") return HOMELEAD_SCRIPT_LIBRARY;
  return [];
}

export default function PortalResources({ audience }: PortalResourcesProps) {
  const categories = ROLE_RESOURCE_CATEGORIES[audience];
  const resources = availableResources(audience);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => resources.filter((item) => {
    const categoryMatch = category === "all" || item.category === category;
    const haystack = `${item.title} ${item.summary} ${item.category} ${item.note ?? ""}`.toLowerCase();
    return categoryMatch && haystack.includes(query.trim().toLowerCase());
  }), [category, query, resources]);

  return <main className="hlc-portal-workspace">
    <header className="hlc-portal-header">
      <div>
        <p className="hlc-account-kicker">RESOURCES</p>
        <h1>{audienceTitle[audience]}</h1>
        <p>Find the information, scripts, services, and support appropriate to this HomeLead Connect experience without sorting through unrelated portal tools.</p>
      </div>
      <div className="hlc-portal-summary">
        <span><strong>{categories.length}</strong><small>Categories</small></span>
        <span><strong>{resources.length}</strong><small>Available now</small></span>
      </div>
    </header>

    <nav className="hlc-portal-actions" aria-label="Resource navigation">
      <Link to={portalBack[audience]}>Back to portal</Link>
      {audience === "professional" && <Link to="/resources/suppliers">Suppliers & materials</Link>}
      {audience === "internal" && <Link to="/resources/forms">Forms</Link>}
      {audience === "internal" && <Link to="/documents">Documents</Link>}
    </nav>

    <section className="hlc-portal-project">
      <div className="hlc-account-section-head"><div><span>FIND WHAT YOU NEED</span><h2>Browse resources</h2></div></div>
      <div className="hlc-sourcing-filters">
        <label>Search<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" /></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
    </section>

    <section className="hlc-portal-project">
      <div className="hlc-account-section-head"><div><span>CATEGORIES</span><h2>Organized for this portal</h2></div><strong>{categories.length}</strong></div>
      <div className="hlc-sourcing-categories">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)}><span>{item}</span><strong>Open category</strong></button>)}</div>
    </section>

    <section className="hlc-portal-project">
      <div className="hlc-account-section-head"><div><span>AVAILABLE RESOURCES</span><h2>{category === "all" ? "All resources" : category}</h2></div><strong>{visible.length}</strong></div>
      {!visible.length && <p className="hlc-portal-state">This category is part of the role-aware Resources structure but does not have a verified production entry yet.</p>}
      {visible.map((item) => <article className="hlc-portal-row" key={item.id}>
        <div>
          <strong>{item.title}</strong>
          <span>{item.category}</span>
          <p>{item.summary}</p>
          {item.note && <p>{item.note}</p>}
          {item.source && <small>Source: {item.source}</small>}
        </div>
        <div className="hlc-portal-actions">
          {item.website && <a href={item.website} target="_blank" rel="noopener noreferrer">Visit official site ↗</a>}
          {item.phone && <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}>Call {item.phone}</a>}
        </div>
      </article>)}
    </section>

    <section className="hlc-portal-project">
      <div className="hlc-account-section-head"><div><span>TRUST BOUNDARY</span><h2>Use resources carefully</h2></div></div>
      <ul>{RESOURCE_TRUST_RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
    </section>
  </main>;
}
