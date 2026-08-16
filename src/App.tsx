import AppRouter from "./routes/AppRouter";
import GlobalPullToRefresh from "./components/GlobalPullToRefresh";
import GlobalSmartCompose from "./components/GlobalSmartCompose";

function App() {
  return (
    <>
      <GlobalPullToRefresh />
      <GlobalSmartCompose />
      <AppRouter />
    </>
  );
}

export default App;
