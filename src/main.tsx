import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/workspace-nav.css";
import "./styles/mobile-app-shell.css";
import "./styles/desktop-workspace-shell.css";
import "./styles/agent-team.css";
import "./styles/contextual-agent-dock.css";
import "./styles/agent-premium-v2.css";
import "./styles/agent-panel-width-contract.css";
import "./styles/command-center-experience.css";
import "./styles/agent-proactive-briefing.css";
import "./styles/agent-tutorial.css";
import "./styles/auth-methods.css";
import "./styles/product-polish.css";
import "./styles/launch-hardening.css";
import "./styles/launch-mobile.css";
import "./styles/workflow-mobile-fix.css";
import "./styles/responsive-workflows.css";
import "./styles/responsive-ecosystem.css";
import "./styles/visual-centering.css";
import "./styles/property-intelligence.css";
import "./styles/heading-contrast.css";
import "./styles/mobile-acceptance.css";
import "./styles/mobile-work-dock.css";
import "./styles/analytics-hardening.css";
import "./styles/global-pull-refresh.css";
import "./styles/global-smart-compose.css";
import "./styles/community-store.css";
import "./styles/community-match-deck.css";
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
import "./styles/workspace-premium-v3.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { AccountAccessProvider } from "./context/AccountAccessProvider";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
      void registration.update();
    }).catch(() => {
      // Installation support is progressive enhancement; the web app remains usable without a service worker.
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AccountAccessProvider>
        <App />
      </AccountAccessProvider>
    </AuthProvider>
  </StrictMode>,
);
