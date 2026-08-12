import AppEntry from "./AppEntry";
import HomePage from "./HomePage";

const APP_HOST = "app.homeleadconnect.org";

export default function HostEntry() {
  if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === APP_HOST) {
    return <AppEntry />;
  }

  return <HomePage />;
}
