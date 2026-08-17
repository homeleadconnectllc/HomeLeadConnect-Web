import { useState } from "react";
import { sendPortalInvitation, type PortalRole } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";
import { UserRoundPlus } from "lucide-react";

export default function PortalInviteButton({ role, targetId, email, label }: {
  role: PortalRole;
  targetId: string | number;
  email: string | null;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function invite() {
    if (!email) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await sendPortalInvitation(role, targetId, email);
      setMessage(`Invitation sent to ${email}.`);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to send the portal invitation."));
    } finally { setBusy(false); }
  }

  return <div>
    <button type="button" disabled={busy || !email} onClick={invite}>
      <UserRoundPlus size={16} aria-hidden="true" />{busy ? "Sending invitation…" : label}
    </button>
    {!email && <small> Add an email address before inviting.</small>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
  </div>;
}
