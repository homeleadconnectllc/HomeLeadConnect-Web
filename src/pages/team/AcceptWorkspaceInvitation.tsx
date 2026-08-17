import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { acceptWorkspaceInvitation, type AcceptedWorkspaceInvitation } from "../../api/team";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";

export default function AcceptWorkspaceInvitation() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState<AcceptedWorkspaceInvitation | null>(null);
  const token = new URLSearchParams(location.search).get("token")?.trim() || "";
  const next = `${location.pathname}${location.search}`;
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const registerHref = `/register?next=${encodeURIComponent(next)}`;

  async function accept() {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      const result = await acceptWorkspaceInvitation(token);
      setAccepted(result);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to accept this company invitation."));
    } finally { setBusy(false); }
  }

  return <main style={pageStyle}>
    <section style={cardStyle}>
      <p style={{ fontWeight: 900, letterSpacing: ".05em", textTransform: "uppercase", margin: 0 }}>HomeLead Connect</p>
      <h1>Company workspace invitation</h1>
      {!token && <p role="alert" style={{ color: "#b91c1c" }}>This invitation link is incomplete. Ask the company administrator for a new link.</p>}
      {loading && <p role="status">Checking your HLC session…</p>}
      {!loading && token && !session && <>
        <p>Sign in with the exact email address that received this invitation. If you do not have an HLC account yet, create one first.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to={loginHref}>Sign in to accept</Link>
          <Link to={registerHref}>Create an HLC account</Link>
        </div>
      </>}
      {!loading && token && session && !accepted && <>
        <p>This invitation is email-bound, single-use, and checked again by HLC before workspace access is granted.</p>
        <button type="button" disabled={busy} onClick={() => void accept()}>{busy ? "Accepting invitation…" : "Accept company invitation"}</button>
      </>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {accepted && <>
        <p role="status" style={{ color: "#166534" }}><strong>Invitation accepted.</strong> You now have {accepted.member_role} access to {accepted.workspace_name}.</p>
        <Link to="/dashboard">Open company dashboard</Link>
      </>}
    </section>
  </main>;
}

const pageStyle = { width: "min(720px, calc(100% - 32px))", margin: "48px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "grid", gap: 14, padding: 24, border: "1px solid #e2e8f0", borderRadius: 16, background: "#fff" };
