import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#111827",
        color: "#9ca3af",
        textAlign: "center",
        padding: "26px 20px",
      }}
    >
      <nav
        aria-label="Legal and accessibility"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px 18px",
          marginBottom: 12,
        }}
      >
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/accessibility">Accessibility</Link>
        <Link to="/platform-disclosure">Platform disclosure</Link>
      </nav>
      <div>© {new Date().getFullYear()} HomeLead Connect LLC</div>
    </footer>
  );
}
