/* ──────────────────────────────────────────────────────────────
   Marcadores de hipoxemia · edición esencial · NEOPEDS Academy
   Service worker para uso sin conexión.

   Al publicar una versión nueva de index.html, cambie el número
   de CACHE (v1 → v2). Eso obliga a descartar el caché anterior.
   ────────────────────────────────────────────────────────────── */

const CACHE = 'hipoxemia-esencial-v1';
const ASSETS = ['./', './index.html'];

/* Instalación: se guarda la app completa */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activación: se borran los cachés de versiones anteriores */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Lectura: primero el caché (abre al instante y sin red),
   y en paralelo se refresca desde la red para la próxima apertura */
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => {
      const fresh = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);

      return cached || fresh;
    })
  );
});
