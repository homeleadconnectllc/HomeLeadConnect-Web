const products = [
  { name: "HLC Signature Cap", category: "Apparel", note: "Embroidered HomeLead Connect cap fulfilled and shipped by the connected merchandise partner." },
  { name: "HLC Performance Polo", category: "Apparel", note: "Professional navy work polo for events, field visits and team use." },
  { name: "HLC Everyday Tee", category: "Apparel", note: "HomeLead Connect branded everyday shirt in the approved navy/blue system." },
  { name: "HLC Coffee Mug", category: "Home + Office", note: "Branded mug produced on demand and shipped directly to the purchaser." },
  { name: "HLC Business Cards", category: "Business Tools", note: "Branded cards with contact information and optional HLC QR destination." },
  { name: "HLC QR Connect Cards", category: "Business Tools", note: "Scannable handout cards that can route people to approved HLC web destinations." },
  { name: "HLC QR Counter Sign", category: "Business Tools", note: "Small branded QR display for events, desks and partner locations." },
  { name: "HLC Welcome Pack", category: "Bundles", note: "A future bundled set of approved HLC merchandise fulfilled by the connected partner." },
] as const;

function configuredStoreUrl() {
  const value = import.meta.env.VITE_HLC_MERCH_STORE_URL as string | undefined;
  return value?.trim() || "";
}

export default function CommunityStore() {
  const storeUrl = configuredStoreUrl();

  return (
    <section className="hlc-community-store" aria-labelledby="hlc-store-heading">
      <div className="hlc-community-store-head">
        <div>
          <p className="hlc-community-store-eyebrow">HLC STORE · THIRD-PARTY FULFILLMENT</p>
          <h2 id="hlc-store-heading">HomeLead Connect gear + business tools</h2>
          <p>
            HLC can present the storefront and brand experience without holding inventory. Physical products are intended to be printed,
            packed and shipped by the connected fulfillment partner after checkout.
          </p>
        </div>
        <span className={`hlc-community-store-status ${storeUrl ? "is-live" : "is-pending"}`}>
          {storeUrl ? "Storefront connected" : "Fulfillment checkout connecting"}
        </span>
      </div>

      <div className="hlc-community-store-grid">
        {products.map((product) => (
          <article className="hlc-community-product" key={product.name}>
            <span>{product.category}</span>
            <div className="hlc-community-product-mark" aria-hidden="true">HLC</div>
            <h3>{product.name}</h3>
            <p>{product.note}</p>
            {storeUrl ? (
              <a href={storeUrl} target="_blank" rel="noreferrer">Shop through fulfillment partner</a>
            ) : (
              <p className="hlc-community-product-checkout-status" role="status">
                Checkout unavailable · storefront connection pending
              </p>
            )}
          </article>
        ))}
      </div>

      <p className="hlc-community-store-disclosure">
        HLC does not represent an item as stocked, printed, shipped or delivered until the connected third-party fulfillment provider supplies that evidence.
        Product availability, price, tax, shipping and return terms must come from the active storefront/fulfillment configuration.
      </p>
    </section>
  );
}
