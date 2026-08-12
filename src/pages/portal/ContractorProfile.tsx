import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getContractorPortalData, type ContractorPortalData } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";

export default function ContractorProfile() {
  const [data, setData] = useState<ContractorPortalData>({ links: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getContractorPortalData()
      .then((result) => { if (active) setData(result); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load your linked business profile.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>Professional portal</p>
      <h1 style={{ margin: 0 }}>Business/provider profile</h1>
      <p>The canonical contractor records explicitly linked to your signed-in account.</p>
    </header>
    <nav aria-label="Professional portal sections" style={navStyle}>
      <Link to="/contractor-portal">Work dashboard</Link>
      <Link to="/contractor-portal/profile">Business profile</Link>
      <Link to="/contractor-portal/services">Services and service areas</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/documents">Documents</Link>
    </nav>
    {loading && <p role="status">Loading linked businesses…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {!loading && !error && data.links.length === 0 && <section style={emptyStyle}>
      <h2>No linked business</h2>
      <p>This account does not currently have an authorized contractor-company relationship. An approved invitation is required; an email match alone does not grant access.</p>
    </section>}
    {data.links.map((link) => <article key={`${link.workspace_id}:${link.contractor_id}`} style={cardStyle}>
      <p style={eyebrowStyle}>Linked provider #{link.contractor_id}</p>
      <h2 style={{ marginTop: 4 }}>{link.company_name || "Company name not provided"}</h2>
      <p><strong>Primary contact:</strong> {link.contact_name || "Not provided"}</p>
      <p><strong>Current portal work:</strong> {data.assignments.filter((assignment) => assignment.contractor_id === link.contractor_id).length} offer(s) or assignment(s)</p>
      <p>Editing, verification evidence, trades, service areas, availability, licensing, and insurance remain unavailable until those fields and permissions are returned by the canonical portal contract.</p>
    </article>)}
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px, 5vw, 40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#2563eb", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { padding: 20, border: "1px solid #dbeafe", borderRadius: 16, background: "#fff" };
const emptyStyle = { padding: 24, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc" };
const errorStyle = { color: "#b91c1c", padding: 16, border: "1px solid #fecaca", borderRadius: 12 };
