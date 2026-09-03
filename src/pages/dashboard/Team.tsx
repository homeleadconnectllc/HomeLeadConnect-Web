import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
  const managers = members.filter((member) => member.member_role === "owner" || member.member_role === "manager").length;

  return <main className="hlc-account-workspace">
    <header className="hlc-account-header">
      <div>
        <p className="hlc-account-kicker">ACCOUNT · TEAM</p>
        <h1>Team & workspace access</h1>
        <p>Manage who can enter this HomeLead Connect workspace, which operational role they receive, and which invitations are still outstanding.</p>
      </div>
      <div className="hlc-account-summary">
        <span><strong>{members.length}</strong><small>Current members</small></span>
        <span><strong>{managers}</strong><small>Owners & managers</small></span>
        <span><strong>{pendingInvitations}</strong><small>Pending invitations</small></span>
      </div>
    </header>

    {loading && <p role="status" className="hlc-account-status">Loading team…</p>}
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}
    {message && <p role="status" className="hlc-account-status is-success">{message}</p>}

    {!loading && <div className="hlc-settings-ledger">
      <section className="hlc-settings-section" aria-labelledby="invite-team-heading">
        <div className="hlc-account-section-head"><div><span>INVITE</span><h2 id="invite-team-heading">Invite a team member</h2></div><small>Email-bound · 24 hours</small></div>
        <p>Create a secure, single-use invitation instead of sharing passwords or workspace credentials.</p>
        <form onSubmit={invite} className="hlc-account-field-grid">
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Role<select value={role} onChange={(event) => setRole(event.target.value as "manager" | "technician")}>
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
          </select></label>
          <div className="hlc-account-form-actions"><span>Roles are enforced by workspace access controls.</span><button type="submit" disabled={busy || !email.trim()}>{busy ? "Working…" : "Create secure invitation"}</button></div>
        </form>
        {inviteLink && <div className="hlc-phone-list">
          <article className="hlc-phone-row"><div><strong>Secure invitation link</strong><span><input readOnly value={inviteLink} onFocus={(event) => event.currentTarget.select()} /></span></div><button type="button" onClick={() => void copyInvite()}>Copy link</button></article>
        </div>}
      </section>

      <section className="hlc-settings-section" aria-labelledby="team-members-heading">
        <div className="hlc-account-section-head"><div><span>MEMBERS</span><h2 id="team-members-heading">Current workspace members</h2></div><strong>{members.length}</strong></div>
        {members.length === 0 ? <p>No team members are visible.</p> : <div className="hlc-phone-list">{members.map((member) => <article key={member.user_id} className="hlc-phone-row">
          <div><strong>{member.full_name || member.email || "Team member"}</strong><span>{member.email || "Email unavailable"}</span></div>
          <small>{member.member_role} · joined {new Date(member.joined_at).toLocaleDateString()}</small>
          {member.member_role !== "owner" && <button type="button" disabled={busy} onClick={() => void removeMember(member)}>Remove</button>}
        </article>)}</div>}
      </section>

      <section className="hlc-settings-section" aria-labelledby="team-invitations-heading">
        <div className="hlc-account-section-head"><div><span>INVITATIONS</span><h2 id="team-invitations-heading">Invitation history</h2></div><strong>{pendingInvitations} pending</strong></div>
        {invitations.length === 0 ? <p>No invitations yet.</p> : <div className="hlc-phone-list">{invitations.map((invitation) => {
          const state = invitationState(invitation);
          return <article key={invitation.id} className="hlc-phone-row">
            <div><strong>{invitation.intended_email}</strong><span>{invitation.role} · {state}</span></div>
            <small>Expires {new Date(invitation.expires_at).toLocaleString()}</small>
            {state === "Pending" && <button type="button" disabled={busy} onClick={() => void revoke(invitation)}>Revoke</button>}
          </article>;
        })}</div>}
      </section>

      <section className="hlc-settings-section" aria-labelledby="team-related-heading">
        <div className="hlc-account-section-head"><div><span>ACCOUNT</span><h2 id="team-related-heading">Related controls</h2></div></div>
        <nav className="hlc-account-inline-links">
          <Link to="/settings">Account settings</Link>
          <Link to="/settings/workspace">Workspace profile</Link>
          <Link to="/settings/billing">Subscription & billing</Link>
        </nav>
      </section>
    </div>}
  </main>;
}
