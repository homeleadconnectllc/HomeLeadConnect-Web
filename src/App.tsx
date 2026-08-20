import { lazy, Suspense } from "react";
import AppRouter from "./routes/AppRouter";
import { useAuth } from "./hooks/useAuth";

const AuthenticatedStyles = lazy(() => import("./styles/AuthenticatedStyles"));
const GlobalPullToRefresh = lazy(() => import("./components/GlobalPullToRefresh"));
const GlobalSmartCompose = lazy(() => import("./components/GlobalSmartCompose"));
const MobileViewControls = lazy(() => import("./components/MobileViewControls"));

function App() {
  const { session } = useAuth();

  return (
    <>
      {session && (
        <Suspense fallback={null}>
          <AuthenticatedStyles />
          <GlobalPullToRefresh />
          <GlobalSmartCompose />
          <MobileViewControls />
        </Suspense>
      )}
      <AppRouter />
    </>
  );
}

export default App;