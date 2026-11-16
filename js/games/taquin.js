/* ============================================================
   Taquin — remettre les tuiles dans l’ordre (3×3, 4×4, 5×5)
   ============================================================ */
let tqSize = 3, tqGrid = [], tqMoves = 0, tqSeconds = 0, tqSolved = false, tqTimer = null;

// Objectifs en nombre de coups : [3 étoiles, 2 étoiles]
const TQ_GOALS = { 3: [60, 120], 4: [220, 400], 5: [500, 900] };
// cfg (mode parcours) : { size: 3 | 4 | 5 }
function initTaquin(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) tqSize = cfg.size;
  setActiveChips("taquin", tqSize);
  const [g3, g2] = TQ_GOALS[tqSize];
  $("taquin-goals").innerHTML = `3 ${ICONS.star} en ${g3} coups ou moins · 2 ${ICONS.star} jusqu’à ${g2}`;
  stopTaquinTimer();
  tqMoves = 0; tqSeconds = 0; tqSolved = false;
  const n = tqSize * tqSize;
  tqGrid = Array.from({ length: n }, (_, i) => (i === n - 1 ? 0 : i + 1)); // 0 = case vide
  // Mélange toujours solvable : on joue des coups légaux au hasard depuis la position résolue.
  let prev = -1;
  for (let k = 0; k < n * 30 || isTaquinSolved(); k++) {
    const empty = tqGrid.indexOf(0);
    const cands = taquinNeighbors(empty).filter(c => c !== prev);
    const pick = cands[Math.floor(Math.random() * cands.length)];
    [tqGrid[empty], tqGrid[pick]] = [tqGrid[pick], tqGrid[empty]];
    prev = empty;
  }
  $("taquin-moves").textContent = "0";
  $("taquin-time").textContent = "0 s";
  buildTaquinBoard();
}
function stopTaquinTimer() { if (tqTimer) { clearInterval(tqTimer); tqTimer = null; } }
function taquinNeighbors(i) {
  const r = Math.floor(i / tqSize), c = i % tqSize, out = [];
  if (r > 0) out.push(i - tqSize);
  if (r < tqSize - 1) out.push(i + tqSize);
  if (c > 0) out.push(i - 1);
  if (c < tqSize - 1) out.push(i + 1);
  return out;
}
function buildTaquinBoard() {
  const b = $("taquin-board");
  b.style.gridTemplateColumns = `repeat(${tqSize}, 1fr)`;
  b.style.width = "min(88vw, 560px)";
  b.style.width = "min(calc(100vw - 32px), calc(100svh - 260px), 560px)";
  b.innerHTML = "";
  tqGrid.forEach((v, i) => {
    const d = document.createElement("div");
    d.className = "tile" + (v === 0 ? " empty" : v === i + 1 ? " inplace" : "");
    d.textContent = v || "";
    d.onclick = () => clickTaquin(i);
    b.appendChild(d);
  });
}
function clickTaquin(i) {
  if (tqSolved) return;
  const empty = tqGrid.indexOf(0);
  if (!taquinNeighbors(empty).includes(i)) return;
  if (!tqTimer) {
    tqTimer = setInterval(() => { tqSeconds++; $("taquin-time").textContent = tqSeconds + " s"; }, 1000);
    timers.push(tqTimer);
  }
  [tqGrid[empty], tqGrid[i]] = [tqGrid[i], tqGrid[empty]];
  tqMoves++;
  sfx("tick");
  $("taquin-moves").textContent = tqMoves;
  buildTaquinBoard();
  if (isTaquinSolved()) {
    tqSolved = true;
    stopTaquinTimer();
    const pts = Math.max(20, Math.round(tqSize * 60 - Math.min(tqMoves, tqSize * tqSize * 10) * .5 - tqSeconds * .4));
    addPoints(pts); state.solved++;
    setBest("taquin", pts);
    save();
    const [g3, g2] = TQ_GOALS[tqSize];
    const stars = tqMoves <= g3 ? 3 : tqMoves <= g2 ? 2 : 1;
    later(() => winGame("Taquin résolu", `${tqMoves} coups en ${tqSeconds} s. +${pts} points`, pts, stars), 400);
  }
}
function isTaquinSolved() {
  for (let i = 0; i < tqGrid.length - 1; i++) if (tqGrid[i] !== i + 1) return false;
  return true;
}
function setTaquinSize(n) { tqSize = n; initTaquin(); }

LQ.register({
  id: "taquin",
  title: "Taquin",
  desc: "Remettre les tuiles dans l’ordre",
  hue: "#e59a7a",
  recordLabel: v => `Record : ${v} points`,
  init: initTaquin,
  levelInfo: cfg => {
    const [g3, g2] = TQ_GOALS[cfg.size];
    return { what: `Un taquin ${cfg.size}×${cfg.size}`, goals: [`Résoudre en ${g3} coups ou moins`, `Résoudre en ${g2} coups ou moins`, "Résoudre le taquin"] };
  },
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="3" onclick="setTaquinSize(3)">3×3</button>
      <button class="chip" data-b="4" onclick="setTaquinSize(4)">4×4</button>
      <button class="chip" data-b="5" onclick="setTaquinSize(5)">5×5</button>
    </div>
    <div class="board-wrap">
      <p class="goals" id="taquin-goals"></p>
      <div class="board" id="taquin-board"></div>
      <div class="toolbar">
        <div class="pill">Coups <b id="taquin-moves">0</b></div>
        <div class="pill">Temps <b id="taquin-time">0 s</b></div>
        <button class="btn ghost small" onclick="initTaquin()">${ICONS.shuffle} Mélanger</button>
      </div>
    </div>`,
});
