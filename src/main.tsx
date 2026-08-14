import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/workspace-nav.css";
import "./styles/desktop-workspace-shell.css";
import "./styles/agent-team.css";
import "./styles/contextual-agent-dock.css";
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
import "./styles/responsive-page-contract.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installation support is progressive enhancement; the web app remains usable without a service worker.
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
