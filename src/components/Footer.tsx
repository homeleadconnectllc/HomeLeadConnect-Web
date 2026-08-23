const legalLinkStyle = {
  color: "#bfdbfe",
  fontWeight: 600,
} as const;

export default function Footer() {
  return (
    <footer className="hlc-public-footer">
      <a className="hlc-public-footer-brand" href="/" aria-label="HomeLead Connect home">
        <span className="hlc-public-footer-mark" aria-hidden="true">
          <img src="/hlc-icon.jpeg" alt="" />
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
          gap: "10px 18px",
          marginBottom: 12,
        }}
      >
        <a style={legalLinkStyle} href="/privacy">Privacy</a>
        <a style={legalLinkStyle} href="/terms">Terms</a>
        <a style={legalLinkStyle} href="/accessibility">Accessibility</a>
        <a style={legalLinkStyle} href="/platform-disclosure">Platform disclosure</a>
      </nav>
      <div>© {new Date().getFullYear()} HomeLead Connect LLC</div>
    </footer>
  );
}
