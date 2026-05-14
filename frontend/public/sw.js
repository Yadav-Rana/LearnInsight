// Self-unregistering service worker.
//
// The app does not currently use a service worker, but some browsers may have
// one registered from an earlier visit (e.g. a PWA install or a Next.js plugin
// that has since been removed). That stale registration keeps requesting this
// file, which 404s and pollutes the dev logs. The script below makes the
// running SW unregister itself and clear any caches it created, so the next
// page load is clean.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore cache cleanup errors
      }
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
