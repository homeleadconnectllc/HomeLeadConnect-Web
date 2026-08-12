import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { acceptPortalInvitation, type PortalRole } from "../../api/portals";
import AuthShell from "../../components/auth/AuthShell";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";

export default function AcceptInvitation() {
  const { session, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Validating your invitation…");
  const token = params.get("token")?.trim() ?? "";

  useEffect(() => {
    if (authLoading || !session || !token) return;
    let active = true;
    acceptPortalInvitation(token)
      .then((result) => {
        if (!active) return;
        const role: PortalRole = result.portal_role;
        setStatus("Invitation accepted. Opening your HLC portal…");
        navigate(role === "homeowner" ? "/homeowner-portal" : "/contractor-portal", { replace: true });
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, "Unable to accept this invitation."));
      });
    return () => { active = false; };
  }, [authLoading, navigate, session, token]);

  let content;
  if (!token) {
    content = <p role="alert" style={{ color: "#b91c1c" }}>This invitation link is incomplete. Ask the HLC business that invited you to send a new invitation.</p>;
  } else if (authLoading) {
    content = <p role="status">Checking your HLC account…</p>;
  } else if (!session) {
    content = <>
      <p>This invitation must be opened through the secure email link sent to the invited address.</p>
      <p>If the link expired, ask the HLC business that invited you to send a new invitation.</p>
    </>;
  } else {
    content = error
      ? <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>
      : <p role="status">{status}</p>;
  }

  const footer = !session && !authLoading
    ? <p><Link to="/login">Sign in to your HLC account</Link></p>
    : <p><Link to="/">Return to HomeLead Connect</Link></p>;

  return <AuthShell
    eyebrow="HomeLead Connect invitation"
    title="Join your HLC portal"
    description="One secure invitation connects your existing HLC account to the homeowner or professional portal assigned to you."
    footer={footer}
  >
    {content}
  </AuthShell>;
}
