/* ============================================================
   Nonogram (picross) — noircir les cases d’après les indices
   Les grilles sont générées au hasard puis gardées seulement si un
   raisonnement ligne par ligne suffit à les résoudre : la solution
   est donc unique et ne demande jamais de deviner.
   ============================================================ */
const NG_SIZES = [5, 8, 10];
const NG_TIME = { 5: [60, 150], 8: [240, 480], 10: [420, 840] }; // secondes : [3 étoiles, 2 étoiles]
let ngN = 5, ngSol = [], ngRows = [], ngCols = [], ngCells = [], ngMode = 1, ngSeconds = 0, ngDone = false, ngDrag = null;

/* ---------- Génération et vérification ---------- */
function ngClues(line) {
  const out = []; let run = 0;
  for (const v of line) { if (v) run++; else if (run) { out.push(run); run = 0; } }
  if (run) out.push(run);
  return out.length ? out : [0];
}
// Toutes les façons de placer les blocs d’une ligne compatibles avec l’état connu
// (cur : 1 noir, 0 blanc, -1 inconnu). Renvoie la ligne déduite, ou null si contradiction.
function ngSolveLine(clue, cur) {
  const n = cur.length, blocks = clue[0] === 0 ? [] : clue;
  let canBlack = new Array(n).fill(false), canWhite = new Array(n).fill(false), any = false;
  const line = new Array(n).fill(0);
  function place(b, start) {
    if (b === blocks.length) {
      for (let i = start; i < n; i++) if (cur[i] === 1) return;
      for (let i = 0; i < n; i++) { const v = i < start ? line[i] : 0; if (v) canBlack[i] = true; else canWhite[i] = true; }
      any = true; return;
    }
    const len = blocks[b];
    const rest = blocks.slice(b + 1).reduce((a, x) => a + x + 1, 0);
    for (let s = start; s + len + rest <= n; s++) {
      let ok = true;
      for (let i = start; i < s; i++) if (cur[i] === 1) { ok = false; break; }
      if (!ok) break; // une case noire laissée derrière : plus loin ne marchera pas
      for (let i = s; i < s + len; i++) if (cur[i] === 0) { ok = false; break; }
      if (ok && s + len < n && cur[s + len] === 1) ok = false;
      if (!ok) continue;
      for (let i = start; i < s; i++) line[i] = 0;
      for (let i = s; i < s + len; i++) line[i] = 1;
      if (s + len < n) line[s + len] = 0;
      place(b + 1, Math.min(n, s + len + 1));
    }
  }
  place(0, 0);
  if (!any) return null;
  return cur.map((v, i) => canBlack[i] && !canWhite[i] ? 1 : canWhite[i] && !canBlack[i] ? 0 : v);
}
function ngLogicSolvable(rows, cols, n) {
  const g = Array.from({ length: n }, () => new Array(n).fill(-1));
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < n; r++) {
      const res = ngSolveLine(rows[r], g[r]);
      if (!res) return false;
      res.forEach((v, c) => { if (v !== g[r][c]) { g[r][c] = v; changed = true; } });
    }
    for (let c = 0; c < n; c++) {
      const res = ngSolveLine(cols[c], g.map(row => row[c]));
      if (!res) return false;
      res.forEach((v, r) => { if (v !== g[r][c]) { g[r][c] = v; changed = true; } });
    }
  }
  return g.every(row => row.every(v => v !== -1));
}
function ngGenerate(n) {
  for (let tries = 0; tries < 400; tries++) {
    const dens = .52 + Math.random() * .12;
    const sol = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.random() < dens ? 1 : 0));
    const rows = sol.map(ngClues), cols = sol[0].map((_, c) => ngClues(sol.map(r => r[c])));
    if (ngLogicSolvable(rows, cols, n)) return { sol, rows, cols };
  }
  return null;
}

/* ---------- Partie ---------- */
// cfg (mode parcours) : { size: 5 | 8 | 10 }
function initNonogram(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) ngN = cfg.size;
  setActiveChips("nonogram", ngN);
  let p = ngGenerate(ngN);
  while (!p) p = ngGenerate(ngN);
  ngSol = p.sol; ngRows = p.rows; ngCols = p.cols;
  ngCells = Array.from({ length: ngN }, () => new Array(ngN).fill(0)); // 0 vide, 1 noir, 2 croix
  ngDone = false; ngSeconds = 0;
  stopTimers();
  $("ng-time").textContent = "0 s";
  timers.push(setInterval(() => { ngSeconds++; $("ng-time").textContent = ngSeconds + " s"; }, 1000));
  const [t3, t2] = NG_TIME[ngN];
  $("ng-goals").innerHTML = `3 ${ICONS.star} en ${t3} s ou moins · 2 ${ICONS.star} jusqu’à ${t2} s`;
  setNgMode(1);
  renderNonogram();
}
function setNgMode(m) {
  ngMode = m;
  $("ng-mode-fill").classList.toggle("active", m === 1);
  $("ng-mode-cross").classList.toggle("active", m === 2);
}
function ngCellSize() {
  const maxRow = Math.max(...ngRows.map(r => r.length)), maxCol = Math.max(...ngCols.map(c => c.length));
  const avail = Math.min(document.documentElement.clientWidth - 32, 620);
  const clueW = maxRow * (ngN > 8 ? 13 : 15) + 10;
  const byWidth = Math.floor((avail - clueW - ngN * 2) / ngN);
  const byHeight = Math.floor((window.innerHeight - 290 - maxCol * 16) / ngN);
  return Math.max(24, Math.min(56, byWidth, Math.max(byHeight, 30)));
}
function renderNonogram() {
  const cs = ngCellSize();
  const t = $("ng-board");
  t.style.setProperty("--ngc", cs + "px");
  let h = "<tr><th></th>";
  ngCols.forEach((col, c) => { h += `<th class="ng-colclue" data-c="${c}">${col.map(v => `<span>${v}</span>`).join("")}</th>`; });
  h += "</tr>";
  for (let r = 0; r < ngN; r++) {
    h += `<tr><th class="ng-rowclue" data-r="${r}">${ngRows[r].map(v => `<span>${v}</span>`).join("")}</th>`;
    for (let c = 0; c < ngN; c++) {
      const cls = ["ngc", c % 5 === 4 && c < ngN - 1 ? "sep-r" : "", r % 5 === 4 && r < ngN - 1 ? "sep-b" : ""].join(" ");
      h += `<td class="${cls}" data-r="${r}" data-c="${c}"></td>`;
    }
    h += "</tr>";
  }
  t.innerHTML = h;
  for (let r = 0; r < ngN; r++) for (let c = 0; c < ngN; c++) paintNgCell(r, c);
  ngRefreshClues();
}
function ngCellEl(r, c) { return document.querySelector(`#ng-board td[data-r="${r}"][data-c="${c}"]`); }
function paintNgCell(r, c) {
  const el = ngCellEl(r, c), v = ngCells[r][c];
  el.className = el.className.replace(/\b(on|x)\b/g, "").trim() + (v === 1 ? " on" : v === 2 ? " x" : "");
}
function ngRefreshClues() {
  for (let r = 0; r < ngN; r++) {
    const ok = ngClues(ngCells[r].map(v => v === 1 ? 1 : 0)).join() === ngRows[r].join();
    document.querySelector(`.ng-rowclue[data-r="${r}"]`).classList.toggle("ok", ok);
  }
  for (let c = 0; c < ngN; c++) {
    const ok = ngClues(ngCells.map(row => row[c] === 1 ? 1 : 0)).join() === ngCols[c].join();
    document.querySelector(`.ng-colclue[data-c="${c}"]`).classList.toggle("ok", ok);
  }
}
function ngApply(r, c) {
  if (ngDone || !ngDrag) return;
  const key = r + "," + c;
  if (ngDrag.seen.has(key)) return;
  ngDrag.seen.add(key);
  if (ngCells[r][c] === ngDrag.value) return;
  // En traçant, on ne remplace pas une marque de l’autre type (sauf pour effacer)
  if (ngDrag.value !== 0 && ngCells[r][c] !== 0 && ngDrag.seen.size > 1) return;
  ngCells[r][c] = ngDrag.value;
  paintNgCell(r, c);
}
function ngEndDrag() {
  if (!ngDrag) return;
  ngDrag = null;
  ngRefreshClues();
  ngCheckWin();
}
function ngCheckWin() {
  if (ngDone) return;
  for (let r = 0; r < ngN; r++) for (let c = 0; c < ngN; c++) if ((ngCells[r][c] === 1) !== (ngSol[r][c] === 1)) return;
  ngDone = true;
  stopTimers();
  for (let r = 0; r < ngN; r++) for (let c = 0; c < ngN; c++) if (ngCells[r][c] !== 1) { ngCells[r][c] = 2; paintNgCell(r, c); }
  const pts = { 5: 30, 8: 80, 10: 150 }[ngN];
  addPoints(pts); state.solved++;
  if (!LQ.level) setBest("nonogram", ngN);
  save();
  const [t3, t2] = NG_TIME[ngN];
  const stars = ngSeconds <= t3 ? 3 : ngSeconds <= t2 ? 2 : 1;
  later(() => winGame("Image révélée", `Nonogram ${ngN}×${ngN} résolu en ${ngSeconds} s. +${pts} points`, pts, stars), 900);
}
function clearNonogram() {
  ngCells = Array.from({ length: ngN }, () => new Array(ngN).fill(0));
  for (let r = 0; r < ngN; r++) for (let c = 0; c < ngN; c++) paintNgCell(r, c);
  ngRefreshClues();
}

LQ.register({
  id: "nonogram",
  title: "Nonogram",
  desc: "Noircir les cases d’après les indices",
  hue: "#7ec8e3",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initNonogram,
  levelInfo: cfg => {
    const [t3, t2] = NG_TIME[cfg.size];
    return { what: `Un nonogram ${cfg.size}×${cfg.size}`, goals: [`Résoudre en ${t3} s ou moins`, `Résoudre en ${t2} s ou moins`, "Résoudre la grille"] };
  },
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="5" onclick="ngN=5;initNonogram()">Facile · 5×5</button>
      <button class="chip" data-b="8" onclick="ngN=8;initNonogram()">Moyen · 8×8</button>
      <button class="chip" data-b="10" onclick="ngN=10;initNonogram()">Difficile · 10×10</button>
    </div>
    <div class="stat-pills">
      <div class="seg">
        <button class="seg-btn" id="ng-mode-fill" onclick="setNgMode(1)"><span class="ng-sw fill"></span>Noircir</button>
        <button class="seg-btn" id="ng-mode-cross" onclick="setNgMode(2)"><span class="ng-sw">✕</span>Croix</button>
      </div>
      <div class="pill">Temps <b id="ng-time">0 s</b></div>
    </div>
    <p class="goals" id="ng-goals"></p>
    <div class="board-wrap"><table class="ng-board" id="ng-board"></table></div>
    <div class="toolbar">
      <button class="btn ghost small" onclick="clearNonogram()">${ICONS.erase} Tout effacer</button>
      <button class="btn ghost small lvl-hide" onclick="initNonogram()">${ICONS.refresh} Nouvelle grille</button>
    </div>
    <p class="hint-line">Les nombres donnent, dans l’ordre, la longueur des blocs de cases noires de chaque ligne et colonne, séparés par au moins une case blanche. Glissez le doigt pour noircir plusieurs cases d’un coup.</p>`,
  setup() {
    const t = $("ng-board");
    const cellAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest ? el.closest("#ng-board td.ngc") : null; };
    t.addEventListener("pointerdown", e => {
      const el = cellAt(e.clientX, e.clientY);
      if (!el || ngDone) return;
      e.preventDefault();
      const r = +el.dataset.r, c = +el.dataset.c;
      // Toucher une case déjà marquée dans le mode courant l’efface (et efface en glissant).
      ngDrag = { value: ngCells[r][c] === ngMode ? 0 : ngMode, seen: new Set() };
      sfx("tick");
      ngApply(r, c);
    });
    t.addEventListener("pointermove", e => {
      if (!ngDrag) return;
      const el = cellAt(e.clientX, e.clientY);
      if (el) ngApply(+el.dataset.r, +el.dataset.c);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(ev => t.addEventListener(ev, ngEndDrag));
    window.addEventListener("resize", () => { if (currentGame === "nonogram" && ngSol.length) renderNonogram(); });
  },
});
