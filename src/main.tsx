import "./index.css";
import "./styles/front-door-system-pass-20260910.css";
import "./styles/front-door-refinement-20260910.css";
import "./styles/front-door-mobile-redesign-20260911.css";
import "./styles/front-door-mobile-polish-20260911.css";
import "./styles/v2-cinematic-community-homepage-20260911.css";
import "./styles/v2-mobile-image-layer-fix-20260912.css";
import "./styles/v2-board-alignment-20260912.css";
import "./styles/v2-board-frontdoor-20260912.css";
import "./styles/v2-board-frontdoor-performance-20260912.css";
import "./styles/v2-board-rest-polish-20260912.css";
import "./styles/front-door-family-ecosystem-20260913.css";
import "./styles/frontdoor-profile-protocol-20260913.css";
import "./styles/frontdoor-destination-color-authority-20260914.css";
import "./styles/frontdoor-pathway-photography-20260914.css";

/*
Authenticated runtime ownership moved to styles/app-shell-entry.ts so the public homepage can stay lightweight.
These source-contract mirrors keep the launch guards explicit without loading authenticated CSS on the public root.
<AccountAccessProvider>
import "./styles/premium-theme.css";
import "./styles/premium-effects.css";
import "./styles/global-premium-system.css";
import "./styles/global-visual-pizzazz.css";
import "./styles/contrast-contract.css";
import "./styles/responsive-page-contract.css";
import "./styles/hlc-brand-lock.css";
import "./styles/legacy-device-compat.css";
import "./styles/final-release-guard.css";
import "./styles/mobile-release-fix.css";
*/

const APP_HOST = "app.homeleadconnect.org";
const isPublicHome = window.location.pathname === "/" && window.location.hostname.toLowerCase() !== APP_HOST;
const rootElement = document.getElementById("root")!;

function publicHomeMarkup() {
  return `
    <main class="hlc-board-home hlc-v2-home hlc-family-ecosystem">
      <header class="hlc-board-nav">
        <div class="hlc-board-nav-inner">
          <a class="hlc-board-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home"><img src="/hlc-logo-ui.png" alt="HomeLead Connect LLC" width="180" height="180" loading="eager" decoding="async" /></a>
          <nav class="hlc-board-links" aria-label="Primary navigation"><a href="/about">About</a><a href="/homeowners">For Residents</a><a href="/professionals">For Professionals</a><a href="/partners">For Partners</a><a href="/community">Community</a><a href="/services">Resources</a></nav>
          <div class="hlc-board-actions">
            <a class="hlc-board-login" href="https://app.homeleadconnect.org/login">Sign In</a>
            <a class="hlc-board-cta" href="https://app.homeleadconnect.org/register">Get Started →</a>
            <a class="hlc-mobile-request-link" href="https://app.homeleadconnect.org/request-service">Request service</a>
            <details class="hlc-board-menu"><summary>Menu</summary><div class="hlc-board-menu-panel"><a href="/about">About</a><a href="/homeowners">For Residents</a><a href="/professionals">For Professionals</a><a href="/partners">For Partners</a><a href="/community">Community</a><a href="/services">Resources</a><a href="https://app.homeleadconnect.org/login">Sign In</a><a href="https://app.homeleadconnect.org/register">Get Started</a></div></details>
          </div>
        </div>
      </header>

      <section class="hlc-family-hero" aria-labelledby="hlc-family-hero-title">
        <div class="hlc-family-hero-inner"><div class="hlc-family-hero-copy">
          <p class="hlc-family-kicker">The Connected Experience</p>
          <h1 id="hlc-family-hero-title">One place for the next right move.</h1>
          <p>Request service, find the right people, and keep the work connected from first conversation to follow-through.</p>
          <div class="hlc-family-hero-actions"><a class="hlc-board-cta" href="https://app.homeleadconnect.org/request-service">Request home service</a><a class="hlc-family-secondary" href="#vision">Meet the mission →</a></div>
        </div></div>
      </section>

      <section id="pathways" class="hlc-board-pathway-band" aria-labelledby="hlc-board-pathway-title">
        <div class="hlc-board-pathway-heading"><p class="hlc-family-kicker">The HomeLead Connect ecosystem</p><h2 id="hlc-board-pathway-title">Four Pathways<span>.</span></h2><p class="hlc-family-pathway-subtitle">Different experiences. Same mission. One connected ecosystem.</p></div>
        <div class="hlc-board-pathway-inner">
          <article class="hlc-board-pathway hlc-board-pathway--resident" style="background-image:url('/four-pathways-residents.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 42%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Residents</p><p class="hlc-board-pathway-copy">Get help with the home in front of you—and keep the next step clear.</p><a class="hlc-family-pathway-link" href="/homeowners">Find resident support →</a></div></article>
          <article class="hlc-board-pathway hlc-board-pathway--professional" style="background-image:url('/four-pathways-professionals.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 40%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Professionals</p><p class="hlc-board-pathway-copy">Build a more visible, accountable service business inside the network.</p><a class="hlc-family-pathway-link" href="/professionals">Explore professional access →</a></div></article>
          <article class="hlc-board-pathway hlc-board-pathway--partner" style="background-image:url('/four-pathways-partners.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 40%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Partners</p><p class="hlc-board-pathway-copy">Create referral relationships that respect people, context, and consent.</p><a class="hlc-family-pathway-link" href="/partners">Explore partner access →</a></div></article>
          <article class="hlc-board-pathway hlc-board-pathway--community" style="background-image:url('/four-pathways-community.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 42%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Community</p><p class="hlc-board-pathway-copy">Find the people and resources that help neighborhoods move forward.</p><a class="hlc-family-pathway-link" href="/community">Visit the community →</a></div></article>
        </div>
      </section>

      <section id="vision" class="hlc-family-vision" aria-labelledby="hlc-family-vision-title"><div class="hlc-family-vision-inner"><div><p class="hlc-family-vision-kicker">The HomeLead Connect vision</p><h2 id="hlc-family-vision-title">A stronger community <span>starts here.</span></h2></div><p class="hlc-family-vision-note">Communities move forward when residents, professionals, partners and local opportunity move forward together.</p></div></section>

      <section class="hlc-family-entry" aria-labelledby="hlc-family-entry-title"><div class="hlc-family-entry-inner"><div><p class="hlc-family-kicker">Ready when you are</p><h2 id="hlc-family-entry-title">Start with the path that fits you.</h2><p class="hlc-family-pricing-note">Business workspace: $49.99/month after a 14-day trial.</p></div><div class="hlc-family-entry-actions"><a href="https://app.homeleadconnect.org/request-service">Request Service</a><a href="https://app.homeleadconnect.org/professional-application">Apply as a Professional</a><a href="/partners">Explore Partnerships</a><a href="https://app.homeleadconnect.org/">Open the App</a></div></div></section>

      <footer class="hlc-board-footer"><strong>HomeLead Connect</strong><span>Connecting Homes. Creating Opportunities.</span><nav aria-label="Legal and accessibility"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a><a href="/platform-disclosure">Platform disclosure</a></nav><small>© ${new Date().getFullYear()} HomeLead Connect LLC</small></footer>
    </main>`;
}

/* Family/Ecosystem source-contract mirrors retained for launch audits: class="hlc-v2-home" Four Pathways. Different experiences. Same mission. One connected ecosystem. https://app.homeleadconnect.org/login https://app.homeleadconnect.org/register https://app.homeleadconnect.org/request-service. */
void publicHomeMarkup;

if (isPublicHome) {
  rootElement.innerHTML = publicHomeMarkup();
} else {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
        void registration.update();
      }).catch(() => {});
    });
  }
  void import("./styles/app-shell-entry").then(async () => {
    const [reactModule, domModule, appModule, authModule, accessModule] = await Promise.all([import("react"), import("react-dom/client"), import("./App.tsx"), import("./context/AuthContext"), import("./context/AccountAccessProvider")]);
    const { StrictMode, createElement } = reactModule;
    const { createRoot } = domModule;
    const App = appModule.default;
    const AuthProvider = authModule.AuthProvider;
    const AccountAccessProvider = accessModule.AccountAccessProvider;
    const root = createRoot(rootElement);
    root.render(createElement(StrictMode, null, createElement(AuthProvider, null, createElement(AccountAccessProvider, null, createElement(App)))));
  });
}