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

  const pendingInvitations = invitations.filter((invitation) => invitationState(invitation) === "Pending").length;

  return <main className="hlc-account-workspace hlc-team-workspace">
    <header className="hlc-account-header">
      <div><p className="hlc-account-kicker">ACCESS · TEAM</p><h1>Company team</h1><p>Invite managers and technicians into this company workspace without sharing passwords. Invitations are email-bound, single-use, and expire after 24 hours.</p></div>
      <div className="hlc-account-summary"><span><strong>{members.length}</strong><small>Current members</small></span><span><strong>{pendingInvitations}</strong><small>Pending invitations</small></span><span><strong>2</strong><small>Assignable roles</small></span></div>
    </header>
    {loading && <p role="status">Loading team…</p>}
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}
    {message && <p role="status" className="hlc-account-status is-success">{message}</p>}

    {!loading && <>
      <section className="hlc-settings-section hlc-team-invite" aria-labelledby="invite-team-heading">
        <div className="hlc-account-section-head"><div><span>SECURE INVITATION</span><h2 id="invite-team-heading">Invite a team member</h2></div><small>Expires in 24 hours</small></div>
        <form onSubmit={invite} className="hlc-account-field-grid">
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Role<select value={role} onChange={(event) => setRole(event.target.value as "manager" | "technician")}>
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
          </select></label>
          <div className="hlc-account-form-actions is-wide"><span>Only the intended email can accept this invitation.</span><button type="submit" disabled={busy || !email.trim()}>{busy ? "Working…" : "Create secure invitation"}</button></div>
        </form>
        {inviteLink && <div className="hlc-team-invite-link">
          <label>Secure invitation link<input readOnly value={inviteLink} onFocus={(event) => event.currentTarget.select()} /></label>
          <button type="button" onClick={() => void copyInvite()}>Copy invitation link</button>
        </div>}
      </section>

      <div className="hlc-team-ledger">
      <section className="hlc-settings-section" aria-labelledby="team-members-heading">
        <div className="hlc-account-section-head"><div><span>MEMBERSHIP</span><h2 id="team-members-heading">Current members</h2></div><strong>{members.length}</strong></div>
        {members.length === 0 ? <p>No team members are visible.</p> : members.map((member) => <article key={member.user_id} className="hlc-team-row">
          <div>
            <strong>{member.full_name || member.email || "Team member"}</strong>
            <div>{member.email || "Email unavailable"}</div>
            <small>{member.member_role} · joined {new Date(member.joined_at).toLocaleDateString()}</small>
          </div>
          {member.member_role !== "owner" && <button type="button" disabled={busy} onClick={() => void removeMember(member)}>Remove</button>}
        </article>)}
      </section>

      <section className="hlc-settings-section" aria-labelledby="team-invitations-heading">
        <div className="hlc-account-section-head"><div><span>INVITATION REGISTER</span><h2 id="team-invitations-heading">Invitations</h2></div><strong>{invitations.length}</strong></div>
        {invitations.length === 0 ? <p>No invitations yet.</p> : invitations.map((invitation) => {
          const state = invitationState(invitation);
          return <article key={invitation.id} className="hlc-team-row">
            <div>
              <strong>{invitation.intended_email}</strong>
              <div>{invitation.role} · {state}</div>
              <small>Expires {new Date(invitation.expires_at).toLocaleString()}</small>
            </div>
            {state === "Pending" && <button type="button" disabled={busy} onClick={() => void revoke(invitation)}>Revoke</button>}
          </article>;
        })}
      </section>
      </div>
    </>}
  </main>;
}
