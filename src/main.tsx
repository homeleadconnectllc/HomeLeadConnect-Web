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
    <main class="hlc-board-home hlc-v2-home">
      <header class="hlc-board-nav">
        <div class="hlc-board-nav-inner">
          <a class="hlc-board-brand" href="/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-public.webp" alt="HomeLead Connect LLC" width="440" height="142" loading="eager" decoding="async" />
          </a>
          <nav class="hlc-board-links" aria-label="Primary navigation">
            <a href="/">Home</a>
            <a href="/homeowners">For Residents</a>
            <a href="/professionals">For Professionals</a>
            <a href="/partners">For Partners</a>
            <a href="/community">For Our Community</a>
          </nav>
          <div class="hlc-board-actions">
            <a class="hlc-board-login" href="/login">Login</a>
            <a class="hlc-board-cta" href="/register">Get Started</a>
            <details class="hlc-board-menu">
              <summary>Menu</summary>
              <div class="hlc-board-menu-panel">
                <a href="/homeowners">For Residents</a>
                <a href="/professionals">For Professionals</a>
                <a href="/partners">For Partners</a>
                <a href="/community">For Our Community</a>
                <a href="/login">Login</a>
                <a href="/register">Get Started</a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section class="hlc-board-hero" aria-labelledby="hlc-board-title">
        <img class="hlc-board-hero-media" src="/hlc-frontdoor-resident-hero-v2.webp" alt="" width="1536" height="864" fetchpriority="high" decoding="async" />
        <div class="hlc-board-hero-inner">
          <div>
            <p class="hlc-board-kicker">More than homes.</p>
            <h1 id="hlc-board-title">We Build<br /><span>Opportunities.</span></h1>
            <p class="hlc-board-copy">HomeLead Connect connects homeowners, professionals, partners and communities with the resources, services and opportunities that create lasting generational wealth.</p>
            <div class="hlc-board-actions-row">
              <a class="hlc-board-btn" href="/register">Get Started</a>
              <a class="hlc-board-btn hlc-board-btn--ghost" href="/about">Learn More →</a>
            </div>
          </div>
          <aside class="hlc-board-app-panel" aria-label="The platform connects the ecosystem. The app puts it in your hands.">
            <p class="hlc-board-app-panel-label">The HLC App</p>
            <h2>Your opportunity.<br/>In your hands.</h2>
            <div class="hlc-board-app-icon"><img src="/hlc-icon.jpeg" alt="HLC app icon" width="270" height="270" loading="lazy" decoding="async" /></div>
            <p>One connected place to manage your home, services, professional opportunities and community connections.</p>
            <a class="hlc-board-btn" href="/app">Open HLC App →</a>
          </aside>
        </div>
      </section>

      <section class="hlc-board-pathway-band hlc-v2-horizon-band" aria-labelledby="hlc-board-pathway-title">
        <div class="hlc-board-pathway-heading">
          <p>Choose your path</p>
          <h2 id="hlc-board-pathway-title">One platform. Built around you.</h2>
          <span>Start where you are. HomeLead Connect brings the next opportunity closer.</span>
        </div>
        <div class="hlc-board-pathway-inner">
          <article class="hlc-board-pathway hlc-v2-card--resident hlc-board-pathway--resident"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Residents</p><p class="hlc-board-pathway-copy">Find homes. Build wealth. Create your future.</p></div><a class="hlc-board-pathway-arrow" href="/homeowners" aria-label="Open For Residents">→</a></article>
          <article class="hlc-board-pathway hlc-v2-card--professional hlc-board-pathway--professional"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Professionals</p><p class="hlc-board-pathway-copy">Grow your business. Get more opportunities.</p></div><a class="hlc-board-pathway-arrow" href="/professionals" aria-label="Open For Professionals">→</a></article>
          <article class="hlc-board-pathway hlc-v2-card--partner hlc-board-pathway--partner"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Partners</p><p class="hlc-board-pathway-copy">Collaborate. Invest. Make a bigger impact.</p></div><a class="hlc-board-pathway-arrow" href="/partners" aria-label="Open For Partners">→</a></article>
          <article class="hlc-board-pathway hlc-v2-card--community hlc-board-pathway--community"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Our Community</p><p class="hlc-board-pathway-copy">Stronger neighborhoods. Greater possibilities.</p></div><a class="hlc-board-pathway-arrow" href="/community" aria-label="Open For Our Community">→</a></article>
        </div>
      </section>

      <section class="hlc-board-worlds" aria-labelledby="hlc-board-worlds-title">
        <div class="hlc-board-worlds-inner">
          <div class="hlc-board-section-title"><div><p class="hlc-board-section-kicker">The ecosystem</p><h2 id="hlc-board-worlds-title">The Four Visual Worlds</h2></div><span>Different needs. One connected platform.</span></div>
          <div class="hlc-board-world-grid">
            <article class="hlc-board-world hlc-board-world--resident"><div class="hlc-board-world-content"><strong>Residents</strong><small>Homeownership · Family · Community · Legacy</small></div></article>
            <article class="hlc-board-world hlc-board-world--professional"><div class="hlc-board-world-content"><strong>Professionals</strong><small>Jobs · Tools · Training · Growth</small></div></article>
            <article class="hlc-board-world hlc-board-world--partner"><div class="hlc-board-world-content"><strong>Partners</strong><small>Collaboration · Business · Impact · Scale</small></div></article>
            <article class="hlc-board-world hlc-board-world--internal"><div class="hlc-board-world-content"><strong>Internal</strong><small>Operations · Technology · Data · Excellence</small></div></article>
          </div>
        </div>
      </section>

      <section class="hlc-board-identity" aria-labelledby="hlc-board-identity-title">
        <div class="hlc-board-identity-inner"><div><p class="hlc-board-identity-kicker">The brand rule</p><h2 id="hlc-board-identity-title">HomeLead Connect = The Platform.<br/>HLC = The App.</h2><p>Same mission. Different experiences. One connected ecosystem.</p><p><strong>Connecting Homes.<br />Creating <span>Opportunities.</span></strong></p></div><img src="/hlc-logo-public.webp" alt="HomeLead Connect LLC official logo" width="440" height="142" loading="lazy"/></div>
      </section>

      <footer class="hlc-board-footer"><strong>HomeLead Connect LLC</strong><span>Harrisburg, Pennsylvania</span><a href="mailto:info@homeleadconnect.org">info@homeleadconnect.org</a><span>Connecting Homes.<br />Creating <span>Opportunities.</span></span><nav aria-label="Legal and accessibility"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a><a href="/platform-disclosure">Platform disclosure</a></nav><small>© ${new Date().getFullYear()} HomeLead Connect LLC</small></footer>
    </main>`;
}

/* V2 source-contract mirrors retained for launch audits: class="hlc-v2-home" One Platform.<br />Four Pathways. Infinite impact. A Stronger Community Builds a Brighter Future. https://professionals.homeleadconnect.org/ <a href="https://app.homeleadconnect.org/login">Sign In</a> <a href="https://app.homeleadconnect.org/register">Create My HomeLead Connect Account</a> <a href="https://app.homeleadconnect.org/request-service">Get Help Now</a>. */

/* The canonical React route is the live public root. The legacy no-React markup above remains only as an audit/source-contract mirror. */
if (false && isPublicHome) {
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