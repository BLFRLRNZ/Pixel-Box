// Pixel Box · service worker: fa funzionare l'app anche senza connessione.
// Cambia VERSIONE quando aggiorni le icone o il manifest.
const VERSIONE = 'pixelbox-v1';
const BASE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(chiavi => Promise.all(chiavi.filter(k => k !== VERSIONE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // la pagina: prima la rete (così arrivano gli aggiornamenti), poi la copia salvata se sei offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then(r => { const copia = r.clone(); caches.open(VERSIONE).then(c => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // icone, manifest e carattere a pixel: prima la copia salvata, poi la rete
  e.respondWith(caches.match(req).then(salvato => salvato || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const copia = r.clone(); caches.open(VERSIONE).then(c => c.put(req, copia)); }
    return r;
  })));
});
