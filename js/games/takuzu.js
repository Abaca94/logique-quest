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
// Indice en trois temps : 1) montrer la case, 2) expliquer, 3) placer le chiffre.
let tzHint = null; // { i, stage, wrong, why: [cases à surligner], text }

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
  tzDone = false; tzUndo = []; tzHinted = -1; tzHint = null;
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
  b.innerHTML = tzGrid.map((v, i) => `<button class="tz-cell ${v === 0 ? "z" : v === 1 ? "o" : ""} ${tzGiven[i] === 1 ? "given" : tzGiven[i] === 2 ? "given hinted" : ""} ${bad[i] ? "bad" : ""} ${i === tzHinted ? "pulse" : ""} ${tzHint && tzHint.i === i ? (tzHint.wrong ? "hint-wrong" : "hint-target") : ""} ${tzHint && tzHint.stage >= 2 && tzHint.why.includes(i) ? "hint-why" : ""}" data-i="${i}" aria-label="${v >= 0 ? v + ", " : ""}ligne ${Math.floor(i / n) + 1}, colonne ${i % n + 1}">${v >= 0 ? v : ""}</button>`).join("");
  const left = tzGrid.filter(v => v < 0).length;
  $("tz-info").textContent = left ? `${left} case${left > 1 ? "s" : ""} à remplir` : "";
  const ex = $("tz-explain");
  if (tzHint && tzHint.stage >= 2) { ex.innerHTML = tzHint.text; ex.classList.add("show"); }
  else { ex.innerHTML = ""; ex.classList.remove("show"); }
}
function tapTakuzu(i) {
  if (tzDone || tzGiven[i]) return;
  tzUndo.push(tzGrid.slice()); if (tzUndo.length > 300) tzUndo.shift();
  tzGrid[i] = tzGrid[i] === -1 ? 0 : tzGrid[i] === 0 ? 1 : -1;
  tzHinted = -1;
  if (tzHint && tzHint.i === i) tzHint = null; // la case montrée vient d’être jouée
  sfx("tick"); renderTakuzu(); saveTakuzu();
  if (!tzGrid.includes(-1)) checkTakuzu();
}
function undoTakuzu() {
  if (tzDone) return;
  const u = tzUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  tzGrid = u; tzHinted = -1; tzHint = null; sfx("tick"); renderTakuzu(); saveTakuzu();
}
/* ---------- Indice expliqué ----------
   Cherche une case vide que l’on peut déduire tout de suite, avec la raison la
   plus simple : paire (00 → 1 à côté), case encadrée (0_0), compte atteint
   (déjà n/2 fois le même chiffre), essai sur la ligne, puis lignes identiques. */
function tzLines(n) {
  const L = [];
  for (let r = 0; r < n; r++) L.push({ name: `ligne ${r + 1}`, Name: `Ligne ${r + 1}`, idx: Array.from({ length: n }, (_, c) => r * n + c), row: true });
  for (let c = 0; c < n; c++) L.push({ name: `colonne ${c + 1}`, Name: `Colonne ${c + 1}`, idx: Array.from({ length: n }, (_, r) => r * n + c), row: false });
  return L;
}
function tzFindReason() {
  const n = tzN, g = tzGrid, lines = tzLines(n), found = [];
  const add = (rank, i, v, why, text) => { if (v === tzSol[i]) found.push({ rank, i, v, why, text }); };
  for (const L of lines) {
    const cur = L.idx.map(i => g[i]);
    if (!cur.includes(-1)) continue;
    for (let k = 0; k < n; k++) {
      if (cur[k] !== -1) continue;
      const i = L.idx[k];
      for (const d of [-1, 1]) { // paire juste à côté
        const a = k + d, b = k + 2 * d;
        if (b < 0 || b >= n || cur[a] === -1 || cur[a] !== cur[b]) continue;
        const u = cur[a];
        add(0, i, 1 - u, [L.idx[a], L.idx[b]], `${L.Name} : les deux <b>${u}</b> côte à côte ne peuvent pas avoir un troisième <b>${u}</b> pour voisin, sinon on aurait ${u}${u}${u}. La case entourée est donc un <b>${1 - u}</b>.`);
      }
      if (k > 0 && k < n - 1 && cur[k - 1] !== -1 && cur[k - 1] === cur[k + 1]) { // case encadrée
        const u = cur[k - 1];
        add(1, i, 1 - u, [L.idx[k - 1], L.idx[k + 1]], `${L.Name} : la case entourée est encadrée par deux <b>${u}</b>. Un ${u} ici donnerait ${u}${u}${u} : c’est donc un <b>${1 - u}</b>.`);
      }
      for (const u of [0, 1]) { // compte atteint
        const have = cur.filter(x => x === u).length;
        if (have === n / 2) add(2, i, 1 - u, L.idx.filter((_, q) => cur[q] === u), `${L.Name} : elle contient déjà ${have} fois le <b>${u}</b>, le maximum pour ${n} cases (autant de 0 que de 1). Les cases vides restantes sont donc des <b>${1 - u}</b>.`);
      }
    }
    // Essai sur toute la ligne : quelles complétions restent possibles ?
    const rows = tzRows(n).filter(row => row.every((v, q) => cur[q] === -1 || cur[q] === v));
    const full = lines.filter(M => M.row === L.row && M !== L && M.idx.every(i => g[i] !== -1));
    const fullStr = full.map(M => M.idx.map(i => g[i]).join(""));
    const ok = rows.filter(row => !fullStr.includes(row.join("")));
    if (!ok.length) continue;
    for (let k = 0; k < n; k++) {
      if (cur[k] !== -1) continue;
      const v = ok[0][k];
      if (!ok.every(row => row[k] === v)) continue;
      const i = L.idx[k], z = n / 2 - cur.filter(x => x === 0).length, o = n / 2 - cur.filter(x => x === 1).length;
      const rest = `il reste ${z} <b>0</b> et ${o} <b>1</b> à placer`;
      if (rows.every(row => row[k] === v)) {
        add(3, i, v, L.idx.filter((_, q) => cur[q] !== -1), `${L.Name} : ${rest}. Essayez un <b>${1 - v}</b> ici : les autres cases vides ne peuvent plus être remplies sans aligner trois chiffres identiques. La case entourée est donc un <b>${v}</b>.`);
      } else {
        const twin = full.find(M => rows.some(row => row[k] !== v && row.join("") === M.idx.map(q => g[q]).join("")));
        if (twin) add(4, i, v, twin.idx, `${L.Name} : ${rest}. Avec un <b>${1 - v}</b> ici, la seule façon de la compléter la rendrait identique à la ${twin.name}, déjà pleine. Deux ${L.row ? "lignes" : "colonnes"} ne peuvent pas être identiques : c’est donc un <b>${v}</b>.`);
      }
    }
  }
  if (!found.length) return null;
  const best = Math.min(...found.map(f => f.rank)), pool = found.filter(f => f.rank === best);
  return pool[Math.floor(Math.random() * pool.length)];
}
function hintTakuzu() {
  if (tzDone) return;
  // Un indice déjà montré et toujours valable : on passe à l’étape suivante.
  if (tzHint && (tzHint.wrong ? tzGrid[tzHint.i] >= 0 && tzGrid[tzHint.i] !== tzSol[tzHint.i] : tzGrid[tzHint.i] === -1)) {
    const h = tzHint;
    if (h.stage === 1) {
      h.stage = 2;
      if (h.wrong) { // on efface la case fausse
        tzUndo.push(tzGrid.slice()); tzGrid[h.i] = -1; tzHint = null; tzHinted = h.i;
        sfx("tick"); toast("Case fausse effacée"); renderTakuzu(); saveTakuzu(); return;
      }
      sfx("tick"); renderTakuzu();
      return;
    }
    // Troisième demande : on place le chiffre.
    tzUndo.push(tzGrid.slice());
    tzGrid[h.i] = tzSol[h.i]; tzGiven[h.i] = 2; tzHinted = h.i; tzHint = null;
    sfx("good"); renderTakuzu(); saveTakuzu();
    if (!tzGrid.includes(-1)) checkTakuzu();
    return;
  }
  tzHint = null;
  // D’abord une erreur : toute déduction partirait d’une case fausse.
  const bad = tzGrid.findIndex((v, k) => v >= 0 && v !== tzSol[k] && !tzGiven[k]);
  if (bad >= 0) {
    tzHint = { i: bad, stage: 1, wrong: true, why: [], text: "" };
    tzHints++; sfx("bad"); toast("Cette case est fausse. Touchez encore Indice pour l’effacer."); renderTakuzu(); saveTakuzu();
    return;
  }
  const r = tzFindReason();
  if (r) tzHint = { i: r.i, stage: 1, wrong: false, why: r.why, text: r.text + " <span class=\"tz-next\">Touchez encore Indice pour placer le chiffre.</span>" };
  else {
    const i = tzGrid.indexOf(-1);
    if (i < 0) return;
    tzHint = { i, stage: 1, wrong: false, why: [], text: "Cette case se déduit en croisant plusieurs lignes et colonnes. <span class=\"tz-next\">Touchez encore Indice pour placer le chiffre.</span>" };
  }
  tzHints++;
  sfx("tick"); toast("Cette case se déduit maintenant. Touchez encore Indice pour l’explication."); renderTakuzu(); saveTakuzu();
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
    "<b>Indice</b> montre d’abord la prochaine case à déduire, sans son chiffre. Touchez-le une deuxième fois pour l’explication, une troisième pour placer le chiffre.",
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
      <p class="tz-explain" id="tz-explain" aria-live="polite"></p>
      <div class="toolbar">
        <button class="btn ghost small" onclick="undoTakuzu()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintTakuzu()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newTakuzu()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Autant de 0 que de 1 sur chaque ligne et chaque colonne, jamais trois pareils à la suite, pas deux lignes identiques.</p>`,
  setup() {
    $("tz-board").addEventListener("click", e => { const c = e.target.closest(".tz-cell"); if (c) tapTakuzu(+c.dataset.i); });
    window.addEventListener("resize", () => { if (currentGame === "takuzu" && tzSol.length) renderTakuzu(); });
  },
});
