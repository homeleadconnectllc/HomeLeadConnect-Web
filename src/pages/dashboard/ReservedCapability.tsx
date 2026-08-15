import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { canonicalPageMap } from "../../config/pageMap";

export default function ReservedCapability() {
  const location = useLocation();
  const record = canonicalPageMap.flatMap((area) => area.pages.map((page) => ({ area: area.label, ...page }))).find((page) => page.route === location.pathname || (page.route.includes(":providerId") && location.pathname.startsWith("/providers/")));
  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>PREVIEW TERMINAL</p>
      <h1 style={{ margin: 0 }}>{record?.label || "Reserved capability"}</h1>
      <p>This destination belongs to the one canonical HLC ecosystem. It remains non-operational until persistence, permissions, automation, error states and acceptance evidence pass.</p>
    </header>
    <section style={cardStyle}>
      <p><strong>Route:</strong> <code>{location.pathname}</code></p>
      <p><strong>Owner:</strong> {record?.owner || "Shared"}</p>
      <p><strong>Audience:</strong> {record?.audience || "Authorized participants"}</p>
      <p><strong>Approval:</strong> No verified approval data loaded</p>
      <p><strong>Integration:</strong> Operational integration required</p>
      <p><strong>Service alerts:</strong> No verified service-alert data loaded</p>
      <p>No duplicate database, portal, CRM or profile system will be created for this page.</p>
      <div style={linksStyle}><Link to="/dashboard">Dashboard</Link><Link to="/workflow">Golden workflow</Link><Link to="/automations">Automation control plane</Link></div>
    </section>
  </main>;
}
const pageStyle={width:"min(850px,calc(100% - 32px))",margin:"40px auto",display:"grid",gap:20};
const heroStyle={padding:"clamp(22px,5vw,42px)",borderRadius:22,color:"#f8fafc",background:"linear-gradient(135deg,#081426,#12365f)"};
const eyebrowStyle={margin:0,color:"#60a5fa",fontWeight:900,textTransform:"uppercase" as const};
const cardStyle={padding:20,border:"1px solid #f59e0b",borderRadius:16,background:"#fffbeb",lineHeight:1.6,overflowWrap:"anywhere" as const};
const linksStyle={display:"flex",flexWrap:"wrap" as const,gap:14,justifyContent:"center"};
