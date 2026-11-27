/* ============================================================
   Futoshiki — carré latin avec inégalités
   Chaque ligne et chaque colonne contient une fois chaque chiffre
   de 1 à n, et les signes < > entre deux cases sont respectés.
   Grilles générées à solution unique.
   ============================================================ */
const FT_SIZES = [4, 5, 6];
const FT_PTS = { 4: 40, 5: 80, 6: 140 };
let ftN = 5, ftSol = [], ftGrid = [], ftGiven = [], ftH = [], ftV = [], ftNotes = [], ftSel = -1, ftNoteMode = false, ftUndo = [], ftErrors = 0, ftHints = 0, ftDone = false;
// ftH[r*(n-1)+c] : signe entre (r,c) et (r,c+1) ; ftV[r*n+c] : entre (r,c) et (r+1,c)
// 0 = rien, 1 = la première case est plus petite, 2 = la première est plus grande

/* ---------- Génération ---------- */
function ftLatin(n) {
  const g = new Array(n * n).fill(0);
  function dfs(i) {
    if (i === n * n) return true;
    const r = Math.floor(i / n), c = i % n;
    for (const v of shuffle([...Array(n)].map((_, k) => k + 1))) {
      let ok = true;
      for (let k = 0; k < c && ok; k++) if (g[r * n + k] === v) ok = false;
      for (let k = 0; k < r && ok; k++) if (g[k * n + c] === v) ok = false;
      if (!ok) continue;
      g[i] = v;
      if (dfs(i + 1)) return true;
    }
    g[i] = 0;
    return false;
  }
  dfs(0);
  return g;
}
// Compte les solutions (s’arrête à limit) : propagation des domaines + recherche
function ftCount(n, givens, H, V, limit = 2) {
  const N = n * n, full = (1 << (n + 1)) - 2;
  const lo = m => { let v = 1; while (!(m & (1 << v))) v++; return v; };
  const hi = m => { let v = n; while (!(m & (1 << v))) v--; return v; };
  const below = v => (1 << v) - 2;              // valeurs < v
  const above = v => full & ~((1 << (v + 1)) - 1); // valeurs > v
  const pairs = []; // [petite, grande]
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) { const s = H[r * (n - 1) + c], a = r * n + c; if (s) pairs.push(s === 1 ? [a, a + 1] : [a + 1, a]); }
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) { const s = V[r * n + c], a = r * n + c; if (s) pairs.push(s === 1 ? [a, a + n] : [a + n, a]); }
  function propagate(D) {
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < N; i++) {
        const m = D[i];
        if (!m) return false;
        if (m & (m - 1)) continue;
        const r = Math.floor(i / n), c = i % n;
        for (let k = 0; k < n; k++) {
          const a = r * n + k, b = k * n + c;
          if (a !== i && D[a] & m) { D[a] &= ~m; changed = true; if (!D[a]) return false; }
          if (b !== i && D[b] & m) { D[b] &= ~m; changed = true; if (!D[b]) return false; }
        }
      }
      for (const [a, b] of pairs) {
        const na = D[a] & below(hi(D[b])), nb = D[b] & above(lo(D[a]));
        if (!na || !nb) return false;
        if (na !== D[a] || nb !== D[b]) { D[a] = na; D[b] = nb; changed = true; }
      }
    }
    return true;
  }
  let count = 0, steps = 0;
  function dfs(D) {
    if (count >= limit) return;
    if (++steps > 20000) { count = limit; return; }
    if (!propagate(D)) return;
    let best = -1, bc = 99;
    for (let i = 0; i < N; i++) { const c = popcount(D[i]); if (c > 1 && c < bc) { bc = c; best = i; if (c === 2) break; } }
    if (best < 0) { count++; return; }
    for (let v = 1; v <= n && count < limit; v++) if (D[best] & (1 << v)) { const E = D.slice(); E[best] = 1 << v; dfs(E); }
  }
  dfs(givens.map(v => v ? 1 << v : full));
  return count;
}
function popcount(m) { let c = 0; while (m) { m &= m - 1; c++; } return c; }
function ftGenerate(n) {
  const sol = ftLatin(n);
  const H = [], V = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) H.push(sol[r * n + c] < sol[r * n + c + 1] ? 1 : 2);
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) V.push(sol[r * n + c] < sol[(r + 1) * n + c] ? 1 : 2);
  const givens = sol.slice();
  // On retire chiffres puis signes tant que la solution reste unique
  for (const i of shuffle([...givens.keys()])) { const v = givens[i]; givens[i] = 0; if (ftCount(n, givens, H, V) !== 1) givens[i] = v; }
  const signs = shuffle([...H.keys()].map(i => ["H", i]).concat([...V.keys()].map(i => ["V", i])));
  for (const [t, i] of signs) {
    const A = t === "H" ? H : V, v = A[i];
    A[i] = 0;
    if (ftCount(n, givens, H, V) !== 1) A[i] = v;
  }
  // Grilles faciles : on rajoute quelques signes pour aider
  const extra = { 4: 3, 5: 2, 6: 1 }[n] || 0;
  const removed = signs.filter(([t, i]) => !(t === "H" ? H : V)[i]).slice(0, extra);
  for (const [t, i] of removed) {
    if (t === "H") { const r = Math.floor(i / (n - 1)), c = i % (n - 1); H[i] = sol[r * n + c] < sol[r * n + c + 1] ? 1 : 2; }
    else { const r = Math.floor(i / n), c = i % n; V[i] = sol[r * n + c] < sol[(r + 1) * n + c] ? 1 : 2; }
  }
  return { sol, givens, H, V };
}

/* ---------- Partie ---------- */
// cfg (parcours) : { size: 4 | 5 | 6 }
function initFutoshiki(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) ftN = cfg.size;
  else if (resumeFreeSize("futoshiki")) ftN = resumeFreeSize("futoshiki");
  setActiveChips("futoshiki", ftN);
  ftSel = -1; ftDone = false; ftUndo = []; hintReset("futoshiki"); ftNoteMode = false; setFutoshikiNoteBtn();
  const snap = resumeTake("futoshiki", playCtx(ftN));
  if (snap) ({ sol: ftSol, grid: ftGrid, given: ftGiven, H: ftH, V: ftV, notes: ftNotes, errors: ftErrors, hints: ftHints } = snap);
  else {
    const p = ftGenerate(ftN);
    ftSol = p.sol; ftH = p.H; ftV = p.V; ftGrid = p.givens.slice(); ftGiven = p.givens.map(v => v ? 1 : 0);
    ftNotes = new Array(ftN * ftN).fill(0); ftErrors = 0; ftHints = 0;
  }
  renderFutoshiki(); renderFutoshikiKeys();
}
function saveFutoshiki() { resumeSave("futoshiki", playCtx(ftN), { sol: ftSol, grid: ftGrid, given: ftGiven, H: ftH, V: ftV, notes: ftNotes, errors: ftErrors, hints: ftHints }); }
function newFutoshiki() { resumeClear("futoshiki"); initFutoshiki(); }
function setFutoshikiNoteBtn() { const b = $("ft-note-btn"); if (b) b.classList.toggle("toggle-on", ftNoteMode); }
function toggleFutoshikiNotes() { ftNoteMode = !ftNoteMode; setFutoshikiNoteBtn(); sfx("tick"); }
function ftConflicts() {
  const n = ftN, g = ftGrid, bad = new Array(n * n).fill(false);
  for (let i = 0; i < n * n; i++) {
    if (!g[i]) continue;
    const r = Math.floor(i / n), c = i % n;
    for (let k = 0; k < n; k++) {
      if (k !== c && g[r * n + k] === g[i]) bad[i] = true;
      if (k !== r && g[k * n + c] === g[i]) bad[i] = true;
    }
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) {
    const s = ftH[r * (n - 1) + c], a = g[r * n + c], b = g[r * n + c + 1];
    if (s && a && b && (s === 1 ? a >= b : a <= b)) bad[r * n + c] = bad[r * n + c + 1] = true;
  }
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) {
    const s = ftV[r * n + c], a = g[r * n + c], b = g[(r + 1) * n + c];
    if (s && a && b && (s === 1 ? a >= b : a <= b)) bad[r * n + c] = bad[(r + 1) * n + c] = true;
  }
  return bad;
}
function ftCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 520);
  const sign = 18;
  return Math.max(34, Math.min(64, Math.floor((avail - (ftN - 1) * sign) / ftN)));
}
function renderFutoshiki() {
  const n = ftN, b = $("ft-board"), bad = ftConflicts(), cs = ftCellSize();
  hintPanel("futoshiki", "ft-explain", h => h.wrong ? ftGrid[h.key] && ftGrid[h.key] !== ftSol[h.key] : !ftGrid[h.key]);
  b.style.setProperty("--ftc", cs + "px");
  b.style.gridTemplateColumns = Array.from({ length: 2 * n - 1 }, (_, k) => k % 2 ? "18px" : "var(--ftc)").join(" ");
  const sel = ftSel, sr = Math.floor(sel / n), sc = sel % n;
  let h = "";
  for (let R = 0; R < 2 * n - 1; R++) for (let C = 0; C < 2 * n - 1; C++) {
    const r = R >> 1, c = C >> 1;
    if (R % 2 === 0 && C % 2 === 0) {
      const i = r * n + c, v = ftGrid[i];
      const cls = ["ft-cell", ftGiven[i] === 1 ? "given" : ftGiven[i] === 2 ? "given hinted" : "", i === sel ? "sel" : sel >= 0 && (r === sr || c === sc) ? "peer" : "", bad[i] ? "bad" : ""].join(" ") + hintCls("futoshiki", i);
      const inner = v ? v : ftNotes[i] ? `<div class="notes ft-notes">${[...Array(n)].map((_, k) => `<span>${ftNotes[i] & (1 << (k + 1)) ? k + 1 : ""}</span>`).join("")}</div>` : "";
      h += `<div class="${cls}" data-i="${i}">${inner}</div>`;
    } else if (R % 2 === 0) {
      const s = ftH[r * (n - 1) + c];
      h += `<div class="ft-sign">${s === 1 ? "<" : s === 2 ? ">" : ""}</div>`;
    } else if (C % 2 === 0) {
      const s = ftV[r * n + c];
      h += `<div class="ft-sign v">${s === 1 ? "∧" : s === 2 ? "∨" : ""}</div>`;
    } else h += `<div></div>`;
  }
  b.innerHTML = h;
}
function renderFutoshikiKeys() {
  const k = $("ft-keys");
  k.innerHTML = "";
  for (let v = 1; v <= ftN; v++) {
    const d = document.createElement("button");
    d.className = "key"; d.textContent = v; d.onclick = () => putFutoshiki(v);
    k.appendChild(d);
  }
  const e = document.createElement("button");
  e.className = "key"; e.innerHTML = ICONS.erase; e.setAttribute("aria-label", "Effacer"); e.onclick = () => putFutoshiki(0);
  k.appendChild(e);
}
function putFutoshiki(v) {
  if (ftDone) return;
  if (ftSel < 0) { toast("Choisissez d’abord une case"); return; }
  if (ftGiven[ftSel]) { sfx("bad"); return; }
  const n = ftN, r = Math.floor(ftSel / n), c = ftSel % n;
  ftUndo.push({ grid: ftGrid.slice(), notes: ftNotes.slice() }); if (ftUndo.length > 200) ftUndo.shift();
  if (ftNoteMode && v) {
    if (ftGrid[ftSel]) { ftUndo.pop(); toast("Effacez d’abord le chiffre pour prendre des notes"); return; }
    ftNotes[ftSel] ^= 1 << v;
  } else {
    ftGrid[ftSel] = v; ftNotes[ftSel] = 0;
    if (v) for (let k = 0; k < n; k++) { ftNotes[r * n + k] &= ~(1 << v); ftNotes[k * n + c] &= ~(1 << v); }
  }
  sfx("tick"); renderFutoshiki(); saveFutoshiki();
  if (ftGrid.every(Boolean)) checkFutoshiki();
}
function undoFutoshiki() {
  if (ftDone) return;
  const u = ftUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  ftGrid = u.grid; ftNotes = u.notes; sfx("tick"); renderFutoshiki(); saveFutoshiki();
}
/* ---------- Indice expliqué ---------- */
// Voisins reliés par un signe : rel « < » si la case doit être plus petite que le voisin.
function ftLinks(i) {
  const n = ftN, r = Math.floor(i / n), c = i % n, out = [];
  if (c < n - 1) { const s = ftH[r * (n - 1) + c]; if (s) out.push({ j: i + 1, rel: s === 1 ? "<" : ">", where: "de droite" }); }
  if (c > 0) { const s = ftH[r * (n - 1) + c - 1]; if (s) out.push({ j: i - 1, rel: s === 1 ? ">" : "<", where: "de gauche" }); }
  if (r < n - 1) { const s = ftV[r * n + c]; if (s) out.push({ j: i + n, rel: s === 1 ? "<" : ">", where: "du dessous" }); }
  if (r > 0) { const s = ftV[(r - 1) * n + c]; if (s) out.push({ j: i - n, rel: s === 1 ? ">" : "<", where: "du dessus" }); }
  return out;
}
function ftLineVals(i) {
  const n = ftN, r = Math.floor(i / n), c = i % n, row = [], col = [];
  for (let k = 0; k < n; k++) { if (k !== c && ftGrid[r * n + k]) row.push(r * n + k); if (k !== r && ftGrid[k * n + c]) col.push(k * n + c); }
  return { row, col };
}
function ftBase(i) { const { row, col } = ftLineVals(i), used = new Set([...row, ...col].map(q => ftGrid[q])); return [...Array(ftN)].map((_, k) => k + 1).filter(v => !used.has(v)); }
// Candidats avec les signes, et ce qui a servi à les réduire
function ftDomain(i) {
  let D = ftBase(i);
  const bounds = [];
  for (const L of ftLinks(i)) {
    const w = ftGrid[L.j], B = w ? [w] : ftBase(L.j);
    if (!B.length) continue;
    const lim = L.rel === "<" ? Math.max(...B) : Math.min(...B);
    const keep = D.filter(v => L.rel === "<" ? v < lim : v > lim);
    if (keep.length < D.length) bounds.push({ L, lim, exact: !!w }); 
    D = keep;
  }
  return { D, bounds };
}
function futoshikiReason() {
  const n = ftN, found = [], dom = ftGrid.map((v, i) => v ? null : ftDomain(i));
  const add = (rank, key, why, text) => { if (dom[key] && dom[key].D.includes(ftSol[key])) found.push({ rank, key, why: [...new Set(why)], text }); };
  dom.forEach((d, i) => {
    if (!d || d.D.length !== 1) return;
    const v = d.D[0], { row, col } = ftLineVals(i), parts = [];
    const rv = row.map(q => ftGrid[q]).sort((x, y) => x - y), cv = col.map(q => ftGrid[q]).filter(x => !rv.includes(x)).sort((x, y) => x - y);
    if (rv.length) parts.push(`sa ligne ${frList(rv)}`);
    if (cv.length) parts.push(`sa colonne ${frList(cv)}`);
    const why = [...row, ...col];
    let txt = parts.length ? `Pour la case entourée, ${parts.map((x, k) => k ? x : x.replace(/^(sa ligne|sa colonne|son bloc) /, "$1 contient déjà ")).join(", ")}.` : "";
    for (const b of d.bounds) {
      why.push(b.L.j);
      txt += ` Le signe l’oblige à être ${b.L.rel === "<" ? "plus petite" : "plus grande"} que la case ${b.L.where}, qui ${b.exact ? "vaut" : b.L.rel === "<" ? "vaut au plus" : "vaut au moins"} ${b.lim}.`;
    }
    add(d.bounds.length ? 1 : 0, i, why, `${txt.trim()} Il ne reste que le <b>${v}</b>.`);
  });
  for (let k = 0; k < 2 * n; k++) {
    const cells = [...Array(n)].map((_, q) => k < n ? k * n + q : q * n + (k - n)), name = k < n ? `la ligne ${k + 1}` : `la colonne ${k - n + 1}`;
    for (let v = 1; v <= n; v++) {
      if (cells.some(q => ftGrid[q] === v)) continue;
      const spots = cells.filter(q => dom[q] && dom[q].D.includes(v));
      if (spots.length !== 1) continue;
      const p = spots[0], why = [];
      cells.filter(q => q !== p && !ftGrid[q]).forEach(q => {
        const { row, col } = ftLineVals(q), blk = [...row, ...col].find(x => ftGrid[x] === v);
        if (blk !== undefined) why.push(blk); else ftLinks(q).forEach(L => why.push(L.j));
      });
      add(2, p, why, `Dans ${name}, le <b>${v}</b> ne peut aller que dans la case entourée : dans les autres cases vides, il est exclu par un ${v} déjà placé sur leur ${k < n ? "colonne" : "ligne"} ou par un signe (cases entourées en bleu).`);
    }
  }
  if (!found.length) return null;
  const best = Math.min(...found.map(f => f.rank)), pool = found.filter(f => f.rank === best);
  return pool[Math.floor(Math.random() * pool.length)];
}
function hintFutoshiki() {
  if (ftDone) return;
  const ok = h => h.wrong ? ftGrid[h.key] && ftGrid[h.key] !== ftSol[h.key] : !ftGrid[h.key];
  hintFlow("futoshiki", {
    valid: ok,
    wrong: () => { const i = ftGrid.findIndex((v, k) => v && !ftGiven[k] && v !== ftSol[k]); return i < 0 ? null : { key: i }; },
    find: futoshikiReason,
    fallback: () => {
      const e = [...ftGrid.keys()].filter(k => !ftGrid[k]);
      if (!e.length) return null;
      const i = e.reduce((a, k) => ftDomain(k).D.length < ftDomain(a).D.length ? k : a);
      return { key: i, why: ftLinks(i).map(L => L.j), text: `Pas de déduction directe ici : il faut enchaîner plusieurs signes. Chiffres encore possibles dans la case entourée : ${frList(ftDomain(i).D)}.` };
    },
    clear: h => { ftUndo.push({ grid: ftGrid.slice(), notes: ftNotes.slice() }); ftGrid[h.key] = 0; ftSel = h.key; saveFutoshiki(); },
    place: h => {
      ftUndo.push({ grid: ftGrid.slice(), notes: ftNotes.slice() });
      const i = h.key, n = ftN, r = Math.floor(i / n), c = i % n, v = ftSol[i];
      ftGrid[i] = v; ftGiven[i] = 2; ftNotes[i] = 0; ftSel = i;
      for (let k = 0; k < n; k++) { ftNotes[r * n + k] &= ~(1 << v); ftNotes[k * n + c] &= ~(1 << v); }
      saveFutoshiki();
      if (ftGrid.every(Boolean)) later(checkFutoshiki, 300);
    },
    count: () => { ftHints++; saveFutoshiki(); },
    render: () => renderFutoshiki(),
  });
}
function checkFutoshiki() {
  if (ftDone) return;
  const left = ftGrid.filter(v => !v).length;
  if (left) { toast(`Il reste ${left} case${left > 1 ? "s" : ""} à remplir`); return; }
  if (ftConflicts().some(Boolean)) {
    ftErrors++; addPoints(-3); sfx("bad"); saveFutoshiki();
    toast("Les cases en rouge enfreignent une règle : corrigez-les");
    return;
  }
  ftDone = true;
  resumeClear("futoshiki");
  const pts = FT_PTS[ftN];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("futoshiki", ftN);
  save();
  const stars = ftErrors === 0 && !ftHints ? 3 : ftErrors <= 1 && ftHints <= 2 ? 2 : 1;
  later(() => winGame("Futoshiki résolu", `Grille ${ftN}×${ftN} terminée${ftErrors ? ` après ${ftErrors} essai${ftErrors > 1 ? "s" : ""} raté${ftErrors > 1 ? "s" : ""}` : " sans faute"}${ftHints ? `, avec ${ftHints} indice${ftHints > 1 ? "s" : ""}` : ""}. +${pts} points`, pts, stars), 500);
}

LQ.register({
  id: "futoshiki",
  title: "Futoshiki",
  desc: "Carré latin et inégalités",
  hue: "#e88fb0",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initFutoshiki,
  levelInfo: cfg => ({
    what: `Une grille de futoshiki ${cfg.size}×${cfg.size}`,
    goals: ["Sans erreur et sans indice", "Au plus un essai raté et deux indices", "Terminer la grille"],
  }),
  rules: [
    `Placez les chiffres de 1 à n (n = taille de la grille) : chacun une seule fois par ligne et par colonne.`,
    "Les signes entre deux cases doivent être respectés : < et > en ligne, ∧ et ∨ en colonne. La pointe du signe montre la case la plus petite.",
    "Touchez une case puis un chiffre. Le <b>crayon</b> note les chiffres possibles. Les conflits s’affichent en rouge.",
    "Chaque grille n’a qu’une seule solution.",
    "<b>Indice</b> montre d’abord la prochaine case à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour le chiffre.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="4" onclick="ftN=4;newFutoshiki()">Facile · 4×4</button>
      <button class="chip" data-b="5" onclick="ftN=5;newFutoshiki()">Moyen · 5×5</button>
      <button class="chip" data-b="6" onclick="ftN=6;newFutoshiki()">Difficile · 6×6</button>
    </div>
    <div class="board-wrap">
      <div class="ft-board" id="ft-board"></div>
      <p class="hint-explain" id="ft-explain" aria-live="polite"></p>
      <div class="keypad" id="ft-keys"></div>
      <div class="toolbar">
        <button class="btn ghost small" id="ft-note-btn" onclick="toggleFutoshikiNotes()">${ICONS.pencil} Crayon</button>
        <button class="btn ghost small" onclick="undoFutoshiki()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintFutoshiki()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newFutoshiki()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Chaque chiffre une fois par ligne et par colonne. La pointe d’un signe désigne la case la plus petite.</p>`,
  setup() {
    $("ft-board").addEventListener("click", e => {
      const c = e.target.closest(".ft-cell");
      if (!c || ftDone) return;
      ftSel = +c.dataset.i; sfx("tick"); renderFutoshiki();
    });
    window.addEventListener("resize", () => { if (currentGame === "futoshiki" && ftSol.length) renderFutoshiki(); });
  },
});
