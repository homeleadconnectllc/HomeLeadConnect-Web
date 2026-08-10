import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#111827",
        color: "#9ca3af",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <nav aria-label="Footer" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
        <Link to="/about">About</Link>
        <Link to="/how-it-works">How It Works</Link>
        <Link to="/homeowners">Homeowners</Link>
        <Link to="/contractors">Contractors</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      © {new Date().getFullYear()} HomeLead Connect LLC
    </footer>
  );
}
