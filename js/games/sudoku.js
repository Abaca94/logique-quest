/* ============================================================
   Sudoku — grilles 4×4, 6×6, 9×9 à solution unique, générées à la volée
   ============================================================ */
const SUD_BOX = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
const SUD_PTS = { 4: 40, 6: 100, 9: 200 };
let sErrors = 0;
let sN = 4, sBr = 2, sBc = 2, sSol = [], sGrid = [], sGiven = [], sSelIdx = -1, sBad = [];

function setSudoku(n) { sN = n; [sBr, sBc] = SUD_BOX[n]; initSudoku(); }
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
  sErrors = 0;
  [sBr, sBc] = SUD_BOX[sN];
  setActiveChips("sudoku", sN);
  sSelIdx = -1;
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
  renderSudoku();
  renderSudokuKeys();
}
function sudokuCellSize() {
  const avail = Math.min(document.documentElement.clientWidth, 720) - 32 - 2 * (sN / sBc - 1) * 4 - (sN - 1) * 2 - 8;
  const max = sN === 9 ? 58 : 76;
  return Math.max(28, Math.min(max, Math.floor(avail / sN)));
}
function renderSudoku() {
  const b = $("sudoku-board");
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
      + (sGiven[p] ? " given" : "")
      + (peer ? " peer" : "")
      + (same ? " same" : "")
      + (p === sel ? " sel" : "")
      + (sBad[p] ? " bad" : "");
    if (j % sBc === sBc - 1 && j !== sN - 1) d.style.marginRight = "4px";
    if (i % sBr === sBr - 1 && i !== sN - 1) d.style.marginBottom = "4px";
    d.textContent = sGrid[p] || "";
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
  sGrid[sSelIdx] = v;
  sBad[sSelIdx] = 0;
  sfx("tick");
  renderSudoku();
  if (sGrid.every(x => x)) checkSudoku();
}
function checkSudoku() {
  const empties = sGrid.reduce((a, v) => a + (!v), 0);
  if (empties) { toast(`Il reste ${empties} case${empties > 1 ? "s" : ""} à remplir`); return; }
  sBad = sGrid.map((v, p) => v !== sSol[p] ? 1 : 0);
  if (sBad.some(Boolean)) {
    sfx("bad"); addPoints(-3); sErrors++;
    renderSudoku();
    toast("Certaines cases sont fausses");
  } else {
    const pts = SUD_PTS[sN];
    addPoints(pts); state.solved++;
    setBest("sudoku", pts);
    save();
    // 3 étoiles si la grille est juste du premier coup, 2 après une erreur, 1 au-delà.
    const stars = sErrors === 0 ? 3 : sErrors === 1 ? 2 : 1;
    winGame("Grille complète", `Sudoku ${sN}×${sN} terminé${sErrors ? ` après ${sErrors} vérification${sErrors > 1 ? "s" : ""} ratée${sErrors > 1 ? "s" : ""}` : " sans faute"}. +${pts} points`, pts, stars);
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
    goals: ["Grille juste du premier coup", "Au plus une vérification ratée", "Terminer la grille"],
  }),
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="4" onclick="setSudoku(4)">Facile · 4×4</button>
      <button class="chip" data-b="6" onclick="setSudoku(6)">Moyen · 6×6</button>
      <button class="chip" data-b="9" onclick="setSudoku(9)">Difficile · 9×9</button>
    </div>
    <div class="board-wrap">
      <div class="sudoku-board" id="sudoku-board"></div>
      <div class="keypad" id="sudoku-keys"></div>
      <div class="toolbar" style="margin-top:14px">
        <button class="btn small" onclick="checkSudoku()">${ICONS.check} Vérifier</button>
        <button class="btn ghost small" onclick="initSudoku()">${ICONS.refresh} Autre grille</button>
      </div>
    </div>`,
  setup() {
    window.addEventListener("resize", () => { if (currentGame === "sudoku") renderSudoku(); });
  },
});
