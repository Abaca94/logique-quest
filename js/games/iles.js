/* ============================================================
   Îles et canaux — séparer la terre et l’eau
   Chaque chiffre appartient à une île d’autant de cases ; les îles
   ne se touchent pas par un côté ; tous les canaux sont reliés et ne
   forment jamais un bassin de 2×2. Grilles générées, résolubles sans deviner.
   ============================================================ */
const IL_PTS = { 5: 40, 7: 90, 9: 160 };
let ilN = 7, ilClue = [], ilSol = [], ilCells = [], ilUndo = [], ilHints = 0, ilErrors = 0, ilDone = false;
// ilCells / états du solveur : 0 inconnu, 1 terre, 2 canal

const IL_NB = {};
function ilNb(n) {
  if (IL_NB[n]) return IL_NB[n];
  const out = [];
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n;
    out.push([[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n).map(([a, b]) => a * n + b));
  }
  return (IL_NB[n] = out);
}
// Morceaux reliés de cases du même état
function ilComps(n, st, val, clue) {
  const nb = ilNb(n), id = new Array(n * n).fill(-1), comps = [];
  for (let i = 0; i < n * n; i++) {
    if (st[i] !== val || id[i] >= 0) continue;
    const k = comps.length, cells = [], stack = [i], exits = new Set(), clues = [];
    id[i] = k;
    while (stack.length) {
      const x = stack.pop(); cells.push(x);
      if (clue && clue[x] > 0) clues.push(x);
      nb[x].forEach(j => { if (st[j] === val && id[j] < 0) { id[j] = k; stack.push(j); } else if (st[j] === 0) exits.add(j); });
    }
    comps.push({ cells, clues, exits: [...exits] });
  }
  return { id, comps };
}

/* ---------- Raisonnement pas à pas ---------- */
// Renvoie les déductions { i, v, rank, why, text } ou null si la position est impossible.
function ilRules(n, clue, st, all) {
  const nb = ilNb(n), N = n * n, W = N - clue.reduce((a, b) => a + b, 0), out = [];
  const L = ilComps(n, st, 1, clue), A = ilComps(n, st, 2, null);
  const water = st.filter(v => v === 2).length, land = st.filter(v => v === 1).length;
  if (water > W || land > N - W) return null;
  for (const c of L.comps) {
    if (c.clues.length > 1) return null;
    const k = c.clues.length ? clue[c.clues[0]] : 0;
    if (k && c.cells.length > k) return null;
    if ((!k || c.cells.length < k) && !c.exits.length) return null;
  }
  for (const c of A.comps) if (!c.exits.length && c.cells.length < W) return null;
  for (let r = 0; r < n - 1; r++) for (let q = 0; q < n - 1; q++) {
    const b = [r * n + q, r * n + q + 1, (r + 1) * n + q, (r + 1) * n + q + 1];
    if (b.every(i => st[i] === 2)) return null;
  }
  const done = () => !all && out.length;
  // 0. Île complète : tout autour, ce sont des canaux
  for (const c of L.comps) {
    if (!c.clues.length) continue;
    const k = clue[c.clues[0]];
    if (c.cells.length !== k) continue;
    c.exits.forEach(i => out.push({ i, v: 2, rank: 0, why: c.cells, text: k === 1
      ? "L’île du 1 (en bleu) ne fait qu’une case : tout ce qui la touche est un canal, dont la case entourée."
      : `L’île du ${k} (en bleu) a déjà ses ${k} cases : tout ce qui la touche est un canal, dont la case entourée.` }));
    if (done()) return out;
  }
  // 0. Case entre deux îles numérotées
  for (let i = 0; i < N; i++) {
    if (st[i] !== 0) continue;
    const ks = [...new Set(nb[i].filter(j => st[j] === 1 && L.comps[L.id[j]].clues.length).map(j => L.id[j]))];
    if (ks.length < 2) continue;
    const [a, b] = ks.map(k => clue[L.comps[k].clues[0]]);
    out.push({ i, v: 2, rank: 0, why: [...L.comps[ks[0]].cells, ...L.comps[ks[1]].cells], text: `La case entourée touche deux îles différentes (en bleu), celle du ${a} et celle du ${b}. Si c’était de la terre, elles se rejoindraient : c’est un canal.` });
    if (done()) return out;
  }
  // 1. Case qu’aucune île ne peut atteindre
  const reach = new Array(N).fill(false);
  L.comps.forEach((c, k) => {
    if (!c.clues.length) return;
    const left = clue[c.clues[0]] - c.cells.length, dist = new Array(N).fill(-1);
    c.cells.forEach(x => { dist[x] = 0; reach[x] = true; });
    const q = c.cells.slice();
    for (let h = 0; h < q.length; h++) {
      const x = q[h];
      if (dist[x] >= left) continue;
      nb[x].forEach(j => {
        if (dist[j] >= 0 || st[j] === 2) return;
        if (st[j] === 1 && L.comps[L.id[j]].clues.length) return;
        if (nb[j].some(y => st[y] === 1 && L.id[y] !== k && L.comps[L.id[y]].clues.length)) return;
        dist[j] = dist[x] + 1; reach[j] = true; q.push(j);
      });
    }
  });
  for (let i = 0; i < N; i++) if (st[i] === 1 && !reach[i]) return null;
  for (let i = 0; i < N; i++) {
    if (st[i] !== 0 || reach[i]) continue;
    out.push({ i, v: 2, rank: 1, why: [], text: "Aucune île ne peut s’étendre jusqu’à la case entourée : les chiffres voisins sont trop petits, trop loin ou leurs îles déjà complètes. C’est donc un canal." });
    if (done()) return out;
  }
  // 2. Une seule sortie possible
  for (const c of L.comps) {
    if (c.exits.length !== 1) continue;
    if (c.clues.length) {
      const k = clue[c.clues[0]];
      if (c.cells.length >= k) continue;
      out.push({ i: c.exits[0], v: 1, rank: 2, why: c.cells, text: `L’île du ${k} (en bleu) n’a encore ${c.cells.length === 1 ? "qu’une case" : `que ${c.cells.length} cases`} et ne peut grandir que par la case entourée : c’est de la terre.` });
    } else out.push({ i: c.exits[0], v: 1, rank: 2, why: c.cells, text: "La terre en bleu n’a pas encore de chiffre : elle ne peut rejoindre une île numérotée que par la case entourée, qui est donc de la terre." });
    if (done()) return out;
  }
  for (const c of A.comps) {
    if (c.exits.length !== 1 || c.cells.length >= W) continue;
    out.push({ i: c.exits[0], v: 2, rank: 2, why: c.cells, text: "Le canal en bleu doit rejoindre les autres canaux, et il ne peut passer que par la case entourée : c’est aussi un canal." });
    if (done()) return out;
  }
  // 3. Pas de bassin 2×2
  for (let r = 0; r < n - 1; r++) for (let q = 0; q < n - 1; q++) {
    const b = [r * n + q, r * n + q + 1, (r + 1) * n + q, (r + 1) * n + q + 1], u = b.filter(i => st[i] === 0);
    if (u.length !== 1 || b.filter(i => st[i] === 2).length !== 3) continue;
    out.push({ i: u[0], v: 1, rank: 3, why: b.filter(i => st[i] === 2), text: "Les trois canaux en bleu forment un coin : si la case entourée était aussi un canal, ils dessineraient un bassin carré de 2×2, ce qui est interdit. C’est de la terre." });
    if (done()) return out;
  }
  return out;
}
function ilPropagate(n, clue, st, limit = 300) {
  for (let k = 0; k < limit; k++) {
    const r = ilRules(n, clue, st, false);
    if (r === null) return false;
    if (!r.length) return true;
    st[r[0].i] = r[0].v;
  }
  return true;
}
function ilSteps(n, clue, st, sol, all) {
  const out = (ilRules(n, clue, st, all) || []).filter(x => !sol || sol[x.i] === x.v);
  if (out.length) return out;
  // Essai : la case mène à une impasse
  for (let i = 0; i < n * n; i++) {
    if (st[i] !== 0) continue;
    for (const v of [2, 1]) {
      const t = st.slice(); t[i] = v;
      if (ilPropagate(n, clue, t)) continue;
      const res = 3 - v;
      if (sol && sol[i] !== res) continue;
      out.push({ i, v: res, rank: 4, why: [], text: v === 1
        ? "Supposez que la case entourée soit de la terre : en suivant les règles, on aboutit vite à une impasse (une île trop grande, deux chiffres réunis ou un canal coupé des autres). C’est donc un canal."
        : "Supposez que la case entourée soit un canal : en suivant les règles, on aboutit vite à une impasse (une île qui ne peut plus atteindre sa taille, un canal isolé ou un bassin 2×2). C’est donc de la terre." });
      if (!all) return out;
    }
  }
  return out;
}
function ilStart(n, clue) { return clue.map(k => k > 0 ? 1 : 0); }
function ilSolvable(n, clue, sol) {
  const st = ilStart(n, clue);
  for (let k = 0; k < 400 && st.includes(0); k++) {
    const s = ilSteps(n, clue, st, null, false);
    if (!s.length || sol[s[0].i] !== s[0].v) return false;
    st[s[0].i] = s[0].v;
  }
  return !st.includes(0);
}

/* ---------- Génération ---------- */
function ilGenerate(n) {
  const nb = ilNb(n), N = n * n, maxIs = n <= 5 ? 5 : n <= 7 ? 7 : 9;
  for (let t = 0; t < 60; t++) {
    const land = new Array(N).fill(-1), sizes = [];
    const pools = () => {
      const p = [];
      for (let r = 0; r < n - 1; r++) for (let q = 0; q < n - 1; q++) {
        const b = [r * n + q, r * n + q + 1, (r + 1) * n + q, (r + 1) * n + q + 1];
        if (b.every(i => land[i] < 0)) p.push(b);
      }
      return p;
    };
    const waterOk = () => {
      const start = land.findIndex(v => v < 0);
      if (start < 0) return false;
      const seen = new Set([start]), st = [start];
      while (st.length) { const x = st.pop(); nb[x].forEach(j => { if (land[j] < 0 && !seen.has(j)) { seen.add(j); st.push(j); } }); }
      return seen.size === land.filter(v => v < 0).length;
    };
    const target = Math.round(N * (.36 + Math.random() * .1));
    let count = 0, fail = false;
    for (let guard = 0; guard < 600; guard++) {
      const P = pools();
      if (!P.length && count >= target) break;
      const cands = shuffle(P.length ? [...new Set(P.flat())] : land.map((v, i) => v < 0 ? i : -1).filter(i => i >= 0));
      let ok = false;
      for (const x of cands) {
        const adj = [...new Set(nb[x].filter(j => land[j] >= 0).map(j => land[j]))];
        if (adj.length > 1 || (adj.length && sizes[adj[0]] >= maxIs)) continue;
        // Les nouvelles îles restent assez rares pour éviter une poussière de 1
        if (!adj.length && P.length === 0 && Math.random() < .5) continue;
        const k = adj.length ? adj[0] : sizes.length;
        land[x] = k;
        if (!waterOk()) { land[x] = -1; continue; }
        if (adj.length) sizes[k]++; else sizes.push(1);
        count++; ok = true; break;
      }
      if (!ok && P.length) { fail = true; break; }
    }
    if (fail || pools().length) continue;
    const sol = land.map(v => v >= 0 ? 1 : 2);
    for (let tries = 0; tries < 3; tries++) {
      const clue = new Array(N).fill(0);
      sizes.forEach((s, k) => { const cells = land.map((v, i) => v === k ? i : -1).filter(i => i >= 0); clue[cells[Math.floor(Math.random() * cells.length)]] = s; });
      if (ilSolvable(n, clue, sol)) return { clue, sol };
    }
  }
  return null;
}

/* ---------- Partie ---------- */
// cfg (parcours, défi) : { size: 5 | 7 | 9 }
function initIles(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) ilN = cfg.size;
  else if (resumeFreeSize("iles")) ilN = resumeFreeSize("iles");
  setActiveChips("iles", ilN);
  ilDone = false; ilUndo = []; hintReset("iles");
  const snap = resumeTake("iles", playCtx(ilN));
  if (snap) ({ clue: ilClue, sol: ilSol, cells: ilCells, hints: ilHints, errors: ilErrors } = snap);
  else {
    let p = null;
    while (!p) p = ilGenerate(ilN);
    ilClue = p.clue; ilSol = p.sol; ilCells = ilStart(ilN, ilClue); ilHints = 0; ilErrors = 0;
  }
  renderIles();
}
function saveIles() { resumeSave("iles", playCtx(ilN), { clue: ilClue, sol: ilSol, cells: ilCells, hints: ilHints, errors: ilErrors }); }
function newIles() { resumeClear("iles"); initIles(); }
function ilCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 520);
  return Math.max(32, Math.min(64, Math.floor((avail - 8) / ilN)));
}
function ilIsWrong(i) { return !ilClue[i] && ilCells[i] !== 0 && ilCells[i] !== ilSol[i]; }
function ilHintValid(h) { return h.wrong ? ilIsWrong(h.key) : ilCells[h.key] === 0; }
function ilPools() {
  const n = ilN, bad = new Array(n * n).fill(false);
  for (let r = 0; r < n - 1; r++) for (let q = 0; q < n - 1; q++) {
    const b = [r * n + q, r * n + q + 1, (r + 1) * n + q, (r + 1) * n + q + 1];
    if (b.every(i => ilCells[i] === 2)) b.forEach(i => { bad[i] = true; });
  }
  return bad;
}
function renderIles() {
  const n = ilN, b = $("il-board"), bad = ilPools();
  hintPanel("iles", "il-explain", ilHintValid);
  b.style.setProperty("--ilc", ilCellSize() + "px");
  b.style.gridTemplateColumns = `repeat(${n}, var(--ilc))`;
  // Taille courante de chaque île numérotée, pour signaler une île trop grande
  const L = ilComps(n, ilCells, 1, ilClue), over = new Array(n * n).fill(false);
  L.comps.forEach(c => { const k = c.clues.length ? ilClue[c.clues[0]] : 0; if (c.clues.length > 1 || (k && c.cells.length > k)) c.clues.forEach(i => { over[i] = true; }); });
  let h = "";
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, v = ilCells[i], k = ilClue[i];
    const cls = ["il-cell", k ? "clue" : v === 1 ? "land" : v === 2 ? "water" : "", bad[i] ? "bad" : "", over[i] ? "over" : ""].join(" ") + hintCls("iles", i);
    const lab = k ? `chiffre ${k}` : v === 1 ? "terre" : v === 2 ? "canal" : "vide";
    h += `<div class="${cls}" data-i="${i}" data-label="${lab}, ligne ${r + 1}, colonne ${c + 1}">${k ? k : v === 1 ? "<i></i>" : ""}</div>`;
  }
  b.innerHTML = h;
  const W = n * n - ilClue.reduce((a, x) => a + x, 0), left = W - ilCells.filter(v => v === 2).length;
  $("il-info").textContent = ilDone ? "" : left > 0 ? `${left} case${left > 1 ? "s" : ""} de canal à placer` : left < 0 ? "Trop de canaux" : "";
}
function tapIle(i) {
  if (ilDone || ilClue[i]) return;
  ilUndo.push(ilCells.slice()); if (ilUndo.length > 300) ilUndo.shift();
  ilCells[i] = ilCells[i] === 0 ? 2 : ilCells[i] === 2 ? 1 : 0;
  sfx("tick"); renderIles(); saveIles(); checkIles();
}
function undoIles() {
  if (ilDone) return;
  const u = ilUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  ilCells = u; sfx("tick"); renderIles(); saveIles();
}
function ilesReason() {
  const s = ilSteps(ilN, ilClue, ilCells.slice(), ilSol, true).filter(x => ilCells[x.i] === 0);
  if (!s.length) return null;
  const best = Math.min(...s.map(x => x.rank)), pool = s.filter(x => x.rank === best), r = pool[Math.floor(Math.random() * pool.length)];
  return { rank: r.rank, key: r.i, why: r.why, text: r.text, msg: r.v === 2 ? "Un canal se déduit ici. Touchez encore Indice pour l’explication." : "Une case de terre se déduit ici. Touchez encore Indice pour l’explication." };
}
function hintIles() {
  if (ilDone) return;
  hintFlow("iles", {
    valid: ilHintValid,
    wrong: () => { const i = ilCells.findIndex((v, k) => ilIsWrong(k)); return i < 0 ? null : { key: i, msg: ilCells[i] === 2 ? "Ce canal est mal placé. Touchez encore Indice pour l’effacer." : "Cette case n’est pas de la terre. Touchez encore Indice pour l’effacer." }; },
    find: ilesReason,
    fallback: () => { const i = ilSol.findIndex((v, k) => ilCells[k] === 0); return i < 0 ? null : { key: i, why: [], text: "Cette case se déduit en combinant plusieurs îles." }; },
    clear: h => { ilUndo.push(ilCells.slice()); ilCells[h.key] = 0; saveIles(); },
    place: h => { ilUndo.push(ilCells.slice()); ilCells[h.key] = ilSol[h.key]; saveIles(); },
    count: () => { ilHints++; saveIles(); },
    render: () => { renderIles(); checkIles(); },
  });
}
function checkIles() {
  if (ilDone) return;
  const W = ilSol.filter(v => v === 2).length, water = ilCells.filter(v => v === 2).length;
  if (water < W) return;
  if (water > W || ilCells.some((v, i) => v === 2 && ilSol[i] !== 2)) {
    ilErrors++; addPoints(-3); sfx("bad"); saveIles();
    toast("Tous les canaux sont tracés, mais une règle n’est pas respectée");
    return;
  }
  ilDone = true;
  resumeClear("iles");
  ilCells = ilSol.slice(); renderIles();
  const pts = IL_PTS[ilN];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("iles", ilN);
  save();
  const stars = !ilHints && !ilErrors ? 3 : ilHints <= 2 && ilErrors <= 1 ? 2 : 1;
  later(() => winGame("Lagune dessinée", `Grille ${ilN}×${ilN} terminée${ilHints ? `, avec ${ilHints} indice${ilHints > 1 ? "s" : ""}` : " sans indice"}. +${pts} points`, pts, stars), 600);
}

LQ.register({
  id: "iles",
  title: "Îles et canaux",
  desc: "Des îles numérotées, un seul réseau de canaux",
  hue: "#6fc2b0",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initIles,
  levelInfo: cfg => ({
    what: `Une lagune ${cfg.size}×${cfg.size} à dessiner`,
    goals: ["Sans indice ni erreur", "Au plus deux indices et une erreur", "Terminer la grille"],
  }),
  rules: [
    "Chaque chiffre fait partie d’une île qui compte exactement ce nombre de cases. Chaque île porte un seul chiffre.",
    "Deux îles ne se touchent jamais par un côté (elles peuvent se toucher par un coin).",
    "Toutes les autres cases sont des canaux. Les canaux forment un seul réseau relié, sans aucun bassin carré de 2×2.",
    "Touchez une case : un canal, puis de la terre (un point), puis vide. Un bassin 2×2 s’affiche en rouge.",
    "<b>Indice</b> montre d’abord la prochaine case à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour la remplir.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="5" onclick="ilN=5;newIles()">Facile · 5×5</button>
      <button class="chip" data-b="7" onclick="ilN=7;newIles()">Moyen · 7×7</button>
      <button class="chip" data-b="9" onclick="ilN=9;newIles()">Difficile · 9×9</button>
    </div>
    <div class="board-wrap">
      <div class="il-board" id="il-board"></div>
      <p class="hint-line" id="il-info"></p>
      <p class="hint-explain" id="il-explain" aria-live="polite"></p>
      <div class="toolbar">
        <button class="btn ghost small" onclick="undoIles()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintIles()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newIles()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Chaque chiffre est une île de cette taille ; les canaux sont tous reliés, sans carré 2×2.</p>`,
  setup() {
    $("il-board").addEventListener("click", e => { const c = e.target.closest(".il-cell"); if (c) tapIle(+c.dataset.i); });
    window.addEventListener("resize", () => { if (currentGame === "iles" && ilSol.length) renderIles(); });
  },
});
