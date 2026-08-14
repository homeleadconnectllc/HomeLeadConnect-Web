import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/workspace-nav.css";
import "./styles/desktop-workspace-shell.css";
import "./styles/agent-team.css";
import "./styles/launch-hardening.css";
import "./styles/launch-mobile.css";
import "./styles/workflow-mobile-fix.css";
import "./styles/responsive-workflows.css";
import "./styles/responsive-ecosystem.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
