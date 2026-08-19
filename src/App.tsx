import AppRouter from "./routes/AppRouter";
import GlobalPullToRefresh from "./components/GlobalPullToRefresh";
import GlobalSmartCompose from "./components/GlobalSmartCompose";
import MobileViewControls from "./components/MobileViewControls";

function App() {
  return (
    <>
      <GlobalPullToRefresh />
      <GlobalSmartCompose />
      <MobileViewControls />
      <AppRouter />
    </>
  );
}

export default App;
