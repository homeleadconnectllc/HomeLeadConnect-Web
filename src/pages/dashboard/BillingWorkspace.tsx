import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBillingOffer,
  getBillingStatus,
  openBillingPortal,
  startSubscriptionCheckout,
  type BillingOffer,
  type BillingStatus,
} from "../../api/billing";
import { errorMessage } from "../../lib/errorMessage";

function money(offer: BillingOffer) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: offer.currency.toUpperCase(),
  }).format(offer.price_cents / 100);
}

function dateLabel(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid provider date" : date.toLocaleDateString();
}

export default function BillingWorkspace() {
  const billingEnabled = import.meta.env.VITE_BILLING_ENABLED === "true";
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [offer, setOffer] = useState<BillingOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"checkout" | "portal" | "refresh" | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    if (!billingEnabled) {
      setLoading(false);
      return;
    }
    try {
      const [status, currentOffer] = await Promise.all([getBillingStatus(), getBillingOffer()]);
      setBilling(status);
      setOffer(currentOffer);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to verify workspace billing."));
    } finally {
      setLoading(false);
    }
  }, [billingEnabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const price = useMemo(() => offer ? `${money(offer)} / ${offer.interval}` : "Unavailable", [offer]);
  const state = !billingEnabled ? "disabled" : billing?.status || "not enrolled";
  const canStart = billingEnabled && Boolean(offer) && !billing?.is_active && !error;

  async function run(kind: "checkout" | "portal" | "refresh", action: () => Promise<void>) {
    setBusy(kind);
    setError("");
    try {
      await action();
    } catch (reason) {
      setError(errorMessage(reason, "Billing action is currently unavailable."));
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <main className="hlc-account-workspace"><p role="status">Loading authoritative billing state…</p></main>;
  }

  return <main className="hlc-account-workspace">
    <header className="hlc-account-header">
      <div>
        <p className="hlc-account-kicker">FINANCE · BILLING</p>
        <h1>Subscription & billing control</h1>
        <p>Review the workspace plan, Stripe-backed subscription state, billing dates, and supported billing actions from one operating view.</p>
      </div>
      <div className="hlc-account-summary">
        <span><strong>{state}</strong><small>Provider-backed status</small></span>
        <span><strong>{price}</strong><small>Authoritative offer</small></span>
        <span><strong>{billing?.is_active ? "Active" : "Inactive"}</strong><small>Workspace access plan</small></span>
      </div>
    </header>

    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

    <div className="hlc-settings-ledger">
      <section className="hlc-settings-section" aria-labelledby="billing-plan-heading">
        <div className="hlc-account-section-head">
          <div><span>PLAN</span><h2 id="billing-plan-heading">HLC workspace plan</h2></div>
          <strong>{billing?.plan_key || offer?.key || "unverified"}</strong>
        </div>
        {offer ? <>
          <p><strong>{offer.name}</strong> · {price}</p>
          <p>The HLC launch offer begins with a 14-day free trial. A payment method is required. Unless cancelled before the trial ends, Stripe begins paid billing at the authoritative plan rate.</p>
        </> : <p>No authoritative active HLC offer could be loaded, so enrollment is unavailable.</p>}
      </section>

      <section className="hlc-settings-section" aria-labelledby="billing-state-heading">
        <div className="hlc-account-section-head">
          <div><span>SUBSCRIPTION</span><h2 id="billing-state-heading">Current provider state</h2></div>
          <strong>{state}</strong>
        </div>
        {billing ? <div className="hlc-phone-list">
          <article className="hlc-phone-row"><div><strong>Trial end</strong><span>{dateLabel(billing.trial_end)}</span></div><small>Recorded subscription trial boundary</small></article>
          <article className="hlc-phone-row"><div><strong>Current period end</strong><span>{dateLabel(billing.current_period_end)}</span></div><small>{billing.cancel_at_period_end ? "Cancellation is scheduled for period end" : "No period-end cancellation recorded"}</small></article>
          <article className="hlc-phone-row"><div><strong>Grace period end</strong><span>{dateLabel(billing.grace_period_end)}</span></div><small>Only shown when recorded by workspace billing state</small></article>
        </div> : <p>No authoritative Stripe subscription is recorded for this workspace.</p>}
      </section>

      <section className="hlc-settings-section" aria-labelledby="billing-actions-heading">
        <div className="hlc-account-section-head">
          <div><span>ACTIONS</span><h2 id="billing-actions-heading">Provider-backed controls</h2></div>
          <small>Stripe-hosted</small>
        </div>
        {!billingEnabled ? <p><strong>Setup required:</strong> Stripe launch billing is not enabled in this environment.</p> : <>
          {canStart && <label className="hlc-billing-consent">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>I agree to begin a 14-day free trial with a payment method. Unless cancelled before the trial ends, this workspace will be charged {price}. Billing can be managed through the Stripe portal.</span>
          </label>}
          <div className="hlc-account-inline-links">
            {canStart && <button type="button" disabled={!consent || busy !== null} onClick={() => void run("checkout", startSubscriptionCheckout)}>{busy === "checkout" ? "Opening Checkout…" : "Start 14-day trial"}</button>}
            {billing && <button type="button" disabled={busy !== null} onClick={() => void run("portal", openBillingPortal)}>{busy === "portal" ? "Opening Stripe…" : "Manage billing with Stripe"}</button>}
            <button type="button" disabled={busy !== null} onClick={() => void run("refresh", load)}>{busy === "refresh" ? "Refreshing…" : "Refresh billing state"}</button>
          </div>
        </>}
        <small>Card details and provider credentials remain with Stripe and the trusted server integration; this page does not collect payment-card data.</small>
      </section>

      <section className="hlc-settings-section" aria-labelledby="billing-links-heading">
        <div className="hlc-account-section-head"><div><span>ACCOUNT</span><h2 id="billing-links-heading">Related controls</h2></div></div>
        <nav className="hlc-account-inline-links">
          <Link to="/settings">Workspace settings</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/hq/system-health">System health</Link>
        </nav>
      </section>
    </div>
  </main>;
}
