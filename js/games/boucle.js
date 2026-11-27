/* ============================================================
   Boucle — tracer une seule boucle fermée
   Les traits suivent les pointillés ; un chiffre dit combien des
   quatre côtés de sa case sont tracés. La boucle ne se croise pas
   et ne se sépare jamais. Grilles générées, résolubles sans deviner.
   ============================================================ */
const BC_PTS = { 5: 50, 6: 100, 7: 160 };
let bcN = 5, bcClue = [], bcSol = [], bcEd = [], bcUndo = [], bcHints = 0, bcErrors = 0, bcDone = false;
// bcEd : 0 inconnu, 1 trait, 2 croix (côté vide)

/* ---------- Géométrie ----------
   Côtés horizontaux : r * n + c (r de 0 à n, c de 0 à n-1)
   Côtés verticaux : (n + 1) * n + r * (n + 1) + c (r de 0 à n-1, c de 0 à n)
   Points : r * (n + 1) + c (r, c de 0 à n) */
const BC_GEO = {};
function bcGeo(n) {
  if (BC_GEO[n]) return BC_GEO[n];
  const H = (n + 1) * n, E = 2 * H, ev = [], ec = [], ve = Array.from({ length: (n + 1) * (n + 1) }, () => []), ce = [];
  for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) {
    const e = r * n + c; ev[e] = [r * (n + 1) + c, r * (n + 1) + c + 1];
    ec[e] = [r > 0 ? (r - 1) * n + c : -1, r < n ? r * n + c : -1].filter(x => x >= 0);
  }
  for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) {
    const e = H + r * (n + 1) + c; ev[e] = [r * (n + 1) + c, (r + 1) * (n + 1) + c];
    ec[e] = [c > 0 ? r * n + c - 1 : -1, c < n ? r * n + c : -1].filter(x => x >= 0);
  }
  for (let e = 0; e < E; e++) ev[e].forEach(v => ve[v].push(e));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) ce.push([r * n + c, (r + 1) * n + c, H + r * (n + 1) + c, H + r * (n + 1) + c + 1]);
  return (BC_GEO[n] = { E, ev, ec, ve, ce });
}

/* ---------- Génération : le bord d’une forme sans trou ---------- */
function bcShape(n) {
  const inS = new Array(n * n).fill(false), nb = i => { const r = Math.floor(i / n), c = i % n; return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n).map(([a, b]) => a * n + b); };
  const start = Math.floor(Math.random() * n * n);
  inS[start] = true;
  const target = Math.round(n * n * (.45 + Math.random() * .15));
  // Le complément doit rester relié au bord (pas de trou) et aucun point ne doit être pincé.
  const outsideOk = () => {
    const seen = new Set(), st = [];
    for (let i = 0; i < n * n; i++) { const r = Math.floor(i / n), c = i % n; if (!inS[i] && (r === 0 || c === 0 || r === n - 1 || c === n - 1)) { seen.add(i); st.push(i); } }
    while (st.length) { const i = st.pop(); nb(i).forEach(j => { if (!inS[j] && !seen.has(j)) { seen.add(j); st.push(j); } }); }
    return seen.size === inS.filter(x => !x).length;
  };
  const pinchFree = () => {
    for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
      const a = inS[r * n + c], b = inS[r * n + c + 1], d = inS[(r + 1) * n + c], e = inS[(r + 1) * n + c + 1];
      if ((a && e && !b && !d) || (b && d && !a && !e)) return false;
    }
    return true;
  };
  let count = 1, guard = 0;
  while (count < target && guard++ < 2000) {
    const cand = [];
    inS.forEach((x, i) => { if (x) nb(i).forEach(j => { if (!inS[j]) cand.push(j); }); });
    const j = cand[Math.floor(Math.random() * cand.length)];
    inS[j] = true;
    if (!outsideOk() || !pinchFree()) { inS[j] = false; continue; }
    count++;
  }
  return inS;
}
function bcLoopOf(n, inS) {
  const g = bcGeo(n), on = new Array(g.E).fill(0);
  for (let e = 0; e < g.E; e++) {
    const cs = g.ec[e], ins = cs.filter(c => inS[c]).length;
    if (cs.length === 1 ? ins === 1 : ins === 1) on[e] = 1;
  }
  return on;
}

/* ---------- Raisonnement pas à pas ---------- */
// Applique une règle simple ; renvoie la liste des déductions { e, v, rank, why, text } ou null si contradiction.
function bcRules(n, clue, st, all) {
  const g = bcGeo(n), out = [];
  for (let c = 0; c < n * n; c++) {
    if (clue[c] < 0) continue;
    const es = g.ce[c], L = es.filter(e => st[e] === 1).length, U = es.filter(e => st[e] === 0);
    if (L > clue[c] || L + U.length < clue[c]) return null;
    if (!U.length) continue;
    if (L === clue[c]) U.forEach(e => out.push({ e, v: 2, rank: 0, why: ["c" + c], text: clue[c] === 0 ? `Une case 0 (en bleu) n’a aucun trait autour d’elle : ce côté reste vide. Mettez-y une croix.` : `La case ${clue[c]} en bleu a déjà ${clue[c] > 1 ? `ses ${clue[c]} traits` : "son trait"} : ses autres côtés restent vides. Mettez une croix sur le côté entouré.` }));
    else if (L + U.length === clue[c]) U.forEach(e => out.push({ e, v: 1, rank: 0, why: ["c" + c], text: `La case ${clue[c]} en bleu a besoin de ${clue[c]} traits et il ne lui reste que ${clue[c]} côtés possibles (les autres sont barrés) : ils sont tous tracés, dont le côté entouré.` }));
    if (!all && out.length) return out;
  }
  for (let v = 0; v < (n + 1) * (n + 1); v++) {
    const es = g.ve[v], L = es.filter(e => st[e] === 1).length, U = es.filter(e => st[e] === 0);
    if (L > 2 || (L === 1 && !U.length)) return null;
    if (!U.length) continue;
    if (L === 2) U.forEach(e => out.push({ e, v: 2, rank: 1, why: ["p" + v], text: "Au point en bleu, deux traits se rejoignent déjà : la boucle ne peut pas y passer une troisième fois. Le côté entouré reste vide." }));
    else if (L === 1 && U.length === 1) out.push({ e: U[0], v: 1, rank: 1, why: ["p" + v], text: "Au point en bleu, la boucle arrive par un trait et doit en repartir : le seul côté encore libre est celui qui est entouré. Il faut le tracer." });
    else if (L === 0 && U.length === 1) out.push({ e: U[0], v: 2, rank: 1, why: ["p" + v], text: "Au point en bleu, il ne reste qu’un côté libre : la boucle ne pourrait pas y entrer sans en ressortir. Le côté entouré reste vide." });
    if (!all && out.length) return out;
  }
  // Petite boucle fermée trop tôt
  const comp = bcComponents(n, st);
  if (comp.closed.some(Boolean) && (comp.size.length > 1 || clue.some((k, c) => k >= 0 && g.ce[c].filter(x => st[x] === 1).length !== k))) return null;
  for (let e = 0; e < g.E; e++) {
    if (st[e] !== 0) continue;
    const [a, b] = g.ev[e];
    if (comp.id[a] < 0 || comp.id[a] !== comp.id[b] || g.ve[a].filter(x => st[x] === 1).length !== 1 || g.ve[b].filter(x => st[x] === 1).length !== 1) continue;
    const t = st.slice(); t[e] = 1;
    const lines = t.filter(x => x === 1).length, inLoop = comp.size[comp.id[a]] + 1;
    const cluesOk = clue.every((k, c) => k < 0 || g.ce[c].filter(x => t[x] === 1).length === k);
    if (inLoop === lines && cluesOk) out.push({ e, v: 1, rank: 2, why: [], text: "Ce trait referme la boucle, et tous les chiffres sont alors respectés : c’est le dernier trait." });
    else out.push({ e, v: 2, rank: 2, why: [], text: "Tracer le côté entouré refermerait une boucle trop tôt : il resterait d’autres traits ou des chiffres non satisfaits en dehors. Il reste donc vide." });
    if (!all) return out;
  }
  return out;
}
function bcComponents(n, st) {
  const g = bcGeo(n), V = (n + 1) * (n + 1), id = new Array(V).fill(-1), size = [], closed = [];
  for (let v = 0; v < V; v++) {
    if (id[v] >= 0 || !g.ve[v].some(e => st[e] === 1)) continue;
    const k = size.length, stack = [v]; id[v] = k; let edges = 0, verts = 0;
    while (stack.length) {
      const x = stack.pop(); verts++;
      g.ve[x].forEach(e => { if (st[e] !== 1) return; const y = g.ev[e][0] === x ? g.ev[e][1] : g.ev[e][0]; edges++; if (id[y] < 0) { id[y] = k; stack.push(y); } });
    }
    size.push(edges / 2); closed.push(edges / 2 === verts);
  }
  return { id, size, closed };
}
// Applique les règles simples jusqu’au bout ; renvoie false en cas de contradiction.
function bcPropagate(n, clue, st, limit = 400) {
  for (let k = 0; k < limit; k++) {
    const r = bcRules(n, clue, st, false);
    if (r === null) return false;
    if (!r.length) return true;
    st[r[0].e] = r[0].v;
  }
  return true;
}
function bcSteps(n, clue, st, sol, all) {
  const out = (bcRules(n, clue, st, all) || []).filter(x => !sol || (sol[x.e] === 1) === (x.v === 1));
  if (out.length) return out;
  // Essai : tracer (ou barrer) ce côté mène à une contradiction
  const g = bcGeo(n);
  for (let e = 0; e < g.E; e++) {
    if (st[e] !== 0) continue;
    for (const v of [1, 2]) {
      const t = st.slice(); t[e] = v;
      if (bcPropagate(n, clue, t)) continue;
      const res = 3 - v;
      if (sol && (sol[e] === 1) !== (res === 1)) continue;
      out.push({ e, v: res, rank: 3, why: [], text: v === 1
        ? "Essayez de tracer le côté entouré : en appliquant les règles (chiffres, points où la boucle passe deux fois au plus, pas de boucle fermée trop tôt), on arrive vite à une contradiction. Ce côté reste donc vide."
        : "Essayez de barrer le côté entouré : en appliquant les règles (chiffres, points où la boucle doit entrer et ressortir), on arrive vite à une contradiction. Ce côté est donc tracé." });
      if (!all) return out;
    }
  }
  return out;
}
function bcSolvable(n, clue, sol) {
  const st = new Array(bcGeo(n).E).fill(0);
  for (let k = 0; k < 600 && st.includes(0); k++) {
    const s = bcSteps(n, clue, st, null, false);
    if (!s.length) return false;
    if ((sol[s[0].e] === 1) !== (s[0].v === 1)) return false;
    st[s[0].e] = s[0].v;
  }
  return !st.includes(0);
}
function bcGenerate(n) {
  for (let t = 0; t < 30; t++) {
    const inS = bcShape(n), sol = bcLoopOf(n, inS), g = bcGeo(n);
    const full = [...Array(n * n)].map((_, c) => g.ce[c].filter(e => sol[e]).length);
    const clue = full.slice();
    if (!bcSolvable(n, clue, sol)) continue;
    for (const c of shuffle([...Array(n * n).keys()])) {
      const k = clue[c]; clue[c] = -1;
      if (!bcSolvable(n, clue, sol)) clue[c] = k;
    }
    return { clue, sol };
  }
  return null;
}

/* ---------- Partie ---------- */
// cfg (parcours, défi) : { size: 5 | 6 | 7 }
function initBoucle(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) bcN = cfg.size;
  else if (resumeFreeSize("boucle")) bcN = resumeFreeSize("boucle");
  setActiveChips("boucle", bcN);
  bcDone = false; bcUndo = []; hintReset("boucle");
  const snap = resumeTake("boucle", playCtx(bcN));
  if (snap) ({ clue: bcClue, sol: bcSol, ed: bcEd, hints: bcHints, errors: bcErrors } = snap);
  else {
    let p = bcN === 7 && typeof BC_BANK7 !== "undefined" ? bcFromBank(7) : null;
    while (!p) p = bcGenerate(bcN);
    bcClue = p.clue; bcSol = p.sol; bcEd = new Array(bcGeo(bcN).E).fill(0); bcHints = 0; bcErrors = 0;
  }
  renderBoucle();
}
function saveBoucle() { resumeSave("boucle", playCtx(bcN), { clue: bcClue, sol: bcSol, ed: bcEd, hints: bcHints, errors: bcErrors }); }
function newBoucle() { resumeClear("boucle"); initBoucle(); }
function bcIsWrong(e) { return (bcEd[e] === 1 && !bcSol[e]) || (bcEd[e] === 2 && bcSol[e]); }
function bcHintValid(h) { const e = +h.key.slice(1); return h.wrong ? bcIsWrong(e) : bcEd[e] === 0; }
function renderBoucle() {
  const n = bcN, g = bcGeo(n), S = 48, P = 14, W = n * S + 2 * P;
  hintPanel("boucle", "bc-explain", bcHintValid);
  const H = hintGet("boucle");
  const xy = v => [P + (v % (n + 1)) * S, P + Math.floor(v / (n + 1)) * S];
  let lines = "", hits = "", crosses = "", marks = "";
  for (let e = 0; e < g.E; e++) {
    const [a, b] = g.ev[e], [x1, y1] = xy(a), [x2, y2] = xy(b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const hk = hintCls("boucle", "e" + e);
    if (bcEd[e] === 1) lines += `<line class="bc-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    if (bcEd[e] === 2) crosses += `<path class="bc-x" d="M${mx - 4} ${my - 4}l8 8M${mx + 4} ${my - 4}l-8 8"/>`;
    if (hk) marks += `<line class="bc-hint${hk.includes("wrong") ? " wrong" : hk.includes("why") ? " why" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    hits += `<line class="bc-hit" data-e="${e}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }
  let nums = "";
  for (let c = 0; c < n * n; c++) {
    const x = P + (c % n) * S + S / 2, y = P + Math.floor(c / n) * S + S / 2;
    if (H && H.stage >= 2 && H.why.includes("c" + c)) nums += `<rect class="bc-why" x="${x - S / 2 + 3}" y="${y - S / 2 + 3}" width="${S - 6}" height="${S - 6}" rx="6"/>`;
    if (bcClue[c] < 0) continue;
    const L = g.ce[c].filter(e => bcEd[e] === 1).length, U = g.ce[c].filter(e => bcEd[e] === 0).length, st = L > bcClue[c] ? "over" : L === bcClue[c] && (L > 0 || !U) ? "ok" : "";
    nums += `<text class="bc-num ${st}" x="${x}" y="${y}">${bcClue[c]}</text>`;
  }
  let dots = "";
  for (let v = 0; v < (n + 1) * (n + 1); v++) {
    const [x, y] = xy(v), why = H && H.stage >= 2 && H.why.includes("p" + v);
    dots += why ? `<circle class="bc-why-dot" cx="${x}" cy="${y}" r="7"/>` : "";
    dots += `<circle class="bc-dot" cx="${x}" cy="${y}" r="2.6"/>`;
  }
  $("bc-board").innerHTML = `<svg viewBox="0 0 ${W} ${W}" style="width:min(100%, ${Math.min(560, n * 74)}px)">${nums}${marks}${lines}${crosses}${dots}${hits}</svg>`;
  const left = bcSol.filter((v, e) => v && bcEd[e] !== 1).length;
  $("bc-info").textContent = bcDone ? "" : `Touchez un côté : trait, puis croix, puis vide.`;
}
function tapBoucle(e) {
  if (bcDone) return;
  bcUndo.push(bcEd.slice()); if (bcUndo.length > 400) bcUndo.shift();
  bcEd[e] = (bcEd[e] + 1) % 3;
  sfx("tick"); renderBoucle(); saveBoucle(); checkBoucle();
}
function undoBoucle() {
  if (bcDone) return;
  const u = bcUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  bcEd = u; sfx("tick"); renderBoucle(); saveBoucle();
}
function boucleReason() {
  const s = bcSteps(bcN, bcClue, bcEd.slice(), bcSol, true);
  if (!s.length) return null;
  // À difficulté égale, on préfère montrer un trait à tracer
  const best = Math.min(...s.map(x => x.rank)), pool0 = s.filter(x => x.rank === best), pool = pool0.some(x => x.v === 1) ? pool0.filter(x => x.v === 1) : pool0;
  const r = pool[Math.floor(Math.random() * pool.length)];
  return { rank: r.rank, key: "e" + r.e, why: r.why, text: r.text, msg: r.v === 1 ? "Un trait se déduit ici. Touchez encore Indice pour l’explication." : "Un côté vide se déduit ici. Touchez encore Indice pour l’explication." };
}
function hintBoucle() {
  if (bcDone) return;
  hintFlow("boucle", {
    valid: bcHintValid,
    wrong: () => { const e = bcEd.findIndex((v, k) => bcIsWrong(k)); return e < 0 ? null : { key: "e" + e, msg: bcEd[e] === 1 ? "Ce trait est faux. Touchez encore Indice pour l’effacer." : "Cette croix est fausse. Touchez encore Indice pour l’effacer." }; },
    find: boucleReason,
    fallback: () => { const e = bcSol.findIndex((v, k) => v && bcEd[k] !== 1); return e < 0 ? null : { key: "e" + e, why: [], text: "Ce trait se déduit en combinant plusieurs chiffres." }; },
    clear: h => { bcUndo.push(bcEd.slice()); bcEd[+h.key.slice(1)] = 0; saveBoucle(); },
    place: h => { const e = +h.key.slice(1); bcUndo.push(bcEd.slice()); bcEd[e] = bcSol[e] ? 1 : 2; saveBoucle(); },
    count: () => { bcHints++; saveBoucle(); },
    render: () => { renderBoucle(); checkBoucle(); },
  });
}
function checkBoucle() {
  if (bcDone) return;
  const n = bcN, g = bcGeo(n), on = bcEd.map(v => v === 1 ? 1 : 0);
  if (!on.some(Boolean)) return;
  // Une seule boucle fermée, et tous les chiffres respectés
  const degOk = g.ve.every(es => { const d = es.filter(e => on[e]).length; return d === 0 || d === 2; });
  if (!degOk) return;
  const comp = bcComponents(n, on);
  if (comp.size.length !== 1) return;
  if (!bcClue.every((k, c) => k < 0 || g.ce[c].filter(e => on[e]).length === k)) {
    bcErrors++; addPoints(-3); sfx("bad"); saveBoucle();
    toast("La boucle est fermée, mais certains chiffres ne sont pas respectés");
    return;
  }
  bcDone = true;
  resumeClear("boucle");
  bcEd = bcEd.map(v => v === 1 ? 1 : 0); renderBoucle();
  const pts = BC_PTS[n];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("boucle", n);
  save();
  const stars = !bcHints && !bcErrors ? 3 : bcHints <= 2 && bcErrors <= 1 ? 2 : 1;
  later(() => winGame("Boucle bouclée", `Grille ${n}×${n} terminée${bcHints ? `, avec ${bcHints} indice${bcHints > 1 ? "s" : ""}` : " sans indice"}. +${pts} points`, pts, stars), 600);
}

LQ.register({
  id: "boucle",
  title: "Boucle",
  desc: "Une seule boucle autour des chiffres",
  hue: "#7fb6e8",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initBoucle,
  levelInfo: cfg => ({
    what: `Une boucle à tracer sur une grille ${cfg.size}×${cfg.size}`,
    goals: ["Sans indice ni erreur", "Au plus deux indices et une erreur", "Terminer la boucle"],
  }),
  rules: [
    "Tracez une seule boucle fermée en reliant les points par des traits horizontaux et verticaux.",
    "Chaque chiffre indique combien des quatre côtés de sa case font partie de la boucle. Une case sans chiffre peut en avoir n’importe quel nombre.",
    "La boucle ne se croise pas et ne passe jamais deux fois par le même point.",
    "Touchez un côté : un trait, puis une croix (côté que vous savez vide), puis rien. Un chiffre passe au gris quand il est satisfait, au rouge s’il a trop de traits.",
    "<b>Indice</b> montre d’abord le prochain côté à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour le tracer ou le barrer.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="5" onclick="bcN=5;newBoucle()">Facile · 5×5</button>
      <button class="chip" data-b="6" onclick="bcN=6;newBoucle()">Moyen · 6×6</button>
      <button class="chip" data-b="7" onclick="bcN=7;newBoucle()">Difficile · 7×7</button>
    </div>
    <div class="board-wrap">
      <div class="bc-board" id="bc-board"></div>
      <p class="hint-line" id="bc-info"></p>
      <p class="hint-explain" id="bc-explain" aria-live="polite"></p>
      <div class="toolbar">
        <button class="btn ghost small" onclick="undoBoucle()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintBoucle()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newBoucle()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Une seule boucle fermée ; chaque chiffre compte les côtés tracés de sa case.</p>`,
  setup() {
    $("bc-board").addEventListener("click", e => { const h = e.target.closest(".bc-hit"); if (h) tapBoucle(+h.dataset.e); });
    window.addEventListener("resize", () => { if (currentGame === "boucle" && bcSol.length) renderBoucle(); });
  },
});
