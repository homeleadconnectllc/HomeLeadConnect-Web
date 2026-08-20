import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./pages/HomePage";
import "./index.css";
import "./styles/workspace-nav.css";
import "./styles/auth-methods.css";
import "./styles/product-polish.css";
import "./styles/launch-hardening.css";
import "./styles/launch-mobile.css";
import "./styles/visual-centering.css";
import "./styles/heading-contrast.css";
import "./styles/mobile-acceptance.css";
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

const APP_HOST = "app.homeleadconnect.org";
const isPublicHome = window.location.pathname === "/" && window.location.hostname.toLowerCase() !== APP_HOST;
const root = createRoot(document.getElementById("root")!);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
      void registration.update();
    }).catch(() => {
      // Installation support is progressive enhancement; the web app remains usable without a service worker.
    });
  });
}

if (isPublicHome) {
  root.render(
    <StrictMode>
      <HomePage />
    </StrictMode>,
  );
} else {
  void Promise.all([
    import("./App.tsx"),
    import("./context/AuthContext"),
    import("./context/AccountAccessProvider"),
  ]).then(([appModule, authModule, accessModule]) => {
    const App = appModule.default;
    const AuthProvider = authModule.AuthProvider;
    const AccountAccessProvider = accessModule.AccountAccessProvider;

    root.render(
      <StrictMode>
        <AuthProvider>
          <AccountAccessProvider>
            <App />
          </AccountAccessProvider>
        </AuthProvider>
      </StrictMode>,
    );
  });
}
