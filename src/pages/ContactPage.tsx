import { Link } from "react-router-dom";

const paths = [
  { eyebrow: "HOME HELP", title: "Request home service", body: "Tell HLC what you need and route the request into the connected service workflow.", to: "/request-service", action: "Start service request" },
  { eyebrow: "PROFESSIONALS", title: "Grow with the HLC network", body: "Contractors, trades and service businesses can apply to participate in the HomeLead Connect ecosystem.", to: "/professional-application", action: "Apply as a professional" },
  { eyebrow: "PLATFORM", title: "Account & business support", body: "Questions about HLC, workspace access, partnerships or the platform can go directly to our business contact.", to: "mailto:homeleadconnect@gmail.com", action: "Email HomeLead Connect" },
] as const;

export default function ContactPage() {
  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <img src="/branding/hlc-logo-full.png" alt="HomeLead Connect" style={logoStyle} />
        <p style={eyebrowStyle}>HOMELEAD CONNECT · CONTACT</p>
        <h1 style={titleStyle}>How can we help?</h1>
        <p style={introStyle}>One place for home-service requests, professional opportunities, and HomeLead Connect platform support.</p>
        <div style={heroActionsStyle}>
          <Link to="/request-service" style={primaryButtonStyle}>Request home service</Link>
          <Link to="/professionals" style={glassButtonStyle}>For professionals</Link>
        </div>
      </section>

      <section aria-label="Contact paths" style={gridStyle}>
        {paths.map((item) => (
          <article key={item.title} style={cardStyle}>
            <p style={cardEyebrowStyle}>{item.eyebrow}</p>
            <h2 style={cardTitleStyle}>{item.title}</h2>
            <p style={cardCopyStyle}>{item.body}</p>
            {item.to.startsWith("mailto:") ? <a href={item.to} style={cardLinkStyle}>{item.action} →</a> : <Link to={item.to} style={cardLinkStyle}>{item.action} →</Link>}
          </article>
        ))}
      </section>

      <section aria-label="HomeLead Connect business contact" style={contactPanelStyle}>
        <div style={contactIntroStyle}>
          <p style={darkEyebrowStyle}>BUSINESS CONTACT</p>
          <h2 style={contactTitleStyle}>HomeLead Connect LLC</h2>
          <p style={contactCopyStyle}>Serving the Pennsylvania launch market with a connected platform for residents, professionals, and participating businesses.</p>
        </div>
        <div style={contactDetailsStyle}>
          <div><span style={detailLabelStyle}>Founder / Owner</span><strong>Antoine Washington</strong></div>
          <div><span style={detailLabelStyle}>Email</span><a href="mailto:homeleadconnect@gmail.com" style={detailLinkStyle}>homeleadconnect@gmail.com</a></div>
          <div><span style={detailLabelStyle}>Phone</span><a href="tel:+17172881785" style={detailLinkStyle}>717-288-1785</a></div>
          <div><span style={detailLabelStyle}>Web</span><a href="https://homeleadconnect.org" style={detailLinkStyle}>homeleadconnect.org</a></div>
        </div>
      </section>

      <section style={closingStyle}>
        <p style={darkEyebrowStyle}>READY WHEN YOU ARE</p>
        <h2 style={closingTitleStyle}>Start with the right HLC path.</h2>
        <p style={closingCopyStyle}>Service requests enter the HLC workflow for review. Submitting a request does not guarantee provider assignment, pricing, or an appointment.</p>
        <Link to="/request-service" style={primaryButtonStyle}>Request service →</Link>
      </section>
    </main>
  );
}

const pageStyle = { width: "min(1180px, calc(100% - 28px))", margin: "clamp(18px,4vw,44px) auto 72px", display: "grid", gap: "clamp(18px,3vw,28px)", color: "#0f172a" };
const heroStyle = { position: "relative" as const, overflow: "hidden", borderRadius: 30, padding: "clamp(30px,7vw,72px) clamp(20px,6vw,64px)", textAlign: "center" as const, color: "#f8fafc", background: "radial-gradient(circle at 85% 15%,rgba(59,130,246,.28),transparent 30%),linear-gradient(145deg,#050b14 0%,#0b1c33 55%,#0b3150 100%)", boxShadow: "0 28px 80px rgba(15,23,42,.22)" };
const logoStyle = { width: "min(220px,58vw)", maxHeight: 76, objectFit: "contain" as const, margin: "0 auto 18px" };
const eyebrowStyle = { margin: 0, color: "#93c5fd", fontSize: 12, fontWeight: 900, letterSpacing: ".16em" };
const titleStyle = { margin: "10px auto 14px", color: "#fff", fontSize: "clamp(2.1rem,5.8vw,4.7rem)", lineHeight: .98, letterSpacing: "-.045em", maxWidth: 820 };
const introStyle = { maxWidth: 720, margin: "0 auto", color: "#dbeafe", fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.65, fontWeight: 600 };
const heroActionsStyle = { display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: 12, marginTop: 26 };
const primaryButtonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "12px 20px", borderRadius: 14, color: "#fff", background: "linear-gradient(135deg,#2563eb,#0ea5e9)", textDecoration: "none", fontWeight: 900, boxShadow: "0 12px 30px rgba(37,99,235,.28)" };
const glassButtonStyle = { ...primaryButtonStyle, background: "rgba(255,255,255,.08)", border: "1px solid rgba(191,219,254,.35)", boxShadow: "none", backdropFilter: "blur(12px)" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16 };
const cardStyle = { minHeight: 230, display: "flex", flexDirection: "column" as const, padding: "clamp(22px,4vw,30px)", borderRadius: 22, background: "linear-gradient(180deg,#ffffff,#f8fbff)", border: "1px solid #dbe7f4", boxShadow: "0 16px 42px rgba(15,23,42,.07)" };
const cardEyebrowStyle = { margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".14em" };
const cardTitleStyle = { margin: "10px 0 9px", fontSize: "clamp(20px,3vw,25px)", letterSpacing: "-.02em" };
const cardCopyStyle = { margin: "0 0 22px", color: "#475569", lineHeight: 1.65, fontWeight: 600, flex: 1 };
const cardLinkStyle = { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" };
const contactPanelStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))", gap: 24, alignItems: "center", padding: "clamp(24px,5vw,46px)", borderRadius: 26, background: "#f8fafc", border: "1px solid #dbe7f4" };
const contactIntroStyle = { maxWidth: 520 };
const darkEyebrowStyle = { margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".14em" };
const contactTitleStyle = { margin: "8px 0 10px", fontSize: "clamp(1.8rem,4vw,2.7rem)", letterSpacing: "-.035em" };
const contactCopyStyle = { margin: 0, color: "#475569", lineHeight: 1.7, fontWeight: 600 };
const contactDetailsStyle = { display: "grid", gap: 14, padding: 20, borderRadius: 20, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 12px 30px rgba(15,23,42,.05)" };
const detailLabelStyle = { display: "block", marginBottom: 3, color: "#64748b", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const detailLinkStyle = { color: "#0f4c81", fontWeight: 800, overflowWrap: "anywhere" as const };
const closingStyle = { padding: "clamp(28px,5vw,48px)", borderRadius: 26, textAlign: "center" as const, background: "linear-gradient(180deg,#f8fbff,#eef6ff)", border: "1px solid #dbeafe" };
const closingTitleStyle = { margin: "8px 0 10px", fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "-.035em" };
const closingCopyStyle = { maxWidth: 720, margin: "0 auto 20px", color: "#475569", lineHeight: 1.65, fontWeight: 600 };
