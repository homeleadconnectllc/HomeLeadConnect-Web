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
  const year = new Date().getFullYear();
  return `
    <main class="hlc-home" style="min-height:100vh;padding:0 20px 48px;background:#081426;color:#f8fafc">
      <header style="position:sticky;top:0;z-index:30;max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px;padding:10px 0;background:rgba(8,20,38,.96);border-bottom:1px solid rgba(199,210,227,.10);backdrop-filter:blur(14px)">
        <a href="/" aria-label="HomeLead Connect home" style="display:flex;align-items:center;min-width:0;text-decoration:none;color:#fff">
          <img src="/hlc-logo-final.png" alt="HomeLead Connect LLC" loading="eager" decoding="async" style="display:block;height:40px;max-width:min(56vw,240px);width:auto;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))" />
        </a>
        <a data-route-to="/app" href="/app" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;border:1px solid rgba(147,197,253,.32);border-radius:8px;background:#10243e;color:#fff;font-weight:800;text-decoration:none;white-space:nowrap">Open HLC</a>
      </header>

      <section class="hlc-home-hero" style="max-width:980px;margin:0 auto;text-align:center;padding:clamp(52px,10vw,92px) 0 44px">
        <p class="hlc-home-hero-kicker" style="margin:0;color:#60a5fa;font-size:13px;font-weight:900;letter-spacing:.12em">HOMELEAD CONNECT</p>
        <h1 class="hlc-home-hero-title" style="font-size:clamp(42px,8vw,76px);line-height:1.02;letter-spacing:-2.5px;margin:14px auto 22px;color:#f8fafc">One front door.<br />One connected home-services ecosystem.</h1>
        <p class="hlc-home-hero-copy" style="max-width:760px;margin:0 auto;font-size:clamp(18px,3.8vw,21px);line-height:1.6;color:#c7d2e3">Request help, connect with providers, join the community, manage work, and reach the HomeLead Connect workspace from one identity.</p>
        <div class="hlc-home-hero-actions" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px">
          <a href="/pricing" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:8px;background:#2563eb;color:#fff;font-weight:900;text-decoration:none">Start 14-Day Free Trial</a>
          <a data-route-to="/request-service" href="/request-service" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:8px;background:#10243e;border:1px solid rgba(147,197,253,.24);color:#fff;font-weight:800;text-decoration:none">Get Help Now</a>
          <a data-route-to="/app" href="/app" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:8px;background:transparent;border:1px solid rgba(147,197,253,.24);color:#dbeafe;font-weight:800;text-decoration:none">Open HomeLead Connect</a>
        </div>
        <p class="hlc-home-hero-note" style="margin-top:14px;color:#9fb0c5;font-size:14px">For participating businesses: 14 days free, then $49.99/month. Payment method required.</p>
      </section>

      <section aria-label="HomeLead Connect capabilities" style="max-width:1100px;margin:10px auto 58px;border-top:1px solid rgba(199,210,227,.10)">
        <article style="display:grid;grid-template-columns:minmax(150px,.7fr) minmax(0,1.3fr);gap:18px 28px;align-items:start;padding:24px 0;border-bottom:1px solid rgba(199,210,227,.10);background:transparent"><h2 style="font-size:22px;margin:0;color:#f8fafc">Get Home Help</h2><p style="margin:0;color:#c7d2e3;line-height:1.65">Renters and homeowners can submit a service request and follow the work from one HLC account.</p></article>
        <article style="display:grid;grid-template-columns:minmax(150px,.7fr) minmax(0,1.3fr);gap:18px 28px;align-items:start;padding:24px 0;border-bottom:1px solid rgba(199,210,227,.10);background:transparent"><h2 style="font-size:22px;margin:0;color:#f8fafc">Find Providers</h2><p style="margin:0;color:#c7d2e3;line-height:1.65">Use the HLC network, matching, availability, profiles, and service-area tools.</p></article>
        <article style="display:grid;grid-template-columns:minmax(150px,.7fr) minmax(0,1.3fr);gap:18px 28px;align-items:start;padding:24px 0;border-bottom:1px solid rgba(199,210,227,.10);background:transparent"><h2 style="font-size:22px;margin:0;color:#f8fafc">Community</h2><p style="margin:0;color:#c7d2e3;line-height:1.65">Discussions, events, referrals, reviews, groups, and moderation live in the same ecosystem.</p></article>
        <article style="display:grid;grid-template-columns:minmax(150px,.7fr) minmax(0,1.3fr);gap:18px 28px;align-items:start;padding:24px 0;border-bottom:1px solid rgba(199,210,227,.10);background:transparent"><h2 style="font-size:22px;margin:0;color:#f8fafc">HLC Workspace</h2><p style="margin:0;color:#c7d2e3;line-height:1.65">Leads, LeadScope estimates, jobs, scheduling, messages, documents, workflows, analytics, and AI agents stay connected.</p></article>
      </section>

      <section style="max-width:1100px;margin:0 auto;padding:34px 0;border-top:1px solid rgba(199,210,227,.10);border-bottom:1px solid rgba(199,210,227,.10);text-align:center;background:transparent">
        <p style="margin:0;color:#93c5fd;font-weight:900;letter-spacing:.1em;font-size:12px">FOR BUSINESSES</p>
        <h2 style="margin:10px auto 12px;color:#fff;font-size:clamp(28px,5vw,42px)">Try the connected HLC workspace free for 14 days.</h2>
        <p style="color:#c7d2e3;line-height:1.65;max-width:760px;margin:0 auto">Run leads, estimates, jobs, scheduling, messages, documents, workflow, analytics, and your HLC AI team from one workspace. Continue for $49.99/month after the trial.</p>
        <div style="display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:22px">
          <a href="/pricing" style="display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:8px;background:#2563eb;color:#fff;font-weight:900;text-decoration:none">See Pricing &amp; Start Trial</a>
          <a href="/login?next=/settings" style="color:#dbeafe;font-weight:800">Manage existing subscription</a>
        </div>
      </section>

      <section style="max-width:1100px;margin:0 auto;padding:34px 0 16px;text-align:center;background:transparent">
        <h2 style="margin:0 auto 12px;color:#fff">Everything branches from HomeLead Connect.</h2>
        <p style="color:#c7d2e3;line-height:1.65;max-width:860px;margin:0 auto">Public information, service requests, authentication, resident and professional portals, Community, Network &amp; Map, CRM operations, scheduling, communications, documents, billing, workflows, analytics, and the HLC AI team all belong to one connected system.</p>
        <div style="display:flex;gap:12px 18px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:20px">
          <a href="/pricing" style="color:#bfdbfe;font-weight:800">Pricing &amp; free trial</a>
          <a href="/how-it-works" style="color:#bfdbfe">How it works</a>
          <a data-route-to="/community" href="/community" style="color:#bfdbfe">Community</a>
          <a href="/professionals" style="color:#bfdbfe">For professionals</a>
          <a href="/trust" style="color:#bfdbfe">Trust &amp; safety</a>
          <a href="/contact" style="color:#bfdbfe">Contact</a>
        </div>
      </section>
    </main>
    <footer style="background:#06101f;color:#9fb0c5;text-align:center;padding:26px 20px;border-top:1px solid rgba(199,210,227,.10)">
      <img src="/hlc-logo-final.png" alt="" loading="lazy" decoding="async" style="display:block;height:28px;width:auto;max-width:180px;object-fit:contain;margin:0 auto 14px;opacity:.78" />
      <nav aria-label="Legal and accessibility" style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px 18px;margin-bottom:12px">
        <a style="color:#bfdbfe;font-weight:600" href="/privacy">Privacy</a>
        <a style="color:#bfdbfe;font-weight:600" href="/terms">Terms</a>
        <a style="color:#bfdbfe;font-weight:600" href="/accessibility">Accessibility</a>
        <a style="color:#bfdbfe;font-weight:600" href="/platform-disclosure">Platform disclosure</a>
      </nav>
      <div>© ${year} HomeLead Connect LLC</div>
    </footer>`;
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

  void Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./styles/app-shell-entry"),
    import("./App.tsx"),
    import("./context/AuthContext"),
    import("./context/AccountAccessProvider"),
  ]).then(([reactModule, domModule, , appModule, authModule, accessModule]) => {
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
