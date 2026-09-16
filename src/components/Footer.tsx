import "../styles/public-footer-home-authority-20260916.css";

export default function Footer() {
  return (
    <footer className="hlc-board-footer hlc-public-footer-home-authority">
      <a className="hlc-public-footer-home-authority__brand" href="/" aria-label="HomeLead Connect home">
        <img src="/brand/homelead-connect-master-transparent.png" alt="HomeLead Connect LLC" width={1254} height={1254} />
      </a>
      <strong>HomeLead Connect</strong>
      <span>Connecting Homes. Creating Opportunities.</span>
      <nav aria-label="Legal and accessibility">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/accessibility">Accessibility</a>
        <a href="/platform-disclosure">Platform disclosure</a>
      </nav>
      <small>© {new Date().getFullYear()} HomeLead Connect LLC</small>
    </footer>
  );
}
