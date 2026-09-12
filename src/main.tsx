import "./index.css";
import "./styles/front-door-system-pass-20260910.css";
import "./styles/front-door-refinement-20260910.css";
import "./styles/front-door-mobile-redesign-20260911.css";
import "./styles/front-door-mobile-polish-20260911.css";
import "./styles/v2-cinematic-community-homepage-20260911.css";

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
    <main class="hlc-v2-home">
      <header class="hlc-v2-nav">
        <div class="hlc-v2-nav-inner">
          <a class="hlc-v2-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-transparent.png" alt="HomeLead Connect LLC" width="440" height="150" loading="eager" decoding="async" />
          </a>
          <nav class="hlc-v2-nav-links" aria-label="Primary navigation">
            <a href="https://homeleadconnect.org/">Home</a>
            <a href="https://about.homeleadconnect.org/">About</a>
            <a href="https://residents.homeleadconnect.org/">For Residents</a>
            <a href="https://professionals.homeleadconnect.org/">For Professionals</a>
            <a href="https://partners.homeleadconnect.org/">For Partners</a>
            <a href="https://community.homeleadconnect.org/">For Community</a>
            <div class="hlc-v2-nav-actions">
              <a class="hlc-v2-btn hlc-v2-btn--ghost" href="https://app.homeleadconnect.org/login">Sign In</a>
              <a class="hlc-v2-btn hlc-v2-btn--primary" href="https://app.homeleadconnect.org/register">Create My HomeLead Connect Account</a>
            </div>
          </nav>
        </div>
      </header>

      <section class="hlc-v2-hero" aria-labelledby="hlc-v2-hero-title">
        <div class="hlc-v2-hero-inner">
          <p class="hlc-v2-eyebrow">More than homes.</p>
          <h1 id="hlc-v2-hero-title">Real People.<br /><span>Real Opportunity.</span></h1>
          <p class="hlc-v2-hero-copy">HomeLead Connect brings together residents, professionals, partners and communities to create opportunity, access and a stronger connected future.</p>
          <div class="hlc-v2-hero-actions">
            <a class="hlc-v2-btn hlc-v2-btn--primary" href="https://app.homeleadconnect.org/register">Get Started <span aria-hidden="true">→</span></a>
            <a class="hlc-v2-btn hlc-v2-btn--ghost" href="https://about.homeleadconnect.org/">Learn More</a>
            <a class="hlc-v2-btn hlc-v2-btn--ghost" href="https://app.homeleadconnect.org/request-service">Get Help Now</a>
          </div>
          <p class="hlc-v2-hero-note">For participating businesses: 14 days free, then <strong>$49.99/month</strong>. Payment method required.</p>
        </div>
        <div class="hlc-v2-horizon" aria-hidden="true"></div>
      </section>

      <section class="hlc-v2-section hlc-v2-section--dark" aria-labelledby="hlc-v2-ecosystem-title">
        <div class="hlc-v2-wrap">
          <div class="hlc-v2-section-head">
            <p class="hlc-v2-eyebrow">The HLC ecosystem</p>
            <h2 id="hlc-v2-ecosystem-title">One Platform.<br />Four Pathways.</h2>
            <p class="hlc-v2-section-copy">Different needs. Same mission. A stronger, more connected community.</p>
          </div>
          <div class="hlc-v2-pathways">
            <div class="hlc-v2-intro-tile">
              <p>HomeLead Connect connects the people, services, businesses and relationships that make a community work.</p>
              <a class="hlc-v2-link" href="https://platform.homeleadconnect.org/">Explore the ecosystem →</a>
            </div>
            <article class="hlc-v2-card hlc-v2-card--resident"><div class="hlc-v2-card-content"><span class="hlc-v2-card-icon" aria-hidden="true">⌂</span><h3>For Residents</h3><p>Build wealth. Find trusted professionals. Create your future at home.</p><a href="https://residents.homeleadconnect.org/">Learn More →</a></div></article>
            <article class="hlc-v2-card hlc-v2-card--professional"><div class="hlc-v2-card-content"><span class="hlc-v2-card-icon" aria-hidden="true">⌁</span><h3>For Professionals</h3><p>Grow your business. Get more opportunities. Make a bigger impact.</p><a href="https://professionals.homeleadconnect.org/">Learn More →</a></div></article>
            <article class="hlc-v2-card hlc-v2-card--partner"><div class="hlc-v2-card-content"><span class="hlc-v2-card-icon" aria-hidden="true">◎</span><h3>For Partners</h3><p>Collaborate. Invest. Build stronger communities. Create lasting change.</p><a href="https://partners.homeleadconnect.org/">Learn More →</a></div></article>
            <article class="hlc-v2-card hlc-v2-card--community"><div class="hlc-v2-card-content"><span class="hlc-v2-card-icon" aria-hidden="true">◌</span><h3>For Our Community</h3><p>Stronger neighborhoods. Greater possibilities. A brighter tomorrow.</p><a href="https://community.homeleadconnect.org/">Learn More →</a></div></article>
          </div>
        </div>
      </section>

      <section class="hlc-v2-section hlc-v2-section--light" aria-labelledby="hlc-v2-vision-title">
        <div class="hlc-v2-wrap hlc-v2-vision">
          <div class="hlc-v2-vision-copy"><p class="hlc-v2-eyebrow">The HLC vision</p><h2 id="hlc-v2-vision-title">A Stronger Community Builds a Brighter Future.</h2><p>HomeLead Connect is more than a platform — it is a connected ecosystem where people, resources and opportunities come together to create lasting impact.</p><a class="hlc-v2-link" href="https://about.homeleadconnect.org/">Explore the vision →</a><div class="hlc-v2-storyline" aria-label="HomeLead Connect story"><span>City</span><span>Neighborhood</span><span>Home</span><span>People</span><span>Opportunity</span></div></div>
          <div class="hlc-v2-vision-media" role="img" aria-label="City and community visual"></div>
        </div>
      </section>

      <section class="hlc-v2-section hlc-v2-section--dark" aria-labelledby="hlc-v2-app-title">
        <div class="hlc-v2-wrap hlc-v2-app"><div class="hlc-v2-app-copy"><p class="hlc-v2-eyebrow">Powered by people + technology</p><h2 id="hlc-v2-app-title">The HLC app puts the power of HomeLead Connect in your hands.</h2><p class="hlc-v2-section-copy">The public brand introduces the ecosystem. HLC is the compact operating identity that helps you run your HomeLead world.</p><ul class="hlc-v2-app-points"><li>Manage your home and service needs</li><li>Find trusted professionals and opportunities</li><li>Connect with partners and your community</li><li>Move from discovery to action in one place</li></ul><div class="hlc-v2-hero-actions"><a class="hlc-v2-btn hlc-v2-btn--primary" href="https://app.homeleadconnect.org/app">Open HomeLead Connect →</a></div></div><div class="hlc-v2-app-icon"><img src="/hlc-icon.jpeg" alt="HLC app icon" width="270" height="270" loading="lazy" decoding="async" /></div></div>
      </section>

      <section class="hlc-v2-horizon-band" aria-label="HomeLead Connect brand statement"><div class="hlc-v2-horizon-band-inner"><div><h2>Connecting Homes.<br />Creating <span>Opportunities.</span></h2><p>One platform. Four pathways. Infinite impact.</p></div><a class="hlc-v2-btn hlc-v2-btn--primary" href="https://app.homeleadconnect.org/register">Join HomeLead Connect →</a></div></section>
      <footer class="hlc-v2-footer"><div class="hlc-v2-wrap"><p><strong>HomeLead Connect LLC</strong> · Harrisburg, Pennsylvania · <a href="mailto:info@homeleadconnect.org">info@homeleadconnect.org</a></p><div class="hlc-v2-footlinks"><a href="https://homeleadconnect.org/">Home</a><a href="https://residents.homeleadconnect.org/">Residents</a><a href="https://professionals.homeleadconnect.org/">Professionals</a><a href="https://partners.homeleadconnect.org/">Partners</a><a href="https://platform.homeleadconnect.org/">Platform</a><a href="https://about.homeleadconnect.org/">About</a><a href="https://contact.homeleadconnect.org/">Contact</a><a href="https://homeleadconnectprivacy.carrd.co/">Privacy</a><a href="https://homeleadconnectterms.carrd.co/">Terms</a></div><p>2026 HomeLead Connect LLC</p></div></footer>
    </main>`;
}

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
    const { StrictMode, createElement } = reactModule; const { createRoot } = domModule; const App = appModule.default; const AuthProvider = authModule.AuthProvider; const AccountAccessProvider = accessModule.AccountAccessProvider; const root = createRoot(rootElement);
    root.render(createElement(StrictMode, null, createElement(AuthProvider, null, createElement(AccountAccessProvider, null, createElement(App)))));
  });
}
