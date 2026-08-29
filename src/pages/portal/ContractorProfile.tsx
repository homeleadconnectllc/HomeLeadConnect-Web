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

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>Professional portal</p>
      <h1 style={{ margin: 0 }}>Business/provider profile</h1>
      <p>The canonical provider records explicitly linked to your signed-in account. Profile type describes the business; it never grants HLC permissions.</p>
    </header>
    <nav aria-label="Professional portal sections" style={navStyle}>
      <Link to="/contractor-portal">Work dashboard</Link>
      <Link to="/contractor-portal/profile" aria-current="page">Business profile</Link>
      <Link to="/contractor-portal/services">Services and service areas</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/contractor-portal/documents">Documents</Link>
    </nav>
    {loading && <p role="status">Loading linked businesses…</p>}
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {message && <p role="status" style={successStyle}>{message}</p>}
    {!loading && !error && data.links.length === 0 && <section style={emptyStyle}>
      <h2>No linked business</h2>
      <p>This account does not currently have an authorized contractor-company relationship. An approved invitation is required; an email match alone does not grant access.</p>
      <p><Link to="/professional-application">Open professional application</Link></p>
    </section>}

    {profiles.map((profile) => <form key={profile.id} onSubmit={(event) => void submit(event, profile)} style={cardStyle}>
      <div style={sectionHeadingStyle}>
        <div><p style={eyebrowStyle}>Linked provider #{profile.id}</p><h2 style={{ margin: "4px 0 0" }}>{profile.company_name || profile.contact_name || "Professional profile"}</h2></div>
        <span style={typeChipStyle}>{providerTypes.find((type) => type.value === profile.provider_type)?.label || profile.provider_type}</span>
      </div>

      <label style={fieldStyle}>Professional type
        <select value={profile.provider_type} onChange={(event) => updateField(profile.id, "provider_type", event.target.value as ProviderType)}>
          {providerTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </label>
      {profile.provider_type === "subcontractor" && <p style={setupStyle}><strong>Subcontractor Experience — Product Setup Required.</strong> HLC preserves identity/company, contact and specialty. Contractor hierarchy, crews, sub-assignment, homeowner access, schedule scope, payment split and completion authority are not inferred by this profile.</p>}

      <div style={gridStyle}>
        <label style={fieldStyle}>Company name<input value={profile.company_name || ""} onChange={(event) => updateField(profile.id, "company_name", event.target.value)} /></label>
        <label style={fieldStyle}>Primary contact<input value={profile.contact_name || ""} onChange={(event) => updateField(profile.id, "contact_name", event.target.value)} /></label>
        <label style={fieldStyle}>Specialty / service<input value={profile.specialty || ""} onChange={(event) => updateField(profile.id, "specialty", event.target.value)} /></label>
        <label style={fieldStyle}>Phone<input type="tel" value={profile.phone || ""} onChange={(event) => updateField(profile.id, "phone", event.target.value)} /></label>
        <label style={fieldStyle}>Email<input type="email" value={profile.email || ""} onChange={(event) => updateField(profile.id, "email", event.target.value)} /></label>
        <label style={fieldStyle}>Website<input type="url" value={profile.website || ""} onChange={(event) => updateField(profile.id, "website", event.target.value)} /></label>
        <label style={fieldStyle}>Street address<input value={profile.address || ""} onChange={(event) => updateField(profile.id, "address", event.target.value)} /></label>
        <label style={fieldStyle}>City<input value={profile.city || ""} onChange={(event) => updateField(profile.id, "city", event.target.value)} /></label>
        <label style={fieldStyle}>State<input value={profile.state || ""} onChange={(event) => updateField(profile.id, "state", event.target.value)} /></label>
        <label style={fieldStyle}>ZIP<input value={profile.zip || ""} onChange={(event) => updateField(profile.id, "zip", event.target.value)} /></label>
      </div>

      <button type="submit" disabled={busyId !== null} style={primaryButtonStyle}>{busyId === profile.id ? "Saving…" : "Save professional profile"}</button>
      <p style={boundaryStyle}>This self-service form cannot change HLC verification state, license approval, provider eligibility, assignment authority, workspace membership, map coordinates, billing, or internal staff roles.</p>
      <p><strong>Current portal work:</strong> {data.assignments.filter((assignment) => assignment.contractor_id === profile.id).length} offer(s) or assignment(s)</p>
      <p><Link to="/contractor-portal/services">Continue to services & availability</Link></p>
    </form>)}
  </main>;
}

const pageStyle = { width: "min(980px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 18 };
const heroStyle = { padding: "clamp(22px, 5vw, 40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#2563eb", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".04em" };
const navStyle = { display: "flex", flexWrap: "wrap" as const, gap: 14 };
const cardStyle = { display: "grid", gap: 14, padding: 20, border: "1px solid #dbeafe", borderRadius: 16, background: "#fff" };
const emptyStyle = { padding: 24, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc" };
const errorStyle = { color: "#b91c1c", padding: 14, border: "1px solid #fecaca", borderRadius: 12 };
const successStyle = { color: "#166534", padding: 14, border: "1px solid #bbf7d0", borderRadius: 12 };
const fieldStyle = { display: "grid", gap: 6, fontWeight: 700 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const sectionHeadingStyle = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" as const };
const typeChipStyle = { padding: "6px 10px", borderRadius: 999, background: "#dbeafe", color: "#1e3a8a", fontWeight: 800 };
const setupStyle = { padding: 14, border: "1px solid #fde68a", borderRadius: 12, background: "#fffbeb", color: "#92400e" };
const boundaryStyle = { padding: 14, border: "1px solid #cbd5e1", borderRadius: 12, background: "#f8fafc", color: "#475569" };
const primaryButtonStyle = { minHeight: 44, width: "fit-content", padding: "10px 18px", border: "1px solid #0f172a", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 900 };
