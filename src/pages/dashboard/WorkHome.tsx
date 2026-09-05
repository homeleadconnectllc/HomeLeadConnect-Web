import { Link } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  CircleCheck,
  FileText,
  MessageSquare,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import "../../styles/work-home-source-authority.css";

const primaryWork = [
  { title: "Leads", note: "Requests, qualification, ownership and next actions.", route: "/leads", icon: Users },
  { title: "Estimates", note: "Scope, pricing, options and estimate-to-job handoff.", route: "/estimator", icon: FileText },
  { title: "Jobs", note: "Scheduled, active and completed service work.", route: "/jobs", icon: Briefcase },
  { title: "Calendar", note: "Appointments, availability and upcoming commitments.", route: "/calendar", icon: CalendarDays },
  { title: "Follow-Ups", note: "Due, waiting, overdue and completed relationship work.", route: "/follow-ups", icon: CircleCheck },
  { title: "Provider Fit", note: "Eligibility and fit evidence before assignment.", route: "/work/matching", icon: UserRound },
] as const;

const communicationWork = [
  { title: "Call Center", route: "/call-center", icon: Phone },
  { title: "Calls & Texts", route: "/manual-communications", icon: MessageSquare },
] as const;

export default function WorkHome() {
  return (
    <main className="hlc-work-home hlc-parent-index">
      <header className="hlc-parent-index-header">
        <div>
          <span className="hlc-parent-eyebrow">WORK</span>
          <h1>What are you working on?</h1>
          <p>Choose the part of the service workflow you need. Each area stays focused on one job instead of putting the entire operation on one screen.</p>
        </div>
        <Link className="hlc-parent-agent-link" to="/operations">Ask Dion <span aria-hidden="true">→</span></Link>
      </header>

      <nav className="hlc-parent-branch-list" aria-label="Work areas">
        {primaryWork.map((area) => {
          const Icon = area.icon;
          return (
            <Link className="hlc-parent-branch-row" to={area.route} key={area.route}>
              <span className="hlc-work-primary-icon" aria-hidden="true"><Icon size={23} /></span>
              <span className="hlc-work-primary-copy">
                <strong>{area.title}</strong>
                <small>{area.note}</small>
              </span>
              <b aria-hidden="true">›</b>
            </Link>
          );
        })}
      </nav>

      <section className="hlc-parent-secondary" aria-labelledby="work-communications-heading">
        <div>
          <span className="hlc-parent-eyebrow">COMMUNICATION TOOLS</span>
          <h2 id="work-communications-heading">Need to reach somebody?</h2>
        </div>
        <nav aria-label="Work communication tools">
          {communicationWork.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="hlc-work-communication-link" to={item.route} key={item.route}>
                <span className="hlc-work-communication-icon" aria-hidden="true"><Icon size={21} /></span>
                <strong>{item.title}</strong>
                <b aria-hidden="true">›</b>
              </Link>
            );
          })}
        </nav>
      </section>

      <aside className="hlc-parent-boundary">
        <strong>Discovery is not assignment.</strong>
        <span>Community helps people discover and connect. Provider assignment, scheduling and completion stay deliberate Work actions.</span>
        <Link to="/community-hub">Go to Community <span aria-hidden="true">→</span></Link>
      </aside>
    </main>
  );
}
