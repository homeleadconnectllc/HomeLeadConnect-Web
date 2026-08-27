import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bell, CheckCircle2, Inbox, Radio, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { listNotifications, markNotificationRead, type NotificationRecord } from "../../api/notifications";
import { errorMessage } from "../../lib/errorMessage";
import "../../styles/notifications-workspace.css";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export default function Notifications() {
  const [items,setItems] = useState<NotificationRecord[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listNotifications());
    } catch (reason: unknown) {
      setError(errorMessage(reason,"Unable to load notifications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active=true;
    listNotifications().then((rows) => { if(active) setItems(rows); })
      .catch((reason:unknown) => { if(active) setError(errorMessage(reason,"Unable to load notifications.")); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active=false; };
  }, []);

  async function read(item: NotificationRecord) {
    if (!item.read_at) {
      try { await markNotificationRead(item.id); setItems((current) => current.map((row) => row.id===item.id ? {...row,read_at:new Date().toISOString()} : row)); }
      catch (reason) { setError(errorMessage(reason,"Unable to mark the notification read.")); return; }
    }
  }

  const unreadCount = useMemo(() => items.filter((item) => !item.read_at).length, [items]);
  const latest = items[0]?.created_at ? formatNotificationTime(items[0].created_at) : "No activity";

  return <main className="hlc-notifications-workspace">
    <header className="hlc-notifications-header">
      <div>
        <span className="hlc-notifications-kicker"><Bell size={15} aria-hidden="true" /> Command inbox</span>
        <h1>Notifications</h1>
        <p>Assignment, appointment, conversation and telephony events land here as an operating queue.</p>
      </div>
      <div className="hlc-notifications-live" aria-label="Notification feed status">
        <Radio size={15} aria-hidden="true" />
        Live event feed
      </div>
    </header>

    <section className="hlc-notifications-summary" aria-label="Notification summary">
      <div><span>Unread</span><strong>{loading ? "—" : unreadCount}</strong></div>
      <div><span>Total</span><strong>{loading ? "—" : items.length}</strong></div>
      <div><span>Latest</span><strong className="hlc-notifications-latest">{loading ? "Loading…" : latest}</strong></div>
    </section>

    <section className="hlc-notifications-queue" aria-labelledby="notification-queue-heading">
      <div className="hlc-notifications-queue-heading">
        <div>
          <span>Operations</span>
          <h2 id="notification-queue-heading">Event queue</h2>
        </div>
        {!loading && !error && <span>{unreadCount ? `${unreadCount} need attention` : "All caught up"}</span>}
      </div>

      {loading && <p className="hlc-notifications-state" role="status">Loading notifications…</p>}
      {error && <div className="hlc-notifications-state hlc-notifications-error" role="alert">
        <strong>Notifications are temporarily unavailable.</strong>
        <span>{error}</span>
        <button type="button" onClick={() => void loadNotifications()} disabled={loading}>
          <RotateCw size={16} aria-hidden="true" />
          {loading ? "Retrying…" : "Try again"}
        </button>
      </div>}
      {!loading && !error && items.length===0 && <div className="hlc-notifications-empty">
        <Inbox size={24} aria-hidden="true" />
        <strong>No notifications yet</strong>
        <span>You’re caught up. New HLC events that need awareness or action will appear here in time order.</span>
      </div>}

      <div className="hlc-notifications-list" aria-live="polite">
        {items.map((item) => {
          const unread = !item.read_at;
          return <article key={item.id} className={`hlc-notification-row${unread ? " is-unread" : ""}`}>
            <span className="hlc-notification-status" aria-hidden="true">{unread ? <span /> : <CheckCircle2 size={16} />}</span>
            <div className="hlc-notification-copy">
              <div className="hlc-notification-title-line">
                <h3>{item.title}</h3>
                {unread && <span>New</span>}
              </div>
              <p>{item.body}</p>
              <time dateTime={item.created_at}>{formatNotificationTime(item.created_at)}</time>
            </div>
            <Link className="hlc-notification-open" to={item.deep_link || "/notifications"} onClick={() => void read(item)}>
              <span>Open</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>;
        })}
      </div>
    </section>
  </main>;
}
