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
    <article className="hlc-contractor-card hlc-ui-card-a3839d" >
      <div className="hlc-contractor-card__copy">
        <h3 className="hlc-ui-margin-ab79ea">
          {contractor.company_name || contractor.contact_name || `Contractor #${contractor.id}`}
        </h3>
        <p className="hlc-ui-contractor-card-c9d2c2">
          {[contractor.specialty, location].filter(Boolean).join(" · ") || "No specialty or location recorded"}
        </p>
        <small>Status: {contractor.status || "not specified"}</small>
      </div>
      <div className="hlc-contractor-card__actions hlc-ui-contractor-card-03b0f4" >
        {contractor.phone && <Link to={`/manual-communications?contact=contractor:${contractor.id}&channel=call`}>Call</Link>}
        <button type="button" disabled={disabled} onClick={() => onOffer(contractor)}>
          Offer job
        </button>
      </div>
    </article>
  );
}
