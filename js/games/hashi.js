/* ============================================================
   Hashi — relier les îles par des ponts
   Chaque île porte le nombre de ponts qui en partent. Les ponts
   sont droits, horizontaux ou verticaux, simples ou doubles, ne se
   croisent pas, et toutes les îles finissent reliées entre elles.
   Grilles générées à solution unique.
   ============================================================ */
const HS_SIZES = { 7: 9, 9: 15, 11: 22 }; // taille → nombre d’îles visé
const HS_PTS = { 7: 50, 9: 100, 11: 170 };
let hsN = 7, hsIsl = [], hsEdges = [], hsSol = [], hsCur = [], hsSel = -1, hsUndo = [], hsHints = 0, hsErrors = 0, hsDone = false, hsFlash = -1;
// hsIsl : [{r, c, n}] · hsEdges : [{a, b, cells: [index de case]}] entre îles voisines alignées

/* ---------- Génération ---------- */
function hsNeighbours(n, isl) {
  const at = new Map(isl.map((s, i) => [s.r * n + s.c, i]));
  const edges = [];
  isl.forEach((s, a) => {
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const cells = [];
      let r = s.r + dr, c = s.c + dc;
      while (r < n && c < n && !at.has(r * n + c)) { cells.push(r * n + c); r += dr; c += dc; }
      if (r < n && c < n && at.has(r * n + c)) edges.push({ a, b: at.get(r * n + c), cells, dir: dr ? "v" : "h" });
    }
  });
  // Paires de ponts qui se croiseraient
  edges.forEach(e => { e.cross = []; });
  edges.forEach((e, i) => edges.forEach((f, j) => {
    if (j <= i || e.dir === f.dir) return;
    if (e.cells.some(x => f.cells.includes(x))) { e.cross.push(j); f.cross.push(i); }
  }));
  return edges;
}
function hsBuild(n, target) {
  const occ = new Array(n * n).fill(0); // 1 = île, 2 = pont
  const isl = [], bridges = [];
  const free = (r, c) => r >= 0 && c >= 0 && r < n && c < n && !occ[r * n + c];
  const nearIsland = (r, c) => [[0, 1], [1, 0], [0, -1], [-1, 0]].some(([dr, dc]) => { const rr = r + dr, cc = c + dc; return rr >= 0 && cc >= 0 && rr < n && cc < n && occ[rr * n + cc] === 1; });
  const add = (r, c) => { occ[r * n + c] = 1; isl.push({ r, c, n: 0 }); return isl.length - 1; };
  add(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
  for (let tries = 0; tries < 4000 && isl.length < target; tries++) {
    const a = Math.floor(Math.random() * isl.length), s = isl[a];
    const [dr, dc] = [[0, 1], [1, 0], [0, -1], [-1, 0]][Math.floor(Math.random() * 4)];
    const len = 2 + Math.floor(Math.random() * Math.max(1, n / 2 - 1));
    const path = [];
    let ok = true;
    for (let k = 1; k < len; k++) { const r = s.r + dr * k, c = s.c + dc * k; if (!free(r, c)) { ok = false; break; } path.push(r * n + c); }
    const r = s.r + dr * len, c = s.c + dc * len;
    if (!ok || !free(r, c) || nearIsland(r, c)) continue;
    const b = add(r, c);
    path.forEach(x => { occ[x] = 2; });
    bridges.push({ a, b, v: Math.random() < .35 ? 2 : 1 });
  }
  if (isl.length < target * .8) return null;
  // Quelques ponts en plus entre îles déjà alignées (boucles)
  const edges = hsNeighbours(n, isl);
  const key = (a, b) => Math.min(a, b) + "-" + Math.max(a, b);
  const val = new Map(bridges.map(x => [key(x.a, x.b), x.v]));
  edges.forEach(e => {
    if (val.has(key(e.a, e.b)) || Math.random() > .3) return;
    if (e.cells.some(x => occ[x])) return;
    e.cells.forEach(x => { occ[x] = 2; });
    val.set(key(e.a, e.b), Math.random() < .3 ? 2 : 1);
  });
  const sol = edges.map(e => val.get(key(e.a, e.b)) || 0);
  edges.forEach((e, i) => { isl[e.a].n += sol[i]; isl[e.b].n += sol[i]; });
  return { isl, edges, sol };
}
// Compte les solutions (jusqu’à 2)
function hsCount(isl, edges, limit = 2) {
  const m = edges.length, val = new Array(m).fill(-1), sum = isl.map(() => 0);
  const inc = isl.map(() => []);
  edges.forEach((e, i) => { inc[e.a].push(i); inc[e.b].push(i); });
  let count = 0, steps = 0;
  const capOf = i => { // ponts encore possibles autour de l’île i
    let cap = 0;
    for (const j of inc[i]) if (val[j] < 0 && !edges[j].cross.some(k => val[k] > 0)) cap += 2;
    return cap;
  };
  function connected() {
    const seen = new Set([0]), st = [0];
    while (st.length) { const i = st.pop(); for (const j of inc[i]) if (val[j] > 0) { const o = edges[j].a === i ? edges[j].b : edges[j].a; if (!seen.has(o)) { seen.add(o); st.push(o); } } }
    return seen.size === isl.length;
  }
  function dfs(k) {
    if (count >= limit) return;
    if (++steps > 200000) { count = limit; return; }
    if (k === m) { if (isl.every((s, i) => sum[i] === s.n) && connected()) count++; return; }
    const e = edges[k];
    for (let v = 0; v <= 2; v++) {
      if (v > 0 && e.cross.some(j => val[j] > 0)) break;
      if (sum[e.a] + v > isl[e.a].n || sum[e.b] + v > isl[e.b].n) break;
      val[k] = v; sum[e.a] += v; sum[e.b] += v;
      // Chaque île doit encore pouvoir atteindre son nombre
      if (isl[e.a].n - sum[e.a] <= capOf(e.a) && isl[e.b].n - sum[e.b] <= capOf(e.b) && e.cross.every(j => val[j] >= 0 || isl[edges[j].a].n - sum[edges[j].a] <= capOf(edges[j].a))) dfs(k + 1);
      val[k] = -1; sum[e.a] -= v; sum[e.b] -= v;
    }
  }
  dfs(0);
  return count;
}
function hsGenerate(n) {
  let last = null;
  for (let t = 0; t < 40; t++) {
    const p = hsBuild(n, HS_SIZES[n]);
    if (!p) continue;
    last = p;
    if (hsCount(p.isl, p.edges) === 1) return p;
  }
  return last;
}

/* ---------- Partie ---------- */
// cfg (parcours) : { size: 7 | 9 | 11 }
function initHashi(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) hsN = cfg.size;
  else if (resumeFreeSize("hashi")) hsN = resumeFreeSize("hashi");
  setActiveChips("hashi", hsN);
  hsSel = -1; hsDone = false; hsUndo = []; hsFlash = -1; hintReset("hashi");
  const snap = resumeTake("hashi", playCtx(hsN));
  if (snap) ({ isl: hsIsl, edges: hsEdges, sol: hsSol, cur: hsCur, hints: hsHints, errors: hsErrors } = snap);
  else {
    let p = null;
    while (!p) p = hsGenerate(hsN);
    hsIsl = p.isl; hsEdges = p.edges; hsSol = p.sol; hsCur = p.sol.map(() => 0); hsHints = 0; hsErrors = 0;
  }
  renderHashi();
}
function saveHashi() { resumeSave("hashi", playCtx(hsN), { isl: hsIsl, edges: hsEdges, sol: hsSol, cur: hsCur, hints: hsHints, errors: hsErrors }); }
function newHashi() { resumeClear("hashi"); initHashi(); }
function hsSums() { const s = hsIsl.map(() => 0); hsEdges.forEach((e, i) => { s[e.a] += hsCur[i]; s[e.b] += hsCur[i]; }); return s; }
function renderHashi() {
  const n = hsN, S = 40, W = n * S, sums = hsSums();
  const px = s => [s.c * S + S / 2, s.r * S + S / 2];
  const near = hsSel >= 0 ? new Set(hsEdges.filter(e => e.a === hsSel || e.b === hsSel).map(e => (e.a === hsSel ? e.b : e.a))) : new Set();
  let lines = "", hits = "";
  hsEdges.forEach((e, i) => {
    const [x1, y1] = px(hsIsl[e.a]), [x2, y2] = px(hsIsl[e.b]), v = hsCur[i];
    const cls = i === hsFlash ? "hs-br flash" : "hs-br";
    if (v === 1) lines += `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    if (v === 2) {
      const [ox, oy] = e.dir === "h" ? [0, 4] : [4, 0];
      lines += `<line class="${cls}" x1="${x1 - ox}" y1="${y1 - oy}" x2="${x2 - ox}" y2="${y2 - oy}"/><line class="${cls}" x1="${x1 + ox}" y1="${y1 + oy}" x2="${x2 + ox}" y2="${y2 + oy}"/>`;
    }
    if (v) hits += `<line class="hs-hit" data-e="${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  });
  hintPanel("hashi", "hs-explain", hsHintValid);
  const H = hintGet("hashi");
  if (H) { const e = hsEdges[+H.key.slice(1)], [x1, y1] = px(hsIsl[e.a]), [x2, y2] = px(hsIsl[e.b]); lines += `<line class="hs-hint ${H.wrong ? "wrong" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }
  const dots = Array.from({ length: n * n }, (_, k) => `<circle class="hs-dot" cx="${(k % n) * S + S / 2}" cy="${Math.floor(k / n) * S + S / 2}" r="1.6"/>`).join("");
  const islands = hsIsl.map((s, i) => {
    const [x, y] = px(s), st = sums[i] === s.n ? "ok" : sums[i] > s.n ? "over" : "";
    return `<g class="hs-isl ${st} ${i === hsSel ? "sel" : ""} ${near.has(i) ? "near" : ""}${hintCls("hashi", "i" + i)}" data-i="${i}"><circle cx="${x}" cy="${y}" r="${S * .4}"/><text x="${x}" y="${y}">${s.n}</text></g>`;
  }).join("");
  $("hs-board").innerHTML = `<svg viewBox="0 0 ${W} ${W}" style="width:min(100%, ${Math.min(560, n * 52)}px)">${dots}${lines}${hits}${islands}</svg>`;
  const left = hsIsl.filter((s, i) => sums[i] !== s.n).length;
  $("hs-info").textContent = hsSel >= 0 ? "Touchez une île voisine pour poser ou retirer un pont." : left ? `${left} île${left > 1 ? "s" : ""} à compléter` : "";
}
function hsEdgeBetween(a, b) { return hsEdges.findIndex(e => (e.a === a && e.b === b) || (e.a === b && e.b === a)); }
function cycleHashi(i) {
  const e = hsEdges[i];
  const next = (hsCur[i] + 1) % 3;
  if (next > 0 && e.cross.some(j => hsCur[j] > 0)) { sfx("bad"); toast("Un pont ne peut pas en croiser un autre"); return; }
  hsUndo.push(hsCur.slice()); if (hsUndo.length > 300) hsUndo.shift();
  hsCur[i] = next; hsFlash = -1;
  sfx("tick"); renderHashi(); saveHashi(); checkHashi();
}
function tapIsland(i) {
  if (hsDone) return;
  if (hsSel < 0 || hsSel === i) { hsSel = hsSel === i ? -1 : i; sfx("tick"); renderHashi(); return; }
  const k = hsEdgeBetween(hsSel, i);
  if (k < 0) { hsSel = i; sfx("tick"); renderHashi(); return; }
  cycleHashi(k);
}
function undoHashi() {
  if (hsDone) return;
  const u = hsUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  hsCur = u; hsFlash = -1; sfx("tick"); renderHashi(); saveHashi();
}
/* ---------- Indice expliqué ----------
   Pour une île, on compare les ponts qui lui manquent à ce que ses voisines
   peuvent encore recevoir. Si sans une voisine le compte n’y est pas, au moins
   un pont va forcément vers elle. */
function hsDir(e, i) {
  const o = hsIsl[e.a === i ? e.b : e.a], s = hsIsl[i];
  return o.r < s.r ? "en haut" : o.r > s.r ? "en bas" : o.c < s.c ? "à gauche" : "à droite";
}
function hashiReason() {
  const sums = hsSums(), need = hsIsl.map((s, i) => s.n - sums[i]), found = [];
  const extra = (k, i) => {
    const e = hsEdges[k], o = e.a === i ? e.b : e.a;
    if (hsCur[k] === 0 && e.cross.some(j => hsCur[j] > 0)) return 0;
    return Math.max(0, Math.min(2 - hsCur[k], need[o]));
  };
  hsIsl.forEach((s, i) => {
    if (need[i] <= 0) return;
    const inc = hsEdges.map((e, k) => k).filter(k => hsEdges[k].a === i || hsEdges[k].b === i);
    const cap = inc.reduce((t, k) => t + extra(k, i), 0);
    inc.forEach(k => {
      const x = extra(k, i), add = need[i] - (cap - x);
      if (x <= 0 || add <= 0) return;
      const val = hsCur[k] + add;
      if (val > hsSol[k]) return;
      const e = hsEdges[k], o = e.a === i ? e.b : e.a, dir = hsDir(e, i);
      const what = add === 2 ? "deux ponts" : "un pont";
      const besoin = need[i] > 1 ? `de ${need[i]} ponts` : "d’un pont";
      const text = cap === x
        ? `L’île ${s.n} entourée en bleu a encore besoin ${besoin}, et il ne lui reste qu’une voisine possible : l’île ${hsIsl[o].n} ${dir}. Il faut donc ${what} vers elle (en pointillés).`
        : cap === need[i]
        ? `L’île ${s.n} entourée en bleu a encore besoin ${besoin}, et ses voisines ne peuvent pas lui en donner plus de ${cap} en tout. Il faut donc prendre tous les ponts possibles, dont ${what} vers l’île ${hsIsl[o].n} ${dir} (en pointillés).`
        : `L’île ${s.n} entourée en bleu a encore besoin ${besoin}. Sans l’île ${hsIsl[o].n} ${dir}, ses autres voisines ne peuvent lui en donner que ${cap - x > 1 ? cap - x : "un"} au plus. Il faut donc au moins ${what} vers l’île ${hsIsl[o].n} (en pointillés).`;
      found.push({ rank: cap === need[i] ? 0 : 1, key: "e" + k, val, why: ["i" + i], text });
    });
  });
  if (!found.length) return null;
  const best = Math.min(...found.map(f => f.rank)), pool = found.filter(f => f.rank === best);
  return pool[Math.floor(Math.random() * pool.length)];
}
function hsHintValid(h) { const k = +h.key.slice(1); return h.wrong ? hsCur[k] > hsSol[k] : hsCur[k] < h.val; }
function hintHashi() {
  if (hsDone) return;
  hintFlow("hashi", {
    valid: hsHintValid,
    wrong: () => { const k = hsCur.findIndex((v, q) => v > hsSol[q]); return k < 0 ? null : { key: "e" + k, msg: "Ce pont est de trop. Touchez encore Indice pour le retirer." }; },
    find: hashiReason,
    fallback: () => {
      const k = hsCur.findIndex((v, q) => v < hsSol[q]);
      if (k < 0) return null;
      return { key: "e" + k, val: hsSol[k], why: [], text: "Ce pont se déduit en combinant plusieurs îles, et la règle qui veut que tout l’archipel forme un seul réseau : sans lui, un groupe d’îles resterait isolé." };
    },
    clear: h => { hsUndo.push(hsCur.slice()); hsCur[+h.key.slice(1)] = 0; saveHashi(); },
    place: h => {
      const k = +h.key.slice(1);
      hsUndo.push(hsCur.slice());
      hsEdges[k].cross.forEach(j => { if (hsCur[j] > hsSol[j]) hsCur[j] = hsSol[j]; });
      hsCur[k] = h.val; hsFlash = k; hsSel = -1; saveHashi();
    },
    count: () => { hsHints++; saveHashi(); },
    render: () => { renderHashi(); checkHashi(); },
  });
}
function checkHashi() {
  if (hsDone) return;
  const sums = hsSums();
  if (!hsIsl.every((s, i) => sums[i] === s.n)) return;
  // Toutes les îles sont complètes : le réseau doit être d’un seul tenant
  const seen = new Set([0]), st = [0];
  while (st.length) { const i = st.pop(); hsEdges.forEach((e, k) => { if (!hsCur[k]) return; const o = e.a === i ? e.b : e.b === i ? e.a : -1; if (o >= 0 && !seen.has(o)) { seen.add(o); st.push(o); } }); }
  if (seen.size !== hsIsl.length) {
    hsErrors++; addPoints(-3); sfx("bad"); saveHashi();
    toast("Toutes les îles sont pleines, mais elles ne forment pas un seul réseau");
    return;
  }
  hsDone = true;
  resumeClear("hashi");
  const pts = HS_PTS[hsN];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("hashi", hsN);
  save();
  const stars = !hsHints && !hsErrors ? 3 : hsHints <= 2 && hsErrors <= 1 ? 2 : 1;
  later(() => winGame("Archipel relié", `${hsIsl.length} îles reliées${hsHints ? `, avec ${hsHints} indice${hsHints > 1 ? "s" : ""}` : " sans indice"}. +${pts} points`, pts, stars), 600);
}

LQ.register({
  id: "hashi",
  title: "Hashi",
  desc: "Relier les îles par des ponts",
  hue: "#6fb3e8",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initHashi,
  levelInfo: cfg => ({
    what: `Un archipel de hashi ${cfg.size}×${cfg.size}`,
    goals: ["Sans indice ni erreur", "Au plus deux indices", "Relier tout l’archipel"],
  }),
  rules: [
    "Chaque île indique le nombre de ponts qui doivent en partir.",
    "Les ponts sont droits, horizontaux ou verticaux, et relient deux îles voisines. Entre deux îles, il y a 0, 1 ou 2 ponts.",
    "Les ponts ne se croisent jamais, et à la fin toutes les îles doivent être reliées en un seul réseau.",
    "Touchez une île, puis une île voisine : 1 pont, puis 2, puis aucun. Toucher un pont le fait aussi changer. Une île complète passe au vert.",
    "<b>Indice</b> montre d’abord le prochain pont à déduire, en pointillés ; touchez-le encore pour l’explication, puis une troisième fois pour le poser.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="7" onclick="hsN=7;newHashi()">Facile · 7×7</button>
      <button class="chip" data-b="9" onclick="hsN=9;newHashi()">Moyen · 9×9</button>
      <button class="chip" data-b="11" onclick="hsN=11;newHashi()">Difficile · 11×11</button>
    </div>
    <div class="board-wrap">
      <div class="hs-board" id="hs-board"></div>
      <p class="hint-line" id="hs-info"></p>
      <p class="hint-explain" id="hs-explain" aria-live="polite"></p>
      <div class="toolbar">
        <button class="btn ghost small" onclick="undoHashi()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintHashi()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newHashi()">${ICONS.refresh} Nouvel archipel</button>
      </div>
    </div>
    <p class="hint-line">Touchez une île puis sa voisine pour poser un pont. Recommencez pour le doubler, puis une troisième fois pour l’enlever.</p>`,
  setup() {
    $("hs-board").addEventListener("click", e => {
      const g = e.target.closest(".hs-isl");
      if (g) { tapIsland(+g.dataset.i); return; }
      const h = e.target.closest(".hs-hit");
      if (h && !hsDone) { hsSel = -1; cycleHashi(+h.dataset.e); return; }
      if (hsSel >= 0) { hsSel = -1; renderHashi(); }
    });
  },
});
