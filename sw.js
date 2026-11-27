/* Service Worker LogiqueQuest — cache-first : une fois la 1re visite faite, le jeu
   fonctionne 100 % hors-ligne (avion, vacances, coupe du Wi-Fi…). */
const CACHE = "logiquequest-v33";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./fonts/ebgaramond.woff2",
  "./fonts/ebgaramond-italic.woff2",
  "./fonts/OFL.txt",
  "./js/core.js",
  "./js/games/enigmes.js",
  "./js/games/sequences.js",
  "./js/games/logique-gen.js",
  "./js/games/logique.js",
  "./js/games/sudoku.js",
  "./js/games/taquin.js",
  "./js/games/memoire.js",
  "./js/games/mots.js",
  "./js/games/vraifaux.js",
  "./js/games/nonogram.js",
  "./js/games/kakuro.js",
  "./js/games/takuzu.js",
  "./js/games/futoshiki.js",
  "./js/games/hashi.js",
  "./js/games/code.js",
  "./js/levels.js",
  "./js/daily.js",
  "./js/story2.js",
  "./js/story.js",
  "./js/share.js",
  "./js/app.js",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // ne jamais intercepter le service worker lui-même (sinon les mises à jour ne passent plus)
  if (new URL(e.request.url).pathname.endsWith("sw.js")) return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        // met en cache au fil de l'eau (utile si de nouveaux assets apparaissent)
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
    )
  );
});
