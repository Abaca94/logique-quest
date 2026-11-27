/* ============================================================
   LogiqueQuest — cœur commun à tous les jeux
   Sauvegarde, points, sons, navigation, écran de victoire.
   Chaque jeu se déclare avec LQ.register({...}) dans js/games/.
   ============================================================ */

const $ = id => document.getElementById(id);

/* ---------- Icônes (SVG au trait) ---------- */
const ICONS = {
  enigmes: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M8.6 8.8a2 2 0 1 1 2.6 1.9c-.5.2-.7.6-.7 1.1v.4"/><path d="M10.5 14.3v.1"/></svg>',
  sequences: '<svg viewBox="0 0 24 24"><path d="M4 19V15M9 19v-7M14 19V9M19 19V5"/><path d="M3 21h18"/></svg>',
  taquin: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><path d="M14 17.25h6M18 15l2 2.25-2 2.25" /></svg>',
  memoire: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="11" height="15" rx="2"/><path d="M10 4.2L11.5 3.8a2 2 0 0 1 2.4 1.4l3.2 11.9"/><path d="M14 4l5.2 1.4a2 2 0 0 1 1.4 2.4l-2.6 9.8"/><path d="M8.5 10.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z"/></svg>',
  sudoku: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
  mots: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16l2.5-8L12 16M7.8 13.4h3.4"/><path d="M14 8l4 8"/></svg>',
  logique: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/><path d="M5.5 7.5l2 2 3-3.5"/><path d="M14.5 14.5l4 4M18.5 14.5l-4 4"/></svg>',
  vf: '<svg viewBox="0 0 24 24"><path d="M12 3v18M7 21h10M4 7h16"/><path d="M4 7l-2.5 6a2.8 2.8 0 0 0 5 0L4 7zM20 7l-2.5 6a2.8 2.8 0 0 0 5 0L20 7z"/></svg>',
  nonogram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><path d="M4.5 4.5h3v3h-3zM10.5 10.5h3v3h-3zM16.5 16.5h3v3h-3zM10.5 4.5h3v3h-3z" fill="currentColor" stroke="none"/></svg>',
  kakuro: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 10h18M10 3v18M3 3l7 7"/><path d="M13.5 13.5h2.5l-2.5 4h3M6 6.2v-.1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 13.2l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.4 1.6 1.2 2.7 2.3 3.4.3-2.9 1.6-5.3 3.6-6.9-.2 3.1 1 5 2.3 6.6 1.1 1.4 1.7 3 1.7 5.2 0 3.6-3 6.2-7 6.2z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5V20"/></svg>',
  chevL: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  chevR: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8.5 20h7M10 17h4"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cross: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  erase: '<svg viewBox="0 0 24 24"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
  medal: '<svg viewBox="0 0 24 24"><path d="M8 3l2.5 6M16 3l-2.5 6"/><circle cx="12" cy="15" r="6"/><path d="M12 12.2l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 14.3l2-.3z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 4L3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  pencil: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.6"/><path d="M12 16.8v.1"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
  transfer: '<svg viewBox="0 0 24 24"><rect x="2.5" y="4" width="8" height="14" rx="1.5"/><rect x="13.5" y="6" width="8" height="14" rx="1.5"/><path d="M8 11h8M14 9l2 2-2 2"/></svg>',
  textSize: '<svg viewBox="0 0 24 24"><path d="M3 19l5-13 5 13M4.8 14.5h6.4"/><path d="M14 19l3.5-9 3.5 9M15.2 16h4.6"/></svg>',
  takuzu: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M12 3v18M3 12h18"/><circle cx="7.5" cy="7.5" r="2"/><path d="M16.5 5.5v4M7.5 14.5v4"/><circle cx="16.5" cy="16.5" r="2"/></svg>',
  futoshiki: '<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="8" height="10" rx="2"/><rect x="13.5" y="7" width="8" height="10" rx="2"/><path d="M13 9.5L11.2 12 13 14.5" /><path d="M5.5 10.5h2.5l-2 3h2.5"/></svg>',
  hashi: '<svg viewBox="0 0 24 24"><circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><path d="M8 4h8M8 6h8M5 8v8"/></svg>',
  code: '<svg viewBox="0 0 24 24"><circle cx="5" cy="8" r="2.4"/><circle cx="12" cy="8" r="2.4"/><circle cx="19" cy="8" r="2.4"/><path d="M4 16h.01M9 16h.01"/><circle cx="16" cy="16" r="1.6"/><circle cx="20" cy="16" r="1.6"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M3 7h3.5c4 0 6 10 10 10H21M3 17h3.5c1.6 0 2.8-1.5 3.8-3.4M13.7 10.4C14.7 8.5 15.9 7 17.5 7H21"/><path d="M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/></svg>',
};

/* ---------- Registre des jeux ---------- */
const LQ = {
  games: [],
  byId: {},
  register(game) {
    this.games.push(game);
    this.byId[game.id] = game;
    if (game.screen) {
      const sec = document.createElement("section");
      sec.className = "screen";
      sec.id = "screen-" + game.id;
      sec.innerHTML = game.screen;
      $("screen-win").before(sec);
    }
    if (game.setup) game.setup();
  },
};

/* ---------- Progression (localStorage) ---------- */
// Même clé que la v2 : les scores déjà gagnés sont conservés.
const SAVE_KEY = "logiquequest_v1";
function defaultState() {
  // levels : étoiles par niveau du parcours · badges : date d’obtention · wins : parties gagnées par jeu
  // daily : étoiles du défi du jour par date (AAAA-MM-JJ) · bestDaily : plus longue série de jours
  return { score: 0, solved: 0, bestStreak: 0, streak: 0, sound: true, best: {}, levels: {}, badges: {}, wins: {}, daily: {}, bestDaily: 0, story: {}, resume: {}, seenRules: {}, bigText: false, played: {}, activity: {} };
}
function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    const s = { ...defaultState(), ...raw };
    s.best = { ...(raw.best || {}) };
    s.levels = { ...(raw.levels || {}) };
    s.badges = { ...(raw.badges || {}) };
    s.wins = { ...(raw.wins || {}) };
    s.daily = { ...(raw.daily || {}) };
    s.story = { ...(raw.story || {}) };
    s.resume = { ...(raw.resume || {}) };
    s.seenRules = { ...(raw.seenRules || {}) };
    s.played = { ...(raw.played || {}) };
    s.activity = { ...(raw.activity || {}) };
    return s;
  } catch (e) { return defaultState(); }
}
let state = loadState();

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
  refreshHUD();
}
function setBest(game, value) {
  state.best[game] = Math.max(state.best[game] || 0, value);
}
function refreshHUD() {
  $("hudScore").textContent = state.score;
  $("hudStreak").textContent = state.streak;
  $("hudStreak").parentElement.classList.toggle("is-zero", !state.streak);
  $("stat-score").textContent = state.score;
  $("stat-solved").textContent = state.solved;
  $("stat-best").textContent = state.bestStreak;
  $("soundBtn").innerHTML = state.sound === false ? ICONS.soundOff : ICONS.soundOn;
  for (const g of LQ.games) {
    const el = $("rec-" + g.id);
    if (el) el.textContent = state.best[g.id] ? (g.recordLabel ? g.recordLabel(state.best[g.id]) : "Record " + state.best[g.id]) : "";
  }
}
function addPoints(n) {
  state.score = Math.max(0, state.score + n);
  if (n > 0) {
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.streak = 0;
  }
  save();
}

/* ---------- Petites aides ---------- */
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function setActiveChips(screenName, val) {
  document.querySelectorAll("#screen-" + screenName + " .chip").forEach(c =>
    c.classList.toggle("active", c.dataset.b == val));
}
function askConfirm(title, text, okLabel) {
  return new Promise(resolve => {
    const m = $("modal");
    $("modal-title").textContent = title;
    $("modal-text").textContent = text;
    $("modal-ok").textContent = okLabel || "Confirmer";
    const close = v => { m.classList.remove("show"); m.setAttribute("aria-hidden", "true"); resolve(v); };
    $("modal-ok").onclick = () => close(true);
    $("modal-cancel").onclick = () => close(false);
    m.onclick = e => { if (e.target === m) close(false); };
    m.classList.add("show");
    m.setAttribute("aria-hidden", "false");
  });
}

/* ---------- Navigation ---------- */
let currentGame = "home";
let timers = [];
// Jeton de navigation : un délai programmé par un jeu est ignoré si le joueur
// a changé d'écran ou relancé une partie entre-temps.
let navToken = 0;
function later(fn, ms) {
  const t = navToken;
  return setTimeout(() => { if (t === navToken) fn(); }, ms);
}
function stopTimers() { timers.forEach(clearInterval); timers = []; }

// Niveau du parcours en cours (null en jeu libre). Voir js/levels.js.
LQ.level = null;
// Défi du jour en cours (null sinon). Voir js/daily.js.
LQ.daily = null;
// Épisode de l’histoire en cours (null sinon). Voir js/story.js.
LQ.story = null;
function levelCfg() { const m = LQ.level || LQ.daily || LQ.story; return m ? m.cfg : null; }
let currentScreen = "home";

const SCREEN_TITLES = { home: "", map: "Parcours", profile: "Profil", daily: "Défi du jour", story: "Histoire", episode: "" };
function showScreen(name) {
  currentScreen = name;
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("screen-" + name).classList.add("active");
  $("btnBack").classList.toggle("show", name !== "home");
  $("rulesBtn").classList.toggle("show", !!(LQ.byId[name] && LQ.byId[name].rules));
  const g = LQ.byId[currentGame];
  let title = SCREEN_TITLES[name];
  if (title === undefined) {
    if (LQ.level) title = `Niveau ${LQ.level.n}` + (name === "win" ? "" : ` · ${g ? g.title : ""}`);
    else if (LQ.daily) title = "Défi du jour" + (name === "win" ? "" : ` · ${g ? g.title : ""}`);
    else if (LQ.story) title = `Épisode ${LQ.story.n}` + (name === "win" ? "" : ` · ${g ? g.title : ""}`);
    else title = name === "win" ? "Résultat" : (g ? g.title : "");
  }
  $("screenTitle").textContent = title;
  if (title) { $("screenTitle").setAttribute("role", "heading"); $("screenTitle").setAttribute("aria-level", "1"); }
  else { $("screenTitle").removeAttribute("role"); $("screenTitle").removeAttribute("aria-level"); }
  document.body.classList.toggle("in-level", !!(LQ.level || LQ.daily || LQ.story) && name !== "win");
  window.scrollTo(0, 0);
}
function leaveGame() { navToken++; stopTimers(); }
function goHome() {
  leaveGame();
  currentGame = "home";
  LQ.level = null;
  LQ.daily = null;
  LQ.story = null;
  if (typeof renderHome === "function") renderHome();
  showScreen("home");
}
// Bouton retour : un niveau ramène à la carte, le défi du jour à son calendrier, le reste à l’accueil.
function goBack() {
  const inGame = LQ.byId[currentScreen] || currentScreen === "win";
  if (LQ.level && inGame) { leaveGame(); openMap(); }
  else if (LQ.daily && inGame) { leaveGame(); openDaily(); }
  else if (LQ.story && inGame) { leaveGame(); openEpisode(LQ.story.n); }
  else if (currentScreen === "episode") openStory();
  else goHome();
}
function startGame(id) {
  LQ.level = null;
  LQ.daily = null;
  LQ.story = null;
  launchGame(id);
}
function launchGame(id) {
  const g = LQ.byId[id];
  if (!g) return;
  leaveGame();
  sfx("tick");
  currentGame = id;
  showScreen(id);
  g.init(levelCfg());
  if (g.rules && !state.seenRules[id]) showRules(id);
}
function replay() {
  if (LQ.level) startLevel(LQ.level.n);
  else if (LQ.daily) startDaily();
  else if (LQ.story) startEpisode(LQ.story.n);
  else startGame(currentGame);
}
/* ---------- Reprise d’une partie en cours ----------
   Les jeux à grille enregistrent leur état à chaque coup. En revenant sur le même
   jeu, dans le même contexte (jeu libre de même taille, même niveau, même défi du
   jour ou même épisode), la partie reprend là où on l’avait laissée. */
function playCtx(extra) {
  const m = LQ.level ? "L" + LQ.level.n : LQ.daily ? "D" + LQ.daily.key : LQ.story ? "S" + (LQ.story.s ? LQ.story.s + "." : "") + LQ.story.n : "F";
  return m + ":" + extra;
}
function resumeSave(game, ctx, data) { state.resume[game] = { ctx, data }; save(); }
function resumeTake(game, ctx) {
  const r = state.resume[game];
  if (!r || r.ctx !== ctx) return null;
  later(() => toast("Partie reprise là où vous l’aviez laissée"), 150);
  return r.data;
}
// En jeu libre, reprend la taille de la partie gardée (sinon la partie serait ignorée après un redémarrage).
function resumeFreeSize(game) {
  const r = state.resume[game];
  return r && r.ctx.startsWith("F:") ? +r.ctx.slice(2) : 0;
}
function resumeClear(game) { if (state.resume[game]) { delete state.resume[game]; save(); } }

/* ---------- Règles des jeux (affichées à la première partie, puis via « ? ») ---------- */
function showRules(id) {
  const g = LQ.byId[id || currentGame];
  if (!g || !g.rules) return;
  $("rules-ico").innerHTML = ICONS[g.id];
  $("rules-ico").style.setProperty("--hue", g.hue);
  $("rules-title").textContent = g.title;
  $("rules-body").innerHTML = g.rules.map(t => `<li>${t}</li>`).join("");
  const m = $("rules-sheet");
  m.onclick = e => { if (e.target === m) closeRules(); };
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
  state.seenRules[g.id] = 1; save();
}
function closeRules() { const m = $("rules-sheet"); m.classList.remove("show"); m.setAttribute("aria-hidden", "true"); }

/* ---------- Taille du texte ---------- */
function applyTextSize() { document.body.classList.toggle("big-text", !!state.bigText); }
function toggleTextSize() {
  state.bigText = !state.bigText; save(); applyTextSize();
  toast(state.bigText ? "Texte agrandi" : "Texte normal");
  if (typeof renderHome === "function") renderHome();
}

function starsHtml(n, total = 3) {
  return Array.from({ length: total }, (_, i) => ICONS.star.replace("<svg", `<svg class="${i < n ? "on" : ""}"`)).join("");
}

// Fin de partie. stars : 0 (échec) à 3 ; sans valeur, elles dépendent des points.
function winGame(title, sub, pts, stars) {
  leaveGame();
  const g = LQ.byId[currentGame];
  const n = stars === undefined ? Math.max(1, Math.min(3, Math.round(pts / 80))) : stars;
  if (n > 0) state.wins[currentGame] = (state.wins[currentGame] || 0) + 1;
  trackPlay(currentGame, n > 0);
  const notes = [];
  if (LQ.level) notes.push(...recordLevel(LQ.level.n, n));
  if (LQ.daily) notes.push(...recordDaily(LQ.daily.key, n));
  if (LQ.story) notes.push(...recordStory(LQ.story.n, n));
  const badges = checkBadges();
  save();
  sfx(n > 0 ? "win" : "bad");
  $("win-icon").innerHTML = (g && ICONS[g.id]) || ICONS.trophy;
  $("win-icon").classList.toggle("fail", n === 0);
  $("win-title").textContent = n > 0 ? title : "Pas cette fois";
  $("win-sub").textContent = n > 0 || !(LQ.level || LQ.daily || LQ.story) ? sub
    : sub + (LQ.level ? " Il faut au moins une étoile pour valider le niveau." : LQ.daily ? " Il faut au moins une étoile pour réussir le défi." : " Il faut au moins une étoile pour poursuivre l’histoire.");
  $("win-stars").innerHTML = starsHtml(n);
  $("win-notes").innerHTML = [
    ...notes.map(t => `<div class="note">${t}</div>`),
    ...badges.map(b => `<div class="note badge-note">${ICONS.medal} Badge obtenu : <b>${b.name}</b></div>`),
  ].join("");
  const next = LQ.level && n > 0 ? nextLevel(LQ.level.n) : null;
  $("win-actions").innerHTML = LQ.level
    ? (next ? `<button class="btn" onclick="startLevel(${next})">Niveau suivant →</button>` : "")
      + `<button class="btn ${next ? "ghost" : ""}" onclick="replay()">${n > 0 ? "Rejouer le niveau" : "Réessayer"}</button>`
      + `<button class="btn ghost" onclick="openMap()">Carte du parcours</button>`
    : LQ.story
    ? (n > 0 && LQ.story.n < STORY.episodes.length ? `<button class="btn" onclick="openEpisode(${LQ.story.n + 1})">Épisode suivant →</button>` : "")
      + (n > 0 && LQ.story.n === STORY.episodes.length && STORIES[LQ.story.s + 1] ? `<button class="btn" onclick="openStory(${LQ.story.s + 1})">Tome suivant →</button>` : "")
      + `<button class="btn ${n > 0 && (LQ.story.n < STORY.episodes.length || STORIES[LQ.story.s + 1]) ? "ghost" : ""}" onclick="replay()">${n > 0 ? "Rejouer l’épreuve" : "Réessayer"}</button>`
      + `<button class="btn ghost" onclick="openStory()">Sommaire de l’histoire</button>`
    : LQ.daily
    ? (dailyStars(LQ.daily.key) > 0 ? `<button class="btn" onclick="shareDaily('${LQ.daily.key}')">${ICONS.share} Partager mon résultat</button>` : "")
      + `<button class="btn ${dailyStars(LQ.daily.key) > 0 ? "ghost" : ""}" onclick="replay()">${n > 0 ? "Rejouer le défi" : "Réessayer"}</button><button class="btn ghost" onclick="openDaily()">Calendrier des défis</button>`
    : `<button class="btn" onclick="replay()">Rejouer</button><button class="btn ghost" onclick="goHome()">Retour au menu</button>`;
  showScreen("win");
}

async function resetProgress() {
  const ok = await askConfirm("Tout effacer ?", "Votre score, vos séries, vos records, vos étoiles du parcours et vos badges seront remis à zéro. Cette action est définitive.", "Effacer");
  if (!ok) return;
  const sound = state.sound;
  state = defaultState();
  state.sound = sound;
  save();
  if (typeof renderHome === "function") renderHome();
  toast("Progression réinitialisée");
}

/* ---------- Effets sonores (Web Audio, aucun fichier) ---------- */
let audioCtx = null;
function sfx(kind) {
  if (state.sound === false) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    // Safari (iPhone, iPad) met le son en état « interrupted » après un appel, une alarme
    // ou un passage en arrière-plan : on relance dans tous les cas où il ne joue pas.
    if (audioCtx.state !== "running") audioCtx.resume();
    const t0 = audioCtx.currentTime;
    const tone = (f, at, dur = .12, type = "sine", vol = .12) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + .015);
      g.gain.exponentialRampToValueAtTime(.001, at + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(at); o.stop(at + dur + .05);
    };
    if (kind === "tick") tone(660, t0, .04, "triangle", .05);
    else if (kind === "flip") tone(340, t0, .07, "triangle", .08);
    else if (kind === "good") { tone(587, t0, .1); tone(880, t0 + .08, .18); }
    else if (kind === "bad") tone(165, t0, .22, "triangle", .12);
    else if (kind === "win") [523, 659, 784, 1046].forEach((f, i) => tone(f, t0 + i * .1, .22));
  } catch (e) { /* pas de son disponible */ }
}
function toggleSound() {
  state.sound = state.sound === false;
  save();
  sfx("tick");
  toast(state.sound ? "Sons activés" : "Sons coupés");
}

/* ---------- Étoiles selon le nombre de bonnes réponses ---------- */
// Tout juste : 3 · une erreur : 2 · au moins la moitié : 1 · sinon 0 (niveau raté)
function starsByCount(good, total) {
  if (good >= total) return 3;
  if (good >= total - 1) return 2;
  return good >= Math.ceil(total / 2) ? 1 : 0;
}
function countGoals(total) {
  return [`${total} bonnes réponses sur ${total}`, `Au moins ${total - 1} bonnes réponses`, `Au moins ${Math.ceil(total / 2)} bonnes réponses`];
}

/* ---------- Comparaison de réponses tapées ---------- */
function normalize(s) {
  return s.toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, " ").replace(/[^a-z0-9 -]/g, " ").replace(/\s+/g, " ").trim();
}

/* ---------- Indices en trois temps ----------
   1er appui : on montre la prochaine case (ou le prochain pont) à déduire.
   2e appui : on explique pourquoi, et on entoure les éléments qui le prouvent.
   3e appui : on place la réponse. Une erreur du joueur passe toujours en premier :
   montrée au 1er appui, effacée au 2e.
   Chaque jeu fournit : valid(h) (l’indice tient-il encore ?), wrong(), find(),
   fallback(), clear(h), place(h), count(), render(). */
const HINTS = {};
const HINT_NEXT = ' <span class="hint-next">Touchez encore Indice pour placer la réponse.</span>';
function hintFlow(game, o) {
  const h = HINTS[game];
  if (h && o.valid(h)) {
    if (h.stage === 1 && h.wrong) { HINTS[game] = null; o.clear(h); sfx("tick"); toast("Erreur effacée"); o.render(); return; }
    if (h.stage === 1) { h.stage = 2; sfx("tick"); o.render(); return; }
    HINTS[game] = null; sfx("good"); o.place(h); o.render(); return;
  }
  HINTS[game] = null;
  const w = o.wrong();
  if (w) {
    HINTS[game] = Object.assign({ stage: 1, wrong: true, why: [], text: "" }, w);
    o.count(); sfx("bad"); toast(w.msg || "Cette case est fausse. Touchez encore Indice pour l’effacer."); o.render(); return;
  }
  const r = o.find() || o.fallback();
  if (!r) return;
  HINTS[game] = Object.assign({ stage: 1, wrong: false, why: [] }, r, { text: r.text + HINT_NEXT });
  o.count(); sfx("tick"); toast(r.msg || "Cette case se déduit maintenant. Touchez encore Indice pour l’explication."); o.render();
}
function hintGet(game) { return HINTS[game] || null; }
function hintReset(game) { HINTS[game] = null; }
// Classe CSS d’un élément : cible de l’indice, erreur montrée, ou élément de la preuve.
function hintCls(game, key) {
  const h = HINTS[game];
  if (!h) return "";
  if (h.key === key) return h.wrong ? " hint-wrong" : " hint-target";
  return h.stage >= 2 && h.why.includes(key) ? " hint-why" : "";
}
// Panneau d’explication sous la grille ; l’indice est oublié s’il ne tient plus.
function hintPanel(game, id, valid) {
  if (HINTS[game] && !valid(HINTS[game])) HINTS[game] = null;
  const el = $(id), h = HINTS[game];
  if (!el) return;
  if (h && h.stage >= 2 && h.text) { el.innerHTML = h.text; el.classList.add("show"); }
  else { el.innerHTML = ""; el.classList.remove("show"); }
}
// « 1, 2 et 5 »
function frList(a) { a = a.map(String); return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " et " + a[a.length - 1]; }

/* ---------- Clavier (iPad avec clavier, accessibilité) ----------
   Les cases des grilles deviennent atteignables avec Tab et se jouent avec
   Entrée ou Espace ; les chiffres et la touche Effacer passent par le pavé. */
const KB_CELLS = ".sudoku-cell, .kk-cell, .ft-cell, .mem-card, .tile, .lgc, .hs-isl";
function kbLabel(el) {
  const v = el.classList.contains("mem-card") ? "" : (el.querySelector(".notes") ? "" : el.textContent.trim());
  const rc = (i, n) => `ligne ${Math.floor(i / n) + 1}, colonne ${i % n + 1}`;
  const sibs = el.parentElement ? [...el.parentElement.children] : [], idx = sibs.indexOf(el);
  if (el.matches(".sudoku-cell")) return `${v || "vide"}, ${rc(idx, Math.round(Math.sqrt(sibs.length)))}`;
  if (el.matches(".kk-cell")) return `${v || "vide"}, ${rc(+el.dataset.i, kkN)}`;
  if (el.matches(".ft-cell")) return `${v || "vide"}, ${rc(+el.dataset.i, ftN)}`;
  if (el.matches(".tile")) return v ? `${v}` : "Case vide";
  if (el.matches(".mem-card")) return `Carte ${idx + 1}, ${el.matches(".matched") ? "paire trouvée " + el.dataset.e : el.matches(".open") ? el.dataset.e : "cachée"}`;
  if (el.matches(".lgc")) {
    const tr = el.closest("tr"), row = tr && tr.querySelector("td.a");
    const cols = [...el.closest("table").querySelectorAll("th.col")], pos = [...tr.querySelectorAll(".lgc")].indexOf(el);
    const col = cols[pos] || null;
    const st = v === "✔" ? "oui" : v === "✘" ? "non" : "vide";
    return `${st}, ${row ? row.textContent.trim() : ""} et ${col ? col.textContent.trim() : ""}`;
  }
  if (el.matches(".hs-isl")) return `Île ${el.textContent.trim()}`;
  return v;
}
function kbPrepare(root) {
  // Safari (Mac, iPad avec clavier) saute les boutons à la touche Tab tant que
  // l’option « Tab pour sélectionner chaque élément » est désactivée ; un tabindex
  // explicite les remet dans l’ordre de tabulation, sans rien changer ailleurs.
  (root || document).querySelectorAll("button:not([tabindex])").forEach(b => b.setAttribute("tabindex", "0"));
  (root || document).querySelectorAll(KB_CELLS).forEach(el => {
    if (el.tagName !== "BUTTON") {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    }
    const l = kbLabel(el);
    if (l && el.getAttribute("aria-label") !== l) el.setAttribute("aria-label", l);
  });
}
let kbQueued = false;
kbPrepare(document);
new MutationObserver(() => { if (kbQueued) return; kbQueued = true; requestAnimationFrame(() => { kbQueued = false; kbPrepare($("main")); }); }).observe(document.getElementById("main"), { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
document.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  if (e.key === "Escape") {
    const open = document.querySelector(".modal.show");
    if (open) { e.preventDefault(); open.id === "rules-sheet" ? closeRules() : open.id === "transfer-sheet" ? closeTransfer() : (open.classList.remove("show"), open.setAttribute("aria-hidden", "true")); }
    return;
  }
  if ((e.key === "Enter" || e.key === " ") && t && t.matches && t.matches(KB_CELLS)) {
    e.preventDefault();
    const board = t.parentElement && t.closest("[id]"), list = board ? [...board.querySelectorAll(KB_CELLS)] : [], i = list.indexOf(t);
    t.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    requestAnimationFrame(() => { // une grille redessinée perd le focus : on le rend à la même case
      if (board && i >= 0 && !board.contains(document.activeElement)) { const n = document.getElementById(board.id); if (n) kbPrepare(n); const c = n && n.querySelectorAll(KB_CELLS)[i]; c && c.focus(); }
    });
    return;
  }
  const scr = document.querySelector(".screen.active");
  if (!scr) return;
  if (/^[1-9]$/.test(e.key)) {
    const k = [...scr.querySelectorAll(".key")].find(b => b.textContent.trim() === e.key && b.offsetParent);
    if (k) { e.preventDefault(); k.click(); }
  } else if (e.key === "Backspace" || e.key === "Delete") {
    const k = scr.querySelector('.key[aria-label="Effacer"]');
    if (k && k.offsetParent) { e.preventDefault(); k.click(); }
  }
});

/* ---------- Fenêtres : le focus entre dans la fenêtre et revient ensuite ---------- */
let modalReturn = null;
new MutationObserver(muts => {
  for (const m of muts) {
    const el = m.target;
    if (!el.classList || !el.classList.contains("modal")) continue;
    if (el.classList.contains("show") && !el.contains(document.activeElement)) {
      modalReturn = document.activeElement;
      setTimeout(() => { if (el.contains(document.activeElement)) return; const f = el.querySelector(".modal-actions .btn:not(.ghost), .modal-actions .btn, button, textarea"); f && f.focus({ preventScroll: true }); }, 80);
    } else if (!el.classList.contains("show") && modalReturn && !document.querySelector(".modal.show")) {
      const r = modalReturn; modalReturn = null; if (r && r.isConnected && r.focus) r.focus({ preventScroll: true });
    }
  }
}).observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
