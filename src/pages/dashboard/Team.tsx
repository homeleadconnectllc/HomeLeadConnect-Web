import { useEffect, useState, type FormEvent } from "react";
import {
  createWorkspaceInvitation,
  getWorkspaceTeam,
  listWorkspaceInvitations,
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
  type TeamMember,
  type WorkspaceInvitation,
} from "../../api/team";
import { errorMessage } from "../../lib/errorMessage";

function invitationState(invitation: WorkspaceInvitation) {
  if (invitation.revoked_at) return "Revoked";
  if (invitation.accepted_at) return "Accepted";
  if (new Date(invitation.expires_at).getTime() <= Date.now()) return "Expired";
  return "Pending";
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"manager" | "technician">("technician");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  async function load() {
    const [teamRows, invitationRows] = await Promise.all([getWorkspaceTeam(), listWorkspaceInvitations()]);
    setMembers(teamRows);
    setInvitations(invitationRows);
  }

  useEffect(() => {
    let active = true;
    Promise.all([getWorkspaceTeam(), listWorkspaceInvitations()])
      .then(([teamRows, invitationRows]) => {
        if (!active) return;
        setMembers(teamRows);
        setInvitations(invitationRows);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason, "Unable to load company team settings."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function invite(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true); setError(""); setMessage(""); setInviteLink("");
    try {
      const created = await createWorkspaceInvitation(email, role);
      const link = `${window.location.origin}/team/accept?token=${encodeURIComponent(created.invitation_token)}`;
      setInviteLink(link);
      setMessage(`Secure ${created.invited_role} invitation created for ${created.intended_email}. It expires in 24 hours.`);
      setEmail("");
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to create the team invitation."));
    } finally { setBusy(false); }
  }

  async function copyInvite() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setMessage("Invitation link copied. Send it only to the invited email address.");
    } catch {
      setMessage("Copy the invitation link from the field below and send it only to the invited email address.");
    }
  }

  async function removeMember(member: TeamMember) {
    if (busy || member.member_role === "owner") return;
    setBusy(true); setError(""); setMessage("");
    try {
      await removeWorkspaceMember(member.user_id);
      setMessage(`${member.full_name || member.email || "Team member"} removed from this workspace.`);
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to remove that team member."));
    } finally { setBusy(false); }
  }

  async function revoke(invitation: WorkspaceInvitation) {
    if (busy || invitationState(invitation) !== "Pending") return;
    setBusy(true); setError(""); setMessage("");
    try {
      await revokeWorkspaceInvitation(invitation.id);
      setMessage(`Invitation for ${invitation.intended_email} revoked.`);
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to revoke that invitation."));
    } finally { setBusy(false); }
  }

  return <main style={pageStyle}>
    <h1>Company team</h1>
    <p>Invite managers and technicians into this company workspace without sharing passwords. Invitations are email-bound, single-use, and expire after 24 hours.</p>
    {loading && <p role="status">Loading team…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

    {!loading && <>
      <section style={cardStyle} aria-labelledby="invite-team-heading">
        <h2 id="invite-team-heading">Invite a team member</h2>
        <form onSubmit={invite} style={{ display: "grid", gap: 10 }}>
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Role<select value={role} onChange={(event) => setRole(event.target.value as "manager" | "technician")}>
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
          </select></label>
          <button type="submit" disabled={busy || !email.trim()}>{busy ? "Working…" : "Create secure invitation"}</button>
        </form>
        {inviteLink && <div style={{ display: "grid", gap: 8 }}>
          <label>Secure invitation link<input readOnly value={inviteLink} onFocus={(event) => event.currentTarget.select()} /></label>
          <button type="button" onClick={() => void copyInvite()}>Copy invitation link</button>
        </div>}
      </section>

      <section style={cardStyle} aria-labelledby="team-members-heading">
        <h2 id="team-members-heading">Current members</h2>
        {members.length === 0 ? <p>No team members are visible.</p> : members.map((member) => <article key={member.user_id} style={rowStyle}>
          <div>
            <strong>{member.full_name || member.email || "Team member"}</strong>
            <div>{member.email || "Email unavailable"}</div>
            <small>{member.member_role} · joined {new Date(member.joined_at).toLocaleDateString()}</small>
          </div>
          {member.member_role !== "owner" && <button type="button" disabled={busy} onClick={() => void removeMember(member)}>Remove</button>}
        </article>)}
      </section>

      <section style={cardStyle} aria-labelledby="team-invitations-heading">
        <h2 id="team-invitations-heading">Invitations</h2>
        {invitations.length === 0 ? <p>No invitations yet.</p> : invitations.map((invitation) => {
          const state = invitationState(invitation);
          return <article key={invitation.id} style={rowStyle}>
            <div>
              <strong>{invitation.intended_email}</strong>
              <div>{invitation.role} · {state}</div>
              <small>Expires {new Date(invitation.expires_at).toLocaleString()}</small>
            </div>
            {state === "Pending" && <button type="button" disabled={busy} onClick={() => void revoke(invitation)}>Revoke</button>}
          </article>;
        })}
      </section>
    </>}
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "32px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "grid", gap: 12, marginTop: 20, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14, background: "#fff" };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: 12, border: "1px solid #e2e8f0", borderRadius: 10 };
