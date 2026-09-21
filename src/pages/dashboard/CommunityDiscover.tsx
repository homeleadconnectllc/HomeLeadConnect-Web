import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listCommunityMembers,
  listCommunityRelationships,
  requestCommunityConnection,
  type CommunityMember,
  type CommunityRelationship,
} from "../../api/communityRelationships";
import { errorMessage } from "../../lib/errorMessage";

function displayName(member: CommunityMember) {
  return member.full_name?.trim() || "HLC member";
}

function initials(member: CommunityMember) {
  return displayName(member).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "HLC";
}

export default function CommunityDiscover() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [relationships, setRelationships] = useState<CommunityRelationship[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const [memberRows, relationshipRows] = await Promise.all([listCommunityMembers(), listCommunityRelationships()]);
    setMembers(memberRows);
    setRelationships(relationshipRows);
  }

  useEffect(() => {
    let active = true;
    void Promise.all([listCommunityMembers(), listCommunityRelationships()])
      .then(([memberRows, relationshipRows]) => {
        if (!active) return;
        setMembers(memberRows);
        setRelationships(relationshipRows);
      })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to load Community discovery.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const relationshipByPeer = useMemo(() => new Map(relationships.map((relationship) => [relationship.peer_user_id, relationship])), [relationships]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((member) => [member.full_name, member.role, member.headline, member.bio, member.city, member.state]
      .filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [members, query]);

  async function requestConnection(peerUserId: string) {
    setBusyId(peerUserId);
    setError("");
    try {
      await requestCommunityConnection(peerUserId);
      await refresh();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to request this Community connection."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="hlc-community-workspace hlc-ui-community-discover-b6184f" >
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · DISCOVER</p>
          <h1>Find people worth knowing.</h1>
          <p>Discover opt-in HLC member profiles across roles and workspaces. A connection request never assigns work and never opens operational Messages.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community discovery navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/community/swipe">Swipe Match</Link>
        <Link to="/community/messages">Community Messages</Link>
        <Link to="/network/map">Map</Link>
      </nav>

      <section className="hlc-premium-panel hlc-ui-community-discover-fd599b" >
        <label htmlFor="community-discover-search" className="hlc-ui-community-discover-38cfc5">
          Search Community members
          <input id="community-discover-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, role, headline, city, or state" className="hlc-ui-min-height-393a64" />
        </label>
      </section>

      {error && <p role="alert" className="hlc-match-alert">{error}</p>}
      {loading && <p role="status">Loading Community members…</p>}

      <section aria-label="Community member results" className="hlc-ui-community-discover-eab2f8">
        {visible.map((member) => {
          const relationship = relationshipByPeer.get(member.user_id);
          const status = relationship?.relationship_status;
          return (
            <article key={member.user_id} className="hlc-premium-panel hlc-ui-overflow-a5317b" >
              <div aria-hidden="true" className="hlc-ui-community-discover-ac7a51">{initials(member)}</div>
              <div className="hlc-ui-padding-d26477">
                <p className="hlc-ui-community-academy-1e9fca">{member.role || "HLC member"}</p>
                <h2 className="hlc-ui-margin-3e47b1">{displayName(member)}</h2>
                <p className="hlc-ui-margin-3e47b1">{member.headline || "Community member"}</p>
                <p className="hlc-ui-margin-8740a8">{[member.city, member.state].filter(Boolean).join(", ") || "Location not shared"}</p>
                {member.bio && <p className="hlc-ui-community-discover-2b8743">{member.bio}</p>}
                <div className="hlc-ui-community-discover-7de392">
                  {status === "accepted" ? <Link to="/community/messages" className="hlc-ui-font-weight-52ee95">Message</Link> : null}
                  {!status ? <button type="button" onClick={() => void requestConnection(member.user_id)} disabled={busyId === member.user_id} className="hlc-ui-min-height-850e44">{busyId === member.user_id ? "Requesting…" : "Connect"}</button> : null}
                  {status && <span className="hlc-status-pill">{status === "pending" ? `${relationship?.direction === "incoming" ? "Request received" : "Request sent"}` : status}</span>}
                </div>
              </div>
            </article>
          );
        })}
        {!loading && !visible.length && !error && <div className="hlc-premium-empty"><h2>No matching Community members.</h2><p>Only members who explicitly opt into Community discovery appear here.</p></div>}
      </section>

      <section className="hlc-premium-callout hlc-ui-community-discover-523c62" >
        <h2 className="hlc-ui-margin-top-a0925a">Connection is permission, not assignment.</h2>
        <p className="hlc-ui-margin-bottom-fa769a">Private Community messaging unlocks only after acceptance. Real work still transitions through Start Service Request and operational communication remains at <Link to="/messages">/messages</Link>.</p>
      </section>
    </main>
  );
}
