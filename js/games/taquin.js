/* ============================================================
   Taquin — remettre les tuiles dans l’ordre (3×3, 4×4, 5×5)
   ============================================================ */
let tqSize = 3, tqGrid = [], tqMoves = 0, tqSeconds = 0, tqSolved = false, tqTimer = null, tqHints = 0;

// Objectifs en nombre de coups : [3 étoiles, 2 étoiles]
const TQ_GOALS = { 3: [60, 120], 4: [220, 400], 5: [500, 900] };
// cfg (mode parcours) : { size: 3 | 4 | 5 }
function initTaquin(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) tqSize = cfg.size;
  else if (resumeFreeSize("taquin")) tqSize = resumeFreeSize("taquin");
  setActiveChips("taquin", tqSize);
  const [g3, g2] = TQ_GOALS[tqSize];
  $("taquin-goals").innerHTML = `3 ${ICONS.star} en ${g3} coups ou moins · 2 ${ICONS.star} jusqu’à ${g2}`;
  stopTaquinTimer();
  tqMoves = 0; tqSeconds = 0; tqSolved = false; tqHints = 0;
  const snap = resumeTake("taquin", playCtx(tqSize));
  if (snap) {
    ({ grid: tqGrid, moves: tqMoves, seconds: tqSeconds, hints: tqHints } = snap);
    $("taquin-moves").textContent = tqMoves;
    $("taquin-time").textContent = tqSeconds + " s";
    buildTaquinBoard();
    return;
  }
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
function saveTaquin() { if (!tqSolved) resumeSave("taquin", playCtx(tqSize), { grid: tqGrid, moves: tqMoves, seconds: tqSeconds, hints: tqHints }); }
function newTaquin() { resumeClear("taquin"); initTaquin(); }

/* ---------- Indice ----------
   On résout le taquin par étapes, comme on le fait à la main : la première
   ligne, puis la première colonne, et ainsi de suite jusqu’au carré 2×2 final.
   Chaque étape place une tuile (ou les deux dernières d’une ligne ou d’une
   colonne ensemble) sans déranger les tuiles déjà rangées. Une petite recherche
   en largeur trouve le chemin le plus court pour cette étape ; l’indice est son
   premier coup. */
function taquinStages(n) {
  const stages = [], tile = (r, c) => r * n + c + 1;
  for (let k = 0; k < n - 2; k++) {
    const row = [], col = [];
    for (let c = k; c < n; c++) row.push(tile(k, c));
    for (let r = k + 1; r < n; r++) col.push(tile(r, k));
    for (const line of [row, col]) {
      for (let i = 0; i < line.length - 2; i++) stages.push([line[i]]);
      stages.push(line.slice(-2));
    }
  }
  stages.push([tile(n - 2, n - 2), tile(n - 2, n - 1), tile(n - 1, n - 2)]);
  return stages;
}
function taquinHintMove() {
  const n = tqSize, N = n * n, goal = v => v - 1;
  const stages = taquinStages(n);
  const locked = new Array(N).fill(false);
  for (const T of stages) {
    if (T.every(v => tqGrid[goal(v)] === v)) { T.forEach(v => { locked[goal(v)] = true; }); continue; }
    // Recherche en largeur sur (case vide, positions des tuiles de l’étape)
    const start = [tqGrid.indexOf(0), ...T.map(v => tqGrid.indexOf(v))];
    const key = st => st.join(",");
    const prev = new Map([[key(start), null]]);
    let q = [start], found = null;
    while (q.length && !found) {
      const next = [];
      for (const st of q) {
        const e = st[0];
        for (const nb of taquinNeighbors(e)) {
          if (locked[nb]) continue;
          const ns = st.map((p, i) => i === 0 ? nb : p === nb ? e : p);
          const k = key(ns);
          if (prev.has(k)) continue;
          prev.set(k, st);
          if (T.every((v, i) => ns[i + 1] === goal(v))) { found = ns; break; }
          next.push(ns);
        }
        if (found) break;
      }
      q = next;
    }
    if (!found) return { tile: null, target: T };
    // Remonte jusqu’au premier coup : la tuile qui va dans la case vide de départ
    let st = found, p = prev.get(key(st));
    while (p && prev.get(key(p))) { st = p; p = prev.get(key(p)); }
    return { tile: tqGrid[st[0]], target: T };
  }
  return { tile: null, target: [] };
}
function hintTaquin() {
  if (tqSolved) return;
  const { tile, target } = taquinHintMove();
  if (!tile) return;
  tqHints++;
  saveTaquin();
  const goalTxt = target.length === 1 ? `la tuile ${target[0]}` : `les tuiles ${target.slice(0, -1).join(", ")} et ${target[target.length - 1]}`;
  toast(`Objectif : placer ${goalTxt}. Déplacez la tuile ${tile}.`);
  sfx("tick");
  const el = [...$("taquin-board").children].find(d => d.textContent === String(tile));
  if (el) { el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint"); }
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
  saveTaquin();
  if (isTaquinSolved()) {
    tqSolved = true;
    stopTaquinTimer();
    resumeClear("taquin");
    const pts = Math.max(20, Math.round(tqSize * 60 - Math.min(tqMoves, tqSize * tqSize * 10) * .5 - tqSeconds * .4));
    addPoints(pts); state.solved++;
    if (!levelCfg()) setBest("taquin", pts);
    save();
    const [g3, g2] = TQ_GOALS[tqSize];
    const stars = tqMoves <= g3 && !tqHints ? 3 : tqMoves <= g2 ? 2 : 1;
    later(() => winGame("Taquin résolu", `${tqMoves} coups en ${tqSeconds} s. +${pts} points`, pts, stars), 400);
  }
}
function isTaquinSolved() {
  for (let i = 0; i < tqGrid.length - 1; i++) if (tqGrid[i] !== i + 1) return false;
  return true;
}
function setTaquinSize(n) { tqSize = n; resumeClear("taquin"); initTaquin(); }

LQ.register({
  id: "taquin",
  title: "Taquin",
  desc: "Remettre les tuiles dans l’ordre",
  hue: "#e59a7a",
  recordLabel: v => `Record : ${v} points`,
  init: initTaquin,
  levelInfo: cfg => {
    const [g3, g2] = TQ_GOALS[cfg.size];
    return { what: `Un taquin ${cfg.size}×${cfg.size}`, goals: [`Résoudre en ${g3} coups ou moins, sans indice`, `Résoudre en ${g2} coups ou moins`, "Résoudre le taquin"] };
  },
  rules: [
    "Remettez les tuiles dans l’ordre, de 1 en haut à gauche jusqu’à la dernière, la case vide finissant en bas à droite.",
    "Touchez une tuile voisine de la case vide pour la faire glisser.",
    "Bloqué ? <b>Indice</b> vous dit quelle tuile placer et laquelle déplacer maintenant. Les indices suivent la méthode classique : la première ligne, puis la première colonne, et ainsi de suite.",
    "3 étoiles seulement sans indice. La partie est gardée si vous quittez.",
  ],
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
        <button class="btn ghost small" onclick="hintTaquin()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newTaquin()">${ICONS.shuffle} Mélanger</button>
      </div>
    </div>`,
});
