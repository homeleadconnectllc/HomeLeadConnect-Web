import { trackAnalyticsEvent } from "../../api/analytics";
import { Link } from "react-router-dom";

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
    <section aria-labelledby="leadscope-material-shopping" className="hlc-ui-section-6e03bb">
      <div className="hlc-ui-heading-2fa939">
        <div>
          <p className="hlc-ui-eyebrow-0f6b46">LeadScope material sourcing</p>
          <h2 id="leadscope-material-shopping" className="hlc-ui-material-shop-links-16a33d">Shop project materials</h2>
          <p className="hlc-ui-material-shop-links-4ee3af">
            Open a third-party supplier to compare materials, availability, and current pricing while building the estimate.
          </p>
        </div>
        <span className="hlc-ui-externalBadge-7cf346">External stores</span>
      </div>

      <div className="hlc-ui-grid-32964a">
        {retailers.map((retailer) => (
          <a
            key={retailer.name}
            href={retailer.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hlc-ui-card-61e0ca"
            aria-label={`Shop ${retailer.name} in a new tab`}
            onClick={() => trackAnalyticsEvent("material_store_open", { retailer: retailer.name })}
          >
            <strong className="hlc-ui-material-shop-links-8cbf07">{retailer.name}</strong>
            <span className="hlc-ui-material-shop-links-953ace">{retailer.categories}</span>
            <span className="hlc-ui-material-shop-links-6555ce">Shop website ↗</span>
          </a>
        ))}
      </div>

      <p className="hlc-ui-disclaimer-c1a35a">
        HomeLead Connect is not the seller. Product price, stock, delivery, warranties, returns, taxes, and purchase terms are controlled by the third-party retailer. Verify material specifications before adding costs to a LeadScope estimate.
      </p>
      <p className="hlc-ui-margin-bottom-fa769a"><Link to="/resources/materials" className="hlc-ui-font-weight-52ee95">Open the HLC material plan →</Link></p>
    </section>
  );
}
