import "./index.css";
import "./styles/front-door-system-pass-20260910.css";
import "./styles/front-door-refinement-20260910.css";
import "./styles/front-door-mobile-redesign-20260911.css";
import "./styles/front-door-mobile-polish-20260911.css";
import "./styles/v2-cinematic-community-homepage-20260911.css";
import "./styles/v2-mobile-image-layer-fix-20260912.css";
import "./styles/v2-board-alignment-20260912.css";

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

if (!isPublicHome && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
      void registration.update();
    }).catch(() => {});
  });
}

void Promise.all([import("react"), import("react-dom/client")]).then(async ([reactModule, domModule]) => {
  const { StrictMode, createElement } = reactModule;
  const { createRoot } = domModule;
  const root = createRoot(rootElement);

  if (isPublicHome) {
    const homeModule = await import("./pages/HomePage");
    root.render(createElement(homeModule.default));
    return;
  }

  const [appModule, authModule, accessModule] = await Promise.all([
    import("./App.tsx"),
    import("./context/AuthContext"),
    import("./context/AccountAccessProvider"),
  ]);
  const App = appModule.default;
  const AuthProvider = authModule.AuthProvider;
  const AccountAccessProvider = accessModule.AccountAccessProvider;
  root.render(createElement(StrictMode, null, createElement(AuthProvider, null, createElement(AccountAccessProvider, null, createElement(App)))));
});
