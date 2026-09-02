import { Link } from "react-router-dom";

const resourceBranches = [
  { title: "Guides & Help", note: "Find role-based help, recovery steps and operating guidance.", route: "/help" },
  { title: "Tutorials", note: "Learn HLC through focused guided tasks instead of long reference pages.", route: "/tutorials" },
  { title: "Documents", note: "Open files, evidence, templates and record-linked documents.", route: "/documents" },
  { title: "Forms & Checklists", note: "Use reusable HLC forms and operational checklists.", route: "/resources/forms" },
  { title: "Materials", note: "Plan project materials and track their recorded state.", route: "/resources/materials" },
  { title: "Suppliers", note: "Research supplier categories and verify current details externally.", route: "/resources/suppliers" },
  { title: "Rules & Safety", note: "Review platform, Community, service and privacy expectations.", route: "/rules" },
] as const;

export default function ResourcesHome() {
  return (
    <main className="hlc-parent-index hlc-resources-parent">
      <header className="hlc-parent-index-header">
        <div>
          <span className="hlc-parent-eyebrow">RESOURCES</span>
          <h1>What do you need?</h1>
          <p>Resources is HLC’s library. Start with the kind of information or material you need, then open that branch without carrying the rest of the library onto the same page.</p>
        </div>
        <Link className="hlc-parent-agent-link" to="/operations">Ask Dion <span aria-hidden="true">→</span></Link>
      </header>

      <nav className="hlc-parent-branch-list" aria-label="Resource areas">
        {resourceBranches.map((item) => (
          <Link className="hlc-parent-branch-row" to={item.route} key={item.route}>
            <span>
              <strong>{item.title}</strong>
              <small>{item.note}</small>
            </span>
            <b aria-hidden="true">→</b>
          </Link>
        ))}
      </nav>

      <aside className="hlc-parent-boundary">
        <strong>Current supplier facts stay external.</strong>
        <span>HLC can organize sourcing work, but current price, inventory, delivery and route details must still be confirmed with the supplier.</span>
        <Link to="/resources/suppliers">Research suppliers <span aria-hidden="true">→</span></Link>
      </aside>
    </main>
  );
}
