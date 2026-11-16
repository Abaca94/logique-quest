/* ============================================================
   Mots mêlés — glisser le doigt sur les lettres (8 directions)
   ============================================================ */
const WS_WORDS = [
  "ENIGME", "LOGIQUE", "INDICE", "MYSTERE", "SECRET", "DEDUIRE", "SPHINX", "CODE", "CLEF", "PUZZLE",
  "LABYRINTHE", "ORACLE", "BOUSSOLE", "ASTROLABE", "CRYPTE", "GRIMOIRE", "SIGNAL", "PARADOXE",
  "THEOREME", "ALIBI", "TEMOIN", "PISTE", "DETECTIVE", "SOLUTION", "HORLOGE", "MIROIR", "LANTERNE", "ECHIQUIER",
];
const WS_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]];
let wsS = 8, wsG = [], wsList = [], wsFound = new Set(), wsStart = null;

function setMots(s) { wsS = s; initMots(); }
// Objectifs en secondes : [3 étoiles, 2 étoiles]
const WS_TIME = { 8: [60, 120], 10: [120, 240], 12: [180, 360] };
let wsSeconds = 0;
// cfg (mode parcours) : { size: 8 | 10 | 12 }
function initMots(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) wsS = cfg.size;
  stopTimers();
  wsSeconds = 0;
  $("ws-time").textContent = "0 s";
  timers.push(setInterval(() => { wsSeconds++; $("ws-time").textContent = wsSeconds + " s"; }, 1000));
  const [t3, t2] = WS_TIME[wsS];
  $("ws-goals").innerHTML = `3 ${ICONS.star} en ${t3} s ou moins · 2 ${ICONS.star} jusqu’à ${t2} s`;
  setActiveChips("mots", wsS);
  wsFound = new Set(); wsStart = null;
  const nWords = { 8: 5, 10: 8, 12: 10 }[wsS];
  const fits = WS_WORDS.filter(w => w.length <= wsS);
  let placed = false, guard = 0;
  while (!placed && guard++ < 60) {
    wsG = Array.from({ length: wsS }, () => Array(wsS).fill(""));
    wsList = shuffle(fits).slice(0, nWords);
    placed = wsList.every(w => wsPlace(w));
  }
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < wsS; r++) for (let c = 0; c < wsS; c++) if (!wsG[r][c]) wsG[r][c] = letters[Math.floor(Math.random() * 26)];
  renderWsBoard();
  renderWsWords();
}
function wsPlace(w) {
  for (let tries = 0; tries < 500; tries++) {
    const dir = WS_DIRS[Math.floor(Math.random() * 8)];
    const r0 = Math.floor(Math.random() * wsS), c0 = Math.floor(Math.random() * wsS);
    const rE = r0 + dir[0] * (w.length - 1), cE = c0 + dir[1] * (w.length - 1);
    if (rE < 0 || cE < 0 || rE >= wsS || cE >= wsS) continue;
    let ok = true;
    for (let k = 0; k < w.length; k++) {
      const cur = wsG[r0 + dir[0] * k][c0 + dir[1] * k];
      if (cur && cur !== w[k]) { ok = false; break; }
    }
    if (!ok) continue;
    for (let k = 0; k < w.length; k++) wsG[r0 + dir[0] * k][c0 + dir[1] * k] = w[k];
    return true;
  }
  return false;
}
function renderWsBoard() {
  const b = $("ws-board");
  b.style.gridTemplateColumns = `repeat(${wsS}, 1fr)`;
  b.innerHTML = "";
  for (let r = 0; r < wsS; r++) for (let c = 0; c < wsS; c++) {
    const d = document.createElement("div");
    d.className = "ws-cell";
    d.dataset.r = r; d.dataset.c = c;
    d.textContent = wsG[r][c];
    b.appendChild(d);
  }
  sizeWs();
}
function wsCellAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el && el.closest ? el.closest("#ws-board .ws-cell") : null;
}
function sizeWs() {
  const b = $("ws-board");
  requestAnimationFrame(() => {
    const w = b.clientWidth;
    if (!w) return;
    const cw = Math.floor((w - 3 * (wsS - 1)) / wsS);
    b.style.gridAutoRows = cw + "px";
    b.style.setProperty("--wsf", Math.max(12, Math.floor(cw * .5)) + "px");
  });
}
function wsPath(r0, c0, r1, c1) {
  const dr = r1 - r0, dc = c1 - c0;
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr), sc = Math.sign(dc);
  return Array.from({ length: steps + 1 }, (_, k) => [r0 + sr * k, c0 + sc * k]);
}
function drawWsSel(r0, c0, r1, c1) {
  const path = wsPath(r0, c0, r1, c1);
  if (!path) return; // hors ligne droite : on garde la dernière sélection valide
  document.querySelectorAll("#ws-board .ws-cell.sel").forEach(c => c.classList.remove("sel"));
  wsStart.path = path;
  path.forEach(([r, c]) => document.querySelector(`#ws-board .ws-cell[data-r="${r}"][data-c="${c}"]`)?.classList.add("sel"));
}
function wsCheck() {
  const path = wsStart && wsStart.path;
  wsStart = null;
  document.querySelectorAll("#ws-board .ws-cell.sel").forEach(c => c.classList.remove("sel"));
  if (!path || path.length < 2) return;
  // Le mot est accepté même si la sélection déborde avant ou après lui :
  // on cherche, dans les lettres glissées (dans les deux sens), le plus long mot restant.
  const word = path.map(([r, c]) => wsG[r][c]).join("");
  const rev = [...word].reverse().join("");
  let hit = null;
  for (const x of wsList) {
    if (wsFound.has(x) || (hit && hit.w.length >= x.length)) continue;
    const i = word.indexOf(x);
    if (i >= 0) { hit = { w: x, cells: path.slice(i, i + x.length) }; continue; }
    const j = rev.indexOf(x);
    if (j >= 0) { const k = path.length - j - x.length; hit = { w: x, cells: path.slice(k, k + x.length) }; }
  }
  if (!hit) { sfx("flip"); return; }
  const w = hit.w;
  wsFound.add(w);
  hit.cells.forEach(([r, c]) => document.querySelector(`#ws-board .ws-cell[data-r="${r}"][data-c="${c}"]`)?.classList.add("found"));
  renderWsWords();
  addPoints(8);
  setBest("mots", wsFound.size);
  sfx("good");
  if (wsFound.size === wsList.length) {
    state.solved++;
    addPoints(30);
    toast("Grille terminée : +30 points de bonus");
    stopTimers();
    const [t3, t2] = WS_TIME[wsS];
    const stars = wsSeconds <= t3 ? 3 : wsSeconds <= t2 ? 2 : 1;
    later(() => winGame("Tous trouvés", `${wsList.length} mots repérés en ${wsSeconds} s sur une grille ${wsS}×${wsS}.`, 0, stars), 700);
  }
}
function renderWsWords() {
  $("ws-words").innerHTML = wsList.map(w => `<span class="ws-word ${wsFound.has(w) ? "found" : ""}">${w}</span>`).join("");
  $("ws-found-n").textContent = wsFound.size;
  $("ws-total").textContent = wsList.length;
}

LQ.register({
  id: "mots",
  title: "Mots mêlés",
  desc: "Repérer les mots cachés",
  hue: "#9ccf7a",
  recordLabel: v => `Record : ${v} mots`,
  init: initMots,
  levelInfo: cfg => {
    const [t3, t2] = WS_TIME[cfg.size];
    return { what: `Une grille de mots mêlés ${cfg.size}×${cfg.size}`, goals: [`Tout trouver en ${t3} s ou moins`, `Tout trouver en ${t2} s ou moins`, "Trouver tous les mots"] };
  },
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="8" onclick="setMots(8)">Facile · 8×8</button>
      <button class="chip" data-b="10" onclick="setMots(10)">Moyen · 10×10</button>
      <button class="chip" data-b="12" onclick="setMots(12)">Difficile · 12×12</button>
    </div>
    <div class="stat-pills">
      <div class="pill">Trouvés <b><span id="ws-found-n">0</span>/<span id="ws-total">5</span></b></div>
      <div class="pill">Temps <b id="ws-time">0 s</b></div>
      <button class="btn ghost small" onclick="initMots()">${ICONS.refresh} Nouvelle grille</button>
    </div>
    <p class="goals" id="ws-goals"></p>
    <div class="ws-words" id="ws-words"></div>
    <div class="ws-board" id="ws-board"></div>
    <p class="hint-line">Glissez le doigt le long d’un mot, dans n’importe quelle direction. Pas besoin de vous arrêter pile sur la dernière lettre.</p>`,
  setup() {
    const b = $("ws-board");
    b.addEventListener("pointerdown", e => {
      const cell = wsCellAt(e.clientX, e.clientY);
      if (!cell) return;
      e.preventDefault();
      wsStart = { r: +cell.dataset.r, c: +cell.dataset.c, path: null };
      drawWsSel(wsStart.r, wsStart.c, wsStart.r, wsStart.c);
    });
    b.addEventListener("pointermove", e => {
      if (!wsStart) return;
      const cell = wsCellAt(e.clientX, e.clientY);
      if (cell) drawWsSel(wsStart.r, wsStart.c, +cell.dataset.r, +cell.dataset.c);
    });
    const end = () => { if (wsStart) wsCheck(); };
    b.addEventListener("pointerup", end);
    b.addEventListener("pointercancel", end);
    b.addEventListener("pointerleave", end);
    window.addEventListener("resize", sizeWs);
  },
});
