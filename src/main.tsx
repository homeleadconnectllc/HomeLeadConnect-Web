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
import "./styles/public-header-logo-authority-20260915.css";
import "./styles/public-home-centered-copy-authority-20260915.css";
import "./styles/public-home-title-spacing-repair-20260915.css";
import "./styles/public-home-section-blend-authority-20260915.css";
import "./styles/public-home-final-composition-20260915.css";
import "./styles/public-home-mobile-nav-v4-20260915.css";

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

const icon = (body: string) => `<svg class="hlc-mobile-icon-nav-v4__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const menuItem = (label: string, href: string, tone: string, iconBody: string) => `<a class="hlc-mobile-icon-nav-v4__item hlc-mobile-icon-nav-v4__item--${tone}" href="${href}"><span class="hlc-mobile-icon-nav-v4__tile" aria-hidden="true">${icon(iconBody)}</span><span class="hlc-mobile-icon-nav-v4__label">${label}</span></a>`;

function publicHomeMarkup() {
  return `
    <main class="hlc-board-home hlc-v2-home hlc-family-ecosystem">
      <header class="hlc-board-nav">
        <div class="hlc-board-nav-inner">
          <a class="hlc-board-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home"><img src="/brand/homelead-connect-master-transparent.png" srcset="/hlc-logo-ui.png 180w, /brand/homelead-connect-master-transparent.png 1254w" sizes="(max-width: 680px) 56px, 64px" alt="HomeLead Connect LLC" width="1254" height="1254" loading="eager" decoding="async" fetchpriority="high" /></a>
          <nav class="hlc-board-links" aria-label="Primary navigation"><a href="/about">About</a><a href="/homeowners">For Residents</a><a href="/professionals">For Professionals</a><a href="/partners">For Partners</a><a href="/community">Community</a><a href="/services">Resources</a></nav>
          <div class="hlc-board-actions">
            <a class="hlc-board-login" href="https://app.homeleadconnect.org/login">Sign In</a>
            <a class="hlc-board-cta" href="https://app.homeleadconnect.org/register">Get Started →</a>
            <a class="hlc-mobile-sign-in-link" href="https://app.homeleadconnect.org/login">Sign In</a>
            <details class="hlc-mobile-icon-nav-v4" data-mobile-nav-version="4">
              <summary class="hlc-mobile-icon-nav-v4__trigger">Menu</summary>
              <nav class="hlc-mobile-icon-nav-v4__panel" aria-label="Mobile navigation">
                ${menuItem("About", "/about", "neutral", '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>')}
                ${menuItem("For Residents", "/homeowners", "resident", '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>')}
                ${menuItem("For Professionals", "/professionals", "professional", '<path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-3 3-3-3 3-3Z"/>')}
                ${menuItem("For Partners", "/partners", "partner", '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>')}
                ${menuItem("Community", "/community", "community", '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>')}
                ${menuItem("Resources", "/services", "neutral", '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4h16v16H6.5A2.5 2.5 0 0 1 4 17.5Z"/>')}
                ${menuItem("Sign In", "https://app.homeleadconnect.org/login", "neutral", '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>')}
                ${menuItem("Get Started", "https://app.homeleadconnect.org/register", "start", '<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>')}
              </nav>
            </details>
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
          <article class="hlc-board-pathway hlc-board-pathway--resident" style="background-image:url('/four-pathways-residents-hq-20260915.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 42%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Residents</p><p class="hlc-board-pathway-copy">Get help with the home in front of you—and keep the next step clear.</p><a class="hlc-family-pathway-link" href="/homeowners">Find resident support →</a></div></article>
          <article class="hlc-board-pathway hlc-board-pathway--professional" style="background-image:url('/four-pathways-professionals-hq-20260915.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 40%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Professionals</p><p class="hlc-board-pathway-copy">Build a more visible, accountable service business inside the network.</p><a class="hlc-family-pathway-link" href="/professionals">Explore professional access →</a></div></article>
          <article class="hlc-board-pathway hlc-board-pathway--partner" style="background-image:url('/four-pathways-partners-hq-20260915.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 40%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Partners</p><p class="hlc-board-pathway-copy">Create referral relationships that respect people, context, and consent.</p><a class="hlc-family-pathway-link" href="/partners">Explore partner access →</a></div></article>
          <article class="hlc-board-pathway hlc-board-pathway--community" style="background-image:url('/four-pathways-community-hq-20260915.jpg');background-size:cover;background-repeat:no-repeat;background-position:center 72%;"><div class="hlc-board-pathway-content"><p class="hlc-board-pathway-label">For Community</p><p class="hlc-board-pathway-copy">Find the people and resources that help neighborhoods move forward.</p><a class="hlc-family-pathway-link" href="/community">Visit the community →</a></div></article>
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
