import "./index.css";

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
    <main class="hlc-home hlc-frontdoor-site">
      <nav class="hlc-frontdoor-nav" aria-label="Primary navigation">
        <div class="hlc-frontdoor-wrap hlc-frontdoor-navin">
          <a class="hlc-frontdoor-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home"><img src="/hlc-logo-ui.png" alt="HomeLead Connect" width="58" height="58" /></a>
          <div class="hlc-frontdoor-navlinks">
            <a href="https://residents.homeleadconnect.org/">Residents</a><a href="https://professionals.homeleadconnect.org/">Professionals</a><a href="https://partners.homeleadconnect.org/">Partners</a><a href="https://platform.homeleadconnect.org/">Platform</a><a href="https://about.homeleadconnect.org/">About</a><a href="https://contact.homeleadconnect.org/">Contact</a><a href="https://app.homeleadconnect.org/login">Login</a><a class="hlc-frontdoor-primary" href="https://app.homeleadconnect.org/request-service">Request Service</a>
          </div>
        </div>
      </nav>

      <section class="hlc-frontdoor-hero">
        <img src="/hlc-frontdoor-resident-hero-final.jpg" alt="Resident working on a home project" width="1400" height="900" fetchpriority="high" />
        <div class="hlc-frontdoor-hero-content"><p class="hlc-frontdoor-kicker">Home services, connected better</p><h1>Home help should feel easier.</h1><p>Tell us what your home needs. HomeLead Connect helps renters, homeowners, and everyday households move toward the right professional and a clearer next step.</p><div class="hlc-frontdoor-actions"><a class="hlc-frontdoor-btn hlc-frontdoor-btn-primary" href="https://app.homeleadconnect.org/request-service">Request Home Service</a><a class="hlc-frontdoor-btn hlc-frontdoor-btn-secondary" href="https://professionals.homeleadconnect.org/">For Professionals</a></div></div>
      </section>

      <div class="hlc-frontdoor-quickbar"><div class="hlc-frontdoor-wrap hlc-frontdoor-quick"><span>Renters included</span><span>Homeowners welcome</span><span>Clear next steps</span><span>Harrisburg roots</span></div></div>

      <section class="hlc-frontdoor-section"><div class="hlc-frontdoor-wrap hlc-frontdoor-center"><span class="hlc-frontdoor-eyebrow">Home improvement made simpler</span><h2>Start with the need, not the paperwork.</h2><p class="hlc-frontdoor-copy">Repairs, improvements, maintenance, and everyday home-service needs should not require you to know the industry before you ask for help.</p><div class="hlc-frontdoor-service-line"><span>Repairs</span><span>Painting</span><span>Roofing</span><span>HVAC</span><span>Cleaning</span><span>Moving</span><span>General Home Help</span></div></div></section>

      <section class="hlc-frontdoor-section hlc-frontdoor-alt"><div class="hlc-frontdoor-wrap hlc-frontdoor-split"><div class="hlc-frontdoor-photo"><img src="/hlc-frontdoor-people-first.webp" alt="Resident and home-service professional coordinating together" width="1400" height="900" loading="lazy" /></div><div class="hlc-frontdoor-split-text"><span class="hlc-frontdoor-eyebrow">People first</span><h2>A clearer conversation from the start.</h2><p>HomeLead Connect helps organize what the household needs so the next professional conversation begins with better context.</p></div></div></section>

      <section class="hlc-frontdoor-section"><div class="hlc-frontdoor-wrap hlc-frontdoor-center"><span class="hlc-frontdoor-eyebrow">How it works</span><h2>Four simple steps.</h2><div class="hlc-frontdoor-process"><div class="hlc-frontdoor-step"><div class="hlc-frontdoor-num">1</div><h3>Request</h3><p>Tell us what is happening at home.</p></div><div class="hlc-frontdoor-step"><div class="hlc-frontdoor-num">2</div><h3>Review</h3><p>Clarify the details that matter.</p></div><div class="hlc-frontdoor-step"><div class="hlc-frontdoor-num">3</div><h3>Connect</h3><p>Move toward the right professional path.</p></div><div class="hlc-frontdoor-step"><div class="hlc-frontdoor-num">4</div><h3>Coordinate</h3><p>Keep the next step easier to follow.</p></div></div></div></section>

      <section class="hlc-frontdoor-photo-band"><img src="/hlc-frontdoor-professional.webp" alt="Home-service professional at work" width="1400" height="900" loading="lazy" /><div class="hlc-frontdoor-photo-band-content"><div><span class="hlc-frontdoor-eyebrow">For professionals</span><h2>Better service starts before the job begins.</h2><p>HomeLead Connect helps professionals meet residents with clearer needs, better communication, and a more organized opportunity flow.</p><div class="hlc-frontdoor-actions"><a class="hlc-frontdoor-btn hlc-frontdoor-btn-primary" href="https://professionals.homeleadconnect.org/">Explore Professional Access</a></div></div></div></section>

      <section class="hlc-frontdoor-cta"><div class="hlc-frontdoor-wrap"><h2>Tell us what your home needs.</h2><p>Start with the request. HomeLead Connect will help organize what comes next.</p><div class="hlc-frontdoor-actions"><a class="hlc-frontdoor-btn hlc-frontdoor-btn-primary" href="https://app.homeleadconnect.org/request-service">Start My Request</a></div></div></section>

      <footer class="hlc-frontdoor-footer"><div class="hlc-frontdoor-wrap"><p><strong>HomeLead Connect LLC</strong> | Harrisburg, Pennsylvania | <a class="hlc-frontdoor-contact-link" href="tel:+17175519897">(717) 551-9897</a> | homeleadconnect@gmail.com</p><div class="hlc-frontdoor-footlinks"><a href="https://homeleadconnect.org/">Home</a><a href="https://residents.homeleadconnect.org/">Residents</a><a href="https://professionals.homeleadconnect.org/">Professionals</a><a href="https://partners.homeleadconnect.org/">Partners</a><a href="https://platform.homeleadconnect.org/">Platform</a><a href="https://about.homeleadconnect.org/">About</a><a href="https://contact.homeleadconnect.org/">Contact</a><a href="https://homeleadconnectprivacy.carrd.co/">Privacy</a><a href="https://homeleadconnectterms.carrd.co/">Terms</a></div><p>2026 HomeLead Connect LLC</p></div></footer>
    </main>`;
}

if (isPublicHome) {
  rootElement.innerHTML = publicHomeMarkup();
} else {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
        void registration.update();
      }).catch(() => {
        // Installation support is progressive enhancement; the web app remains usable without a service worker.
      });
    });
  }

  void import("./styles/app-shell-entry").then(async () => {
    const [reactModule, domModule, appModule, authModule, accessModule] = await Promise.all([
      import("react"),
      import("react-dom/client"),
      import("./App.tsx"),
      import("./context/AuthContext"),
      import("./context/AccountAccessProvider"),
    ]);
    const { StrictMode, createElement } = reactModule;
    const { createRoot } = domModule;
    const App = appModule.default;
    const AuthProvider = authModule.AuthProvider;
    const AccountAccessProvider = accessModule.AccountAccessProvider;
    const root = createRoot(rootElement);

    root.render(
      createElement(
        StrictMode,
        null,
        createElement(
          AuthProvider,
          null,
          createElement(AccountAccessProvider, null, createElement(App)),
        ),
      ),
    );
  });
}
