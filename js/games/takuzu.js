/* ============================================================
   Takuzu — grille binaire
   Remplir la grille de 0 et de 1 : autant de 0 que de 1 par ligne
   et par colonne, jamais trois chiffres identiques à la suite, et
   pas deux lignes (ni deux colonnes) identiques.
   Les grilles générées se résolvent toujours par déduction, ligne
   par ligne, sans deviner.
   ============================================================ */
const TZ_SIZES = [6, 8, 10];
const TZ_PTS = { 6: 40, 8: 90, 10: 160 };
let tzN = 6, tzSol = [], tzGrid = [], tzGiven = [], tzErrors = 0, tzHints = 0, tzUndo = [], tzDone = false, tzHinted = -1;

/* ---------- Génération ---------- */
// Toutes les lignes valides de longueur n (autant de 0 que de 1, pas de triple)
const TZ_ROWS = {};
function tzRows(n) {
  if (TZ_ROWS[n]) return TZ_ROWS[n];
  const out = [];
  (function rec(a, z, o) {
    if (a.length === n) { out.push(a.slice()); return; }
    for (const v of [0, 1]) {
      if ((v ? o : z) >= n / 2) continue;
      const k = a.length;
      if (k >= 2 && a[k - 1] === v && a[k - 2] === v) continue;
      a.push(v); rec(a, z + (v ? 0 : 1), o + v); a.pop();
    }
  })([], 0, 0);
  return (TZ_ROWS[n] = out);
}
function tzFull(n) {
  const rows = tzRows(n), g = [];
  let steps = 0;
  function colsOk() {
    const r = g.length;
    for (let c = 0; c < n; c++) {
      let z = 0, o = 0;
      for (let i = 0; i < r; i++) g[i][c] ? o++ : z++;
      if (z > n / 2 || o > n / 2) return false;
      if (r >= 3 && g[r - 1][c] === g[r - 2][c] && g[r - 2][c] === g[r - 3][c]) return false;
    }
    if (r === n) { // colonnes toutes différentes
      const seen = new Set();
      for (let c = 0; c < n; c++) { const s = g.map(row => row[c]).join(""); if (seen.has(s)) return false; seen.add(s); }
    }
    return true;
  }
  function dfs() {
    if (++steps > 50000) return false;
    if (g.length === n) return true;
    for (const row of shuffle(rows)) {
      if (g.some(x => x.join("") === row.join(""))) continue;
      g.push(row);
      if (colsOk() && dfs()) return true;
      g.pop();
    }
    return false;
  }
  return dfs() ? g.flat() : null;
}
// Résolution par lignes : pour chaque ligne/colonne, on garde les complétions
// possibles et on fixe les cases communes à toutes. Renvoie la grille obtenue.
function tzLineSolve(n, grid) {
  const g = grid.slice(), rows = tzRows(n);
  const lines = [];
  for (let r = 0; r < n; r++) lines.push(Array.from({ length: n }, (_, c) => r * n + c));
  for (let c = 0; c < n; c++) lines.push(Array.from({ length: n }, (_, r) => r * n + c));
  let changed = true;
  while (changed) {
    changed = false;
    for (let li = 0; li < lines.length; li++) {
      const idx = lines[li], cur = idx.map(i => g[i]);
      if (!cur.includes(-1)) continue;
      // Lignes complètes du même sens : une ligne ne peut pas les recopier
      const same = lines.slice(li < n ? 0 : n, li < n ? n : 2 * n).filter(l => l !== idx).map(l => l.map(i => g[i])).filter(l => !l.includes(-1)).map(l => l.join(""));
      let acc = null;
      for (const row of rows) {
        if (!row.every((v, k) => cur[k] === -1 || cur[k] === v)) continue;
        if (same.includes(row.join(""))) continue;
        if (!acc) acc = row.slice();
        else for (let k = 0; k < n; k++) if (acc[k] !== row[k]) acc[k] = -1;
      }
      if (!acc) return null; // contradiction
      idx.forEach((i, k) => { if (g[i] === -1 && acc[k] !== -1) { g[i] = acc[k]; changed = true; } });
    }
  }
  return g;
}
function tzGenerate(n) {
  let sol = null;
  while (!sol) sol = tzFull(n);
  const puzzle = sol.slice();
  // On retire les chiffres un par un tant que la grille reste résoluble sans deviner
  for (const i of shuffle([...sol.keys()])) {
    const v = puzzle[i];
    puzzle[i] = -1;
    const s = tzLineSolve(n, puzzle);
    if (!s || s.includes(-1)) puzzle[i] = v;
  }
  return { sol, puzzle };
}

/* ---------- Partie ---------- */
// cfg (parcours) : { size: 6 | 8 | 10 }
function initTakuzu(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) tzN = cfg.size;
  else if (resumeFreeSize("takuzu")) tzN = resumeFreeSize("takuzu");
  setActiveChips("takuzu", tzN);
  tzDone = false; tzUndo = []; tzHinted = -1;
  const snap = resumeTake("takuzu", playCtx(tzN));
  if (snap) ({ sol: tzSol, grid: tzGrid, given: tzGiven, errors: tzErrors, hints: tzHints } = snap);
  else {
    const p = tzGenerate(tzN);
    tzSol = p.sol; tzGrid = p.puzzle.slice(); tzGiven = p.puzzle.map(v => v >= 0 ? 1 : 0);
    tzErrors = 0; tzHints = 0;
  }
  renderTakuzu();
}
function saveTakuzu() { resumeSave("takuzu", playCtx(tzN), { sol: tzSol, grid: tzGrid, given: tzGiven, errors: tzErrors, hints: tzHints }); }
function newTakuzu() { resumeClear("takuzu"); initTakuzu(); }
function tzCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 560);
  return Math.max(28, Math.min(56, Math.floor((avail - (tzN - 1) * 3 - 8) / tzN)));
}
// Cases en faute visible : trois identiques à la suite, ou trop de 0 / de 1 sur une ligne
function tzConflicts() {
  const n = tzN, bad = new Array(n * n).fill(false), g = tzGrid;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c, v = g[i];
    if (v < 0) continue;
    if (c + 2 < n && g[i + 1] === v && g[i + 2] === v) bad[i] = bad[i + 1] = bad[i + 2] = true;
    if (r + 2 < n && g[i + n] === v && g[i + 2 * n] === v) bad[i] = bad[i + n] = bad[i + 2 * n] = true;
  }
  for (let k = 0; k < n; k++) for (const v of [0, 1]) {
    const row = Array.from({ length: n }, (_, j) => k * n + j), col = Array.from({ length: n }, (_, j) => j * n + k);
    for (const line of [row, col]) if (line.filter(i => g[i] === v).length > n / 2) line.forEach(i => { if (g[i] === v) bad[i] = true; });
  }
  return bad;
}
function renderTakuzu() {
  const b = $("tz-board"), n = tzN, bad = tzConflicts();
  b.style.setProperty("--tzc", tzCellSize() + "px");
  b.style.gridTemplateColumns = `repeat(${n}, var(--tzc))`;
  b.innerHTML = tzGrid.map((v, i) => `<button class="tz-cell ${v === 0 ? "z" : v === 1 ? "o" : ""} ${tzGiven[i] === 1 ? "given" : tzGiven[i] === 2 ? "given hinted" : ""} ${bad[i] ? "bad" : ""} ${i === tzHinted ? "pulse" : ""}" data-i="${i}" aria-label="Case ${Math.floor(i / n) + 1}-${i % n + 1}">${v >= 0 ? v : ""}</button>`).join("");
  const left = tzGrid.filter(v => v < 0).length;
  $("tz-info").textContent = left ? `${left} case${left > 1 ? "s" : ""} à remplir` : "";
}
function tapTakuzu(i) {
  if (tzDone || tzGiven[i]) return;
  tzUndo.push(tzGrid.slice()); if (tzUndo.length > 300) tzUndo.shift();
  tzGrid[i] = tzGrid[i] === -1 ? 0 : tzGrid[i] === 0 ? 1 : -1;
  tzHinted = -1;
  sfx("tick"); renderTakuzu(); saveTakuzu();
  if (!tzGrid.includes(-1)) checkTakuzu();
}
function undoTakuzu() {
  if (tzDone) return;
  const u = tzUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  tzGrid = u; tzHinted = -1; sfx("tick"); renderTakuzu(); saveTakuzu();
}
function hintTakuzu() {
  if (tzDone) return;
  // D’abord une erreur, sinon une case que la déduction permet de remplir maintenant
  let i = tzGrid.findIndex((v, k) => v >= 0 && v !== tzSol[k]);
  let msg;
  if (i >= 0) msg = "Cette case est fausse : elle a été corrigée";
  else {
    const s = tzLineSolve(tzN, tzGrid);
    const cand = s ? [...s.keys()].filter(k => tzGrid[k] === -1 && s[k] !== -1) : [];
    i = cand.length ? cand[Math.floor(Math.random() * cand.length)] : tzGrid.indexOf(-1);
    msg = "Indice : cette case se déduit de sa ligne ou de sa colonne";
  }
  if (i < 0) return;
  tzUndo.push(tzGrid.slice());
  tzGrid[i] = tzSol[i]; tzGiven[i] = 2; tzHints++; tzHinted = i;
  sfx("good"); toast(msg); renderTakuzu(); saveTakuzu();
  if (!tzGrid.includes(-1)) checkTakuzu();
}
function checkTakuzu() {
  if (tzDone) return;
  if (tzGrid.includes(-1)) { const l = tzGrid.filter(v => v < 0).length; toast(`Il reste ${l} case${l > 1 ? "s" : ""} à remplir`); return; }
  const n = tzN, rows = [], cols = [];
  for (let k = 0; k < n; k++) { rows.push(tzGrid.slice(k * n, k * n + n).join("")); cols.push(Array.from({ length: n }, (_, j) => tzGrid[j * n + k]).join("")); }
  const ok = !tzConflicts().some(Boolean) && new Set(rows).size === n && new Set(cols).size === n;
  if (!ok) {
    // Pas de pénalité : la case qu’on fait défiler passe forcément par une valeur fausse
    sfx("bad");
    toast(new Set(rows).size < n || new Set(cols).size < n ? "Grille pleine, mais deux lignes ou deux colonnes sont identiques" : "Grille pleine, mais certaines cases enfreignent les règles");
    return;
  }
  tzDone = true;
  resumeClear("takuzu");
  const pts = TZ_PTS[n];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("takuzu", n);
  save();
  const stars = !tzHints ? 3 : tzHints <= 2 ? 2 : 1;
  later(() => winGame("Takuzu résolu", `Grille ${n}×${n} terminée ${tzHints ? `avec ${tzHints} indice${tzHints > 1 ? "s" : ""}` : "sans indice"}. +${pts} points`, pts, stars), 500);
}

LQ.register({
  id: "takuzu",
  title: "Takuzu",
  desc: "Grille binaire de 0 et de 1",
  hue: "#7fc8d8",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initTakuzu,
  levelInfo: cfg => ({
    what: `Une grille de takuzu ${cfg.size}×${cfg.size}`,
    goals: ["Sans indice", "Au plus deux indices", "Terminer la grille"],
  }),
  rules: [
    "Remplissez la grille avec des 0 et des 1.",
    "Chaque ligne et chaque colonne contient autant de 0 que de 1.",
    "Jamais plus de deux chiffres identiques côte à côte (pas de 000 ni de 111), en ligne comme en colonne.",
    "Deux lignes ne peuvent pas être identiques, deux colonnes non plus.",
    "Touchez une case pour passer de vide à 0, puis à 1, puis à vide. Les fautes visibles s’affichent en rouge. La grille se résout toujours sans deviner.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="6" onclick="tzN=6;newTakuzu()">Facile · 6×6</button>
      <button class="chip" data-b="8" onclick="tzN=8;newTakuzu()">Moyen · 8×8</button>
      <button class="chip" data-b="10" onclick="tzN=10;newTakuzu()">Difficile · 10×10</button>
    </div>
    <div class="board-wrap">
      <div class="tz-board" id="tz-board"></div>
      <p class="hint-line" id="tz-info"></p>
      <div class="toolbar">
        <button class="btn ghost small" onclick="undoTakuzu()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintTakuzu()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newTakuzu()">${ICONS.refresh} Autre grille</button>
      </div>
    </div>
    <p class="hint-line">Autant de 0 que de 1 sur chaque ligne et chaque colonne, jamais trois pareils à la suite, pas deux lignes identiques.</p>`,
  setup() {
    $("tz-board").addEventListener("click", e => { const c = e.target.closest(".tz-cell"); if (c) tapTakuzu(+c.dataset.i); });
    window.addEventListener("resize", () => { if (currentGame === "takuzu" && tzSol.length) renderTakuzu(); });
  },
});
