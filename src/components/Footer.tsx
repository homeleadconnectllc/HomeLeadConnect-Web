import { publicUrl } from "../config/siteOrigins";
import "../styles/public-footer-home-authority-20260916.css";

const legalLinkStyle = { color: "#bfdbfe", fontWeight: 600 } as const;

type FooterProps = {
  showLogo?: boolean;
};

export default function Footer({ showLogo = true }: FooterProps) {
  return (
    <footer className="hlc-public-footer hlc-board-footer hlc-public-footer-home-authority">
      {showLogo && <img className="hlc-public-footer-master-logo" src="/brand/homelead-connect-master-transparent.png" alt="HomeLead Connect LLC" />}
      <strong>HomeLead Connect</strong>
      <span>Connecting Homes. Creating Opportunities.</span>
      <nav aria-label="Legal and accessibility" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "10px 18px", marginBottom: 12 }}>
        <a style={legalLinkStyle} href={publicUrl("/privacy")}>Privacy</a>
        <a style={legalLinkStyle} href={publicUrl("/terms")}>Terms</a>
        <a style={legalLinkStyle} href={publicUrl("/accessibility")}>Accessibility</a>
        <a style={legalLinkStyle} href={publicUrl("/platform-disclosure")}>Platform disclosure</a>
      </nav>
      <small>© {new Date().getFullYear()} HomeLead Connect LLC</small>
    </footer>
  );
}
