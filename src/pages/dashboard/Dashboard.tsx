import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Clock3,
  Gauge,
  ListTodo,
  PhoneCall,
  Settings,
  Sparkles,
  UsersRound,
  Workflow,
  Zap,
} from "lucide-react";
import { listLeads } from "../../api/leads";
import { listFollowUps } from "../../api/followUps";
import { listJobs } from "../../api/jobs";
import { listWorkspaceAppointments } from "../../api/appointments";
import { agentTeam } from "../../config/ecosystem";
import type { CrmJob, FollowUp, JobAppointment, Lead } from "../../lib/types/database";
import "../../styles/dashboard.css";

type DashboardData = {
  leads: Lead[];
  followUps: FollowUp[];
  jobs: CrmJob[];
  appointments: JobAppointment[];
};

const emptyData: DashboardData = {
  leads: [],
  followUps: [],
  jobs: [],
  appointments: [],
};

const workspaceLinks = [
  { to: "/workflow", label: "Golden Workflow", detail: "Run the lead-to-job pipeline", icon: Workflow },
  { to: "/leads", label: "Leads", detail: "Review and work opportunities", icon: UsersRound },
  { to: "/jobs", label: "Jobs", detail: "Track active customer work", icon: BriefcaseBusiness },
  { to: "/estimator", label: "LeadScope", detail: "Estimate and qualify projects", icon: Gauge },
  { to: "/automations", label: "Automations", detail: "Keep follow-through moving", icon: Zap },
  { to: "/calendar", label: "Schedule", detail: "See appointments and timing", icon: CalendarDays },
];

const agentRoleCopy: Record<string, { label: string; responsibility: string }> = {
  kendrell: {
    label: "Command",
    responsibility: "Executive priorities, approvals, risk and cross-agent coordination.",
  },
  dion: {
    label: "Operations & BI",
    responsibility: "Leads, LeadScope, jobs, matching, scheduling and operational intelligence.",
  },
  diamond: {
    label: "Customer Experience",
    responsibility: "Onboarding, messages, community, reviews, recovery and brand experience.",
  },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isToday(value: string | null | undefined) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatTime(value: string | null | undefined) {
  if (!value) return "No time set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [partialError, setPartialError] = useState(false);
  const [snapshotAt, setSnapshotAt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const results = await Promise.allSettled([
        listLeads(),
        listFollowUps(),
        listJobs(),
        listWorkspaceAppointments(),
      ]);

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
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const pendingFollowUps = data.followUps.filter((item) => item.status === "pending");
    return [
      {
        label: "New leads",
        value: data.leads.filter((lead) => (lead.status ?? "").toLowerCase() === "new").length,
        icon: UsersRound,
        to: "/leads",
      },
      {
        label: "Follow-ups",
        value: pendingFollowUps.length,
        icon: ListTodo,
        to: "/follow-ups",
      },
      {
        label: "Active jobs",
        value: data.jobs.filter((job) => job.status === "active").length,
        icon: BriefcaseBusiness,
        to: "/jobs",
      },
      {
        label: "Today",
        value: data.appointments.filter(
          (appointment) => appointment.status === "scheduled" && isToday(appointment.appointment_date),
        ).length,
        icon: CalendarDays,
        to: "/calendar",
      },
    ];
  }, [data]);

  const priorities = useMemo(() => {
    const overdue = data.followUps
      .filter(
        (item) =>
          item.status === "pending" &&
          item.scheduled_for &&
          new Date(item.scheduled_for).getTime() <= snapshotAt,
      )
      .slice(0, 2)
      .map((item) => ({
        title: item.lead?.full_name || "Lead follow-up",
        detail: item.notes || "Follow-up is due",
        meta: item.scheduled_for ? `Due ${formatTime(item.scheduled_for)}` : "Due now",
        to: "/follow-ups",
        tone: "urgent" as const,
      }));

    const todayAppointments = data.appointments
      .filter(
        (appointment) =>
          appointment.status === "scheduled" && isToday(appointment.appointment_date),
      )
      .slice(0, 2)
      .map((appointment) => ({
        title: appointment.job?.name || "Scheduled appointment",
        detail: appointment.contractor?.company_name || appointment.notes || "HLC appointment",
        meta: formatTime(appointment.appointment_date),
        to: "/calendar",
        tone: "scheduled" as const,
      }));

    const recentLead = data.leads[0]
      ? [
          {
            title: data.leads[0].full_name || "New lead",
            detail: `${data.leads[0].status || "Open"} lead`,
            meta: "Recent lead",
            to: "/leads",
            tone: "lead" as const,
          },
        ]
      : [];

    return [...overdue, ...todayAppointments, ...recentLead].slice(0, 4);
  }, [data, snapshotAt]);

  return (
    <main className="hlc-command-center">
      <section className="hlc-command-hero">
        <div className="hlc-command-copy">
          <div className="hlc-command-kicker">
            <Sparkles size={15} aria-hidden="true" />
            HLC Command Center
          </div>
          <h1>{getGreeting()}.</h1>
          <p>Here’s what needs your attention across HomeLead Connect.</p>
        </div>
        <Link className="hlc-command-icon-button" to="/notifications" aria-label="Open notifications">
          <Bell size={21} />
        </Link>
      </section>

      <section className="hlc-system-strip" aria-label="System status">
        <span className="hlc-status-dot" />
        <span>Workspace online</span>
        <span className="hlc-system-divider" />
        <span>{partialError ? "Some live metrics unavailable" : "Live operations connected"}</span>
      </section>

      <section className="hlc-metric-grid" aria-label="Live business metrics">
        {metrics.map(({ label, value, icon: Icon, to }) => (
          <Link className="hlc-metric-card" to={to} key={label}>
            <span className="hlc-metric-icon"><Icon size={19} /></span>
            <strong>{loading ? "—" : value}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </section>

      <section className="hlc-dashboard-section hlc-agent-team-section">
        <div className="hlc-section-heading hlc-agent-team-heading">
          <div>
            <span className="hlc-section-eyebrow">Your AI team</span>
            <h2>Kendrell · Dion · Diamond</h2>
            <p className="hlc-agent-team-intro">Three dedicated HLC workspaces, each responsible for a different part of the business.</p>
          </div>
          <span className="hlc-agent-team-chip">3 workspaces</span>
        </div>

        <div className="hlc-agent-grid">
          {agentTeam.map((agent) => {
            const role = agentRoleCopy[agent.id];
            return (
              <Link className={`hlc-agent-card hlc-agent-card-${agent.id}`} to={agent.route} key={agent.id}>
                <div className="hlc-agent-portrait-wrap">
                  <img className="hlc-agent-portrait" src={agent.avatar} alt={`${agent.name}, ${role.label}`} />
                  <span className="hlc-agent-presence" aria-hidden="true" />
                  <span className="hlc-agent-status">Online</span>
                </div>
                <div className="hlc-agent-card-body">
                  <span className="hlc-agent-role">{role.label}</span>
                  <h3>{agent.name}</h3>
                  <p>{role.responsibility}</p>
                  <span className="hlc-agent-open">
                    Open workspace <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="hlc-dashboard-section hlc-dashboard-section-tight">
        <div className="hlc-section-heading">
          <div>
            <span className="hlc-section-eyebrow">Move fast</span>
            <h2>Quick actions</h2>
          </div>
        </div>
        <div className="hlc-quick-actions">
          <Link to="/leads" className="hlc-quick-action hlc-quick-action-primary">
            <UsersRound size={20} />
            <span>Leads</span>
          </Link>
          <Link to="/call-center" className="hlc-quick-action">
            <PhoneCall size={20} />
            <span>Call</span>
          </Link>
          <Link to="/calendar" className="hlc-quick-action">
            <CalendarDays size={20} />
            <span>Schedule</span>
          </Link>
          <Link to="/jobs" className="hlc-quick-action">
            <BriefcaseBusiness size={20} />
            <span>Jobs</span>
          </Link>
        </div>
      </section>

      <section className="hlc-dashboard-section hlc-priority-panel">
        <div className="hlc-section-heading">
          <div>
            <span className="hlc-section-eyebrow">Operations</span>
            <h2>Priority today</h2>
          </div>
          <Clock3 size={20} aria-hidden="true" />
        </div>

        <div className="hlc-priority-list">
          {loading ? (
            <div className="hlc-priority-empty">Loading live priorities…</div>
          ) : priorities.length ? (
            priorities.map((item, index) => (
              <Link className="hlc-priority-item" to={item.to} key={`${item.title}-${index}`}>
                <span className={`hlc-priority-marker hlc-priority-marker-${item.tone}`}>
                  <CircleDot size={16} />
                </span>
                <span className="hlc-priority-copy">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </span>
                <span className="hlc-priority-meta">{item.meta}</span>
                <ChevronRight size={18} className="hlc-priority-chevron" />
              </Link>
            ))
          ) : (
            <div className="hlc-priority-empty">
              <strong>You’re caught up.</strong>
              <span>No urgent follow-ups or appointments are waiting right now.</span>
            </div>
          )}
        </div>
      </section>

      <section className="hlc-dashboard-section">
        <div className="hlc-section-heading">
          <div>
            <span className="hlc-section-eyebrow">Navigate</span>
            <h2>Workspace</h2>
          </div>
          <Link to="/settings" className="hlc-section-action" aria-label="Open settings">
            <Settings size={19} />
          </Link>
        </div>

        <div className="hlc-workspace-grid">
          {workspaceLinks.map(({ to, label, detail, icon: Icon }) => (
            <Link className="hlc-workspace-card" to={to} key={to}>
              <span className="hlc-workspace-icon"><Icon size={21} /></span>
              <span className="hlc-workspace-copy">
                <strong>{label}</strong>
                <span>{detail}</span>
              </span>
              <ArrowRight size={18} className="hlc-workspace-arrow" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
