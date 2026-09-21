import { useEffect, useState } from "react";
import "./connectivity-status.css";

export default function ConnectivityStatus() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (online) return null;
  return <div className="hlc-connectivity-status" role="status" aria-live="polite">Offline — safe drafts remain on this device until you reconnect.</div>;
}
