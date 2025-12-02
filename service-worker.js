const CACHE_NAME = 'tr-aversa-v3';
const OFFLINE_URL = './index.html';

// 🔹 Immagini della gallery disponibili offline
const OFFLINE_IMAGES = [
  './icons/gallery/cappelle_1.jpg',
  './icons/gallery/cappelle_2.jpg',
  './icons/gallery/cappelle_3.JPG',
  './icons/gallery/cappelle_4.JPG',
  './icons/gallery/chiostrino_1.JPG',
  './icons/gallery/chiostrino_2.JPG',
  './icons/gallery/chiostrino_3.JPG',
  './icons/gallery/chiostro_1.JPG',
  './icons/gallery/chiostro_2.JPG',
  './icons/gallery/chiostro_3.JPG',
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
  './icons/gallery/navata_7.JPG'
];

// Install: metto in cache pagina principale + immagini gallery
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

// Attivo subito la nuova versione
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Gestione delle richieste
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1️⃣ SOLO per le vere navigazioni di pagina (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 2️⃣ Immagini → prima provo la cache, poi la rete
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          return cached; // funziona anche offline
        }
        return fetch(req).then((response) => {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, respClone);
          });
          return response;
        }).catch(() => {
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // 3️⃣ Tutto il resto → se è in cache uso quella, altrimenti rete
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req);
    })
  );
});
