import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listNotifications, markNotificationRead, type NotificationRecord } from "../../api/notifications";
import { errorMessage } from "../../lib/errorMessage";

export default function Notifications() {
  const enabled = import.meta.env.VITE_NOTIFICATIONS_ENABLED === "true";
  const [items,setItems] = useState<NotificationRecord[]>([]);
  const [loading,setLoading] = useState(enabled);
  const [error,setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    let active=true;
    listNotifications().then((rows) => { if(active) setItems(rows); })
      .catch((reason:unknown) => { if(active) setError(errorMessage(reason,"Unable to load notifications.")); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active=false; };
  }, [enabled]);

  async function read(item: NotificationRecord) {
    if (!item.read_at) {
      try { await markNotificationRead(item.id); setItems((current) => current.map((row) => row.id===item.id ? {...row,read_at:new Date().toISOString()} : row)); }
      catch (reason) { setError(errorMessage(reason,"Unable to mark the notification read.")); return; }
    }
  }

  if (!enabled) return <main style={pageStyle}><h1>Notifications</h1><p><strong>Setup required:</strong> persistent event notifications are not enabled in this environment.</p></main>;
  return <main style={pageStyle}><h1>Notifications</h1>
    <p>Only real assignment, appointment, and conversation events appear here.</p>
    {loading && <p>Loading notifications…</p>}
    {error && <p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
    {!loading && !error && items.length===0 && <p>No notifications yet.</p>}
    <div aria-live="polite">{items.map((item) => <article key={item.id} style={{...cardStyle,background:item.read_at?"#fff":"#eff6ff"}}>
      <h2 style={{fontSize:18}}>{item.title}</h2><p>{item.body}</p><small>{new Date(item.created_at).toLocaleString()}</small><br />
      <Link to={item.deep_link} onClick={() => void read(item)}>Open related record</Link>
    </article>)}</div>
  </main>;
}

const pageStyle={width:"min(820px, calc(100% - 32px))",margin:"40px auto"};
const cardStyle={padding:16,border:"1px solid #e2e8f0",borderRadius:12,marginBottom:12};
