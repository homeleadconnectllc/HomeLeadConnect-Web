import { Link } from "react-router-dom";

const card = {
  display: "grid",
  gap: 10,
  padding: "clamp(20px,4vw,30px)",
  border: "1px solid #dbe7f4",
  borderRadius: 20,
  background: "#fff",
  boxShadow: "0 18px 50px rgba(15,23,42,.07)",
} as const;

export default function AboutPage() {
  return (
    <main style={{ width: "min(1100px,calc(100% - 28px))", margin: "clamp(22px,5vw,56px) auto 72px", display: "grid", gap: 20, color: "#0f172a" }}>
      <header style={{ padding: "clamp(28px,7vw,64px)", borderRadius: 28, color: "#f8fafc", background: "radial-gradient(circle at 15% 0%,rgba(14,165,233,.2),transparent 32%),linear-gradient(145deg,#050b14,#0b2345)", boxShadow: "0 28px 80px rgba(15,23,42,.2)" }}>
        <p style={{ margin: 0, color: "#93c5fd", fontSize: 11, fontWeight: 900, letterSpacing: ".15em" }}>HOMELEAD CONNECT LLC</p>
        <h1 style={{ margin: "10px 0 14px", color: "#fff", fontSize: "clamp(2.2rem,6vw,4.8rem)", lineHeight: 1, letterSpacing: "-.045em" }}>Built to connect home help with real operations.</h1>
        <p style={{ maxWidth: 780, margin: 0, color: "#dbeafe", lineHeight: 1.7, fontSize: "clamp(16px,2vw,20px)", fontWeight: 600 }}>
          HomeLead Connect is a connected home-services platform for residents, renters, homeowners, providers, technicians, contractors, subcontractors, service businesses, and the teams coordinating the work between them.
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 16 }}>
        <article style={{ ...card, borderColor: "#bfdbfe" }}>
          <p style={{ margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>FOUNDER & BUILDER</p>
          <h2 style={{ margin: 0, fontSize: "clamp(1.65rem,4vw,2.25rem)", color: "#0f172a" }}>Antoine Washington</h2>
          <p style={{ margin: 0, fontWeight: 900, color: "#334155" }}>Founder · Owner · Product Creator · Lead Developer · Technical Architect</p>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>
            Antoine Washington founded HomeLead Connect and has led the product vision, application build, workflow design, technical implementation, operational systems, launch hardening, and day-to-day platform development.
          </p>
        </article>

        <article style={card}>
          <p style={{ margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>WHAT HLC DOES</p>
          <h2 style={{ margin: 0 }}>Connection + guidance + execution</h2>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>
            HLC connects service requests, lead review, estimating, provider coordination, scheduling, jobs, communications, documents, workflow automation, analytics, and customer follow-through in one operating system.
          </p>
        </article>

        <article style={card}>
          <p style={{ margin: 0, color: "#2563eb", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>IN REMEMBRANCE</p>
          <h2 style={{ margin: 0 }}>Kendrell Memorial</h2>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>
            A quiet, dedicated space honoring Kendrell Charles Washington and the family story carried forward through HomeLead Connect.
          </p>
          <Link to="/memorial" style={{ marginTop: 4, color: "#1d4ed8", fontWeight: 800 }}>Visit the memorial</Link>
        </article>
      </section>

      <section style={card}>
        <h2 style={{ margin: 0 }}>Credits</h2>
        <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>HomeLead Connect LLC product direction, platform architecture, application development, operations design, and launch implementation: Antoine Washington.</p>
        <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>HomeLead Connect visual logo design credit: Dion Diamond.</p>
      </section>
    </main>
  );
}
