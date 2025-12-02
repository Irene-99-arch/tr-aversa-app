const CACHE_NAME = 'tr-aversa-v3';
const OFFLINE_URL = './index.html';

// Immagini della gallery di San Lorenzo (stessi nomi del tuo index.html)
const OFFLINE_IMAGES = [
  './icons/gallery/esterno_1.JPG',
  './icons/gallery/esterno_2.JPG',
  './icons/gallery/esterno_3.JPG',
  './icons/gallery/esterno_4.JPG',
  './icons/gallery/esterno_5.JPG',
  './icons/gallery/esterno_6.JPG',
  './icons/gallery/esterno_7.JPG',
  './icons/gallery/esterno_8.JPG',
  './icons/gallery/esterno_9.JPG',
  './icons/gallery/navata_1.JPG',
  './icons/gallery/navata_2.JPG',
  './icons/gallery/navata_3.JPG',
  './icons/gallery/navata_4.JPG',
  './icons/gallery/navata_5.JPG',
  './icons/gallery/navata_6.JPG',
  './icons/gallery/navata_7.JPG',
  './icons/gallery/cappelle_1.JPG',
  './icons/gallery/cappelle_2.JPG',
  './icons/gallery/cappelle_3.JPG',
  './icons/gallery/cappelle_4.JPG',
  './icons/gallery/chiostrino_1.JPG',
  './icons/gallery/chiostrino_2.JPG',
  './icons/gallery/chiostrino_3.JPG',
  './icons/gallery/chiostro_1.JPG',
  './icons/gallery/chiostro_2.JPG',
  './icons/gallery/chiostro_3.JPG'
];

// Install: metto in cache pagina + immagini gallery
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        ...OFFLINE_IMAGES
      ]);
    })
  );
});

// Attivo subito la nuova versione e pulisco le vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Gestione delle richieste
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) Navigazioni vere e proprie (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 2) Immagini: prima cache, poi rete
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(req).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone);
          });
          return response;
        }).catch(() => {
          // niente immagine di fallback → solo 404 “silenziosa”
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // 3) Altre richieste: cache se presente, altrimenti rete
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req);
    })
  );
});
