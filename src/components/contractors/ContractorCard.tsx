import type { Contractor } from "../../lib/types/database";
import { Link } from "react-router-dom";

export default function ContractorCard({
  contractor,
  disabled,
  onOffer,
}: {
  contractor: Contractor;
  disabled: boolean;
  onOffer: (contractor: Contractor) => void;
}) {
  const location = [contractor.city, contractor.state].filter(Boolean).join(", ");

  return (
    <article className="hlc-contractor-card" style={cardStyle}>
      <div className="hlc-contractor-card__copy">
        <h3 style={{ margin: 0 }}>
          {contractor.company_name || contractor.contact_name || `Contractor #${contractor.id}`}
        </h3>
        <p style={{ margin: "6px 0", color: "#475569" }}>
          {[contractor.specialty, location].filter(Boolean).join(" · ") || "No specialty or location recorded"}
        </p>
        <small>Status: {contractor.status || "not specified"}</small>
      </div>
      <div className="hlc-contractor-card__actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {contractor.phone && <Link to={`/manual-communications?contact=contractor:${contractor.id}&channel=call`}>Call</Link>}
        <button type="button" disabled={disabled} onClick={() => onOffer(contractor)}>
          Offer job
        </button>
      </div>
    </article>
  );
}

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: 16,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
};
