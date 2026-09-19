import { publicUrl } from "../config/siteOrigins";

type FooterProps = {
  showLogo?: boolean;
};

export default function Footer({ showLogo = true }: FooterProps) {
  return (
    <footer className="hlc-public-footer hlc-board-footer hlc-public-footer-home-authority">
      {showLogo && <img className="hlc-public-footer-master-logo" src="/hlc-logo-ui.png" alt="HomeLead Connect LLC" />}
      <strong>HomeLead Connect</strong>
      <span>Connecting Homes. Creating Opportunities.</span>
      <nav aria-label="Legal and accessibility">
        <a href={publicUrl("/privacy")}>Privacy</a>
        <a href={publicUrl("/terms")}>Terms</a>
        <a href={publicUrl("/accessibility")}>Accessibility</a>
        <a href={publicUrl("/platform-disclosure")}>Platform disclosure</a>
      </nav>
      <small>© {new Date().getFullYear()} HomeLead Connect LLC</small>
    </footer>
  );
}
