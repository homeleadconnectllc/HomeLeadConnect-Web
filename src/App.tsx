import AppRouter from "./routes/AppRouter";
import GlobalPullToRefresh from "./components/GlobalPullToRefresh";

function App() {
  return (
    <>
      <GlobalPullToRefresh />
      <AppRouter />
    </>
  );
}

export default App;
