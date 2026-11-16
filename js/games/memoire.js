/* ============================================================
   Mémoire — retrouver les paires
   ============================================================ */
const MEM_SYMBOLS = ["🍎", "🍋", "🍇", "🍒", "🥝", "🍑", "🌵", "🌙", "⭐", "🔔", "🎲", "🧭", "🗝️", "🎻", "⚓", "🪶"];
let memPairs = 8, memCols = 4, memFirst = null, memLock = false, memFound = 0, memMoves = 0;

// cfg (mode parcours) : { pairs: 8 | 10 | 12 }
function initMemoire(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) memPairs = cfg.pairs;
  setActiveChips("memoire", memPairs);
  memFirst = null; memLock = false; memFound = 0; memMoves = 0;
  const pick = shuffle(cfg && cfg.symbols ? cfg.symbols : MEM_SYMBOLS).slice(0, memPairs);
  const items = shuffle([...pick, ...pick]);
  const b = $("mem-board");
  // Sur iPhone : toujours 4 colonnes (cases lisibles). Sur iPad : 4, 5 ou 6 colonnes.
  memCols = 4;
  if (document.documentElement.clientWidth >= 600) memCols = { 8: 4, 10: 5, 12: 6 }[memPairs];
  b.style.gridTemplateColumns = `repeat(${memCols}, 1fr)`;
  b.style.maxWidth = memCols > 4 ? "720px" : "560px";
  $("mem-found").textContent = "0";
  $("mem-total").textContent = memPairs;
  $("mem-moves").textContent = "0";
  const [t3, t2] = memTargets();
  $("mem-goals").innerHTML = `3 ${ICONS.star} en ${t3} essais ou moins · 2 ${ICONS.star} jusqu’à ${t2}`;
  b.innerHTML = "";
  items.forEach(sym => {
    const c = document.createElement("div");
    c.className = "mem-card"; c.dataset.e = sym;
    c.onclick = () => clickMemCard(c);
    b.appendChild(c);
  });
  sizeMemBoard();
}
// Hauteur des rangées imposée en JS : aspect-ratio se comporte mal dans une grille étirée sur WebKit.
function sizeMemBoard() {
  const b = $("mem-board");
  if (!b) return;
  requestAnimationFrame(() => {
    const w = b.clientWidth;
    if (!w) return;
    b.style.gridAutoRows = Math.floor((w - 10 * (memCols - 1)) / memCols) + "px";
  });
}
function clickMemCard(card) {
  if (memLock || card.classList.contains("open") || card.classList.contains("matched")) return;
  card.textContent = card.dataset.e;
  card.classList.add("open");
  sfx("flip");
  if (!memFirst) { memFirst = card; return; }
  memMoves++;
  $("mem-moves").textContent = memMoves;
  if (memFirst.dataset.e === card.dataset.e) {
    memFound++;
    $("mem-found").textContent = memFound;
    memFirst.classList.add("matched"); card.classList.add("matched");
    memFirst = null;
    addPoints(6); sfx("good");
    if (memFound === memPairs) {
      state.solved++;
      // Score de précision : moins d’essais en trop, meilleur score.
      const precision = Math.max(10, memPairs * 10 - (memMoves - memPairs) * 3);
      if (!levelCfg()) setBest("memoire", precision);
      save();
      const [t3, t2] = memTargets();
      const stars = memMoves <= t3 ? 3 : memMoves <= t2 ? 2 : 1;
      later(() => winGame("Mémoire d’éléphant", `${memPairs * 2} cartes retrouvées en ${memMoves} essais.`, 0, stars), 450);
    }
  } else {
    memLock = true;
    const first = memFirst;
    memFirst = null;
    addPoints(-1); sfx("bad");
    later(() => {
      first.textContent = ""; card.textContent = "";
      first.classList.remove("open"); card.classList.remove("open");
      memLock = false;
    }, 750);
  }
}
// Objectifs en nombre d’essais (un essai = deux cartes retournées).
// Le minimum possible est égal au nombre de paires.
function memTargets() {
  return [Math.ceil(memPairs * 1.5), memPairs * 2];
}
function setMemLevel(n) { memPairs = n; initMemoire(); }

LQ.register({
  id: "memoire",
  title: "Mémoire",
  desc: "Retrouver les paires",
  hue: "#e7c86e",
  recordLabel: v => `Record : ${v} points`,
  init: initMemoire,
  levelInfo: cfg => ({
    what: `${cfg.pairs} paires à retrouver`,
    goals: [`Terminer en ${Math.ceil(cfg.pairs * 1.5)} essais ou moins`, `Terminer en ${cfg.pairs * 2} essais ou moins`, "Retrouver toutes les paires"],
  }),
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="8" onclick="setMemLevel(8)">8 paires</button>
      <button class="chip" data-b="10" onclick="setMemLevel(10)">10 paires</button>
      <button class="chip" data-b="12" onclick="setMemLevel(12)">12 paires</button>
    </div>
    <div class="stat-pills">
      <div class="pill">Paires <b><span id="mem-found">0</span>/<span id="mem-total">8</span></b></div>
      <div class="pill">Essais <b id="mem-moves">0</b></div>
      <button class="btn ghost small" onclick="initMemoire()">${ICONS.refresh} Nouvelle partie</button>
    </div>
    <p class="goals" id="mem-goals"></p>
    <div class="mem-grid" id="mem-board"></div>`,
  setup() {
    window.addEventListener("resize", sizeMemBoard);
  },
});
