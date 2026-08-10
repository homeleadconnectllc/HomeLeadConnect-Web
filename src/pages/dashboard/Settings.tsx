import { useEffect, useState, type FormEvent } from "react";
import { getBusinessProfile, getMyProfile, saveBusinessProfile, updateMyProfile } from "../../api/settings";
import { errorMessage } from "../../lib/errorMessage";

const blankBusiness = {
  business_name: "", owner_name: "", phone: "", email: "", website: "",
  address: "", city: "", state: "", zip: "",
};

export default function Settings() {
  const [personal, setPersonal] = useState({ fullName: "", avatarUrl: "", email: "", role: "" });
  const [business, setBusiness] = useState(blankBusiness);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"personal" | "business" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getMyProfile(), getBusinessProfile()])
      .then(([profile, businessProfile]) => {
        setPersonal({
          fullName: profile.full_name || "",
          avatarUrl: profile.avatar_url || "",
          email: "",
          role: profile.role,
        });
        if (businessProfile) {
          setBusiness({
            business_name: businessProfile.business_name || "",
            owner_name: businessProfile.owner_name || "",
            phone: businessProfile.phone || "",
            email: businessProfile.email || "",
            website: businessProfile.website || "",
            address: businessProfile.address || "",
            city: businessProfile.city || "",
            state: businessProfile.state || "",
            zip: businessProfile.zip || "",
          });
        }
      })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load settings.")))
      .finally(() => setLoading(false));
  }, []);

  async function savePersonal(event: FormEvent) {
    event.preventDefault();
    await run("personal", async () => {
      const updated = await updateMyProfile(personal);
      setPersonal((current) => ({ ...current, fullName: updated.full_name || "", avatarUrl: updated.avatar_url || "" }));
    }, "Personal profile saved.");
  }

  async function saveBusiness(event: FormEvent) {
    event.preventDefault();
    await run("business", async () => {
      const updated = await saveBusinessProfile(business);
      setBusiness({
        business_name: updated.business_name || "", owner_name: updated.owner_name || "",
        phone: updated.phone || "", email: updated.email || "", website: updated.website || "",
        address: updated.address || "", city: updated.city || "", state: updated.state || "", zip: updated.zip || "",
      });
    }, "Business profile saved.");
  }

  async function run(kind: "personal" | "business", action: () => Promise<void>, success: string) {
    setBusy(kind); setError(""); setMessage("");
    try { await action(); setMessage(success); }
    catch (reason) { setError(errorMessage(reason, "Unable to save settings.")); }
    finally { setBusy(null); }
  }

  if (loading) return <main style={pageStyle}><p>Loading settings…</p></main>;

  return <main style={pageStyle}>
    <h1>Profile and business settings</h1>
    <p>Manage the profile fields already supported by your HLC workspace.</p>
    {error && <p role="alert" style={errorStyle}>{error}</p>}
    {message && <p role="status" style={successStyle}>{message}</p>}

    <form onSubmit={savePersonal} style={cardStyle}>
      <h2>Personal profile</h2>
      <label>Full name<input value={personal.fullName} onChange={(event) => setPersonal({ ...personal, fullName: event.target.value })} /></label>
      <label>Avatar URL<input type="url" value={personal.avatarUrl} onChange={(event) => setPersonal({ ...personal, avatarUrl: event.target.value })} /></label>
      <p><strong>Workspace role:</strong> {personal.role}</p>
      <button disabled={busy !== null} type="submit">{busy === "personal" ? "Saving…" : "Save personal profile"}</button>
    </form>

    <form onSubmit={saveBusiness} style={cardStyle}>
      <h2>Business profile</h2>
      {Object.entries({ business_name: "Business name", owner_name: "Owner name", phone: "Phone", email: "Email", website: "Website", address: "Street address", city: "City", state: "State", zip: "ZIP" }).map(([field, label]) =>
        <label key={field}>{label}<input
          type={field === "email" ? "email" : field === "website" ? "url" : field === "phone" ? "tel" : "text"}
          value={business[field as keyof typeof business]}
          onChange={(event) => setBusiness({ ...business, [field]: event.target.value })}
        /></label>
      )}
      <button disabled={busy !== null} type="submit">{busy === "business" ? "Saving…" : "Save business profile"}</button>
    </form>
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "32px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { display: "grid", gap: 12, marginTop: 24, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const errorStyle = { color: "#b91c1c" };
const successStyle = { color: "#166534" };
