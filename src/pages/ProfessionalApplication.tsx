import { Link } from "react-router-dom";

export default function ProfessionalApplication() {
  return <main style={pageStyle}>
    <h1>Professional application</h1>
    <p>One application path for businesses, contractors, subcontractors and service trades.</p>
    <section style={panelStyle}>
      <h2>Application intake is not connected yet</h2>
      <p>HLC still needs an approved application record, evidence requirements, review permissions and invitation outcome before accepting production submissions.</p>
      <p><strong>Required profile information:</strong> organization, primary contact, trade categories, service territory, availability, insurance/license evidence when applicable, team role and communication consent.</p>
      <p role="status">Status: MISSING · Owner: Dion · Approval and customer-experience support: Kendrell and Diamond</p>
      <Link to="/contact">Contact HLC while application intake is being completed</Link>
    </section>
  </main>;
}

const pageStyle = { width: "min(820px, calc(100% - 32px))", margin: "40px auto" };
const panelStyle = { padding: 22, border: "1px solid #f59e0b", borderRadius: 16, background: "#fffbeb", lineHeight: 1.6 };
