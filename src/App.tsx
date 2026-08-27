import { lazy, Suspense } from "react";
import AppRouter from "./routes/AppRouter";
import { useAuth } from "./hooks/useAuth";
import "./styles/public-final-flat-authority.css";

const AuthenticatedStyles = lazy(() => import("./styles/AuthenticatedStyles"));
const GlobalPullToRefresh = lazy(() => import("./components/GlobalPullToRefresh"));
const GlobalSmartCompose = lazy(() => import("./components/GlobalSmartCompose"));
const MobileViewControls = lazy(() => import("./components/MobileViewControls"));
const MessageDraftPersistence = lazy(() => import("./components/messages/MessageDraftPersistence"));

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
          <MessageDraftPersistence />
        </Suspense>
      )}
      <AppRouter />
    </>
  );
}

export default App;