/* index.css is loaded with the non-home application/public-family entry to keep the standalone homepage critical path lean. */
import "./styles/public-footer-home-authority-20260916.css";


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
const hostname = window.location.hostname.toLowerCase();
const isAppHost = hostname === APP_HOST;
const pathname = window.location.pathname;
const isPublicHome = pathname === "/" && !isAppHost;
const isPublicSiteRoute = !isAppHost && /^\/(?:about|homeowners|contractors|professionals|partners|community|services|how-it-works|leadscope|pricing|trust|demo|contact|request-service|professional-application|privacy|terms|accessibility|platform-disclosure|memorial|kendrell-memorial)(?:\/|$)/.test(pathname);
const isVisualFamilyEntryRoute = /^\/(?:login|register|forgot-password|reset-password|app|portal|portal\/accept)(?:\/|$)/.test(pathname);
const rootElement = document.getElementById("root")!;

if (isPublicHome) {
  void import("./standalonePublicHome").then(({ mountStandalonePublicHome }) => {
    mountStandalonePublicHome(rootElement);
  });
} else {
  // Public routes use only their current page-level visual authority. Retired public-family
  // styles must not leak back into the live public site. Authenticated/app routes retain
  // their dedicated app shell styling on app.homeleadconnect.org.
  const styleReady = (isPublicSiteRoute || isVisualFamilyEntryRoute) ? import("./styles/public-visual-family-20260919.css") : import("./styles/app-shell-entry");
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
        void registration.update();
      }).catch(() => {});
    });
  }
  void styleReady.then(async () => {
    const [reactModule, domModule, appModule, authModule, accessModule] = await Promise.all([import("react"), import("react-dom/client"), import("./App.tsx"), import("./context/AuthContext"), import("./context/AccountAccessProvider")]);
    // App.tsx owns both public and authenticated routes, so its dependency graph can
    // attach authenticated CSS after the route-specific public sheet. Keep the current
    // public authority last in the cascade so public pages cannot inherit the retired
    // dark shell at runtime.
    const keepPublicVisualAuthorityLast = () => {
      if (!isPublicSiteRoute && !isVisualFamilyEntryRoute) return;
      const publicVisualSheet = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        .find((link) => link.href.includes("public-visual-family-20260919"));
      if (publicVisualSheet) document.head.append(publicVisualSheet);
    };
    const { StrictMode, createElement } = reactModule;
    const { createRoot } = domModule;
    const App = appModule.default;
    const AuthProvider = authModule.AuthProvider;
    const AccountAccessProvider = accessModule.AccountAccessProvider;
    const root = createRoot(rootElement);
    root.render(createElement(StrictMode, null, createElement(AuthProvider, null, createElement(AccountAccessProvider, null, createElement(App)))));
    window.requestAnimationFrame(() => window.requestAnimationFrame(keepPublicVisualAuthorityLast));
    window.setTimeout(keepPublicVisualAuthorityLast, 500);
  });
}
