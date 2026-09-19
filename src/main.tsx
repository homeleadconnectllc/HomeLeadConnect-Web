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
const isPublicHome = window.location.pathname === "/" && window.location.hostname.toLowerCase() !== APP_HOST;
const rootElement = document.getElementById("root")!;

if (isPublicHome) {
  void Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./pages/HomePage.tsx"),
    import("./components/Footer.tsx"),
  ]).then(([reactModule, domModule, homeModule, footerModule]) => {
    const { StrictMode, createElement, Fragment } = reactModule;
    const { createRoot } = domModule;
    const HomePage = homeModule.default;
    const Footer = footerModule.default;
    createRoot(rootElement).render(
      createElement(
        StrictMode,
        null,
        createElement(
          Fragment,
          null,
          createElement(HomePage),
          createElement(Footer, { showLogo: false }),
        ),
      ),
    );
  });
} else {
  void import("./styles/public-owner-visual-authority-20260918.css");
  void import("./styles/public-family-legacy-entry");
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
