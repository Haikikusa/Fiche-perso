// Généré par tools/build-pwa.js, version 20261016013634
const VERSION = '20261016013634';
const CACHE = 'fiche-perso-' + VERSION;
const FICHIERS = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png","fiche.enc"];

self.addEventListener('install', e => {
    // cache:'reload' : ne jamais reprendre une ancienne copie du cache HTTP du navigateur (sinon la mise à jour garde l'ancienne fiche)
    e.waitUntil(caches.open(CACHE).then(c => Promise.all(FICHIERS.map(u =>
        fetch(new Request(u, { cache: 'reload' })).then(r => {
            if (!r.ok) throw new Error('Échec ' + u);
            return c.put(u, r);
        })
    ))));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(noms => Promise.all(noms.filter(n => n.indexOf('fiche-perso-') === 0 && n !== CACHE).map(n => caches.delete(n))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', e => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // Polices Google : réseau d'abord, copie en cache en secours
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        e.respondWith(
            caches.open('fiche-polices').then(c =>
                fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => c.match(req))
            )
        );
        return;
    }
    if (url.origin !== location.origin) return;
    // Fichiers de l'application : cache d'abord, réseau en secours
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
