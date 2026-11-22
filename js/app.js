/* ============================================================
   LogiqueQuest — démarrage : menu d’accueil, mises à jour, hors-ligne
   ============================================================ */

/* ---------- Menu des jeux libres, regroupés par famille ---------- */
const MENU_FAMILIES = [
  ["Raisonner", ["enigmes", "logique", "sequences", "vf", "code"]],
  ["Grilles de chiffres", ["sudoku", "kakuro", "futoshiki", "takuzu"]],
  ["Formes et liaisons", ["nonogram", "hashi", "taquin"]],
  ["Mots et mémoire", ["mots", "memoire"]],
];
function renderMenu() {
  const card = g => `
    <button class="menu-card" style="--hue:${g.hue}" onclick="startGame('${g.id}')">
      <span class="ico">${ICONS[g.id] || ICONS.star}</span>
      <h3>${g.title}</h3>
      <p>${g.desc}</p>
      <span class="rec" id="rec-${g.id}"></span>
    </button>`;
  const placed = new Set();
  const groups = MENU_FAMILIES.map(([name, ids]) => {
    const games = ids.map(id => LQ.byId[id]).filter(Boolean);
    games.forEach(g => placed.add(g.id));
    return [name, games];
  });
  const rest = LQ.games.filter(g => !placed.has(g.id)); // un jeu oublié reste accessible
  if (rest.length) groups[groups.length - 1][1].push(...rest);
  $("menu-grid").innerHTML = groups.filter(([, gs]) => gs.length).map(([name, gs]) => `
    <div class="menu-family"><h3>${name}</h3><div class="menu-grid">${gs.map(card).join("")}</div></div>`).join("");
}

/* ---------- Confort tactile ---------- */
document.addEventListener("gesturestart", e => e.preventDefault()); // pas de zoom à deux doigts
document.addEventListener("dblclick", e => e.preventDefault());
window.addEventListener("scroll", () => document.body.classList.toggle("scrolled", window.scrollY > 4), { passive: true });

/* ---------- Mises à jour ----------
   1) compare la version en ligne (badge de index.html) à la version locale ;
   2) si elle diffère : purge service worker et caches, puis recharge.        */
const LOCAL_VERSION = "v9.4";
function canReloadNow() { // garde anti-boucle : au plus un rechargement automatique toutes les 20 s
  try { return Date.now() - Number(localStorage.getItem("lq_last_reload") || 0) > 20000; }
  catch (e) { return true; }
}
async function forceUpdate(silent) {
  try {
    if (!canReloadNow()) { if (silent !== true) toast("Mise à jour déjà vérifiée à l’instant"); return; }
    if (navigator.onLine === false) { toast("Pas de réseau, réessayez plus tard"); return; }
    if (silent !== true) toast("Mise à jour en cours…");
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    try { localStorage.setItem("lq_last_reload", String(Date.now())); } catch (e) {}
    location.reload();
  } catch (e) { /* on réessaiera au prochain lancement */ }
}
async function autoUpdateCheck() {
  try {
    if (!navigator.onLine || location.protocol === "file:") return;
    const res = await fetch(location.pathname + "?ping=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return;
    const m = (await res.text()).match(/id="verBadge"[^>]*>([^<]+)</);
    if (m && m[1] && m[1] !== LOCAL_VERSION) forceUpdate(true);
  } catch (e) { /* hors ligne : rien à faire */ }
}
window.addEventListener("load", () => setTimeout(autoUpdateCheck, 2500));

// Service worker : jeu disponible hors ligne après la première visite (HTTPS uniquement)
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("sw.js");
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        nw && nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) forceUpdate(true);
        });
      });
    } catch (e) { /* le jeu fonctionne quand même */ }
  });
}

renderMenu();
applyTextSize();
checkBadges(); // attribue sans bruit les badges déjà mérités (progression existante)
save();
renderHome();
