import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  getContractorPortalData,
  getLinkedProviderProfile,
  updateLinkedProviderProfile,
  type ContractorPortalData,
  type LinkedProviderProfile,
  type ProviderType,
} from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";

const providerTypes: Array<{ value: ProviderType; label: string }> = [
  { value: "contractor", label: "Contractor" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "remodeling_company", label: "Remodeling company" },
  { value: "real_estate", label: "Real-estate / property services" },
  { value: "mover", label: "Mover" },
  { value: "cleaner", label: "Cleaner" },
  { value: "painter", label: "Painter" },
  { value: "roofer", label: "Roofer" },
  { value: "hvac", label: "HVAC" },
  { value: "service_business", label: "Service business" },
  { value: "other", label: "Other professional" },
];

export default function ContractorProfile() {
  const [data, setData] = useState<ContractorPortalData>({ links: [], assignments: [] });
  const [profiles, setProfiles] = useState<LinkedProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const portalData = await getContractorPortalData();
    const profileRows = await Promise.all(portalData.links.map((link) => getLinkedProviderProfile(link.contractor_id)));
    setData(portalData);
    setProfiles(profileRows);
  }

  useEffect(() => {
    let active = true;
    getContractorPortalData()
      .then(async (result) => {
        const profileRows = await Promise.all(result.links.map((link) => getLinkedProviderProfile(link.contractor_id)));
        if (active) { setData(result); setProfiles(profileRows); }
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load your linked business profile.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateField(id: number, field: keyof LinkedProviderProfile, value: string | number | null) {
    setProfiles((current) => current.map((profile) => profile.id === id ? { ...profile, [field]: value } as LinkedProviderProfile : profile));
  }

  async function submit(event: FormEvent, profile: LinkedProviderProfile) {
    event.preventDefault();
    setBusyId(profile.id); setError(""); setMessage("");
    try {
      await updateLinkedProviderProfile(profile);
      await load();
      setMessage("Professional profile saved.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save this professional profile."));
    } finally {
      setBusyId(null);
    }
  }

  return <main className="hlc-ui-page-d2e8ad">
    <header className="hlc-ui-hero-340ab8">
      <p className="hlc-ui-eyebrow-84ac4d">Professional portal</p>
      <h1 className="hlc-ui-margin-ab79ea">Business/provider profile</h1>
      <p>The canonical provider records explicitly linked to your signed-in account. Profile type describes the business; it never grants HLC permissions.</p>
    </header>
    <nav aria-label="Professional portal sections" className="hlc-ui-nav-c3daa7">
      <Link to="/contractor-portal">Work dashboard</Link>
      <Link to="/contractor-portal/profile" aria-current="page">Business profile</Link>
      <Link to="/contractor-portal/services">Services and service areas</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/contractor-portal/documents">Documents</Link>
    </nav>
    {loading && <p role="status">Loading linked businesses…</p>}
    {error && <p role="alert" className="hlc-ui-error-260ca0">{error}</p>}
    {message && <p role="status" className="hlc-ui-success-a1fdef">{message}</p>}
    {!loading && !error && data.links.length === 0 && <section className="hlc-ui-empty-f0b2c9">
      <h2>No linked business</h2>
      <p>This account does not currently have an authorized contractor-company relationship. An approved invitation is required; an email match alone does not grant access.</p>
      <p><Link to="/professional-application">Open professional application</Link></p>
    </section>}

    {profiles.map((profile) => <form key={profile.id} onSubmit={(event) => void submit(event, profile)} className="hlc-ui-card-d0af8d">
      <div className="hlc-ui-sectionHeading-47f399">
        <div><p className="hlc-ui-eyebrow-84ac4d">Linked provider #{profile.id}</p><h2 className="hlc-ui-margin-af3c2c">{profile.company_name || profile.contact_name || "Professional profile"}</h2></div>
        <span className="hlc-ui-typeChip-141b17">{providerTypes.find((type) => type.value === profile.provider_type)?.label || profile.provider_type}</span>
      </div>

      <label className="hlc-ui-field-082906">Professional type
        <select value={profile.provider_type} onChange={(event) => updateField(profile.id, "provider_type", event.target.value as ProviderType)}>
          {providerTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </label>
      {profile.provider_type === "subcontractor" && <p className="hlc-ui-setup-704d69"><strong>Subcontractor Experience — Product Setup Required.</strong> HLC preserves identity/company, contact and specialty. Contractor hierarchy, crews, sub-assignment, homeowner access, schedule scope, payment split and completion authority are not inferred by this profile.</p>}

      <div className="hlc-ui-grid-2767ca">
        <label className="hlc-ui-field-082906">Company name<input value={profile.company_name || ""} onChange={(event) => updateField(profile.id, "company_name", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">Primary contact<input value={profile.contact_name || ""} onChange={(event) => updateField(profile.id, "contact_name", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">Specialty / service<input value={profile.specialty || ""} onChange={(event) => updateField(profile.id, "specialty", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">Phone<input type="tel" value={profile.phone || ""} onChange={(event) => updateField(profile.id, "phone", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">Email<input type="email" value={profile.email || ""} onChange={(event) => updateField(profile.id, "email", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">Website<input type="url" value={profile.website || ""} onChange={(event) => updateField(profile.id, "website", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">Street address<input value={profile.address || ""} onChange={(event) => updateField(profile.id, "address", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">City<input value={profile.city || ""} onChange={(event) => updateField(profile.id, "city", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">State<input value={profile.state || ""} onChange={(event) => updateField(profile.id, "state", event.target.value)} /></label>
        <label className="hlc-ui-field-082906">ZIP<input value={profile.zip || ""} onChange={(event) => updateField(profile.id, "zip", event.target.value)} /></label>
      </div>

      <button type="submit" disabled={busyId !== null} className="hlc-ui-primaryButton-fca71d">{busyId === profile.id ? "Saving…" : "Save professional profile"}</button>
      <p className="hlc-ui-boundary-ff7b4e">This self-service form cannot change HLC verification state, license approval, provider eligibility, assignment authority, workspace membership, map coordinates, billing, or internal staff roles.</p>
      <p><strong>Current portal work:</strong> {data.assignments.filter((assignment) => assignment.contractor_id === profile.id).length} offer(s) or assignment(s)</p>
      <p><Link to="/contractor-portal/services">Continue to services & availability</Link></p>
    </form>)}
  </main>;
}
