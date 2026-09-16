import "../styles/public-footer-home-authority-20260916.css";

const legalLinkStyle = {
  color: "#bfdbfe",
  fontWeight: 600,
} as const;

export default function Footer() {
  return (
    <footer className="hlc-public-footer hlc-board-footer hlc-public-footer-home-authority">
      <a className="hlc-public-footer-home-authority__brand" href="/" aria-label="HomeLead Connect home">
        <img
          src="/brand/homelead-connect-master-transparent.png"
          srcSet="/hlc-logo-ui.png 180w, /brand/homelead-connect-master-transparent.png 1254w"
          sizes="(max-width: 680px) 136px, 190px"
          alt="HomeLead Connect LLC"
          width={1254}
          height={1254}
        />
      </a>
      <strong>HomeLead Connect</strong>
      <span>Connecting Homes. Creating Opportunities.</span>
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
      <small>© {new Date().getFullYear()} HomeLead Connect LLC</small>
    </footer>
  );
}
