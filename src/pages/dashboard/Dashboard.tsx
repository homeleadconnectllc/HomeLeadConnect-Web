import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ListTodo,
  MessageCircle,
  PhoneCall,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { listLeads } from "../../api/leads";
import { listFollowUps } from "../../api/followUps";
import { listJobs } from "../../api/jobs";
import { listWorkspaceAppointments } from "../../api/appointments";
import { getMyProfile } from "../../api/settings";
import { agentTeam } from "../../config/ecosystem";
import { useAuth } from "../../hooks/useAuth";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../../lib/accessPolicy";
import type { CrmJob, FollowUp, JobAppointment, Lead } from "../../lib/types/database";
import "../../styles/dashboard.css";

type DashboardData = { leads: Lead[]; followUps: FollowUp[]; jobs: CrmJob[]; appointments: JobAppointment[] };
type DashboardIdentity = { fullName: string; avatarUrl: string };

const emptyData: DashboardData = { leads: [], followUps: [], jobs: [], appointments: [] };
const agentRoleCopy: Record<string, string> = { kendrell: "Command", dion: "Operations", diamond: "Customer experience" };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(value: string) { return value.trim().split(/\s+/).filter(Boolean)[0] || ""; }
function initials(value: string) {
  const letters = value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return letters || "HC";
}
function isToday(value: string | null | undefined) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}
function formatTime(value: string | null | undefined) {
  if (!value) return "No time set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time unavailable" : new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}
function openGlobalSearch() { window.dispatchEvent(new Event("hlc:open-command-search")); }

export default function Dashboard() {
  const { session } = useAuth();
  const account = useAccountAccess();
  const [data, setData] = useState<DashboardData>(emptyData);
  const [identity, setIdentity] = useState<DashboardIdentity>({ fullName: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [partialError, setPartialError] = useState(false);
  const [snapshotAt, setSnapshotAt] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      const results = await Promise.allSettled([listLeads(), listFollowUps(), listJobs(), listWorkspaceAppointments()]);
      if (!active) return;
      setData({
        leads: results[0].status === "fulfilled" ? results[0].value : [],
        followUps: results[1].status === "fulfilled" ? results[1].value : [],
        jobs: results[2].status === "fulfilled" ? results[2].value : [],
        appointments: results[3].status === "fulfilled" ? results[3].value : [],
      });
      setSnapshotAt(Date.now());
      setPartialError(results.some((result) => result.status === "rejected"));
      setLoading(false);
    }
    void loadDashboard();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    getMyProfile().then((profile) => {
      if (!active) return;
      setIdentity({ fullName: profile.full_name || "", avatarUrl: profile.avatar_url || "" });
    }).catch(() => {
      if (!active) return;
      setIdentity({ fullName: "", avatarUrl: "" });
    });
    return () => { active = false; };
  }, [session]);

  const visibleAgentTeam = useMemo(() => {
    if (!session || account.loading || account.error || account.userId !== session.user.id || !account.business || !account.role) return [];
    return agentTeam.filter((agent) => canAccessWorkspacePath(account.role, agent.route));
  }, [account, session]);

  const metrics = useMemo(() => {
    const pendingFollowUps = data.followUps.filter((item) => item.status === "pending");
    return [
      { label: "New leads", value: data.leads.filter((lead) => (lead.status ?? "").toLowerCase() === "new").length, icon: UsersRound, to: "/leads" },
      { label: "Follow-ups", value: pendingFollowUps.length, icon: ListTodo, to: "/follow-ups" },
      { label: "Active jobs", value: data.jobs.filter((job) => job.status === "active").length, icon: BriefcaseBusiness, to: "/jobs" },
      { label: "Today", value: data.appointments.filter((appointment) => appointment.status === "scheduled" && isToday(appointment.appointment_date)).length, icon: CalendarDays, to: "/calendar" },
    ];
  }, [data]);

  const priorities = useMemo(() => {
    const overdue = data.followUps.filter((item) => item.status === "pending" && item.scheduled_for && new Date(item.scheduled_for).getTime() <= snapshotAt).slice(0, 3).map((item) => ({
      title: item.lead?.full_name || "Lead follow-up",
      detail: item.notes || "Follow-up is due",
      meta: item.scheduled_for ? `Due ${formatTime(item.scheduled_for)}` : "Due now",
      to: "/follow-ups",
    }));
    const recentLead = data.leads[0] ? [{ title: data.leads[0].full_name || "New lead", detail: `${data.leads[0].status || "Open"} lead`, meta: "Recent lead", to: "/leads" }] : [];
    return [...overdue, ...recentLead].slice(0, 4);
  }, [data, snapshotAt]);

  const todayAppointments = useMemo(() => data.appointments.filter((appointment) => appointment.status === "scheduled" && isToday(appointment.appointment_date)).slice(0, 5), [data.appointments]);
  const signedInName = firstName(identity.fullName);
  const greeting = signedInName ? `${getGreeting()}, ${signedInName}` : getGreeting();

  return (
    <main className="hlc-home-workspace hlc-home-structural">
      <div className="hlc-home-topbar hlc-home-topbar-v2" role="group" aria-label="Home overview">
        <div className="hlc-home-intro-v2">
          <span className="hlc-home-eyebrow">HOME</span>
          <div className="hlc-home-greeting-v3" role="heading" aria-level={1}><span className="hlc-home-greeting-ink">{greeting}</span></div>
          <p>Let&apos;s keep things moving today.</p>
        </div>
        <div className="hlc-home-top-actions hlc-home-top-actions-v2">
          <button className="hlc-home-search-control" type="button" aria-label="Search HomeLead Connect" onClick={openGlobalSearch}><Search className="hlc-home-search-icon" size={20} /></button>
          <Link className="hlc-home-bell-control" to="/notifications" aria-label="Open notifications"><Bell className="hlc-home-bell-icon" size={20} /></Link>
          <Link className="hlc-home-identity" to="/profile" aria-label="Open your profile">
            {identity.avatarUrl ? <img className="hlc-header-avatar" src={identity.avatarUrl} alt="" /> : <span className="hlc-header-avatar hlc-avatar-fallback" aria-hidden="true">{initials(identity.fullName)}</span>}
          </Link>
        </div>
      </div>

      <div className="hlc-home-live-line" role="status">
        <span className="hlc-home-live-dot" aria-hidden="true" />
        <strong>Workspace online</strong>
        <span className="hlc-home-live-state">{partialError ? "Some live metrics are unavailable" : "All systems ready"}</span>
      </div>

      <div className="hlc-home-metric-strip" aria-label="Live business metrics">
        {metrics.map(({ label, value, icon: Icon, to }) => (
          <Link to={to} key={label}><Icon size={18} aria-hidden="true" /><span><strong>{loading ? "—" : value}</strong><small>{label}</small></span></Link>
        ))}
      </div>

      <div className="hlc-home-primary-grid">
        <div className="hlc-home-focus-panel" role="region" aria-labelledby="hlc-home-attention-title">
          <div className="hlc-home-panel-head">
            <div className="hlc-home-panel-title"><span>PRIORITY</span><h2 id="hlc-home-attention-title">Needs attention</h2></div>
            <Link to="/work">Open Work</Link>
          </div>
          <div className="hlc-home-focus-list">
            {!loading && priorities.length === 0 && <div className="hlc-home-caught-up"><strong>You’re caught up.</strong><span>No overdue follow-ups or new lead alerts are waiting.</span></div>}
            {priorities.map((item) => (
              <Link to={item.to} key={`${item.title}-${item.meta}`}>
                <span className="hlc-home-focus-dot" aria-hidden="true" />
                <span className="hlc-home-focus-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                <span className="hlc-home-focus-meta">{item.meta}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="hlc-home-schedule-panel" role="region" aria-labelledby="hlc-home-today-title">
          <div className="hlc-home-panel-head">
            <div className="hlc-home-panel-title"><span>SCHEDULE</span><h2 id="hlc-home-today-title">Today</h2></div>
            <Link to="/calendar">Calendar</Link>
          </div>
          <div className="hlc-home-schedule-list">
            {!loading && todayAppointments.length === 0 && <div className="hlc-home-caught-up"><strong>No appointments today.</strong><span>Your schedule is clear.</span></div>}
            {todayAppointments.map((appointment) => (
              <Link to="/calendar" key={appointment.id}><time>{formatTime(appointment.appointment_date)}</time><span><strong>{appointment.job?.name || "Scheduled appointment"}</strong><small>{appointment.contractor?.company_name || appointment.notes || "HomeLead Connect"}</small></span></Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hlc-home-quick-row hlc-home-quick-row-v2" aria-label="Quick actions">
        <Link to="/leads"><UsersRound size={19} /><span>Leads</span></Link>
        <Link to="/messages"><MessageCircle size={19} /><span>Messages</span></Link>
        <Link to="/call-center"><PhoneCall size={19} /><span>Calls</span></Link>
        <Link to="/calendar"><CalendarDays size={19} /><span>Schedule</span></Link>
        <Link to="/jobs"><BriefcaseBusiness size={19} /><span>Jobs</span></Link>
      </div>

      {visibleAgentTeam.length > 0 && (
        <div className="hlc-home-ai-rail" aria-label="HomeLead Connect AI team">
          <div className="hlc-home-ai-heading"><Sparkles size={18} aria-hidden="true" /><div><strong>AI Team</strong><span>Open the right assistant when you need deeper help.</span></div></div>
          <div className="hlc-home-ai-links">
            {visibleAgentTeam.map((agent) => <Link to={agent.route} key={agent.id}><img src={agent.avatar} alt="" /><span><strong>{agent.name}</strong><small>{agentRoleCopy[agent.id] || "HomeLead Connect assistant"}</small></span></Link>)}
          </div>
        </div>
      )}
    </main>
  );
}
