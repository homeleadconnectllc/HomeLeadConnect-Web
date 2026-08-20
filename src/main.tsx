import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./pages/HomePage";
import "./index.css";

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
    import("./styles/app-shell-entry"),
    import("./App.tsx"),
    import("./context/AuthContext"),
    import("./context/AccountAccessProvider"),
  ]).then(([, appModule, authModule, accessModule]) => {
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
