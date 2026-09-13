const legalLinkStyle = {
  color: "#a9c7e8",
  fontWeight: 650,
  fontSize: "0.78rem",
  textDecoration: "none",
} as const;

export default function Footer() {
  return (
    <footer className="hlc-public-footer" style={{ color: "#9fb3c9" }}>
      <a className="hlc-public-footer-brand" href="/" aria-label="HomeLead Connect home">
        <span className="hlc-public-footer-mark" aria-hidden="true">
          <img src="/hlc-logo-transparent.png" alt="" />
        </span>
        <span>
          <strong>HomeLead Connect</strong>
          <small>Home services network</small>
        </span>
      </a>
      <nav
        aria-label="Legal and accessibility"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px 16px",
          marginBottom: 14,
        }}
      >
        <a style={legalLinkStyle} href="/privacy">Privacy</a>
        <a style={legalLinkStyle} href="/terms">Terms</a>
        <a style={legalLinkStyle} href="/accessibility">Accessibility</a>
        <a style={legalLinkStyle} href="/platform-disclosure">Platform disclosure</a>
      </nav>
      <div style={{ color: "#c4d3e3", fontSize: "0.76rem", fontWeight: 600 }}>
        © {new Date().getFullYear()} HomeLead Connect LLC
      </div>
    </footer>
  );
}
