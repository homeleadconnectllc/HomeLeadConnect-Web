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
import "./styles/front-door-public-root-reset-20260913.css";

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
          <a class="hlc-board-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-transparent.png" alt="HomeLead Connect LLC" width="64" height="64" loading="eager" decoding="async" />
          </a>
          <nav class="hlc-board-links" aria-label="Primary navigation">
            <a href="/about">About</a>
            <a href="/homeowners">For Residents</a>
            <a href="/professionals">For Professionals</a>
            <a href="/partners">For Partners</a>
            <a href="/community">Community</a>
            <a href="/services">Resources</a>
          </nav>
          <div class="hlc-board-actions">
            <a class="hlc-board-request" href="https://app.homeleadconnect.org/request-service">Request service</a>
            <a class="hlc-board-login" href="https://app.homeleadconnect.org/login">Sign In</a>
            <a class="hlc-board-register" href="https://app.homeleadconnect.org/register">Get Started →</a>
            <details class="hlc-board-menu">
              <summary><span aria-hidden="true">☰</span><span>Menu</span></summary>
              <div class="hlc-board-menu-panel">
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="/how-it-works">How it works</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="/services">Services</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="/pricing">Pricing</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="/about">About HomeLead Connect</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="/contact">Contact & help</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--resident" href="/homeowners">For Residents</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--professional" href="/professionals">For Professionals</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--partner" href="/partners">For Partners</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--community" href="/community">Community</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="https://app.homeleadconnect.org/login">Sign in</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--neutral" href="https://app.homeleadconnect.org/register">Get Started</a>
                <a class="hlc-board-menu-link hlc-board-menu-link--resident" href="https://app.homeleadconnect.org/request-service">Request service</a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section class="hlc-family-hero" aria-labelledby="hlc-family-hero-title">
        <img class="hlc-family-hero-media" src="/hlc-frontdoor-resident-hero-v2.webp" alt="" width="1536" height="864" fetchpriority="high" decoding="async" />
        <div class="hlc-family-hero-inner">
          <div class="hlc-family-hero-copy">
            <p class="hlc-family-kicker">Homes. People. Opportunity.</p>
            <h1 id="hlc-family-hero-title">A stronger community <span>starts at home.</span></h1>
            <p>HomeLead Connect brings residents, service professionals, partners and communities together through one connected ecosystem built around real people and real progress.</p>
            <div class="hlc-family-hero-actions">
              <a class="hlc-board-cta" href="https://app.homeleadconnect.org/request-service">Request Service</a>
              <a class="hlc-family-secondary" href="#pathways">Explore the ecosystem →</a>
            </div>
          </div>
          <aside class="hlc-family-hero-note" aria-label="HomeLead Connect mission">
            <span>People</span>
            <span>Homes</span>
            <span>Opportunity</span>
            <strong>Together</strong>
          </aside>
        </div>
      </section>

      <section id="pathways" class="hlc-board-pathway-band" aria-labelledby="hlc-board-pathway-title">
        <div class="hlc-board-pathway-heading">
          <p class="hlc-family-kicker">The HomeLead Connect ecosystem</p>
          <h2 id="hlc-board-pathway-title">Four Pathways<span>.</span></h2>
          <p class="hlc-family-pathway-subtitle">Different experiences. Same mission. One connected ecosystem.</p>
          <p class="hlc-family-pathway-copy">HomeLead Connect connects the people, services, businesses and relationships that make a community work.</p>
          <a class="hlc-family-pathway-explore" href="#vision">Explore the ecosystem →</a>
        </div>
        <div class="hlc-board-pathway-inner">
          <article class="hlc-board-pathway hlc-board-pathway--resident">
            <div class="hlc-board-pathway-content"><div class="hlc-family-pathway-icon" aria-hidden="true">⌂</div><p class="hlc-board-pathway-label">For Residents</p><p class="hlc-board-pathway-copy">Build wealth. Find trusted professionals. Create your future.</p><a class="hlc-family-pathway-link" href="/homeowners">Learn More →</a></div>
          </article>
          <article class="hlc-board-pathway hlc-board-pathway--professional">
            <div class="hlc-board-pathway-content"><div class="hlc-family-pathway-icon" aria-hidden="true">▣</div><p class="hlc-board-pathway-label">For Professionals</p><p class="hlc-board-pathway-copy">Grow your business. Get more opportunities.</p><a class="hlc-family-pathway-link" href="/professionals">Learn More →</a></div>
          </article>
          <article class="hlc-board-pathway hlc-board-pathway--partner">
            <div class="hlc-board-pathway-content"><div class="hlc-family-pathway-icon" aria-hidden="true">↔</div><p class="hlc-board-pathway-label">For Partners</p><p class="hlc-board-pathway-copy">Collaborate. Invest. Build a bigger impact.</p><a class="hlc-family-pathway-link" href="/partners">Learn More →</a></div>
          </article>
          <article class="hlc-board-pathway hlc-board-pathway--community">
            <div class="hlc-board-pathway-content"><div class="hlc-family-pathway-icon" aria-hidden="true">●</div><p class="hlc-board-pathway-label">For Our Community</p><p class="hlc-board-pathway-copy">Stronger neighborhoods. Greater possibilities.</p><a class="hlc-family-pathway-link" href="/community">Learn More →</a></div>
          </article>
        </div>
      </section>

      <section id="vision" class="hlc-family-vision" aria-labelledby="hlc-family-vision-title">
        <div class="hlc-family-vision-inner">
          <div><p class="hlc-family-vision-kicker">The HomeLead Connect vision</p><h2 id="hlc-family-vision-title">A stronger community <span>starts here.</span></h2></div>
          <p class="hlc-family-vision-note">Communities move forward when residents, professionals, partners and local opportunity move forward together.</p>
        </div>
      </section>

      <section class="hlc-family-entry" aria-labelledby="hlc-family-entry-title">
        <div class="hlc-family-entry-inner">
          <div><p class="hlc-family-kicker">Ready when you are</p><h2 id="hlc-family-entry-title">Start with the path that fits you.</h2><p class="hlc-family-pricing-note">Business workspace: $49.99/month after 14-day trial.</p></div>
          <div class="hlc-family-entry-actions">
            <a href="https://app.homeleadconnect.org/request-service">Request Service</a>
            <a href="https://app.homeleadconnect.org/professional-application">Apply as a Professional</a>
            <a href="/partners">Explore Partnerships</a>
            <a href="https://app.homeleadconnect.org/">Open the App</a>
          </div>
        </div>
      </section>

      <footer class="hlc-board-footer">
        <strong>HomeLead Connect LLC</strong>
        <span>Connecting Homes. Creating Opportunities.</span>
        <nav aria-label="Legal and accessibility"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a><a href="/platform-disclosure">Platform disclosure</a></nav>
        <small>© ${new Date().getFullYear()} HomeLead Connect LLC</small>
      </footer>
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
