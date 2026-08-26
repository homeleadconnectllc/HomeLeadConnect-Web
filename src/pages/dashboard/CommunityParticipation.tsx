import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, MessageCircle, UsersRound } from "lucide-react";
import { createCommunityPost, listCommunityPosts, type CommunityPost } from "../../api/ecosystemRecords";
import { createCommunityGroup, listCommunityGroups, type CommunityGroup } from "../../api/ecosystemExtra";
import {
  clearCommunityEventAttendance,
  createCommunityReply,
  joinCommunityGroup,
  leaveCommunityGroup,
  listCommunityEventAttendance,
  listCommunityGroupMemberships,
  listCommunityReplies,
  setCommunityEventAttendance,
  type CommunityEventAttendance,
  type CommunityGroupMembership,
  type CommunityReply,
  type EventAttendanceResponse,
} from "../../api/communityParticipation";
import { errorMessage } from "../../lib/errorMessage";

type Page = "discussions" | "groups" | "events";

const pageMeta = {
  discussions: { title: "Discussions", copy: "Start a workspace discussion and continue it with persisted replies.", icon: MessageCircle },
  groups: { title: "Groups", copy: "Create focused Community groups and explicitly join or leave them.", icon: UsersRound },
  events: { title: "Events & Updates", copy: "Publish an event and record going, interested, or not-going attendance evidence.", icon: CalendarDays },
} satisfies Record<Page, { title: string; copy: string; icon: typeof MessageCircle }>;

export default function CommunityParticipation({ page }: { page: Page }) {
  const meta = pageMeta[page];
  const Icon = meta.icon;
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [memberships, setMemberships] = useState<CommunityGroupMembership[]>([]);
  const [attendance, setAttendance] = useState<CommunityEventAttendance[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      if (page === "groups") {
        const groupRows = await listCommunityGroups();
        setGroups(groupRows);
        const membershipResult = await listCommunityGroupMemberships(groupRows.map((row) => row.id));
        setMemberships(membershipResult.memberships);
        setCurrentUserId(membershipResult.currentUserId);
        setPosts([]);
        setReplies([]);
        setAttendance([]);
      } else {
        const postRows = await listCommunityPosts(page === "discussions" ? "discussion" : "event");
        setPosts(postRows);
        if (page === "discussions") {
          const replyRows = await listCommunityReplies(postRows.map((row) => row.id));
          setReplies(replyRows);
          setAttendance([]);
        } else {
          const attendanceResult = await listCommunityEventAttendance(postRows.map((row) => row.id));
          setAttendance(attendanceResult.attendance);
          setCurrentUserId(attendanceResult.currentUserId);
          setReplies([]);
        }
        setGroups([]);
        setMemberships([]);
      }
    } catch (reason) {
      setError(errorMessage(reason, `Unable to load Community ${page}.`));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of memberships) counts.set(row.group_id, (counts.get(row.group_id) ?? 0) + 1);
    return counts;
  }, [memberships]);

  const attendanceCounts = useMemo(() => {
    const counts = new Map<string, { going: number; interested: number; not_going: number }>();
    for (const row of attendance) {
      const current = counts.get(row.event_post_id) ?? { going: 0, interested: 0, not_going: 0 };
      current[row.response] += 1;
      counts.set(row.event_post_id, current);
    }
    return counts;
  }, [attendance]);

  async function createPrimary() {
    setBusy("create");
    setError("");
    try {
      if (page === "groups") {
        if (!title.trim()) throw new Error("Group name is required.");
        await createCommunityGroup(title, body);
      } else {
        if (!title.trim() || !body.trim()) throw new Error("Title and details are required.");
        if (page === "events" && !eventAt) throw new Error("Event date and time are required.");
        await createCommunityPost({ kind: page === "discussions" ? "discussion" : "event", title, body, eventAt: eventAt || undefined });
      }
      setTitle(""); setBody(""); setEventAt("");
      await load();
    } catch (reason) {
      setError(errorMessage(reason, `Unable to create Community ${page === "groups" ? "group" : "post"}.`));
    } finally {
      setBusy(null);
    }
  }

  async function submitReply(postId: string) {
    const draft = replyDrafts[postId]?.trim();
    if (!draft) return;
    setBusy(`reply:${postId}`); setError("");
    try {
      await createCommunityReply(postId, draft);
      setReplyDrafts((current) => ({ ...current, [postId]: "" }));
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to add the discussion reply."));
    } finally { setBusy(null); }
  }

  async function toggleGroup(groupId: string, joined: boolean) {
    setBusy(`group:${groupId}`); setError("");
    try {
      if (joined) await leaveCommunityGroup(groupId); else await joinCommunityGroup(groupId);
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update group membership."));
    } finally { setBusy(null); }
  }

  async function respondToEvent(eventId: string, response: EventAttendanceResponse | "clear") {
    setBusy(`event:${eventId}`); setError("");
    try {
      if (response === "clear") await clearCommunityEventAttendance(eventId);
      else await setCommunityEventAttendance(eventId, response);
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update event attendance."));
    } finally { setBusy(null); }
  }

  return <main className="hlc-command-center hlc-community-participation">
    <section className="hlc-command-hero"><div className="hlc-command-copy"><div className="hlc-command-kicker"><Icon size={15} aria-hidden="true" />Diamond · Community</div><h1>{meta.title}</h1><p>{meta.copy}</p></div></section>

    <section className="hlc-settings-section" aria-label={`Create ${page}`}>
      <label>{page === "groups" ? "Group name" : "Title"}<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} /></label>
      <label>{page === "groups" ? "Description" : "Details"}<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={4000} /></label>
      {page === "events" && <label>Event date &amp; time<input type="datetime-local" value={eventAt} onChange={(event) => setEventAt(event.target.value)} /></label>}
      <button type="button" disabled={busy !== null} onClick={() => void createPrimary()}>{busy === "create" ? "Saving…" : page === "groups" ? "Create group" : page === "events" ? "Publish event" : "Start discussion"}</button>
    </section>

    {loading && <p role="status">Loading Community participation…</p>}
    {error && <p role="alert" className="hlc-account-status is-error">{error}</p>}

    {!loading && page === "discussions" && <section className="hlc-phone-list" aria-label="Community discussions">
      {posts.map((post) => <article className="hlc-phone-row" key={post.id}><div><strong>{post.title}</strong><span>{post.body}</span><small>{new Date(post.created_at).toLocaleString()}</small></div><div className="hlc-settings-ledger">{replies.filter((reply) => reply.post_id === post.id).map((reply) => <div className="hlc-settings-section" key={reply.id}><p>{reply.body}</p><small>{new Date(reply.created_at).toLocaleString()}</small></div>)}</div><label>Reply<textarea rows={2} value={replyDrafts[post.id] ?? ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={4000} /></label><button type="button" disabled={busy !== null || !(replyDrafts[post.id]?.trim())} onClick={() => void submitReply(post.id)}>{busy === `reply:${post.id}` ? "Replying…" : "Reply"}</button></article>)}
      {posts.length === 0 && <p>No discussions yet.</p>}
    </section>}

    {!loading && page === "groups" && <section className="hlc-phone-list" aria-label="Community groups">
      {groups.map((group) => { const joined = memberships.some((row) => row.group_id === group.id && row.user_id === currentUserId); return <article className="hlc-phone-row" key={group.id}><div><strong>{group.name}</strong><span>{group.description || "No description provided."}</span><small>{memberCounts.get(group.id) ?? 0} member{(memberCounts.get(group.id) ?? 0) === 1 ? "" : "s"}</small></div><button type="button" disabled={busy !== null} onClick={() => void toggleGroup(group.id, joined)}>{busy === `group:${group.id}` ? "Updating…" : joined ? "Leave group" : "Join group"}</button></article>; })}
      {groups.length === 0 && <p>No groups yet.</p>}
    </section>}

    {!loading && page === "events" && <section className="hlc-phone-list" aria-label="Community events">
      {posts.map((post) => { const mine = attendance.find((row) => row.event_post_id === post.id && row.user_id === currentUserId)?.response ?? null; const counts = attendanceCounts.get(post.id) ?? { going: 0, interested: 0, not_going: 0 }; return <article className="hlc-phone-row" key={post.id}><div><strong>{post.title}</strong><span>{post.body}</span><small>{post.event_at ? new Date(post.event_at).toLocaleString() : "Event time not recorded"}</small><small>{counts.going} going · {counts.interested} interested · {counts.not_going} not going</small></div><div className="hlc-account-inline-links"><button type="button" aria-pressed={mine === "going"} disabled={busy !== null} onClick={() => void respondToEvent(post.id, "going")}>Going</button><button type="button" aria-pressed={mine === "interested"} disabled={busy !== null} onClick={() => void respondToEvent(post.id, "interested")}>Interested</button><button type="button" aria-pressed={mine === "not_going"} disabled={busy !== null} onClick={() => void respondToEvent(post.id, "not_going")}>Not going</button>{mine && <button type="button" disabled={busy !== null} onClick={() => void respondToEvent(post.id, "clear")}>Clear response</button>}</div></article>; })}
      {posts.length === 0 && <p>No events yet.</p>}
    </section>}
  </main>;
}
