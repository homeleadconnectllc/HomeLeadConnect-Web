import { CalendarDays, ListTodo, MessageSquareText, Mic, PhoneCall } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const internalWorkspacePrefixes = [
  "/dashboard",
  "/leads",
  "/jobs",
  "/messages",
  "/calendar",
  "/follow-ups",
  "/call-center",
  "/manual-communications",
  "/operations",
  "/customer-experience",
  "/hq",
];

const actions = [
  { to: "/call-center", label: "Call", icon: PhoneCall },
  { to: "/messages", label: "Text", icon: MessageSquareText },
  { to: "/calendar", label: "Schedule", icon: CalendarDays },
  { to: "/follow-ups", label: "Follow Up", icon: ListTodo },
  { to: "/messages?compose=voice-note", label: "Voice Note", icon: Mic },
];

export default function MobileWorkDock() {
  const location = useLocation();
  const isInternalWorkspace = internalWorkspacePrefixes.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
  );

  if (!isInternalWorkspace) return null;

  return (
    <nav className="hlc-mobile-work-dock" aria-label="Mobile work actions">
      {actions.map(({ to, label, icon: Icon }) => {
        const targetPath = to.split("?")[0];
        const active = location.pathname === targetPath;
        return (
          <Link
            className="hlc-mobile-work-dock-action"
            to={to}
            key={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
