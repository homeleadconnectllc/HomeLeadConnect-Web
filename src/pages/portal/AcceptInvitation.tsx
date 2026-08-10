import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { acceptPortalInvitation, type PortalRole } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../hooks/useAuth";

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
        setStatus("Invitation accepted. Opening your portal…");
        navigate(role === "homeowner" ? "/homeowner-portal" : "/contractor-portal", { replace: true });
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, "Unable to accept this invitation."));
      });
    return () => { active = false; };
  }, [authLoading, navigate, session, token]);

  if (!token) return <main style={pageStyle}><h1>Portal invitation</h1><p role="alert">This invitation link is incomplete.</p></main>;
  if (authLoading) return <main style={pageStyle}><p>Checking your sign-in…</p></main>;
  if (!session) return (
    <main style={pageStyle}>
      <h1>Portal invitation</h1>
      <p>This invitation requires the email magic link sent to the invited address.</p>
      <p>If that link expired, ask the HLC business that invited you to send a new invitation.</p>
      <Link to="/login">Business CRM login</Link>
    </main>
  );
  return <main style={pageStyle}><h1>Portal invitation</h1>{error ? <p role="alert" style={{ color: "#b91c1c" }}>{error}</p> : <p role="status">{status}</p>}</main>;
}

const pageStyle = { width: "min(720px, calc(100% - 48px))", margin: "48px auto", fontFamily: "system-ui, sans-serif" };
