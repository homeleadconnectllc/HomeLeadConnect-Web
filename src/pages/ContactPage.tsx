import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <main
      className="hlc-contact-page"
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "clamp(40px, 8vw, 80px) 24px",
        textAlign: "center",
      }}
    >
      <h1>Contact HomeLead Connect</h1>

      <p>HomeLead Connect LLC is preparing its Pennsylvania-first launch.</p>

      <section className="hlc-contact-card" aria-label="HomeLead Connect business contact" style={{ width: "min(620px, 100%)", margin: "32px auto", padding: 24, border: "1px solid #334155", borderRadius: 18, background: "#111827" }}>
        <h2>Business contact</h2>
        <p><strong>HomeLead Connect LLC</strong></p>
        <p>Founder / Owner: Antoine Washington</p>
        <p>Email: <a href="mailto:homeleadconnect@gmail.com">homeleadconnect@gmail.com</a></p>
        <p>Phone: <a href="tel:+17172881785">717-288-1785</a></p>
        <p>Website: <a href="https://homeleadconnect.org">homeleadconnect.org</a></p>
        <p>Pennsylvania</p>
      </section>

      <p>For a Pennsylvania service request, use the Request Service form so the request can enter the correct HLC workflow.</p>
      <Link to="/request-service">Request service</Link>
    </main>
  );
}
