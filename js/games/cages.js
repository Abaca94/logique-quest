/* ============================================================
   Cages de calcul — carré latin découpé en cages
   Chaque chiffre de 1 à n apparaît une fois par ligne et par colonne ;
   les chiffres d’une cage donnent le résultat indiqué avec l’opération
   indiquée (+, −, ×, ÷). Les grilles générées se résolvent toujours
   pas à pas, avec des raisonnements que l’indice sait expliquer.
   ============================================================ */
const CG_SIZES = [4, 5, 6];
const CG_PTS = { 4: 40, 5: 90, 6: 160 };
let cgN = 4, cgSol = [], cgCages = [], cgCageOf = [], cgGrid = [], cgGiven = [], cgNotes = [], cgSel = -1, cgNoteMode = false;
let cgUndo = [], cgErrors = 0, cgHints = 0, cgDone = false;

/* ---------- Cages ---------- */
function cgLabel(k) { const c = cgCages[k]; return c.op === "=" ? String(c.t) : `${c.t}${c.op}`; }
function cgFits(op, t, vals) {
  if (op === "=") return vals[0] === t;
  if (op === "+") return vals.reduce((a, v) => a + v, 0) === t;
  if (op === "×") return vals.reduce((a, v) => a * v, 1) === t;
  const [a, b] = vals, hi = Math.max(a, b), lo = Math.min(a, b);
  return op === "−" ? hi - lo === t : hi === lo * t;
}
// Cages au hasard (1 à 4 cases), opération tirée selon la taille et les chiffres.
function cgMakeCages(n, sol) {
  const own = new Array(n * n).fill(-1), cages = [];
  for (const start of shuffle([...Array(n * n).keys()])) {
    if (own[start] >= 0) continue;
    const r = Math.random(), size = r < .08 ? 1 : r < .58 ? 2 : r < .9 ? 3 : 4;
    const cells = [start]; own[start] = cages.length;
    while (cells.length < size) {
      const opts = [];
      cells.forEach(i => [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        const rr = Math.floor(i / n) + dr, cc = i % n + dc, j = rr * n + cc;
        if (rr >= 0 && cc >= 0 && rr < n && cc < n && own[j] < 0 && !opts.includes(j)) opts.push(j);
      }));
      if (!opts.length) break;
      const j = opts[Math.floor(Math.random() * opts.length)];
      own[j] = cages.length; cells.push(j);
    }
    const v = cells.map(i => sol[i]);
    let op, t;
    if (cells.length === 1) { op = "="; t = v[0]; }
    else if (cells.length === 2) {
      const hi = Math.max(...v), lo = Math.min(...v), q = Math.random();
      if (hi % lo === 0 && q < .35) { op = "÷"; t = hi / lo; }
      else if (q < .6) { op = "−"; t = hi - lo; }
      else if (q < .8) { op = "+"; t = hi + lo; }
      else { op = "×"; t = hi * lo; }
    } else if (Math.random() < .55) { op = "+"; t = v.reduce((a, x) => a + x, 0); }
    else { op = "×"; t = v.reduce((a, x) => a * x, 1); }
    cages.push({ cells, op, t });
  }
  return { cages, own };
}

/* ---------- Raisonnement pas à pas (génération et indices) ---------- */
// Chiffres permis par la ligne et la colonne
function cgBase(n, g, i) {
  const r = Math.floor(i / n), c = i % n, used = new Set();
  for (let k = 0; k < n; k++) { used.add(g[r * n + k]); used.add(g[k * n + c]); }
  return [...Array(n)].map((_, k) => k + 1).filter(v => !used.has(v));
}
// Pour chaque case vide d’une cage : chiffres qui apparaissent dans au moins une
// façon de la compléter (chiffres permis par ligne et colonne, pas de doublon
// sur une même ligne ou colonne à l’intérieur de la cage).
function cgCageAllowed(n, g, cage, base) {
  const empty = cage.cells.filter(i => !g[i]), fixed = cage.cells.filter(i => g[i]).map(i => g[i]);
  const allow = new Map(empty.map(i => [i, new Set()])), cur = [];
  const combos = new Set();
  (function rec(k) {
    if (k === empty.length) {
      if (!cgFits(cage.op, cage.t, [...fixed, ...cur])) return;
      empty.forEach((i, q) => allow.get(i).add(cur[q]));
      combos.add([...fixed, ...cur].sort((a, b) => cage.op === "−" || cage.op === "÷" ? b - a : a - b).join(cage.op === "=" ? "" : cage.op));
      return;
    }
    const i = empty[k], r = Math.floor(i / n), c = i % n;
    for (const v of base.get(i)) {
      if (empty.slice(0, k).some((j, q) => cur[q] === v && (Math.floor(j / n) === r || j % n === c))) continue;
      cur.push(v); rec(k + 1); cur.pop();
    }
  })(0);
  return { allow, combos: [...combos] };
}
// Prochaine déduction : { i, v, rank, why, text }. sol sert à écarter une grille fausse.
function cgSteps(n, g, cages, own, sol, firstOnly) {
  const empty = [...g.keys()].filter(i => !g[i]);
  const base = new Map(empty.map(i => [i, cgBase(n, g, i)]));
  const cageInfo = cages.map(cage => cage.cells.some(i => !g[i]) ? cgCageAllowed(n, g, cage, base) : null);
  const D = new Map(empty.map(i => [i, base.get(i).filter(v => cageInfo[own[i]].allow.get(i).has(v))]));
  const out = [];
  const add = (rank, i, v, why, text) => { if (!sol || sol[i] === v) out.push({ rank, i, v, why: [...new Set(why)], text }); };
  const rc = i => [Math.floor(i / n), i % n];
  for (const i of empty) {
    const cage = cages[own[i]], left = cage.cells.filter(j => !g[j]);
    const d = D.get(i);
    if (left.length === 1 && d.length === 1) {
      const others = cage.cells.filter(j => j !== i).map(j => g[j]);
      const sumTxt = others.length > 1 ? `${others.join(" + ")} font ${others.reduce((a, v) => a + v, 0)}` : `l’autre case vaut ${others[0]}`;
      const prodTxt = others.length > 1 ? `${others.join(" × ")} font ${others.reduce((a, v) => a * v, 1)}` : `l’autre case vaut ${others[0]}`;
      const how = cage.op === "+" ? `${sumTxt}, il manque ${d[0]} pour arriver à ${cage.t}`
        : cage.op === "×" ? `${prodTxt}, il faut multiplier par ${d[0]} pour arriver à ${cage.t}`
        : (() => {
          const o = others[0], c2 = (cage.op === "−" ? [o + cage.t, o - cage.t] : [o * cage.t, o / cage.t]).filter(x => Number.isInteger(x) && x >= 1 && x <= n);
          const rel = cage.op === "−" ? `un écart de ${cage.t}` : `un rapport de ${cage.t}`;
          return c2.length > 1 ? `l’autre case vaut ${o} ; avec ${rel}, ce serait ${c2.join(" ou ")}, et seul le ${d[0]} est encore libre sur sa ligne et sa colonne` : `l’autre case vaut ${o} ; avec ${rel}, seul le ${d[0]} est possible`;
        })();
      add(0, i, d[0], cage.cells.filter(j => j !== i), `C’est la dernière case vide de la cage « ${cage.op === "=" ? cage.t : cage.t + cage.op} » : ${how}. C’est donc un <b>${d[0]}</b>.`);
      continue;
    }
    const b = base.get(i);
    const [r, c] = rc(i), rowV = [], colV = [], why = [];
    for (let k = 0; k < n; k++) if (g[r * n + k]) { rowV.push(g[r * n + k]); why.push(r * n + k); }
    for (let k = 0; k < n; k++) if (g[k * n + c] && !rowV.includes(g[k * n + c])) { colV.push(g[k * n + c]); why.push(k * n + c); }
    const parts = [];
    if (rowV.length) parts.push(`sa ligne contient déjà ${frList(rowV.sort((x, y) => x - y))}`);
    if (colV.length) parts.push(`${parts.length ? "" : "sa colonne contient déjà "}${parts.length ? "sa colonne " : ""}${frList(colV.sort((x, y) => x - y))}`);
    if (b.length === 1) { add(1, i, b[0], why, `Pour la case entourée, ${parts.join(", ")}. Il ne reste que le <b>${b[0]}</b>.`); continue; }
    if (d.length === 1) {
      const cg = cageInfo[own[i]], lab = cage.t + cage.op;
      const combos = cg.combos.slice(0, 4).map(s => s.replace(/([+×−÷])/g, " $1 "));
      add(2, i, d[0], cage.cells.filter(j => j !== i), `La cage « ${lab} » (${cage.cells.length} cases) ne peut se compléter que par ${frList(combos)}${cg.combos.length > 4 ? " …" : ""}, sans répéter un chiffre sur une ligne ou une colonne. Dans toutes ces combinaisons, seul le <b>${d[0]}</b> convient à la place de la case entourée.`);
    }
  }
  if (!out.length || !firstOnly) {
    for (let k = 0; k < 2 * n; k++) {
      const cells = [...Array(n)].map((_, q) => k < n ? k * n + q : q * n + (k - n)), name = k < n ? `la ligne ${k + 1}` : `la colonne ${k - n + 1}`;
      for (let v = 1; v <= n; v++) {
        if (cells.some(q => g[q] === v)) continue;
        const spots = cells.filter(q => !g[q] && D.get(q).includes(v));
        if (spots.length !== 1) continue;
        const p = spots[0];
        add(3, p, v, cells.filter(q => q !== p && !g[q]), `Dans ${name}, le <b>${v}</b> ne peut aller que dans la case entourée : dans les autres cases vides (en bleu), il est exclu par leur ${k < n ? "colonne" : "ligne"} ou par leur cage.`);
      }
    }
  }
  return out;
}
function cgSolvable(n, sol, cages, own) {
  const g = cages.reduce((a, cage) => { if (cage.op === "=") a[cage.cells[0]] = cage.t; return a; }, new Array(n * n).fill(0));
  let guard = 0;
  while (g.includes(0) && guard++ < 200) {
    const s = cgSteps(n, g, cages, own, null, true);
    if (!s.length) return false;
    const best = s.reduce((a, x) => x.rank < a.rank ? x : a);
    if (best.v !== sol[best.i]) return false;
    g[best.i] = best.v;
  }
  return !g.includes(0);
}
function cgGenerate(n) {
  for (let t = 0; t < 200; t++) {
    const sol = ftLatin(n), { cages, own } = cgMakeCages(n, sol);
    if (cgSolvable(n, sol, cages, own)) return { sol, cages, own };
  }
  return null;
}

/* ---------- Partie ---------- */
// cfg (parcours, défi) : { size: 4 | 5 | 6 }
function initCages(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) cgN = cfg.size;
  else if (resumeFreeSize("cages")) cgN = resumeFreeSize("cages");
  setActiveChips("cages", cgN);
  cgSel = -1; cgDone = false; cgUndo = []; cgNoteMode = false; setCagesNoteBtn(); hintReset("cages");
  const snap = resumeTake("cages", playCtx(cgN));
  if (snap) ({ sol: cgSol, cages: cgCages, own: cgCageOf, grid: cgGrid, given: cgGiven, notes: cgNotes, errors: cgErrors, hints: cgHints } = snap);
  else {
    let p = null;
    while (!p) p = cgGenerate(cgN);
    cgSol = p.sol; cgCages = p.cages; cgCageOf = p.own;
    cgGrid = new Array(cgN * cgN).fill(0); cgGiven = new Array(cgN * cgN).fill(0);
    cgCages.forEach(c => { if (c.op === "=") { cgGrid[c.cells[0]] = c.t; cgGiven[c.cells[0]] = 1; } });
    cgNotes = new Array(cgN * cgN).fill(0); cgErrors = 0; cgHints = 0;
  }
  renderCages(); renderCagesKeys();
}
function saveCages() { resumeSave("cages", playCtx(cgN), { sol: cgSol, cages: cgCages, own: cgCageOf, grid: cgGrid, given: cgGiven, notes: cgNotes, errors: cgErrors, hints: cgHints }); }
function newCages() { resumeClear("cages"); initCages(); }
function setCagesNoteBtn() { const b = $("cg-note-btn"); if (b) b.classList.toggle("toggle-on", cgNoteMode); }
function toggleCagesNotes() { cgNoteMode = !cgNoteMode; setCagesNoteBtn(); sfx("tick"); }
function cgConflicts() {
  const n = cgN, g = cgGrid, bad = new Array(n * n).fill(false);
  for (let i = 0; i < n * n; i++) {
    if (!g[i]) continue;
    const r = Math.floor(i / n), c = i % n;
    for (let k = 0; k < n; k++) {
      if (k !== c && g[r * n + k] === g[i]) bad[i] = true;
      if (k !== r && g[k * n + c] === g[i]) bad[i] = true;
    }
  }
  cgCages.forEach(cage => {
    const v = cage.cells.map(i => g[i]);
    if (v.every(Boolean) && !cgFits(cage.op, cage.t, v)) cage.cells.forEach(i => { bad[i] = true; });
  });
  return bad;
}
function cgCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 520);
  return Math.max(40, Math.min(76, Math.floor((avail - 8) / cgN)));
}
function cgHintValid(h) { return h.wrong ? cgGrid[h.key] && cgGrid[h.key] !== cgSol[h.key] : !cgGrid[h.key]; }
function renderCages() {
  const n = cgN, b = $("cg-board"), bad = cgConflicts(), sel = cgSel, sr = Math.floor(sel / n), sc = sel % n;
  hintPanel("cages", "cg-explain", cgHintValid);
  b.style.setProperty("--cgc", cgCellSize() + "px");
  b.style.gridTemplateColumns = `repeat(${n}, var(--cgc))`;
  const labelAt = new Map(cgCages.map((c, k) => [Math.min(...c.cells), k]));
  let h = "";
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, k = cgCageOf[i], v = cgGrid[i];
    const edge = (rr, cc) => rr < 0 || cc < 0 || rr >= n || cc >= n || cgCageOf[rr * n + cc] !== k;
    const cls = ["cg-cell", edge(r - 1, c) ? "bt" : "", edge(r + 1, c) ? "bb" : "", edge(r, c - 1) ? "bl" : "", edge(r, c + 1) ? "br" : "",
      cgGiven[i] === 1 ? "given" : cgGiven[i] === 2 ? "given hinted" : "", i === sel ? "sel" : sel >= 0 && (r === sr || c === sc) ? "peer" : "", bad[i] ? "bad" : ""].join(" ") + hintCls("cages", i);
    const inner = v ? `<span class="cg-v">${v}</span>` : cgNotes[i] ? `<div class="notes cg-notes">${[...Array(n)].map((_, q) => `<span>${cgNotes[i] & (1 << (q + 1)) ? q + 1 : ""}</span>`).join("")}</div>` : "";
    const lab = labelAt.get(i) === k ? `<span class="cg-lab">${cgLabel(k)}</span>` : "";
    h += `<div class="${cls}" data-i="${i}" data-label="${v || "vide"}, ligne ${r + 1}, colonne ${c + 1}, cage ${cgLabel(k)}">${lab}${inner}</div>`;
  }
  b.innerHTML = h;
}
function renderCagesKeys() {
  const k = $("cg-keys");
  k.innerHTML = "";
  for (let v = 1; v <= cgN; v++) {
    const d = document.createElement("button");
    d.className = "key"; d.textContent = v; d.onclick = () => putCages(v);
    k.appendChild(d);
  }
  const e = document.createElement("button");
  e.className = "key"; e.innerHTML = ICONS.erase; e.setAttribute("aria-label", "Effacer"); e.onclick = () => putCages(0);
  k.appendChild(e);
}
function putCages(v) {
  if (cgDone) return;
  if (cgSel < 0) { toast("Choisissez d’abord une case"); return; }
  if (cgGiven[cgSel]) { sfx("bad"); return; }
  const n = cgN, r = Math.floor(cgSel / n), c = cgSel % n;
  cgUndo.push({ grid: cgGrid.slice(), notes: cgNotes.slice() }); if (cgUndo.length > 200) cgUndo.shift();
  if (cgNoteMode && v) {
    if (cgGrid[cgSel]) { cgUndo.pop(); toast("Effacez d’abord le chiffre pour prendre des notes"); return; }
    cgNotes[cgSel] ^= 1 << v;
  } else {
    cgGrid[cgSel] = v; cgNotes[cgSel] = 0;
    if (v) for (let k = 0; k < n; k++) { cgNotes[r * n + k] &= ~(1 << v); cgNotes[k * n + c] &= ~(1 << v); }
  }
  sfx("tick"); renderCages(); saveCages();
  if (cgGrid.every(Boolean)) checkCages();
}
function undoCages() {
  if (cgDone) return;
  const u = cgUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  cgGrid = u.grid; cgNotes = u.notes; sfx("tick"); renderCages(); saveCages();
}
function cagesReason() {
  const s = cgSteps(cgN, cgGrid, cgCages, cgCageOf, cgSol, false);
  if (!s.length) return null;
  const best = Math.min(...s.map(x => x.rank)), pool = s.filter(x => x.rank === best), r = pool[Math.floor(Math.random() * pool.length)];
  return { rank: r.rank, key: r.i, why: r.why, text: r.text };
}
function hintCages() {
  if (cgDone) return;
  hintFlow("cages", {
    valid: cgHintValid,
    wrong: () => { const i = cgGrid.findIndex((v, k) => v && !cgGiven[k] && v !== cgSol[k]); return i < 0 ? null : { key: i }; },
    find: cagesReason,
    fallback: () => { const i = cgGrid.findIndex(v => !v); return i < 0 ? null : { key: i, why: [], text: "Cette case se déduit en croisant plusieurs cages." }; },
    clear: h => { cgUndo.push({ grid: cgGrid.slice(), notes: cgNotes.slice() }); cgGrid[h.key] = 0; saveCages(); },
    place: h => {
      cgUndo.push({ grid: cgGrid.slice(), notes: cgNotes.slice() });
      const i = h.key, n = cgN, r = Math.floor(i / n), c = i % n, v = cgSol[i];
      cgGrid[i] = v; cgGiven[i] = 2; cgNotes[i] = 0; cgSel = i;
      for (let k = 0; k < n; k++) { cgNotes[r * n + k] &= ~(1 << v); cgNotes[k * n + c] &= ~(1 << v); }
      saveCages();
      if (cgGrid.every(Boolean)) later(checkCages, 300);
    },
    count: () => { cgHints++; saveCages(); },
    render: renderCages,
  });
}
function checkCages() {
  if (cgDone) return;
  const left = cgGrid.filter(v => !v).length;
  if (left) { toast(`Il reste ${left} case${left > 1 ? "s" : ""} à remplir`); return; }
  if (cgConflicts().some(Boolean)) {
    cgErrors++; addPoints(-3); sfx("bad"); saveCages();
    toast("Les cases en rouge enfreignent une règle : corrigez-les");
    return;
  }
  cgDone = true;
  resumeClear("cages");
  const pts = CG_PTS[cgN];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("cages", cgN);
  save();
  const stars = cgErrors === 0 && !cgHints ? 3 : cgErrors <= 1 && cgHints <= 2 ? 2 : 1;
  later(() => winGame("Cages résolues", `Grille ${cgN}×${cgN} terminée${cgErrors ? ` après ${cgErrors} essai${cgErrors > 1 ? "s" : ""} raté${cgErrors > 1 ? "s" : ""}` : " sans faute"}${cgHints ? `, avec ${cgHints} indice${cgHints > 1 ? "s" : ""}` : ""}. +${pts} points`, pts, stars), 500);
}

LQ.register({
  id: "cages",
  title: "Cages de calcul",
  desc: "Carré latin et opérations",
  hue: "#9ad06f",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initCages,
  levelInfo: cfg => ({
    what: `Une grille de cages de calcul ${cfg.size}×${cfg.size}`,
    goals: ["Sans erreur et sans indice", "Au plus un essai raté et deux indices", "Terminer la grille"],
  }),
  rules: [
    "Placez les chiffres de 1 à n (n = taille de la grille) : chacun une seule fois par ligne et par colonne.",
    "Les traits épais découpent la grille en cages. En haut à gauche de chaque cage, un résultat et une opération : les chiffres de la cage doivent donner ce résultat. Par exemple « 6× » en deux cases : 2 et 3, ou 1 et 6.",
    "Pour − et ÷ (toujours deux cases), on part du plus grand chiffre : « 2− » peut être 3 et 1, « 2÷ » peut être 4 et 2. Un même chiffre peut revenir dans une cage s’il n’est ni sur la même ligne ni sur la même colonne.",
    "Touchez une case puis un chiffre. Le <b>crayon</b> note les chiffres possibles. Les conflits s’affichent en rouge.",
    "<b>Indice</b> montre d’abord la prochaine case à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour le chiffre.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="4" onclick="cgN=4;newCages()">Facile · 4×4</button>
      <button class="chip" data-b="5" onclick="cgN=5;newCages()">Moyen · 5×5</button>
      <button class="chip" data-b="6" onclick="cgN=6;newCages()">Difficile · 6×6</button>
    </div>
    <div class="board-wrap">
      <div class="cg-board" id="cg-board"></div>
      <p class="hint-explain" id="cg-explain" aria-live="polite"></p>
      <div class="keypad" id="cg-keys"></div>
      <div class="toolbar">
        <button class="btn ghost small" id="cg-note-btn" onclick="toggleCagesNotes()">${ICONS.pencil} Crayon</button>
        <button class="btn ghost small" onclick="undoCages()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintCages()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newCages()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Chaque chiffre une fois par ligne et par colonne ; chaque cage donne son résultat.</p>`,
  setup() {
    $("cg-board").addEventListener("click", e => {
      const c = e.target.closest(".cg-cell");
      if (!c || cgDone) return;
      cgSel = +c.dataset.i; sfx("tick"); renderCages();
    });
    window.addEventListener("resize", () => { if (currentGame === "cages" && cgSol.length) renderCages(); });
  },
});
