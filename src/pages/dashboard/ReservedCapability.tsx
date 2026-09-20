import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { canonicalPageMap } from "../../config/pageMap";

export default function ReservedCapability() {
  const location = useLocation();
  const record = canonicalPageMap.flatMap((area) => area.pages.map((page) => ({ area: area.label, ...page }))).find((page) => page.route === location.pathname || (page.route.includes(":providerId") && location.pathname.startsWith("/providers/")));
  return <main className="hlc-ui-page-b43785">
    <header className="hlc-ui-hero-524b19">
      <p className="hlc-ui-eyebrow-4e3630">PREVIEW TERMINAL</p>
      <h1 className="hlc-ui-margin-ab79ea">{record?.label || "Reserved capability"}</h1>
      <p>This destination belongs to the one canonical HLC ecosystem. It remains non-operational until persistence, permissions, automation, error states and acceptance evidence pass.</p>
    </header>
    <section className="hlc-ui-card-405522">
      <p><strong>Route:</strong> <code>{location.pathname}</code></p>
      <p><strong>Owner:</strong> {record?.owner || "Shared"}</p>
      <p><strong>Audience:</strong> {record?.audience || "Authorized participants"}</p>
      <p><strong>Approval:</strong> No verified approval data loaded</p>
      <p><strong>Integration:</strong> Operational integration required</p>
      <p><strong>Service alerts:</strong> No verified service-alert data loaded</p>
      <p>No duplicate database, portal, CRM or profile system will be created for this page.</p>
      <div className="hlc-ui-links-0a6a6c"><Link to="/dashboard">Dashboard</Link><Link to="/workflow">Golden workflow</Link><Link to="/automations">Automation control plane</Link></div>
    </section>
  </main>;
}
