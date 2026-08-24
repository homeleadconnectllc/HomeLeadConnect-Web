self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function safeHlcNotificationTarget(value) {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/notifications";
  const resolved = new URL(candidate, self.location.origin);
  return resolved.origin === self.location.origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : "/notifications";
}

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch { payload = { body: event.data.text() }; }
  const title = payload.title || "HomeLead Connect";
  const options = {
    body: payload.body || "You have a new HLC update.",
    icon: "/hlc-icon.jpeg",
    badge: "/hlc-icon.jpeg",
    data: { url: safeHlcNotificationTarget(payload.deep_link) },
    tag: payload.tag || undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(safeHlcNotificationTarget(event.notification.data?.url), self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
