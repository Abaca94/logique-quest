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
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8.5 20h7M10 17h4"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cross: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  erase: '<svg viewBox="0 0 24 24"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
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
  return { score: 0, solved: 0, bestStreak: 0, streak: 0, sound: true, best: {} };
}
function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    const s = { ...defaultState(), ...raw };
    s.best = { ...(raw.best || {}) };
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

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("screen-" + name).classList.add("active");
  $("btnBack").classList.toggle("show", name !== "home");
  const g = LQ.byId[currentGame];
  $("screenTitle").textContent = name === "home" ? "" : name === "win" ? "Victoire" : (g ? g.title : "");
  window.scrollTo(0, 0);
}
function goHome() {
  navToken++;
  stopTimers();
  currentGame = "home";
  showScreen("home");
}
function startGame(id) {
  const g = LQ.byId[id];
  if (!g) return;
  navToken++;
  stopTimers();
  sfx("tick");
  currentGame = id;
  showScreen(id);
  g.init();
}
function replay() { startGame(currentGame); }

// Étoiles : 1 à 3 selon les points gagnés dans la partie.
function winGame(title, sub, pts) {
  navToken++;
  stopTimers();
  sfx("win");
  const g = LQ.byId[currentGame];
  $("win-icon").innerHTML = (g && ICONS[g.id]) || ICONS.trophy;
  $("win-title").textContent = title;
  $("win-sub").textContent = sub;
  const n = Math.max(1, Math.min(3, Math.round(pts / 80)));
  $("win-stars").innerHTML = [0, 1, 2].map(i => ICONS.star.replace("<svg", `<svg class="${i < n ? "on" : ""}"`)).join("");
  showScreen("win");
}

async function resetProgress() {
  const ok = await askConfirm("Tout effacer ?", "Votre score, vos séries et vos records seront remis à zéro. Cette action est définitive.", "Effacer");
  if (!ok) return;
  const sound = state.sound;
  state = defaultState();
  state.sound = sound;
  save();
  toast("Progression réinitialisée");
}

/* ---------- Effets sonores (Web Audio, aucun fichier) ---------- */
let audioCtx = null;
function sfx(kind) {
  if (state.sound === false) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
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

/* ---------- Comparaison de réponses tapées ---------- */
function normalize(s) {
  return s.toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, " ").replace(/[^a-z0-9 -]/g, " ").replace(/\s+/g, " ").trim();
}
