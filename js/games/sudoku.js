/* ============================================================
   Sudoku — grilles 4×4, 6×6, 9×9 à solution unique, générées à la volée
   ============================================================ */
const SUD_BOX = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
const SUD_PTS = { 4: 40, 6: 100, 9: 200 };
let sErrors = 0, sHints = 0, sNotes = [], sNoteMode = false, sUndo = [];
let sN = 4, sBr = 2, sBc = 2, sSol = [], sGrid = [], sGiven = [], sSelIdx = -1, sBad = [];

function setSudoku(n) { sN = n; [sBr, sBc] = SUD_BOX[n]; resumeClear("sudoku"); initSudoku(); }
function sIdx(i, j) { return Math.floor(i / sBr) * sBc + Math.floor(j / sBc); }

function sudokuFull() {
  const g = new Array(sN * sN).fill(0);
  const R = new Array(sN).fill(0), C = new Array(sN).fill(0), B = new Array(sN).fill(0);
  function dfs(p) {
    if (p === g.length) return true;
    const i = Math.floor(p / sN), j = p % sN, b = sIdx(i, j);
    const used = R[i] | C[j] | B[b];
    for (const v of shuffle([...Array(sN).keys()])) {
      const bit = 1 << v;
      if (used & bit) continue;
      g[p] = v + 1; R[i] |= bit; C[j] |= bit; B[b] |= bit;
      if (dfs(p + 1)) return true;
      g[p] = 0; R[i] ^= bit; C[j] ^= bit; B[b] ^= bit;
    }
    return false;
  }
  dfs(0);
  return g;
}
function countSols(g, cap = 2) {
  const n = sN;
  const R = new Array(n).fill(0), C = new Array(n).fill(0), B = new Array(n).fill(0);
  for (let p = 0; p < n * n; p++) {
    if (!g[p]) continue;
    const i = Math.floor(p / n), j = p % n, bit = 1 << (g[p] - 1);
    if ((R[i] | C[j] | B[sIdx(i, j)]) & bit) return 0;
    R[i] |= bit; C[j] |= bit; B[sIdx(i, j)] |= bit;
  }
  let count = 0;
  function dfs() {
    let best = -1, bestC = null, bestL = n + 1;
    for (let p = 0; p < n * n; p++) {
      if (g[p]) continue;
      const i = Math.floor(p / n), j = p % n;
      const used = R[i] | C[j] | B[sIdx(i, j)];
      const cands = [];
      for (let v = 0; v < n; v++) if (!((used >> v) & 1)) cands.push(v);
      if (cands.length < bestL) {
        bestL = cands.length; best = p; bestC = cands;
        if (!cands.length) return;
        if (cands.length === 1) break;
      }
    }
    if (best < 0) { count++; return; }
    const i = Math.floor(best / n), j = best % n, b = sIdx(i, j);
    for (const v of bestC) {
      const bit = 1 << v;
      g[best] = v + 1; R[i] |= bit; C[j] |= bit; B[b] |= bit;
      dfs();
      g[best] = 0; R[i] ^= bit; C[j] ^= bit; B[b] ^= bit;
      if (count >= cap) return;
    }
  }
  dfs();
  return count;
}
// cfg (mode parcours) : { size: 4 | 6 | 9 }
function initSudoku(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) sN = cfg.size;
  else if (resumeFreeSize("sudoku")) sN = resumeFreeSize("sudoku");
  sErrors = 0; sHints = 0; sUndo = []; sNoteMode = false; hintReset("sudoku");
  [sBr, sBc] = SUD_BOX[sN];
  setActiveChips("sudoku", sN);
  sSelIdx = -1;
  sBad = [];
  setSudokuNoteBtn();
  const snap = resumeTake("sudoku", playCtx(sN));
  if (snap) {
    ({ sol: sSol, grid: sGrid, given: sGiven, notes: sNotes, errors: sErrors, hints: sHints } = snap);
    renderSudoku(); renderSudokuKeys();
    return;
  }
  sSol = sudokuFull();
  sGrid = [...sSol];
  sBad = [];
  const targetClues = { 4: 8, 6: 20, 9: 32 }[sN];
  for (const p of shuffle([...Array(sN * sN).keys()])) {
    if (sGrid.filter(v => v).length <= targetClues) break;
    const keep = sGrid[p];
    sGrid[p] = 0;
    if (countSols([...sGrid]) !== 1) sGrid[p] = keep;
  }
  sGiven = sGrid.map(v => v ? 1 : 0);
  sNotes = new Array(sN * sN).fill(0);
  renderSudoku();
  renderSudokuKeys();
}
function saveSudoku() { resumeSave("sudoku", playCtx(sN), { sol: sSol, grid: sGrid, given: sGiven, notes: sNotes, errors: sErrors, hints: sHints }); }
function newSudoku() { resumeClear("sudoku"); initSudoku(); }
function pushSudokuUndo() { sUndo.push({ grid: [...sGrid], notes: [...sNotes] }); if (sUndo.length > 200) sUndo.shift(); }
function undoSudoku() {
  const u = sUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  sGrid = u.grid; sNotes = u.notes; sBad = [];
  sfx("tick"); renderSudoku(); saveSudoku();
}
function setSudokuNoteBtn() { const b = $("sudoku-note-btn"); if (b) b.classList.toggle("toggle-on", sNoteMode); }
function toggleSudokuNotes() { sNoteMode = !sNoteMode; setSudokuNoteBtn(); sfx("tick"); }
/* ---------- Indice expliqué ----------
   Raisons cherchées, de la plus simple à la plus poussée : un chiffre qui n’a
   plus qu’une place dans un bloc, puis dans une ligne ou une colonne, puis une
   case qui n’a plus qu’un chiffre possible. */
function sRC(p) { return [Math.floor(p / sN), p % sN]; }
function sPeersOf(p) {
  const [i, j] = sRC(p), out = [];
  for (let q = 0; q < sN * sN; q++) { const [a, b] = sRC(q); if (q !== p && (a === i || b === j || sIdx(a, b) === sIdx(i, j))) out.push(q); }
  return out;
}
function sCands(p) {
  const used = new Set(sPeersOf(p).map(q => sGrid[q]).filter(Boolean));
  return Array.from({ length: sN }, (_, k) => k + 1).filter(v => !used.has(v));
}
// Une case de la même ligne, colonne ou bloc qui contient déjà v (pour la preuve)
function sBlocker(p, v) { return sPeersOf(p).find(q => sGrid[q] === v); }
function sUnits() {
  const U = [];
  for (let b = 0; b < sN; b++) U.push({ kind: "bloc", name: "ce bloc", cells: [...Array(sN * sN).keys()].filter(q => sIdx(...sRC(q)) === b) });
  for (let i = 0; i < sN; i++) U.push({ kind: "ligne", name: `la ligne ${i + 1}`, cells: [...Array(sN).keys()].map(j => i * sN + j) });
  for (let j = 0; j < sN; j++) U.push({ kind: "colonne", name: `la colonne ${j + 1}`, cells: [...Array(sN).keys()].map(i => i * sN + j) });
  return U;
}
function sudokuReason() {
  const found = [], C = sGrid.map((v, p) => v ? null : sCands(p));
  const add = (rank, key, why, text) => { if (C[key] && C[key].includes(sSol[key])) found.push({ rank, key, why: [...new Set(why)], text }); };
  for (const U of sUnits()) {
    const empty = U.cells.filter(q => !sGrid[q]);
    for (let v = 1; v <= sN; v++) {
      if (U.cells.some(q => sGrid[q] === v)) continue;
      const spots = empty.filter(q => C[q].includes(v));
      if (spots.length !== 1) continue;
      const p = spots[0], others = empty.filter(q => q !== p);
      const name = U.kind === "bloc" ? "son bloc" : U.name;
      const txt = others.length
        ? `Dans ${name}, le <b>${v}</b> ne peut aller que dans la case entourée : chacune des autres cases vides voit déjà un ${v} ${U.kind === "bloc" ? "sur sa ligne ou sa colonne" : U.kind === "ligne" ? "dans sa colonne ou son bloc" : "dans sa ligne ou son bloc"} (chiffres entourés en bleu).`
        : `Dans ${name}, il ne manque plus que le <b>${v}</b>, et il ne reste que la case entourée.`;
      add(U.kind === "bloc" ? 0 : 1, p, others.map(q => sBlocker(q, v)).filter(q => q !== undefined), txt);
    }
  }
  C.forEach((c, p) => {
    if (!c || c.length !== 1) return;
    const [i, j] = sRC(p), seen = { ligne: [], colonne: [], bloc: [] }, why = [];
    for (let v = 1; v <= sN; v++) {
      if (v === c[0]) continue;
      let q = [...Array(sN).keys()].map(k => i * sN + k).find(x => sGrid[x] === v), u = "ligne";
      if (q === undefined) { q = [...Array(sN).keys()].map(k => k * sN + j).find(x => sGrid[x] === v); u = "colonne"; }
      if (q === undefined) { q = sBlocker(p, v); u = "bloc"; }
      seen[u].push(v); why.push(q);
    }
    const parts = [];
    if (seen.ligne.length) parts.push(`sa ligne ${frList(seen.ligne)}`);
    if (seen.colonne.length) parts.push(`sa colonne ${frList(seen.colonne)}`);
    if (seen.bloc.length) parts.push(`son bloc ${frList(seen.bloc)}`);
    add(2, p, why, `Pour la case entourée, ${parts.map((x, k) => k ? x : x.replace(/^(sa ligne|sa colonne|son bloc) /, "$1 contient déjà ")).join(", ")}. Le seul chiffre encore possible est le <b>${c[0]}</b>.`);
  });
  if (!found.length) return null;
  const best = Math.min(...found.map(f => f.rank)), pool = found.filter(f => f.rank === best);
  return pool[Math.floor(Math.random() * pool.length)];
}
function hintSudoku() {
  hintFlow("sudoku", {
    valid: h => h.wrong ? sGrid[h.key] && sGrid[h.key] !== sSol[h.key] : !sGrid[h.key],
    wrong: () => { const p = sGrid.findIndex((v, q) => v && !sGiven[q] && v !== sSol[q]); return p < 0 ? null : { key: p }; },
    find: sudokuReason,
    fallback: () => {
      const empty = sGrid.map((v, p) => v ? -1 : p).filter(p => p >= 0);
      if (!empty.length) return null;
      const p = empty.reduce((a, q) => sCands(q).length < sCands(a).length ? q : a);
      return { key: p, why: [], text: `Pas de déduction simple ici : il faut croiser plusieurs cases à la fois. Chiffres encore possibles dans la case entourée : ${frList(sCands(p))}.` };
    },
    clear: h => { pushSudokuUndo(); sGrid[h.key] = 0; sBad[h.key] = 0; sSelIdx = h.key; saveSudoku(); },
    place: h => {
      pushSudokuUndo();
      const p = h.key;
      sGrid[p] = sSol[p]; sGiven[p] = 2; sNotes[p] = 0; sBad[p] = 0; sSelIdx = p; saveSudoku();
      if (sGrid.every(x => x)) later(checkSudoku, 300);
    },
    count: () => { sHints++; saveSudoku(); },
    render: () => renderSudoku(),
  });
}
function sudokuCellSize() {
  const avail = Math.min(document.documentElement.clientWidth, 720) - 32 - 2 * (sN / sBc - 1) * 4 - (sN - 1) * 2 - 8;
  const max = sN === 9 ? 58 : 76;
  return Math.max(28, Math.min(max, Math.floor(avail / sN)));
}
function renderSudoku() {
  const b = $("sudoku-board");
  hintPanel("sudoku", "sudoku-explain", h => h.wrong ? sGrid[h.key] && sGrid[h.key] !== sSol[h.key] : !sGrid[h.key]);
  b.style.gridTemplateColumns = `repeat(${sN}, auto)`;
  b.style.setProperty("--csz", sudokuCellSize() + "px");
  b.innerHTML = "";
  const sel = sSelIdx;
  const si = sel >= 0 ? Math.floor(sel / sN) : -1, sj = sel >= 0 ? sel % sN : -1;
  for (let p = 0; p < sN * sN; p++) {
    const i = Math.floor(p / sN), j = p % sN;
    const d = document.createElement("div");
    const peer = sel >= 0 && p !== sel && (i === si || j === sj || sIdx(i, j) === sIdx(si, sj));
    const same = sel >= 0 && p !== sel && sGrid[sel] && sGrid[p] === sGrid[sel];
    d.className = "sudoku-cell"
      + (sGiven[p] === 1 ? " given" : sGiven[p] === 2 ? " given hinted" : "")
      + (peer ? " peer" : "")
      + (same ? " same" : "")
      + (p === sel ? " sel" : "")
      + (sBad[p] ? " bad" : "")
      + hintCls("sudoku", p);
    if (j % sBc === sBc - 1 && j !== sN - 1) d.style.marginRight = "4px";
    if (i % sBr === sBr - 1 && i !== sN - 1) d.style.marginBottom = "4px";
    if (sGrid[p]) d.textContent = sGrid[p];
    else if (sNotes[p]) d.innerHTML = `<div class="notes">${Array.from({ length: sN }, (_, v) => `<span>${sNotes[p] & (1 << (v + 1)) ? v + 1 : ""}</span>`).join("")}</div>`;
    d.onclick = () => { sSelIdx = p; sfx("tick"); renderSudoku(); };
    b.appendChild(d);
  }
}
function renderSudokuKeys() {
  const k = $("sudoku-keys");
  k.innerHTML = "";
  for (let v = 1; v <= sN; v++) {
    const d = document.createElement("button");
    d.className = "key"; d.textContent = v;
    d.onclick = () => putSudoku(v);
    k.appendChild(d);
  }
  const e = document.createElement("button");
  e.className = "key"; e.innerHTML = ICONS.erase; e.setAttribute("aria-label", "Effacer");
  e.onclick = () => putSudoku(0);
  k.appendChild(e);
}
function putSudoku(v) {
  if (sSelIdx < 0) { toast("Choisissez d’abord une case"); return; }
  if (sGiven[sSelIdx]) { sfx("bad"); return; }
  pushSudokuUndo();
  if (sNoteMode && v) {
    if (sGrid[sSelIdx]) { sUndo.pop(); toast("Effacez d’abord le chiffre pour prendre des notes"); return; }
    sNotes[sSelIdx] ^= 1 << v;
  } else {
    sGrid[sSelIdx] = v;
    sNotes[sSelIdx] = 0;
    // Un chiffre posé retire cette note des cases de la même ligne, colonne et région.
    if (v) {
      const i = Math.floor(sSelIdx / sN), j = sSelIdx % sN;
      for (let p = 0; p < sN * sN; p++) {
        const pi = Math.floor(p / sN), pj = p % sN;
        if (pi === i || pj === j || sIdx(pi, pj) === sIdx(i, j)) sNotes[p] &= ~(1 << v);
      }
    }
  }
  sBad[sSelIdx] = 0;
  sfx("tick");
  renderSudoku();
  saveSudoku();
  if (sGrid.every(x => x)) checkSudoku();
}
function checkSudoku() {
  const empties = sGrid.reduce((a, v) => a + (!v), 0);
  if (empties) { toast(`Il reste ${empties} case${empties > 1 ? "s" : ""} à remplir`); return; }
  sBad = sGrid.map((v, p) => v !== sSol[p] ? 1 : 0);
  if (sBad.some(Boolean)) {
    sfx("bad"); addPoints(-3); sErrors++;
    renderSudoku(); saveSudoku();
    toast("Les cases en rouge sont fausses : corrigez-les puis vérifiez à nouveau");
  } else {
    const pts = SUD_PTS[sN];
    resumeClear("sudoku");
    addPoints(pts); state.solved++;
    if (!levelCfg()) setBest("sudoku", pts);
    save();
    // 3 étoiles : juste du premier coup et sans indice. 2 : au plus une erreur. 1 au-delà.
    const stars = sErrors === 0 && !sHints ? 3 : sErrors <= 1 ? 2 : 1;
    winGame("Grille complète", `Sudoku ${sN}×${sN} terminé${sErrors ? ` après ${sErrors} vérification${sErrors > 1 ? "s" : ""} ratée${sErrors > 1 ? "s" : ""}` : " sans faute"}${sHints ? `, avec ${sHints} indice${sHints > 1 ? "s" : ""}` : ""}. +${pts} points`, pts, stars);
  }
}

LQ.register({
  id: "sudoku",
  title: "Sudoku",
  desc: "Grilles 4×4, 6×6 et 9×9",
  hue: "#7fcfc0",
  recordLabel: v => `Record : ${({ 40: "4×4", 100: "6×6", 200: "9×9" })[v] || v + " pts"}`,
  init: initSudoku,
  levelInfo: cfg => ({
    what: `Une grille de sudoku ${cfg.size}×${cfg.size}`,
    goals: ["Grille juste du premier coup, sans indice", "Au plus une vérification ratée", "Terminer la grille"],
  }),
  rules: [
    "Remplissez la grille pour que chaque ligne, chaque colonne et chaque région encadrée contienne une seule fois chaque chiffre.",
    "Touchez une case, puis un chiffre. La gomme efface la case.",
    "Le <b>crayon</b> permet de noter plusieurs chiffres possibles dans une case, en petit.",
    "<b>Annuler</b> revient au coup précédent. <b>Indice</b> montre d’abord la prochaine case à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour le chiffre (3 étoiles seulement sans indice).",
    "Votre grille est gardée si vous quittez : vous la retrouverez en revenant.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="4" onclick="setSudoku(4)">Facile · 4×4</button>
      <button class="chip" data-b="6" onclick="setSudoku(6)">Moyen · 6×6</button>
      <button class="chip" data-b="9" onclick="setSudoku(9)">Difficile · 9×9</button>
    </div>
    <div class="board-wrap">
      <div class="sudoku-board" id="sudoku-board"></div>
      <p class="hint-explain" id="sudoku-explain" aria-live="polite"></p>
      <div class="keypad" id="sudoku-keys"></div>
      <div class="toolbar">
        <button class="btn ghost small" id="sudoku-note-btn" onclick="toggleSudokuNotes()">${ICONS.pencil} Crayon</button>
        <button class="btn ghost small" onclick="undoSudoku()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintSudoku()">${ICONS.bulb} Indice</button>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="btn small" onclick="checkSudoku()">${ICONS.check} Vérifier</button>
        <button class="btn ghost small lvl-hide" onclick="newSudoku()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>`,
  setup() {
    window.addEventListener("resize", () => { if (currentGame === "sudoku") renderSudoku(); });
  },
});
