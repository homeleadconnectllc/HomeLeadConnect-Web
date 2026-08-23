import { Link } from "react-router-dom";

const legalLinkStyle = {
  color: "#bfdbfe",
  fontWeight: 600,
} as const;

export default function Footer() {
  return (
    <footer className="hlc-public-footer">
      <Link className="hlc-public-footer-brand" to="/" aria-label="HomeLead Connect home">
        <span className="hlc-public-footer-mark" aria-hidden="true">
          <img src="/hlc-icon.jpeg" alt="" />
        </span>
        <span>
          <strong>HomeLead Connect</strong>
          <small>Home services network</small>
        </span>
      </Link>
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
        <Link style={legalLinkStyle} to="/privacy">Privacy</Link>
        <Link style={legalLinkStyle} to="/terms">Terms</Link>
        <Link style={legalLinkStyle} to="/accessibility">Accessibility</Link>
        <Link style={legalLinkStyle} to="/platform-disclosure">Platform disclosure</Link>
      </nav>
      <div>© {new Date().getFullYear()} HomeLead Connect LLC</div>
    </footer>
  );
}
