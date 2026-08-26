import { Link } from "react-router-dom";
import type { BillingStatus } from "../../api/billing";
import type { IntegrationEvidence } from "../../api/integrations";
import type { BusinessPhone } from "../../api/telephony";

type Props = {
  businessPhones: BusinessPhone[];
  phoneError: string;
  billingEnabled: boolean;
  billing: BillingStatus | null;
  billingError: string;
  integrationEvidence: IntegrationEvidence | null;
  integrationError: string;
};

type ConnectionState = "Connected" | "Needs attention" | "Available" | "Setup required" | "Not verified";

type ConnectionRow = {
  name: string;
  category: string;
  state: ConnectionState;
  detail: string;
  actionLabel?: string;
  actionTo?: string;
};

export default function IntegrationsConnectionsPanel({ businessPhones, phoneError, billingEnabled, billing, billingError, integrationEvidence, integrationError }: Props) {
  const readyPhones = businessPhones.filter((phone) => phone.readiness_state === "ready" || phone.verification_state === "verified");
  const emailConnection = integrationEvidence?.providerConnections.find((connection) => connection.channel === "email");
  const latestEmail = integrationEvidence?.emailTransmissions[0];
  const calendarMappings = integrationEvidence?.calendarMappings || [];
  const failedCalendarMappings = calendarMappings.filter((mapping) => mapping.sync_state === "failed").length;
  const syncedCalendarMappings = calendarMappings.filter((mapping) => mapping.sync_state === "synced").length;

  const emailState: ConnectionState = integrationError
    ? "Needs attention"
    : emailConnection?.status === "connected"
      ? "Connected"
      : emailConnection
        ? "Not verified"
        : "Setup required";
  const emailDetail = integrationError || (emailConnection?.status === "connected"
    ? `Workspace email provider: ${emailConnection.provider_name}. ${latestEmail ? `Latest recorded transmission: ${latestEmail.status}.` : "No email transmission has been recorded yet."} ${integrationEvidence?.providerEventCount ? `${integrationEvidence.providerEventCount} provider delivery event${integrationEvidence.providerEventCount === 1 ? "" : "s"} recorded.` : "Provider delivery-event proof is still pending."}`
    : emailConnection
      ? `Email provider ${emailConnection.provider_name} is recorded with status ${emailConnection.status}; automatic delivery is not certified.`
      : "No workspace email provider connection is recorded.");

  const calendarState: ConnectionState = integrationError
    ? "Needs attention"
    : failedCalendarMappings > 0
      ? "Needs attention"
      : syncedCalendarMappings > 0
        ? "Connected"
        : "Available";
  const calendarDetail = integrationError || (failedCalendarMappings > 0
    ? `${failedCalendarMappings} Google Calendar mapping${failedCalendarMappings === 1 ? "" : "s"} currently report a failed sync state.`
    : syncedCalendarMappings > 0
      ? `${syncedCalendarMappings} appointment mapping${syncedCalendarMappings === 1 ? " is" : "s are"} recorded as synced with Google Calendar.`
      : "The authenticated Google Calendar sync adapter is installed, but no persisted appointment-to-calendar mapping has been recorded for this workspace yet. User OAuth and bidirectional reconciliation are not claimed.");

  const rows: ConnectionRow[] = [
    {
      name: "Phone / SMS providers",
      category: "Communications",
      state: phoneError ? "Needs attention" : readyPhones.length > 0 ? "Connected" : businessPhones.length > 0 ? "Not verified" : "Setup required",
      detail: phoneError || (businessPhones.length > 0 ? `${businessPhones.length} configured line${businessPhones.length === 1 ? "" : "s"}; capability state comes from the provider records.` : "No business phone provider is currently verified for this workspace."),
      actionLabel: "Open Call Center",
      actionTo: "/call-center",
    },
    {
      name: "Stripe",
      category: "Payments & Billing",
      state: billingError ? "Needs attention" : !billingEnabled ? "Setup required" : billing ? "Connected" : "Not verified",
      detail: billingError || (billing ? `Workspace subscription state: ${billing.status}.` : billingEnabled ? "Billing is enabled but no authoritative workspace subscription state has been loaded." : "Stripe billing is disabled in this environment."),
      actionLabel: "Open Billing",
      actionTo: "/settings/billing",
    },
    {
      name: "Email delivery",
      category: "Communications",
      state: emailState,
      detail: emailDetail,
      actionLabel: "Open Messages",
      actionTo: "/messages",
    },
    {
      name: "Google Calendar sync",
      category: "Calendar & Scheduling",
      state: calendarState,
      detail: calendarDetail,
      actionLabel: "Open Calendar",
      actionTo: "/calendar",
    },
    {
      name: "HLC document storage",
      category: "Storage & Documents",
      state: "Connected",
      detail: "Private HLC document storage is already used for authorized record-linked uploads and signed download URLs. External Drive/Dropbox-style synchronization is a separate future connection.",
      actionLabel: "Open Documents",
      actionTo: "/documents",
    },
    {
      name: "OCR / document processing",
      category: "Storage & Documents",
      state: "Setup required",
      detail: "Scan source capture is available. OCR, invoice extraction, and receipt extraction remain review-gated foundations until a trusted processor is installed and verified.",
      actionLabel: "Open Scan Capture",
      actionTo: "/documents/scan",
    },
    {
      name: "Maps / routing",
      category: "Maps & Location",
      state: "Not verified",
      detail: "Provider-map location evidence exists, but this control plane does not yet have a provider-health contract for geocoding, routing, dispatch, or address autocomplete.",
      actionLabel: "Open Map",
      actionTo: "/map",
    },
    {
      name: "API & webhooks",
      category: "Automation",
      state: integrationEvidence?.providerEventCount ? "Connected" : "Available",
      detail: integrationEvidence?.providerEventCount ? `${integrationEvidence.providerEventCount} provider webhook event${integrationEvidence.providerEventCount === 1 ? "" : "s"} are persisted for this workspace.` : "Signed webhook handlers exist for selected platform providers, but no workspace provider-event evidence is currently recorded here.",
      actionLabel: "Open Automations",
      actionTo: "/automations",
    },
  ];

  const connectedCount = rows.filter((row) => row.state === "Connected").length;
  const attentionCount = rows.filter((row) => row.state === "Needs attention").length;

  return <section className="hlc-settings-section" aria-labelledby="integrations-connections-heading">
    <div className="hlc-account-section-head">
      <div><span>CONNECTIONS</span><h2 id="integrations-connections-heading">Integrations & Connections</h2></div>
      <strong>{connectedCount} connected · {attentionCount} attention</strong>
    </div>
    <p>Connect external services once, then use their capabilities from the HLC workflow where the work happens. Statuses below are evidence-based; HLC does not label an integration connected unless the current app can prove it.</p>
    <div className="hlc-phone-list" aria-label="Integration connection status">
      {rows.map((row) => <article className="hlc-phone-row" key={row.name}>
        <div>
          <strong>{row.name}</strong>
          <span>{row.category} · {row.state}</span>
          <small>{row.detail}</small>
        </div>
        {row.actionTo && row.actionLabel && <Link to={row.actionTo}>{row.actionLabel}</Link>}
      </article>)}
    </div>
    <small>Secrets, provider tokens, signing keys, and service-role credentials stay server-side. Connection health and permissions are separate from subscription entitlement.</small>
  </section>;
}
