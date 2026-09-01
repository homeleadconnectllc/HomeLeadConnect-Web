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

function SignalGraphic({ tone }: { tone: RouteVisual["tone"] }) {
  return <svg className="hlc-route-visual-svg" viewBox="0 0 420 220" role="img" aria-label={`${tone} information graphic`}>
    <defs>
      <linearGradient id={`hlc-route-gradient-${tone}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="currentColor" stopOpacity=".9" />
        <stop offset="1" stopColor="currentColor" stopOpacity=".12" />
      </linearGradient>
    </defs>
    <path className="hlc-route-visual-path" d="M32 164 C86 128 112 146 160 102 S252 66 302 92 S354 64 390 38" />
    <circle cx="32" cy="164" r="8" />
    <circle cx="160" cy="102" r="8" />
    <circle cx="302" cy="92" r="8" />
    <circle cx="390" cy="38" r="8" />
    <g className="hlc-route-visual-bars">
      <rect x="44" y="86" width="24" height="52" rx="6" />
      <rect x="78" y="62" width="24" height="76" rx="6" />
      <rect x="112" y="106" width="24" height="32" rx="6" />
    </g>
    <circle className="hlc-route-visual-orbit" cx="310" cy="148" r="46" />
    <circle className="hlc-route-visual-orbit-dot" cx="350" cy="126" r="7" />
  </svg>;
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
