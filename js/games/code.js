/* ============================================================
   Code secret — retrouver une combinaison de couleurs
   Après chaque essai : nombre de couleurs bien placées (●) et de
   couleurs présentes mais mal placées (○).
   Chaque couleur porte aussi un chiffre, pour ne pas dépendre de
   la seule perception des couleurs.
   ============================================================ */
const CS_COLORS = ["#e5707a", "#f0a35e", "#e8d26a", "#67c79f", "#6fb3e8", "#b48cf0", "#f29fd0", "#ece8df"];
const CS_MODES = {
  1: { label: "Facile", pegs: 4, colors: 6, repeat: false, tries: 10, stars: [5, 7], pts: 40 },
  2: { label: "Moyen", pegs: 4, colors: 6, repeat: true, tries: 10, stars: [6, 8], pts: 70 },
  3: { label: "Difficile", pegs: 5, colors: 8, repeat: true, tries: 12, stars: [7, 9], pts: 120 },
};
let csMode = 1, csSecret = [], csRows = [], csCur = [], csLocked = [], csHints = 0, csDone = false;

function csScore(guess, secret) {
  let black = 0, white = 0;
  const g = [], s = [];
  guess.forEach((v, i) => { if (v === secret[i]) black++; else { g.push(v); s.push(secret[i]); } });
  g.forEach(v => { const k = s.indexOf(v); if (k >= 0) { white++; s.splice(k, 1); } });
  return [black, white];
}

// cfg (parcours) : { mode: 1 | 2 | 3 }
function initCode(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) csMode = cfg.mode;
  else if (resumeFreeSize("code")) csMode = resumeFreeSize("code");
  setActiveChips("code", csMode);
  csDone = false;
  const M = CS_MODES[csMode];
  const snap = resumeTake("code", playCtx(csMode));
  if (snap) ({ secret: csSecret, rows: csRows, cur: csCur, locked: csLocked, hints: csHints } = snap);
  else {
    const pool = [...Array(M.colors).keys()];
    csSecret = M.repeat ? Array.from({ length: M.pegs }, () => Math.floor(Math.random() * M.colors)) : shuffle(pool).slice(0, M.pegs);
    csRows = []; csHints = 0;
    csLocked = new Array(M.pegs).fill(-1);
    csCur = new Array(M.pegs).fill(-1);
  }
  renderCode();
}
function saveCode() { resumeSave("code", playCtx(csMode), { secret: csSecret, rows: csRows, cur: csCur, locked: csLocked, hints: csHints }); }
function newCode() { resumeClear("code"); initCode(); }
function csPeg(v, extra = "") {
  return v < 0 ? `<span class="cs-peg empty ${extra}"></span>` : `<span class="cs-peg ${extra}" style="--pc:${CS_COLORS[v]}">${v + 1}</span>`;
}
function renderCode() {
  const M = CS_MODES[csMode];
  const rows = csRows.map((r, k) => `
    <div class="cs-row">
      <span class="cs-n">${k + 1}</span>
      <span class="cs-pegs">${r.g.map(v => csPeg(v)).join("")}</span>
      <span class="cs-fb" aria-label="${r.b} bien placé${r.b > 1 ? "s" : ""}, ${r.w} mal placé${r.w > 1 ? "s" : ""}">
        ${"<i class='b'></i>".repeat(r.b)}${"<i class='w'></i>".repeat(r.w)}${"<i></i>".repeat(M.pegs - r.b - r.w)}
      </span>
      <span class="cs-txt">${r.b} ● ${r.w} ○</span>
    </div>`).join("");
  const cur = csDone ? "" : `
    <div class="cs-row cur">
      <span class="cs-n">${csRows.length + 1}</span>
      <span class="cs-pegs">${csCur.map((v, i) => `<button class="cs-slot" data-i="${i}" aria-label="Position ${i + 1}">${csPeg(v, csLocked[i] >= 0 ? "locked" : "")}</button>`).join("")}</span>
      <span class="cs-left">${M.tries - csRows.length} essai${M.tries - csRows.length > 1 ? "s" : ""}</span>
    </div>`;
  $("cs-board").innerHTML = (rows || `<p class="hint-line">Composez une combinaison de ${M.pegs} couleurs${M.repeat ? " (une couleur peut revenir plusieurs fois)" : ", toutes différentes"}.</p>`) + cur;
  $("cs-palette").innerHTML = csDone ? "" : [...Array(M.colors).keys()].map(v => `<button class="cs-color" data-v="${v}" style="--pc:${CS_COLORS[v]}" aria-label="Couleur ${v + 1}">${v + 1}</button>`).join("");
  $("cs-actions").style.display = csDone ? "none" : "";
  const last = $("cs-board").lastElementChild;
  if (last && csRows.length > 4) last.scrollIntoView({ block: "nearest" });
}
function pickColor(v) {
  if (csDone) return;
  const i = csCur.findIndex((x, k) => x < 0 && csLocked[k] < 0);
  if (i < 0) { toast("La ligne est complète : validez ou retirez une couleur"); return; }
  csCur[i] = v; sfx("tick"); renderCode(); saveCode();
}
function clearSlot(i) {
  if (csDone || csLocked[i] >= 0 || csCur[i] < 0) return;
  csCur[i] = -1; sfx("tick"); renderCode(); saveCode();
}
function clearCodeRow() { csCur = csCur.map((v, i) => (csLocked[i] >= 0 ? v : -1)); sfx("tick"); renderCode(); saveCode(); }
function hintCode() {
  if (csDone) return;
  const free = csLocked.map((v, i) => (v < 0 ? i : -1)).filter(i => i >= 0);
  if (free.length <= 1) { toast("Plus d’indice possible : à vous de conclure"); return; }
  const i = free[Math.floor(Math.random() * free.length)];
  csLocked[i] = csSecret[i]; csCur[i] = csSecret[i]; csHints++;
  sfx("good"); toast(`Indice : la position ${i + 1} est la couleur ${csSecret[i] + 1}`);
  renderCode(); saveCode();
}
function submitCode() {
  if (csDone) return;
  const M = CS_MODES[csMode];
  if (csCur.includes(-1)) { toast(`Placez ${M.pegs} couleurs avant de valider`); return; }
  if (!M.repeat && new Set(csCur).size < M.pegs) { toast("En mode facile, les couleurs sont toutes différentes"); return; }
  const [b, w] = csScore(csCur, csSecret);
  csRows.push({ g: csCur.slice(), b, w });
  csCur = csLocked.map(v => v);
  const won = b === M.pegs, lost = !won && csRows.length >= M.tries;
  if (!won && !lost) { sfx(b ? "good" : "tick"); renderCode(); saveCode(); return; }
  csDone = true;
  resumeClear("code");
  renderCode();
  const n = csRows.length;
  if (won) {
    const pts = M.pts;
    addPoints(pts); state.solved++;
    if (!levelCfg()) setBest("code", csMode);
    save();
    // Chaque indice compte comme un essai de plus pour les étoiles
    const eff = n + csHints;
    const stars = eff <= M.stars[0] ? 3 : eff <= M.stars[1] ? 2 : 1;
    later(() => winGame("Code trouvé", `En ${n} essai${n > 1 ? "s" : ""}${csHints ? `, avec ${csHints} indice${csHints > 1 ? "s" : ""}` : ""}. +${pts} points`, pts, stars), 700);
  } else {
    addPoints(-5);
    later(() => winGame("Code non trouvé", `La combinaison était ${csSecret.map(v => v + 1).join(" · ")}.`, 0, 0), 700);
  }
}

LQ.register({
  id: "code",
  title: "Code secret",
  desc: "Déduire une combinaison de couleurs",
  hue: "#e8d26a",
  recordLabel: v => `Record : niveau ${CS_MODES[v] ? CS_MODES[v].label.toLowerCase() : v}`,
  init: initCode,
  levelInfo: cfg => {
    const M = CS_MODES[cfg.mode];
    return {
      what: `Trouver un code de ${M.pegs} couleurs parmi ${M.colors}${M.repeat ? ", répétitions possibles" : ", toutes différentes"}, en ${M.tries} essais au plus`,
      goals: [`Trouver en ${M.stars[0]} essais au plus`, `Trouver en ${M.stars[1]} essais au plus`, "Trouver le code"],
    };
  },
  rules: [
    "Un code secret de couleurs est caché. Proposez une combinaison, puis touchez <b>Valider</b>.",
    "● indique une couleur juste et bien placée ; ○ une couleur présente dans le code mais à une autre place. L’ordre des pastilles ne dit pas lesquelles.",
    "Chaque couleur porte un chiffre pour la reconnaître sans ambiguïté. Touchez une couleur de la palette pour remplir la ligne, et une case de la ligne pour la vider.",
    "En facile, les couleurs du code sont toutes différentes ; ensuite, une couleur peut revenir. Un indice dévoile une position, mais compte comme un essai pour les étoiles.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="1" onclick="csMode=1;newCode()">Facile · 4 parmi 6</button>
      <button class="chip" data-b="2" onclick="csMode=2;newCode()">Moyen · répétitions</button>
      <button class="chip" data-b="3" onclick="csMode=3;newCode()">Difficile · 5 parmi 8</button>
    </div>
    <div class="board-wrap">
      <div class="cs-board" id="cs-board"></div>
      <div class="cs-palette" id="cs-palette"></div>
      <div class="toolbar" id="cs-actions">
        <button class="btn small" onclick="submitCode()">${ICONS.check} Valider</button>
        <button class="btn ghost small" onclick="clearCodeRow()">${ICONS.erase} Vider</button>
        <button class="btn ghost small" onclick="hintCode()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newCode()">${ICONS.refresh} Autre code</button>
      </div>
    </div>
    <p class="hint-line">● bien placée · ○ présente mais mal placée.</p>`,
  setup() {
    $("cs-palette").addEventListener("click", e => { const b = e.target.closest(".cs-color"); if (b) pickColor(+b.dataset.v); });
    $("cs-board").addEventListener("click", e => { const b = e.target.closest(".cs-slot"); if (b) clearSlot(+b.dataset.i); });
  },
});
