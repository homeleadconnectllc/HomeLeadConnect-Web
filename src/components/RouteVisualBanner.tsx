import { Link, useLocation } from "react-router-dom";

type RouteVisual = {
  eyebrow: string;
  title: string;
  detail: string;
  action?: { label: string; to: string };
  tone: "command" | "work" | "network" | "community" | "academy" | "resources" | "account" | "ai" | "public";
  portrait?: string;
};

const routeVisuals: Array<{ match: (pathname: string) => boolean; visual: RouteVisual }> = [
  { match: (p) => p === "/dashboard", visual: { eyebrow: "LIVE COMMAND", title: "See the business before you work the business.", detail: "Live priorities, workload, appointments and HLC intelligence in one visual command layer.", action: { label: "Open workflow", to: "/workflow" }, tone: "command" } },
  { match: (p) => p === "/work" || p.startsWith("/leads") || p.startsWith("/jobs") || p === "/estimator" || p.startsWith("/follow-ups") || p === "/calendar" || p === "/call-center" || p === "/manual-communications", visual: { eyebrow: "OPERATIONS", title: "Move every request toward completion.", detail: "See where the work sits, what is blocking it and what action moves it forward.", action: { label: "Work home", to: "/work" }, tone: "work" } },
  { match: (p) => p.startsWith("/network") || p === "/map" || p.startsWith("/providers") || p === "/profiles" || p === "/matching" || p === "/work/matching", visual: { eyebrow: "NETWORK", title: "People, place and fit — visible together.", detail: "Explore provider identity, location, service area, availability and matching evidence visually.", action: { label: "Explore network", to: "/network" }, tone: "network" } },
  { match: (p) => p === "/community-hub" || p.startsWith("/community/"), visual: { eyebrow: "COMMUNITY", title: "Make the network feel human.", detail: "Relationships, discussions, reviews, groups, referrals and events belong to one connected community experience.", action: { label: "Community home", to: "/community-hub" }, tone: "community" } },
  { match: (p) => p.startsWith("/academy"), visual: { eyebrow: "ACADEMY · CONNECT", title: "Learn it. Practice it. See your progress.", detail: "Visual learning paths, CONNECT practice, coaching and certification built around real HLC operating standards.", action: { label: "Academy home", to: "/academy" }, tone: "academy" } },
  { match: (p) => p.startsWith("/resources") || p === "/documents" || p === "/documents/scan" || p === "/help" || p === "/tutorials" || p === "/rules", visual: { eyebrow: "KNOWLEDGE & RESOURCES", title: "Turn information into something people can use.", detail: "Documents, forms, checklists, materials and guidance organized as a visual working library.", action: { label: "Open resources", to: "/resources" }, tone: "resources" } },
  { match: (p) => p === "/hq" || p.startsWith("/hq/"), visual: { eyebrow: "KENDRELL · COMMAND", title: "Executive context, visually organized.", detail: "Approvals, risk, priorities and cross-system reasoning with the owner kept in control.", action: { label: "Open Kendrell", to: "/hq" }, tone: "ai", portrait: "/brand/avatars/Kendrell_Locked_HLC.png" } },
  { match: (p) => p === "/operations" || p.startsWith("/operations/"), visual: { eyebrow: "DION · OPERATIONS & BI", title: "See operational pressure before it becomes a problem.", detail: "Patterns across leads, jobs, schedule and performance translated into clear operational signals.", action: { label: "Open Dion", to: "/operations" }, tone: "ai", portrait: "/brand/avatars/Dion_Locked_HLC.png" } },
  { match: (p) => p === "/customer-experience" || p.startsWith("/customer-experience/"), visual: { eyebrow: "DIAMOND · CUSTOMER EXPERIENCE", title: "Make every interaction feel connected.", detail: "Customer experience, community and recovery context presented as one human-centered view.", action: { label: "Open Diamond", to: "/customer-experience" }, tone: "ai", portrait: "/brand/avatars/Diamond_Locked_HLC.png" } },
  { match: (p) => p === "/analytics" || p.startsWith("/analytics/"), visual: { eyebrow: "INTELLIGENCE", title: "Charts should answer the next question.", detail: "Performance, demand and forecasting graphics that explain movement instead of decorating the page.", action: { label: "Analytics home", to: "/analytics" }, tone: "command" } },
  { match: (p) => p.startsWith("/settings") || p === "/profile" || p === "/team" || p.startsWith("/homeowner-portal") || p.startsWith("/contractor-portal") || p.startsWith("/partner-portal") || p === "/notifications" || p === "/messages", visual: { eyebrow: "ACCOUNT & ACCESS", title: "Keep identity, access and communication understandable.", detail: "Account health, people, messages, billing and portal activity with clear visual status and next actions.", tone: "account" } },
  { match: (p) => p === "/request-service" || p === "/app" || p === "/portal" || p === "/login" || p === "/register" || p === "/forgot-password" || p === "/reset-password", visual: { eyebrow: "HOMELEAD CONNECT", title: "One front door into the HLC ecosystem.", detail: "A clear, visual path into home help, professional access and the connected HLC workspace.", tone: "public" } },
];

function fallbackVisual(pathname: string): RouteVisual {
  const label = pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/[-_]/g, " ") || "HomeLead Connect";
  return {
    eyebrow: "HOMELEAD CONNECT",
    title: label.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    detail: "A connected HLC workspace with clear context, visual status and an obvious next action.",
    tone: "command",
  };
}

const baseProps = { className: "hlc-route-visual-svg", viewBox: "0 0 420 220", role: "img" } as const;

function CommandGraphic() {
  return <svg {...baseProps} aria-label="Command center information graphic">
    <path className="hlc-route-visual-path" d="M24 166 C92 118 116 146 166 102 S258 60 312 88 S366 58 396 34" />
    {[24,166,312,396].map((x, i) => <circle key={x} cx={x} cy={[166,102,88,34][i]} r="8" />)}
    <g className="hlc-route-visual-bars"><rect x="48" y="88" width="24" height="52" rx="6"/><rect x="82" y="62" width="24" height="78" rx="6"/><rect x="116" y="106" width="24" height="34" rx="6"/></g>
    <circle className="hlc-route-visual-orbit" cx="310" cy="154" r="42"/><circle className="hlc-route-visual-orbit-dot" cx="346" cy="132" r="7"/>
  </svg>;
}

function WorkGraphic() {
  const xs = [36, 92, 148, 204, 260, 316, 372];
  return <svg {...baseProps} aria-label="Service workflow infographic">
    <path className="hlc-route-visual-path" d="M36 112 H372" />
    {xs.map((x, i) => <g key={x}><circle cx={x} cy="112" r={i === 6 ? 14 : 11}/><text x={x} y="158" textAnchor="middle" className="hlc-route-visual-label">{i + 1}</text></g>)}
    <path className="hlc-route-visual-soft" d="M36 82 L92 66 L148 88 L204 52 L260 78 L316 48 L372 58" />
  </svg>;
}

function NetworkGraphic() {
  const nodes = [[62,62],[170,48],[286,70],[354,148],[224,164],[98,158]];
  return <svg {...baseProps} aria-label="Connected provider network graphic">
    <g className="hlc-route-visual-soft">{[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,4],[0,4]].map(([a,b]) => <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}/>)}</g>
    {nodes.map(([x,y],i)=><g key={x}><circle cx={x} cy={y} r={i===4?19:13}/>{i===4&&<circle className="hlc-route-visual-orbit" cx={x} cy={y} r="34"/>}</g>)}
  </svg>;
}

function CommunityGraphic() {
  return <svg {...baseProps} aria-label="Community relationships graphic">
    <circle className="hlc-route-visual-orbit" cx="210" cy="112" r="82"/><circle className="hlc-route-visual-orbit" cx="210" cy="112" r="54"/>
    {[[210,80],[144,106],[276,106],[172,160],[248,160]].map(([x,y],i)=><g key={x}><circle cx={x} cy={y-12} r={i===0?16:12}/><path className="hlc-route-visual-soft" d={`M${x-22} ${y+20} Q${x} ${y-2} ${x+22} ${y+20}`}/></g>)}
  </svg>;
}

function AcademyGraphic() {
  return <svg {...baseProps} aria-label="Learning progress infographic">
    <path className="hlc-route-visual-soft" d="M42 166 L96 142 L150 150 L204 112 L258 122 L312 76 L372 48"/>
    {[42,96,150,204,258,312,372].map((x,i)=><g key={x}><circle cx={x} cy={[166,142,150,112,122,76,48][i]} r="11"/><text x={x} y="198" textAnchor="middle" className="hlc-route-visual-label">{i+1}</text></g>)}
    <circle className="hlc-route-visual-orbit" cx="330" cy="112" r="58"/><path className="hlc-route-visual-path" d="M330 54 A58 58 0 1 1 282 144"/>
  </svg>;
}

function ResourcesGraphic() {
  return <svg {...baseProps} aria-label="Resources library graphic">
    <g className="hlc-route-visual-bars"><rect x="54" y="48" width="78" height="116" rx="10"/><rect x="150" y="70" width="78" height="94" rx="10"/><rect x="246" y="38" width="78" height="126" rx="10"/></g>
    <path className="hlc-route-visual-soft" d="M70 76 H116 M70 94 H112 M166 98 H212 M166 116 H202 M262 68 H308 M262 86 H300"/>
    <circle className="hlc-route-visual-orbit" cx="342" cy="156" r="34"/>
  </svg>;
}

function AccountGraphic() {
  return <svg {...baseProps} aria-label="Account and access graphic">
    <path className="hlc-route-visual-soft" d="M210 38 L298 70 V124 C298 168 262 194 210 204 C158 194 122 168 122 124 V70 Z"/>
    <circle cx="210" cy="96" r="24"/><path className="hlc-route-visual-path" d="M164 162 Q210 118 256 162"/>
    <circle className="hlc-route-visual-orbit" cx="324" cy="86" r="34"/><circle className="hlc-route-visual-orbit-dot" cx="348" cy="66" r="7"/>
  </svg>;
}

function PublicGraphic() {
  return <svg {...baseProps} aria-label="Connected home services graphic">
    <path className="hlc-route-visual-soft" d="M74 118 L146 58 L218 118 V184 H74 Z M218 118 L288 72 L358 118 V184 H218"/>
    <rect x="118" y="132" width="38" height="52" rx="5"/><rect x="266" y="132" width="38" height="52" rx="5"/>
    <path className="hlc-route-visual-path" d="M34 192 C106 148 138 210 210 166 S324 132 390 86"/>
    <circle cx="34" cy="192" r="8"/><circle cx="210" cy="166" r="8"/><circle cx="390" cy="86" r="8"/>
  </svg>;
}

function SignalGraphic({ tone }: { tone: RouteVisual["tone"] }) {
  switch (tone) {
    case "work": return <WorkGraphic />;
    case "network": return <NetworkGraphic />;
    case "community": return <CommunityGraphic />;
    case "academy": return <AcademyGraphic />;
    case "resources": return <ResourcesGraphic />;
    case "account": return <AccountGraphic />;
    case "public": return <PublicGraphic />;
    default: return <CommandGraphic />;
  }
}

export default function RouteVisualBanner() {
  const { pathname } = useLocation();
  const visual = routeVisuals.find((item) => item.match(pathname))?.visual ?? fallbackVisual(pathname);

  return <aside className={`hlc-route-visual-banner hlc-route-visual-${visual.tone}`} aria-label={`${visual.eyebrow} page overview`}>
    <div className="hlc-route-visual-copy">
      <span className="hlc-route-visual-eyebrow">{visual.eyebrow}</span>
      <strong>{visual.title}</strong>
      <p>{visual.detail}</p>
      {visual.action && visual.action.to !== pathname && <Link to={visual.action.to}>{visual.action.label}<span aria-hidden="true">→</span></Link>}
    </div>
    <div className="hlc-route-visual-art" aria-hidden={visual.portrait ? undefined : true}>
      {visual.portrait ? <img src={visual.portrait} alt="" /> : <SignalGraphic tone={visual.tone} />}
    </div>
  </aside>;
}
