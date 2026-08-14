import { trackAnalyticsEvent } from "../../api/analytics";

type Retailer = {
  name: string;
  href: string;
  categories: string;
};

const retailers: Retailer[] = [
  { name: "The Home Depot", href: "https://www.homedepot.com/", categories: "Hardware · building materials · paint · concrete · lawn & garden · plumbing · electrical" },
  { name: "Lowe's", href: "https://www.lowes.com/", categories: "Home improvement · lumber · paint · lawn & garden · flooring · plumbing · electrical" },
  { name: "Ace Hardware", href: "https://www.acehardware.com/", categories: "Hardware · tools · paint · lawn care · garden · outdoor equipment" },
  { name: "Sherwin-Williams", href: "https://www.sherwin-williams.com/homeowners/products/catalog", categories: "Interior/exterior paint · stains · primers · concrete & masonry coatings · painting supplies" },
  { name: "Tractor Supply", href: "https://www.tractorsupply.com/", categories: "Lawn & garden · fencing · outdoor equipment · tools · property maintenance" },
  { name: "White Cap", href: "https://www.whitecap.com/", categories: "Concrete · masonry · construction tools · fasteners · safety · jobsite supplies" },
  { name: "SiteOne Landscape Supply", href: "https://www.siteone.com/", categories: "Landscape · irrigation · hardscape · turf · nursery · outdoor lighting" },
  { name: "Grainger", href: "https://www.grainger.com/", categories: "Commercial hardware · tools · electrical · HVAC · plumbing · safety · maintenance" },
  { name: "84 Lumber", href: "https://www.84lumber.com/", categories: "Lumber · framing · roofing · siding · windows · doors · building materials" },
  { name: "Ferguson", href: "https://www.ferguson.com/", categories: "Plumbing · HVAC · water systems · fixtures · contractor supplies" },
];

export default function MaterialShopLinks() {
  return (
    <section aria-labelledby="leadscope-material-shopping" style={sectionStyle}>
      <div style={headingStyle}>
        <div>
          <p style={eyebrowStyle}>LeadScope material sourcing</p>
          <h2 id="leadscope-material-shopping" style={{ margin: "4px 0 8px", color: "#0f172a" }}>Shop project materials</h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.55 }}>
            Open a third-party supplier to compare materials, availability, and current pricing while building the estimate.
          </p>
        </div>
        <span style={externalBadgeStyle}>External stores</span>
      </div>

      <div style={gridStyle}>
        {retailers.map((retailer) => (
          <a
            key={retailer.name}
            href={retailer.href}
            target="_blank"
            rel="noopener noreferrer"
            style={cardStyle}
            aria-label={`Shop ${retailer.name} in a new tab`}
            onClick={() => trackAnalyticsEvent("material_store_open", { retailer: retailer.name })}
          >
            <strong style={{ color: "#0f172a", fontSize: 16 }}>{retailer.name}</strong>
            <span style={{ color: "#64748b", lineHeight: 1.45 }}>{retailer.categories}</span>
            <span style={{ color: "#2563eb", fontWeight: 800 }}>Shop website ↗</span>
          </a>
        ))}
      </div>

      <p style={disclaimerStyle}>
        HomeLead Connect is not the seller. Product price, stock, delivery, warranties, returns, taxes, and purchase terms are controlled by the third-party retailer. Verify material specifications before adding costs to a LeadScope estimate.
      </p>
    </section>
  );
}

const sectionStyle = { width: "min(1100px, calc(100% - 32px))", margin: "0 auto 48px", boxSizing: "border-box" as const, padding: 24, border: "1px solid #dbe4ee", borderRadius: 20, background: "#ffffff", boxShadow: "0 12px 40px rgba(15,23,42,.06)", textAlign: "left" as const };
const headingStyle = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 14, marginBottom: 18 };
const eyebrowStyle = { margin: 0, color: "#2563eb", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const externalBadgeStyle = { padding: "7px 10px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 800 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))", gap: 12 };
const cardStyle = { display: "grid", gap: 7, minHeight: 132, boxSizing: "border-box" as const, padding: 16, border: "1px solid #e2e8f0", borderRadius: 14, background: "#f8fafc", textDecoration: "none" };
const disclaimerStyle = { margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: 13, lineHeight: 1.5 };
