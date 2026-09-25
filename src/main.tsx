/* index.css is loaded with the non-home application/public-family entry to keep the standalone homepage critical path lean. */

const APP_HOST = "app.homeleadconnect.org";
const hostname = window.location.hostname.toLowerCase();
const isAppHost = hostname === APP_HOST;
const pathname = window.location.pathname;
const isPublicHome = pathname === "/" && !isAppHost;
const isPublicSiteRoute = !isAppHost && /^\/(?:about|homeowners|residents|contractors|professionals|partners|community|services|how-it-works|leadscope|pricing|trust|demo|contact|request-service|professional-application|privacy|terms|accessibility|platform-disclosure|memorial|kendrell-memorial)\/?$/.test(pathname);
const isVisualFamilyEntryRoute = /^\/(?:login|register|forgot-password|reset-password|app|portal|portal\/accept|team\/accept)(?:\/|$)/.test(pathname);
const rootElement = document.getElementById("root")!;

if (isPublicHome) {
  void import("./standalonePublicHome").then(({ mountStandalonePublicHome }) => {
    mountStandalonePublicHome(rootElement);
  });
} else {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
        void registration.update();
      }).catch(() => {});
    });
  }

  const mountReactApp = async () => {
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
    root.render(createElement(StrictMode, null, createElement(AuthProvider, null, createElement(AccountAccessProvider, null, createElement(App)))));
  };

  const usesCurrentVisualAuthority = isPublicSiteRoute || isVisualFamilyEntryRoute;
  if (usesCurrentVisualAuthority) {
    void Promise.all([
      import("./styles/mockup-authority-20260924.css"),
      import("./styles/home-no-glow-20260925.css"),
    ]).then(mountReactApp);
  }
  if (!usesCurrentVisualAuthority) {
    void import("./styles/app-shell-entry").then(mountReactApp);
  }
}
