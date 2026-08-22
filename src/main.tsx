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
  const compactMark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='26' fill='%230d1b3d'/%3E%3Cpath d='M28 31h13v22h38V31h13v58H79V66H41v23H28z' fill='%23fff'/%3E%3Cpath d='M48 76h24v13H48z' fill='%231e5bff'/%3E%3C/svg%3E";
  return `
    <main class="hlc-home" style="min-height:100vh;padding:40px 24px;background:linear-gradient(135deg,#ffffff 0%,#eff6ff 45%,#dbeafe 100%);color:#0f172a">
      <section class="hlc-home-hero" style="max-width:1100px;margin:0 auto;text-align:center;padding:72px 0 48px">
        <img class="hlc-home-hero-logo" src="${compactMark}" alt="HomeLead Connect LLC" width="120" height="120" decoding="async" style="width:120px;height:120px;object-fit:contain;border-radius:24px;background:#fff;padding:14px;box-shadow:0 20px 60px rgba(15,23,42,.14)" />
        <p class="hlc-home-hero-kicker" style="font-weight:800;color:#2563eb;margin-top:28px">HOMELEAD CONNECT</p>
        <h1 class="hlc-home-hero-title" style="font-size:clamp(44px,8vw,84px);line-height:1;letter-spacing:-3px;margin:14px auto 22px;color:#0f172a;text-shadow:0 1px 0 rgba(255,255,255,.35)">One front door.<br />One connected home-services ecosystem.</h1>
        <p class="hlc-home-hero-copy" style="max-width:760px;margin:0 auto;font-size:21px;line-height:1.6;color:#475569">Request help, connect with providers, join the community, manage work, and reach the HomeLead Connect workspace from one identity.</p>
        <div class="hlc-home-hero-actions" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:32px">
          <a href="/pricing" style="padding:14px 22px;border-radius:999px;background:#2563eb;color:#fff;font-weight:900;text-decoration:none;box-shadow:0 12px 30px rgba(37,99,235,.22)">Start 14-Day Free Trial</a>
          <a data-route-to="/request-service" href="/request-service" style="padding:14px 22px;border-radius:999px;background:#0f172a;color:#fff;font-weight:800;text-decoration:none">Get Help Now</a>
          <a data-route-to="/app" href="/app" style="padding:14px 22px;border-radius:999px;background:#fff;color:#0f172a;font-weight:800;text-decoration:none;border:1px solid #cbd5e1">Open HomeLead Connect</a>
        </div>
        <p class="hlc-home-hero-note" style="margin-top:14px;color:#64748b;font-size:14px">For participating businesses: 14 days free, then $49.99/month. Payment method required.</p>
      </section>

      <section style="max-width:1100px;margin:20px auto 72px;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px">
        <article style="background:#fff;color:#0f172a;border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.08)"><h2 style="font-size:22px;margin-top:0;color:#0f172a">Get Home Help</h2><p style="color:#475569;line-height:1.6">Renters and homeowners can submit a service request and follow the work from one HLC account.</p></article>
        <article style="background:#fff;color:#0f172a;border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.08)"><h2 style="font-size:22px;margin-top:0;color:#0f172a">Find Providers</h2><p style="color:#475569;line-height:1.6">Use the HLC network, matching, availability, profiles, and service-area tools.</p></article>
        <article style="background:#fff;color:#0f172a;border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.08)"><h2 style="font-size:22px;margin-top:0;color:#0f172a">Community</h2><p style="color:#475569;line-height:1.6">Discussions, events, referrals, reviews, groups, and moderation live in the same ecosystem.</p></article>
        <article style="background:#fff;color:#0f172a;border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.08)"><h2 style="font-size:22px;margin-top:0;color:#0f172a">HLC Workspace</h2><p style="color:#475569;line-height:1.6">Leads, LeadScope estimates, jobs, scheduling, messages, documents, workflows, analytics, and AI agents stay connected.</p></article>
      </section>

      <section style="max-width:1100px;margin:0 auto 28px;background:linear-gradient(145deg,#07111f,#0b2345 60%,#0b3b51);color:#fff;border-radius:32px;padding:clamp(28px,5vw,44px);text-align:center;box-shadow:0 24px 70px rgba(15,23,42,.16)">
        <p style="margin:0;color:#93c5fd;font-weight:900;letter-spacing:.1em;font-size:12px">FOR BUSINESSES</p>
        <h2 style="margin:10px auto 12px;color:#fff;font-size:clamp(28px,5vw,42px)">Try the connected HLC workspace free for 14 days.</h2>
        <p style="color:#cbd5e1;line-height:1.65;max-width:760px;margin:0 auto">Run leads, estimates, jobs, scheduling, messages, documents, workflow, analytics, and your HLC AI team from one workspace. Continue for $49.99/month after the trial.</p>
        <div style="display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:24px">
          <a href="/pricing" style="padding:14px 22px;border-radius:12px;background:#2563eb;color:#fff;font-weight:900;text-decoration:none">See Pricing &amp; Start Trial</a>
          <a href="/login?next=/settings" style="color:#dbeafe;font-weight:800">Manage existing subscription</a>
        </div>
      </section>

      <section style="max-width:1100px;margin:0 auto 60px;background:#0f172a;color:#fff;border-radius:32px;padding:34px;text-align:center">
        <h2 style="margin:0 auto 14px;color:#fff">Everything branches from HomeLeadConnect.org</h2>
        <p style="color:#cbd5e1;line-height:1.6;max-width:860px;margin:0 auto">Public information, service requests, authentication, homeowner and contractor portals, Community, Network &amp; Map, CRM operations, scheduling, communications, documents, billing, workflows, analytics, and Kendrell, Dion, and Diamond all belong to the same HLC route tree and Supabase-backed system.</p>
        <div style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:22px">
          <a href="/pricing" style="color:#bfdbfe;font-weight:800">Pricing &amp; free trial</a>
          <a href="/how-it-works" style="color:#bfdbfe">How it works</a>
          <a data-route-to="/community" href="/community" style="color:#bfdbfe">Community</a>
          <a href="/professionals" style="color:#bfdbfe">For professionals</a>
          <a href="/trust" style="color:#bfdbfe">Trust &amp; safety</a>
          <a href="/contact" style="color:#bfdbfe">Contact</a>
        </div>
      </section>
    </main>
    <footer style="background:#111827;color:#9ca3af;text-align:center;padding:26px 20px">
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
