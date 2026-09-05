import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../../lib/accessPolicy";
import "../../styles/global-command-search.css";

export const OPEN_HLC_COMMAND_SEARCH = "hlc:open-command-search";

type SearchItem = {
  label: string;
  detail: string;
  route: string;
  group: "Commands" | "Work" | "Network" | "Community" | "Communication" | "Resources" | "Account" | "AI";
  keywords: string;
};

const items: SearchItem[] = [
  { label: "Home", detail: "Open the HomeLead Connect Command Center", route: "/dashboard", group: "Commands", keywords: "home dashboard command center today priorities" },
  { label: "New lead", detail: "Open Leads to create or work an opportunity", route: "/leads", group: "Commands", keywords: "new lead create opportunity request" },
  { label: "Schedule", detail: "Open the native HomeLead Connect Calendar", route: "/calendar", group: "Commands", keywords: "appointment event schedule calendar today" },
  { label: "Message", detail: "Open HomeLead Connect Messages", route: "/messages", group: "Commands", keywords: "message email conversation chat communication" },
  { label: "Golden Workflow", detail: "Run the lead-to-job operating flow", route: "/workflow", group: "Work", keywords: "request lead scope provider schedule job completion workflow" },
  { label: "Leads", detail: "Review and work opportunities", route: "/leads", group: "Work", keywords: "lead prospect opportunity request customer" },
  { label: "LeadScope", detail: "Estimate and qualify projects", route: "/estimator", group: "Work", keywords: "estimate scope qualify price project" },
  { label: "Jobs", detail: "Track active customer work", route: "/jobs", group: "Work", keywords: "job project work active completion" },
  { label: "Calendar", detail: "Appointments and HomeLead Connect-native events", route: "/calendar", group: "Work", keywords: "calendar appointment event schedule day week month" },
  { label: "Follow-ups", detail: "Due, overdue and upcoming follow-through", route: "/follow-ups", group: "Work", keywords: "follow up reminder due overdue snooze" },
  { label: "Automations", detail: "Review HomeLead Connect automation activity", route: "/automations", group: "Work", keywords: "automation workflow run failure trigger" },
  { label: "Provider Network", detail: "Search the HomeLead Connect provider directory", route: "/network", group: "Network", keywords: "provider contractor professional directory network" },
  { label: "Matching", detail: "Find provider matches", route: "/matching", group: "Network", keywords: "match provider contractor fit save" },
  { label: "Provider Map", detail: "Explore providers geographically", route: "/network/map", group: "Network", keywords: "map location provider nearby service area" },
  { label: "Saved Providers", detail: "Open saved provider records", route: "/network/saved", group: "Network", keywords: "saved favorite provider contractor" },
  { label: "Community", detail: "Open the HomeLead Connect Community Hub", route: "/community-hub", group: "Community", keywords: "community feed discussion event review referral" },
  { label: "Discussions", detail: "Open community discussions", route: "/community/discussions", group: "Community", keywords: "discussion thread post reply community" },
  { label: "Events & Updates", detail: "Open community events and updates", route: "/community/events", group: "Community", keywords: "event update rsvp community" },
  { label: "Reviews", detail: "Open community reviews", route: "/community/reviews", group: "Community", keywords: "review response rating feedback" },
  { label: "Referrals", detail: "Open community referrals", route: "/community/referrals", group: "Community", keywords: "referral refer invite conversion" },
  { label: "Messages", detail: "Conversations and persisted communication", route: "/messages", group: "Communication", keywords: "message chat conversation email voice note" },
  { label: "Call Center", detail: "Call execution, scripts and dispositions", route: "/call-center", group: "Communication", keywords: "call phone script disposition follow up" },
  { label: "Calls & Texts", detail: "Manual communications workspace", route: "/manual-communications", group: "Communication", keywords: "call text sms phone communications" },
  { label: "Documents", detail: "Search and manage workspace documents", route: "/documents", group: "Resources", keywords: "document file upload scan photo" },
  { label: "Help Center", detail: "Operational help and guidance", route: "/help", group: "Resources", keywords: "help support guide question" },
  { label: "Tutorials", detail: "HomeLead Connect tutorials and walkthroughs", route: "/tutorials", group: "Resources", keywords: "tutorial guide learn walkthrough" },
  { label: "Rules & Safety", detail: "Operational rules and safety guidance", route: "/rules", group: "Resources", keywords: "rules safety compliance policy" },
  { label: "My Profile", detail: "Open your HomeLead Connect profile", route: "/profile", group: "Account", keywords: "profile account personal" },
  { label: "Company Team", detail: "Team membership and access", route: "/team", group: "Account", keywords: "team manager technician role invite access" },
  { label: "Settings", detail: "Workspace and account settings", route: "/settings", group: "Account", keywords: "settings preferences integrations security notifications" },
  { label: "Billing", detail: "Subscription and billing workspace", route: "/settings/billing", group: "Account", keywords: "billing subscription plan invoice payment" },
  { label: "Kendrell", detail: "Command, approvals, risk and orchestration", route: "/hq", group: "AI", keywords: "kendrell ken command owner approval risk agent" },
  { label: "Dion", detail: "Operations and business intelligence", route: "/operations", group: "AI", keywords: "dion operations business intelligence agent jobs leads" },
  { label: "Diamond", detail: "Customer experience and community", route: "/customer-experience", group: "AI", keywords: "diamond customer experience community agent messages" },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function GlobalCommandSearch() {
  const navigate = useNavigate();
  const access = useAccountAccess();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const openSearch = () => setOpen(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN_HLC_COMMAND_SEARCH, openSearch);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_HLC_COMMAND_SEARCH, openSearch);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const availableItems = useMemo(() => {
    if (access.loading) return [];
    return items.filter((item) => {
      if (item.route === "/messages" || item.route === "/profile") {
        return access.business || access.homeowner || access.contractor;
      }
      if (!access.business || !access.role) return false;
      return canAccessWorkspacePath(access.role, item.route);
    });
  }, [access.business, access.contractor, access.homeowner, access.loading, access.role]);

  const matches = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return availableItems.slice(0, 10);
    return availableItems
      .filter((item) => `${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(needle))
      .slice(0, 18);
  }, [availableItems, query]);

  function choose(item: SearchItem) {
    setOpen(false);
    setQuery("");
    navigate(item.route);
  }

  return open ? (
    <div className="hlc-cmd-v2-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) setOpen(false);
    }}>
      <div id="hlc-command-search-source" className="hlc-cmd-v2-shell" role="dialog" aria-modal="true" aria-label="Search HomeLead Connect">
        <div className="hlc-cmd-v2-head">
          <Search className="hlc-cmd-v2-search-icon" size={20} aria-hidden="true" />
          <input
            className="hlc-cmd-v2-input"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search HomeLead Connect..."
            aria-label="Search HomeLead Connect"
            autoComplete="off"
          />
          <button className="hlc-cmd-v2-close" type="button" aria-label="Close search" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="hlc-cmd-v2-results" role="listbox" aria-label="Search results">
          {matches.length ? matches.map((item) => (
            <button className="hlc-cmd-v2-result" key={`${item.group}-${item.label}-${item.route}`} type="button" role="option" onClick={() => choose(item)}>
              <div className="hlc-cmd-v2-copy">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </div>
              <b className="hlc-cmd-v2-group">{item.group}</b>
            </button>
          )) : (
            <div className="hlc-cmd-v2-empty">
              <strong>No matching HomeLead Connect area yet.</strong>
              <span>Try a feature, workflow, person, or action name.</span>
            </div>
          )}
        </div>
        <div className="hlc-cmd-v2-foot">
          <span>Search respects your HomeLead Connect role and workspace access.</span>
          <kbd>⌘K</kbd>
        </div>
      </div>
    </div>
  ) : null;
}
