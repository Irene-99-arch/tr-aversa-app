const CACHE_NAME = 'tr-aversa-v1';
const OFFLINE_URL = './index.html';

// Quando installo il service worker: metto in cache la pagina principale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
});

// Attivo subito la nuova versione
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Gestione di TUTTE le richieste
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) SOLO per le vere navigazioni di pagina (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return; // importante: esco qui
  }

  // 2) Per TUTTO il resto (immagini, audio, css, js, ecc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // se ce l'ho in cache → lo uso
        return cached;
      }
      // altrimenti vado in rete normalmente
      return fetch(req);
    })
  );
});
