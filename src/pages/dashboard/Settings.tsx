import { useEffect, useState, type FormEvent } from "react";
import {
  getBusinessProfile,
  getMyProfile,
  listMyWorkspaces,
  saveBusinessProfile,
  switchCurrentWorkspace,
  updateMyProfile,
  type WorkspaceOption,
} from "../../api/settings";
import { errorMessage } from "../../lib/errorMessage";
import {
  getBillingOffer,
  getBillingStatus,
  openBillingPortal,
  startSubscriptionCheckout,
  type BillingOffer,
  type BillingStatus,
} from "../../api/billing";
import { listBusinessPhones, type BusinessPhone } from "../../api/telephony";
import { Link } from "react-router-dom";

const blankBusiness = {
  business_name: "", owner_name: "", phone: "", email: "", website: "",
  address: "", city: "", state: "", zip: "",
};

function formatBillingOffer(offer: BillingOffer) {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: offer.currency.toUpperCase(),
  }).format(offer.price_cents / 100);
  return `${amount} per ${offer.interval}`;
}

export default function Settings() {
  const billingEnabled = import.meta.env.VITE_BILLING_ENABLED === "true";
  const [personal, setPersonal] = useState({ fullName: "", avatarUrl: "", role: "" });
  const [business, setBusiness] = useState(blankBusiness);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"personal" | "business" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [billingOffer, setBillingOffer] = useState<BillingOffer | null>(null);
  const [billingConsent, setBillingConsent] = useState(false);
  const [businessPhones, setBusinessPhones] = useState<BusinessPhone[]>([]);

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getBusinessProfile(),
      listMyWorkspaces(),
      billingEnabled ? getBillingStatus() : Promise.resolve(null),
      listBusinessPhones().catch(() => []),
      billingEnabled ? getBillingOffer() : Promise.resolve(null),
    ])
      .then(([profile, businessProfile, workspaceOptions, billingStatus, phoneRows, offer]) => {
        setBilling(billingStatus);
        setBillingOffer(offer);
        setBusinessPhones(phoneRows);
        setWorkspaceId(profile.workspace_id);
        setWorkspaces(workspaceOptions);
        setPersonal({
          fullName: profile.full_name || "",
          avatarUrl: profile.avatar_url || "",
          role: profile.role,
        });
        if (businessProfile) {
          setBusiness({
            business_name: businessProfile.business_name || "",
            owner_name: businessProfile.owner_name || "",
            phone: businessProfile.phone || "",
            email: businessProfile.email || "",
            website: businessProfile.website || "",
            address: businessProfile.address || "",
            city: businessProfile.city || "",
            state: businessProfile.state || "",
            zip: businessProfile.zip || "",
          });
        }
      })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load settings.")))
      .finally(() => setLoading(false));
  }, [billingEnabled]);

  async function savePersonal(event: FormEvent) {
    event.preventDefault();
    await run("personal", async () => {
      const updated = await updateMyProfile(personal);
      setPersonal((current) => ({ ...current, fullName: updated.full_name || "", avatarUrl: updated.avatar_url || "" }));
    }, "Personal profile saved.");
  }

  async function changeWorkspace(event: FormEvent) {
    event.preventDefault();
    await run("personal", async () => {
      await switchCurrentWorkspace(workspaceId);
      window.location.assign("/dashboard");
    }, "Workspace switched.");
  }

  async function saveBusiness(event: FormEvent) {
    event.preventDefault();
    await run("business", async () => {
      const updated = await saveBusinessProfile(business);
      setBusiness({
        business_name: updated.business_name || "", owner_name: updated.owner_name || "",
        phone: updated.phone || "", email: updated.email || "", website: updated.website || "",
        address: updated.address || "", city: updated.city || "", state: updated.state || "", zip: updated.zip || "",
      });
    }, "Business profile saved.");
  }

  async function run(kind: "personal" | "business", action: () => Promise<void>, success: string) {
    setBusy(kind); setError(""); setMessage("");
    try { await action(); setMessage(success); }
    catch (reason) { setError(errorMessage(reason, "Unable to save settings.")); }
    finally { setBusy(null); }
  }

  async function billingAction(action: () => Promise<void>) {
    setError(""); setMessage("");
    try { await action(); }
    catch (reason) { setError(errorMessage(reason, "Billing is currently unavailable.")); }
  }

  if (loading) return <main style={pageStyle}><p>Loading settings…</p></main>;

  const billingOfferLabel = billingOffer ? formatBillingOffer(billingOffer) : null;

  return <main style={pageStyle}>
    <h1>Profile and business settings</h1>
    <p>Manage the profile fields already supported by your HLC workspace.</p>
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {message && <p role="status" style={successStyle}>{message}</p>}

    <form onSubmit={changeWorkspace} style={cardStyle}>
      <h2>Current workspace</h2>
      <label>Workspace<select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)}>
        {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
      </select></label>
      <button disabled={busy !== null || !workspaceId} type="submit">Switch workspace</button>
      <p>Only workspaces linked to your authenticated membership are listed.</p>
    </form>

    <form onSubmit={savePersonal} style={cardStyle}>
      <h2>Personal profile</h2>
      <label>Full name<input value={personal.fullName} onChange={(event) => setPersonal({ ...personal, fullName: event.target.value })} /></label>
      <label>Avatar URL<input type="url" value={personal.avatarUrl} onChange={(event) => setPersonal({ ...personal, avatarUrl: event.target.value })} /></label>
      <p><strong>Workspace role:</strong> {personal.role}</p>
      <button disabled={busy !== null} type="submit">{busy === "personal" ? "Saving…" : "Save personal profile"}</button>
    </form>

    <form onSubmit={saveBusiness} style={cardStyle}>
      <h2>Business profile</h2>
      {Object.entries({ business_name: "Business name", owner_name: "Owner name", phone: "Phone", email: "Email", website: "Website", address: "Street address", city: "City", state: "State", zip: "ZIP" }).map(([field, label]) =>
        <label key={field}>{label}<input
          type={field === "email" ? "email" : field === "website" ? "url" : field === "phone" ? "tel" : "text"}
          value={business[field as keyof typeof business]}
          onChange={(event) => setBusiness({ ...business, [field]: event.target.value })}
        /></label>
      )}
      <button disabled={busy !== null} type="submit">{busy === "business" ? "Saving…" : "Save business profile"}</button>
    </form>

    <section style={cardStyle} aria-labelledby="phone-settings-heading">
      <h2 id="phone-settings-heading">Business phone numbers</h2>
      <p>Phone numbers belong to this workspace. Provider readiness determines which calling and messaging actions are available.</p>
      {businessPhones.length === 0 ? <p><strong>Phone provider setup required.</strong></p> : businessPhones.map((phone) => <article key={phone.id}>
        <strong>{phone.display_name}: {phone.phone_number}</strong>
        <p>{phone.provider_type} · {phone.readiness_state} · {phone.verification_state}{phone.is_primary ? " · Primary" : ""}</p>
        <small>
          {phone.inbound_enabled ? "Inbound enabled" : "Inbound unavailable"} · {phone.outbound_enabled ? "Outbound enabled" : "Outbound unavailable"} · {phone.sms_enabled ? "SMS enabled" : "SMS unavailable"} · {phone.browser_calling_enabled ? "Browser calling enabled" : "Browser calling unavailable"}
        </small>
      </article>)}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link to="/manual-communications">Google Voice manual logging</Link>
        <Link to="/call-center">Open call center</Link>
      </div>
      <p><small>Provider credentials are configured only in the trusted server environment, never in workspace settings.</small></p>
    </section>

    <section style={cardStyle}>
      <h2>Billing</h2>
      {billingEnabled && billingOfferLabel ? <>
        <p><strong>{billingOffer?.name}:</strong> {billingOfferLabel} after a 14-day free trial.</p>
        <p>A payment method is required to begin the trial. No charge is made until the trial ends. Cancellation of a paid subscription takes effect at the end of the current billing period.</p>
      </> : billingEnabled ? <p><strong>Setup required:</strong> The authoritative HLC billing offer is unavailable, so enrollment is disabled.</p> : null}
      {!billing?.is_active && billingEnabled && billingOfferLabel && <label><input type="checkbox" checked={billingConsent} onChange={(event) => setBillingConsent(event.target.checked)} /> I agree to begin a 14-day free trial with a payment method. Unless cancelled before the trial ends, the workspace will be charged {billingOfferLabel}. I can cancel online through the Stripe billing portal.</label>}
      {billing ? <p>Workspace billing state: <strong>{billing.status}</strong>{billing.trial_end ? ` · Trial ends ${new Date(billing.trial_end).toLocaleDateString()}` : ""}{billing.current_period_end ? ` · Current period ends ${new Date(billing.current_period_end).toLocaleDateString()}` : ""}</p>
        : <p>No authoritative Stripe subscription is recorded for this workspace.</p>}
      {billingEnabled ? <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {!billing?.is_active && <button disabled={!billingConsent || !billingOfferLabel} type="button" onClick={() => billingAction(startSubscriptionCheckout)}>Start 14-day trial</button>}
        {billing && <button type="button" onClick={() => billingAction(openBillingPortal)}>Manage billing with Stripe</button>}
      </div> : <p><strong>Setup required:</strong> Stripe launch billing is not enabled in this environment.</p>}
    </section>
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "32px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "grid", gap: 12, marginTop: 24, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const errorStyle = { color: "#b91c1c" };
const successStyle = { color: "#166534" };
