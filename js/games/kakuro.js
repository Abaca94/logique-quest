/* ============================================================
   Kakuro — mots croisés de chiffres
   Chaque bloc de cases blanches doit totaliser la somme indiquée,
   avec des chiffres de 1 à 9 tous différents dans le bloc.
   Les grilles sont générées au hasard ; si la solution n’est pas
   unique, des chiffres sont dévoilés jusqu’à ce qu’elle le soit.
   ============================================================ */
const KK_SIZES = [6, 8, 10]; // taille totale, première ligne et première colonne noires
const KK_PTS = { 6: 50, 8: 120, 10: 220 };
let kkHints = 0, kkNotes = [], kkNoteMode = false, kkUndo = [];
let kkN = 6, kkWhite = [], kkSol = [], kkGrid = [], kkGiven = [], kkRuns = [], kkCellRuns = [], kkSel = -1, kkBad = [], kkErrors = 0, kkDone = false;

/* ---------- Génération ---------- */
function kkIdx(r, c) { return r * kkN + c; }
function kkLayout(n) {
  for (let tries = 0; tries < 500; tries++) {
    const w = new Array(n * n).fill(false);
    for (let r = 1; r < n; r++) for (let c = 1; c < n; c++) w[r * n + c] = true;
    // Cases noires supplémentaires, symétriques (rotation d’un demi-tour)
    const extra = Math.round((n - 1) * (n - 1) * (n <= 6 ? .14 : .2));
    for (let k = 0; k < extra; k++) {
      const r = 1 + Math.floor(Math.random() * (n - 1)), c = 1 + Math.floor(Math.random() * (n - 1));
      w[r * n + c] = false;
      const r2 = n - r, c2 = n - c; // symétrique dans la zone 1..n-1
      w[r2 * n + c2] = false;
    }
    // Retire les cases blanches isolées (bloc de longueur 1)
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 1; r < n; r++) for (let c = 1; c < n; c++) {
        if (!w[r * n + c]) continue;
        const h = (c > 1 && w[r * n + c - 1]) || (c < n - 1 && w[r * n + c + 1]);
        const v = (r > 1 && w[(r - 1) * n + c]) || (r < n - 1 && w[(r + 1) * n + c]);
        if (!h || !v) { w[r * n + c] = false; changed = true; }
      }
    }
    // Blocs de 9 cases au plus, cases blanches connexes, assez de cases
    const runs = kkComputeRuns(w, n);
    if (runs.some(run => run.cells.length > 9)) continue;
    const whites = w.reduce((a, v, i) => v ? [...a, i] : a, []);
    if (whites.length < (n - 1) * (n - 1) * .55) continue;
    const seen = new Set([whites[0]]), stack = [whites[0]];
    while (stack.length) {
      const i = stack.pop(), r = Math.floor(i / n), c = i % n;
      for (const j of [i - 1, i + 1, i - n, i + n]) {
        const rr = Math.floor(j / n), cc = j % n;
        if (j < 0 || j >= n * n || !w[j] || seen.has(j) || (Math.abs(rr - r) + Math.abs(cc - c) !== 1)) continue;
        seen.add(j); stack.push(j);
      }
    }
    if (seen.size !== whites.length) continue;
    return w;
  }
  return null;
}
function kkComputeRuns(w, n) {
  const runs = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c;
    if (w[i]) continue;
    if (c + 1 < n && w[i + 1]) { const cells = []; for (let k = c + 1; k < n && w[r * n + k]; k++) cells.push(r * n + k); runs.push({ head: i, dir: "a", cells }); }
    if (r + 1 < n && w[i + n]) { const cells = []; for (let k = r + 1; k < n && w[k * n + c]; k++) cells.push(k * n + c); runs.push({ head: i, dir: "d", cells }); }
  }
  return runs;
}
function kkFill(w, n, runs, cellRuns) {
  const g = new Array(n * n).fill(0);
  const order = w.reduce((a, v, i) => v ? [...a, i] : a, []);
  let steps = 0;
  function dfs(k) {
    if (++steps > 200000) return false;
    if (k === order.length) return true;
    const i = order[k];
    const used = new Set();
    cellRuns[i].forEach(ri => runs[ri].cells.forEach(j => { if (g[j]) used.add(g[j]); }));
    for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (used.has(v)) continue;
      g[i] = v;
      if (dfs(k + 1)) return true;
    }
    g[i] = 0;
    return false;
  }
  return dfs(0) ? g : null;
}
// Combinaisons de chiffres distincts (masques de bits) pour chaque longueur et somme.
const KK_COMBOS = (() => {
  const t = {};
  for (let m = 2; m < 1024; m += 2) { // bit v = chiffre v (1 à 9)
    let len = 0, sum = 0;
    for (let v = 1; v <= 9; v++) if (m & (1 << v)) { len++; sum += v; }
    (t[len + "," + sum] = t[len + "," + sum] || []).push(m);
  }
  return t;
})();
// Compte les solutions (jusqu’à cap) ; renvoie aussi les deux premières trouvées.
// Pour chaque case vide, les candidats sont les chiffres encore possibles dans
// toutes les combinaisons compatibles de ses deux blocs.
function kkSolve(n, runs, cellRuns, givens, cap = 2) {
  const cells = [];
  runs.forEach(run => run.cells.forEach(i => { if (!cells.includes(i)) cells.push(i); }));
  const g = new Array(n * n).fill(0);
  cells.forEach(i => { if (givens[i]) g[i] = givens[i]; });
  const combos = runs.map(run => KK_COMBOS[run.cells.length + "," + run.sum] || []);
  const sols = [];
  let steps = 0;
  function runMask(ri) {
    let used = 0;
    for (const j of runs[ri].cells) if (g[j]) { const b = 1 << g[j]; if (used & b) return 0; used |= b; }
    let m = 0;
    for (const c of combos[ri]) if ((c & used) === used) m |= c;
    return m & ~used;
  }
  function dfs() {
    if (++steps > 300000 || sols.length >= cap) return;
    const masks = runs.map((_, ri) => runMask(ri));
    let best = -1, bestM = 0, bestC = 99;
    for (const i of cells) {
      if (g[i]) continue;
      let m = 1022;
      for (const ri of cellRuns[i]) m &= masks[ri];
      if (!m) return;
      let c = 0; for (let v = 1; v <= 9; v++) if (m & (1 << v)) c++;
      if (c < bestC) { best = i; bestM = m; bestC = c; if (c === 1) break; }
    }
    if (best < 0) {
      // Grille pleine : vérifie les sommes exactes
      for (let ri = 0; ri < runs.length; ri++) if (runs[ri].cells.reduce((a, j) => a + g[j], 0) !== runs[ri].sum) return;
      sols.push([...g]); return;
    }
    for (let v = 1; v <= 9; v++) {
      if (!(bestM & (1 << v))) continue;
      g[best] = v; dfs(); g[best] = 0;
      if (sols.length >= cap) return;
    }
  }
  dfs();
  return { count: steps > 300000 ? -1 : sols.length, sols };
}
function kkGenerate(n) {
  for (let tries = 0; tries < 30; tries++) {
    const w = kkLayout(n);
    if (!w) continue;
    const runs = kkComputeRuns(w, n);
    const cellRuns = Array.from({ length: n * n }, () => []);
    runs.forEach((run, ri) => run.cells.forEach(i => cellRuns[i].push(ri)));
    const sol = kkFill(w, n, runs, cellRuns);
    if (!sol) continue;
    runs.forEach(run => { run.sum = run.cells.reduce((a, i) => a + sol[i], 0); });
    const givens = new Array(n * n).fill(0);
    let ok = false;
    for (let k = 0; k < 12; k++) {
      const res = kkSolve(n, runs, cellRuns, givens);
      if (res.count === 1) { ok = true; break; }
      if (res.count === -1) break; // trop long : on change de grille
      // Dévoile une case où deux solutions diffèrent
      const diff = res.sols[0].map((v, i) => v !== res.sols[1][i] ? i : -1).filter(i => i >= 0);
      const i = diff[Math.floor(Math.random() * diff.length)];
      givens[i] = sol[i];
    }
    if (ok) return { w, runs, cellRuns, sol, givens };
  }
  return null;
}

/* ---------- Partie ---------- */
// cfg (mode parcours) : { size: 6 | 8 | 10 }
function initKakuro(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) kkN = cfg.size;
  else if (resumeFreeSize("kakuro")) kkN = resumeFreeSize("kakuro");
  setActiveChips("kakuro", kkN);
  kkSel = -1; kkBad = []; kkDone = false; kkUndo = []; kkNoteMode = false; setKakuroNoteBtn();
  const snap = resumeTake("kakuro", playCtx(kkN));
  if (snap) {
    ({ w: kkWhite, runs: kkRuns, cellRuns: kkCellRuns, sol: kkSol, given: kkGiven, grid: kkGrid, notes: kkNotes, errors: kkErrors, hints: kkHints } = snap);
    renderKakuro(); renderKakuroKeys();
    return;
  }
  let p = kkGenerate(kkN);
  while (!p) p = kkGenerate(kkN);
  kkWhite = p.w; kkRuns = p.runs; kkCellRuns = p.cellRuns; kkSol = p.sol;
  kkGiven = p.givens.map(v => v ? 1 : 0);
  kkGrid = [...p.givens];
  kkErrors = 0; kkHints = 0;
  kkNotes = new Array(kkN * kkN).fill(0);
  renderKakuro();
  renderKakuroKeys();
}
function saveKakuro() {
  resumeSave("kakuro", playCtx(kkN), { w: kkWhite, runs: kkRuns, cellRuns: kkCellRuns, sol: kkSol, given: kkGiven, grid: kkGrid, notes: kkNotes, errors: kkErrors, hints: kkHints });
}
function newKakuro() { resumeClear("kakuro"); initKakuro(); }
function pushKakuroUndo() { kkUndo.push({ grid: [...kkGrid], notes: [...kkNotes] }); if (kkUndo.length > 200) kkUndo.shift(); }
function undoKakuro() {
  if (kkDone) return;
  const u = kkUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  kkGrid = u.grid; kkNotes = u.notes; kkBad = [];
  sfx("tick"); renderKakuro(); saveKakuro();
}
function setKakuroNoteBtn() { const b = $("kk-note-btn"); if (b) b.classList.toggle("toggle-on", kkNoteMode); }
function toggleKakuroNotes() { kkNoteMode = !kkNoteMode; setKakuroNoteBtn(); sfx("tick"); }
function hintKakuro() {
  if (kkDone) return;
  const whites = kkWhite.reduce((a, w, i) => w ? [...a, i] : a, []);
  let i = kkSel >= 0 && !kkGiven[kkSel] && kkGrid[kkSel] !== kkSol[kkSel] ? kkSel : -1;
  if (i < 0) i = whites.find(j => kkGrid[j] && kkGrid[j] !== kkSol[j]) ?? -1;
  if (i < 0) { const empty = whites.filter(j => !kkGrid[j]); i = empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1; }
  if (i < 0) return;
  pushKakuroUndo();
  kkGrid[i] = kkSol[i]; kkGiven[i] = 2; kkNotes[i] = 0; kkBad[i] = 0; kkHints++; kkSel = i;
  sfx("good"); toast(`Indice : ${kkSol[i]} dans la case surlignée`);
  renderKakuro(); saveKakuro();
  if (whites.every(j => kkGrid[j])) checkKakuro();
}
function kkCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 640);
  return Math.max(30, Math.min(60, Math.floor((avail - (kkN - 1) * 2 - 6) / kkN)));
}
function renderKakuro() {
  const b = $("kk-board");
  b.style.gridTemplateColumns = `repeat(${kkN}, var(--kkc))`;
  b.style.setProperty("--kkc", kkCellSize() + "px");
  const selRuns = kkSel >= 0 ? kkCellRuns[kkSel] : [];
  const inSel = new Set(selRuns.flatMap(ri => kkRuns[ri].cells));
  let h = "";
  for (let i = 0; i < kkN * kkN; i++) {
    if (!kkWhite[i]) {
      const a = kkRuns.find(r => r.head === i && r.dir === "a"), d = kkRuns.find(r => r.head === i && r.dir === "d");
      const hl = selRuns.some(ri => kkRuns[ri].head === i);
      h += `<div class="kk-black ${a || d ? "clue" : ""} ${hl ? "hl" : ""}">${a ? `<span class="ka">${a.sum}</span>` : ""}${d ? `<span class="kd">${d.sum}</span>` : ""}</div>`;
    } else {
      const cls = ["kk-cell", kkGiven[i] === 1 ? "given" : kkGiven[i] === 2 ? "given hinted" : "", inSel.has(i) ? "peer" : "", i === kkSel ? "sel" : "", kkBad[i] ? "bad" : ""].join(" ");
      const inner = kkGrid[i] ? kkGrid[i] : kkNotes[i] ? `<div class="notes">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => `<span>${kkNotes[i] & (1 << v) ? v : ""}</span>`).join("")}</div>` : "";
      h += `<div class="${cls}" data-i="${i}">${inner}</div>`;
    }
  }
  b.innerHTML = h;
  // Aide : sommes restantes du bloc sélectionné
  $("kk-info").innerHTML = kkSel >= 0 ? selRuns.map(ri => {
    const run = kkRuns[ri];
    const filled = run.cells.reduce((a, j) => a + (kkGrid[j] || 0), 0);
    return `<span class="pill">${run.dir === "a" ? "Ligne" : "Colonne"} : <b>${run.sum}</b> en ${run.cells.length} cases · reste ${run.sum - filled}</span>`;
  }).join("") : `<span class="hint-line">Touchez une case blanche pour la remplir.</span>`;
}
function renderKakuroKeys() {
  const k = $("kk-keys");
  k.innerHTML = "";
  for (let v = 1; v <= 9; v++) {
    const d = document.createElement("button");
    d.className = "key"; d.textContent = v;
    d.onclick = () => putKakuro(v);
    k.appendChild(d);
  }
  const e = document.createElement("button");
  e.className = "key"; e.innerHTML = ICONS.erase; e.setAttribute("aria-label", "Effacer");
  e.onclick = () => putKakuro(0);
  k.appendChild(e);
}
function putKakuro(v) {
  if (kkDone) return;
  if (kkSel < 0) { toast("Choisissez d’abord une case"); return; }
  if (kkGiven[kkSel]) { sfx("bad"); return; }
  pushKakuroUndo();
  if (kkNoteMode && v) {
    if (kkGrid[kkSel]) { kkUndo.pop(); toast("Effacez d’abord le chiffre pour prendre des notes"); return; }
    kkNotes[kkSel] ^= 1 << v;
  } else {
    kkGrid[kkSel] = v;
    kkNotes[kkSel] = 0;
    if (v) kkCellRuns[kkSel].forEach(ri => kkRuns[ri].cells.forEach(j => { kkNotes[j] &= ~(1 << v); }));
  }
  kkBad[kkSel] = 0;
  sfx("tick");
  renderKakuro();
  saveKakuro();
  const whites = kkWhite.reduce((a, w, i) => w ? [...a, i] : a, []);
  if (whites.every(i => kkGrid[i])) checkKakuro();
}
function checkKakuro() {
  if (kkDone) return;
  const whites = kkWhite.reduce((a, w, i) => w ? [...a, i] : a, []);
  const empties = whites.filter(i => !kkGrid[i]).length;
  if (empties) { toast(`Il reste ${empties} case${empties > 1 ? "s" : ""} à remplir`); return; }
  // Une case est fausse si l’un de ses blocs a un doublon ou une mauvaise somme
  // (on accepte toute réponse qui respecte les règles, même si elle diffère de la grille générée).
  const runBad = kkRuns.map(run => {
    const vals = run.cells.map(i => kkGrid[i]);
    return new Set(vals).size !== vals.length || vals.reduce((a, v) => a + v, 0) !== run.sum;
  });
  kkBad = new Array(kkN * kkN).fill(0);
  kkRuns.forEach((run, ri) => { if (runBad[ri]) run.cells.forEach(i => { if (!kkGiven[i]) kkBad[i] = 1; }); });
  if (runBad.some(Boolean)) {
    kkErrors++;
    sfx("bad"); addPoints(-3);
    renderKakuro(); saveKakuro();
    toast("Les blocs en rouge ne tombent pas juste : corrigez-les puis vérifiez à nouveau");
    return;
  }
  kkDone = true;
  resumeClear("kakuro");
  const pts = KK_PTS[kkN];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("kakuro", kkN);
  save();
  const stars = kkErrors === 0 && !kkHints ? 3 : kkErrors <= 1 ? 2 : 1;
  winGame("Kakuro résolu", `Grille ${kkN}×${kkN} terminée${kkErrors ? ` après ${kkErrors} vérification${kkErrors > 1 ? "s" : ""} ratée${kkErrors > 1 ? "s" : ""}` : " sans faute"}${kkHints ? `, avec ${kkHints} indice${kkHints > 1 ? "s" : ""}` : ""}. +${pts} points`, pts, stars);
}

LQ.register({
  id: "kakuro",
  title: "Kakuro",
  desc: "Mots croisés de chiffres",
  hue: "#f0a35e",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initKakuro,
  levelInfo: cfg => ({
    what: `Une grille de kakuro ${cfg.size}×${cfg.size}`,
    goals: ["Grille juste du premier coup, sans indice", "Au plus une vérification ratée", "Terminer la grille"],
  }),
  rules: [
    "Chaque bloc de cases blanches doit totaliser la somme indiquée dans la case grise qui le précède : en haut à droite pour le bloc horizontal, en bas à gauche pour le bloc vertical.",
    "Dans un même bloc, on n’utilise que les chiffres de 1 à 9, et jamais deux fois le même.",
    "Touchez une case : ses blocs s’éclairent et la somme qui reste à placer s’affiche sous la grille.",
    "Le <b>crayon</b> note les chiffres possibles ; <b>Annuler</b> revient en arrière ; <b>Indice</b> révèle une case (3 étoiles seulement sans indice).",
    "Votre grille est gardée si vous quittez : vous la retrouverez en revenant.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="6" onclick="kkN=6;newKakuro()">Facile · 6×6</button>
      <button class="chip" data-b="8" onclick="kkN=8;newKakuro()">Moyen · 8×8</button>
      <button class="chip" data-b="10" onclick="kkN=10;newKakuro()">Difficile · 10×10</button>
    </div>
    <div class="board-wrap">
      <div class="kk-board" id="kk-board"></div>
      <div class="kk-info" id="kk-info"></div>
      <div class="keypad" id="kk-keys"></div>
      <div class="toolbar">
        <button class="btn ghost small" id="kk-note-btn" onclick="toggleKakuroNotes()">${ICONS.pencil} Crayon</button>
        <button class="btn ghost small" onclick="undoKakuro()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintKakuro()">${ICONS.bulb} Indice</button>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="btn small" onclick="checkKakuro()">${ICONS.check} Vérifier</button>
        <button class="btn ghost small lvl-hide" onclick="newKakuro()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Le nombre en haut à droite d’une case grise est la somme du bloc à sa droite ; celui en bas à gauche, la somme du bloc en dessous. Dans un bloc, chaque chiffre de 1 à 9 n’apparaît qu’une fois.</p>`,
  setup() {
    $("kk-board").addEventListener("click", e => {
      const c = e.target.closest(".kk-cell");
      if (!c || kkDone) return;
      kkSel = +c.dataset.i;
      sfx("tick");
      renderKakuro();
    });
    window.addEventListener("resize", () => { if (currentGame === "kakuro" && kkSol.length) renderKakuro(); });
  },
});
