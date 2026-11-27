/* ============================================================
   Démineur sans hasard — chaque case se déduit
   Les chiffres comptent les mines parmi les huit voisins. La grille
   commence ouverte sur une zone sûre et se termine toujours sans
   deviner. Toucher une mine n’arrête pas la partie : c’est une erreur.
   ============================================================ */
const MN_CFG = { 6: { m: 6, pts: 40 }, 8: { m: 12, pts: 90 }, 10: { m: 20, pts: 160 } };
let mnN = 8, mnMine = [], mnNum = [], mnCells = [], mnBoom = [], mnUndo = [], mnHints = 0, mnErrors = 0, mnDone = false, mnFlagMode = false;
// mnCells : 0 cachée, 1 ouverte, 2 drapeau

const MN_NB = {};
function mnNb(n) {
  if (MN_NB[n]) return MN_NB[n];
  const out = [];
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, l = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const a = r + dr, b = c + dc;
      if (a >= 0 && b >= 0 && a < n && b < n) l.push(a * n + b);
    }
    out.push(l);
  }
  return (MN_NB[n] = out);
}
// Ouvre une case ; un 0 ouvre aussi ses voisins
function mnFlood(n, num, mine, open, i) {
  const nb = mnNb(n), stack = [i];
  while (stack.length) {
    const x = stack.pop();
    if (open[x] === 1 || mine[x]) continue;
    open[x] = 1;
    if (num[x] === 0) nb[x].forEach(j => { if (open[j] === 0) stack.push(j); });
  }
}
const mnPl = (k, w) => `${k} ${w}${k > 1 ? "s" : ""}`;
const mnMinesTxt = k => k === 1 ? "une mine" : `${k} mines`;

/* ---------- Raisonnement pas à pas ----------
   st : 0 inconnue, 1 sûre, 2 mine. open : cases dont le chiffre est visible. */
function mnRules(n, num, open, st, M, all) {
  const nb = mnNb(n), N = n * n, out = [], cons = [];
  const known = st.filter(v => v === 2).length, unk = st.filter(v => v === 0).length;
  if (known > M || known + unk < M) return null;
  for (let i = 0; i < N; i++) {
    if (!open[i]) continue;
    const U = nb[i].filter(j => st[j] === 0), F = nb[i].filter(j => st[j] === 2).length, r = num[i] - F;
    if (r < 0 || r > U.length) return null;
    if (U.length) cons.push({ i, U, r, F });
  }
  const done = () => !all && out.length;
  // 0. Un chiffre complet, ou qui a juste assez de voisins cachés
  for (const c of cons) {
    if (c.r === 0) c.U.forEach(j => out.push({ i: j, v: 1, rank: 0, why: [c.i], text: `Le ${num[c.i]} en bleu touche déjà ${mnMinesTxt(num[c.i])} marquée${num[c.i] > 1 ? "s" : ""} d’un drapeau : ses autres voisins cachés sont sûrs, dont la case entourée.` }));
    else if (c.r === c.U.length) c.U.forEach(j => out.push({ i: j, v: 2, rank: 0, why: [c.i], text: c.F
      ? `Le ${num[c.i]} en bleu a déjà ${mnPl(c.F, "drapeau")} et attend encore ${mnMinesTxt(c.r)} ; il ne lui reste que ${mnPl(c.U.length, "voisin")} caché${c.U.length > 1 ? "s" : ""} : ${c.r > 1 ? "ce sont toutes des mines" : "c’est une mine"}, dont la case entourée.`
      : `Le ${num[c.i]} en bleu attend ${mnMinesTxt(c.r)} et n’a que ${mnPl(c.U.length, "voisin")} caché${c.U.length > 1 ? "s" : ""} : ${c.r > 1 ? "ce sont toutes des mines" : "c’est une mine"}, dont la case entourée.` }));
    if (done()) return out;
  }
  // 1-2. Deux chiffres comparés
  for (const a of cons) for (const b of cons) {
    if (a === b) continue;
    const inter = b.U.filter(j => a.U.includes(j));
    if (!inter.length) continue;
    const onlyB = b.U.filter(j => !a.U.includes(j)), onlyA = a.U.filter(j => !b.U.includes(j));
    if (!onlyB.length) continue;
    let ka = num[a.i], kb = num[b.i];
    if (ka === kb) {
      // Même chiffre : on les distingue par leur place
      const ra = Math.floor(a.i / n), rb = Math.floor(b.i / n);
      const [pa, pb] = ra !== rb ? (ra < rb ? ["du haut", "du bas"] : ["du bas", "du haut"]) : (a.i < b.i ? ["de gauche", "de droite"] : ["de droite", "de gauche"]);
      ka = `${ka} ${pa}`; kb = `${kb} ${pb}`;
    }
    if (!onlyA.length) {
      // Les cases cachées de A sont toutes autour de B
      const d = b.r - a.r;
      if (d === 0) onlyB.forEach(j => out.push({ i: j, v: 1, rank: 1, why: [a.i, b.i], text: `Comparez les deux chiffres en bleu : ${a.r > 1 ? `les ${a.r} mines` : "la mine"} qu’attend encore le ${ka} ${a.r > 1 ? "sont" : "est"} forcément parmi les voisins qu’il partage avec le ${kb}, qui n’en attend pas plus. Les autres voisins du ${kb} sont donc sûrs, dont la case entourée.` }));
      else if (d === onlyB.length) onlyB.forEach(j => out.push({ i: j, v: 2, rank: 1, why: [a.i, b.i], text: `Comparez les deux chiffres en bleu : le ${kb} attend encore ${mnMinesTxt(b.r)}, dont ${a.r} parmi les voisins qu’il partage avec le ${ka}. ${d > 1 ? `Les ${d} cases qui ne touchent que le ${kb} sont donc toutes des mines, dont la case entourée.` : `La seule case qui ne touche que le ${kb}, celle qui est entourée, est donc une mine.`}` }));
    } else if (b.r - a.r === onlyB.length) {
      // B ne peut loger qu’au plus a.r mines dans la partie commune
      onlyB.forEach(j => out.push({ i: j, v: 2, rank: 2, why: [a.i, b.i], text: `Comparez les deux chiffres en bleu : le ${kb} attend encore ${mnMinesTxt(b.r)}, mais au plus ${a.r} peu${a.r > 1 ? "vent" : "t"} se trouver dans les voisins qu’il partage avec le ${ka}. Ses autres voisins cachés sont donc tous des mines, dont la case entourée.` }));
      onlyA.forEach(j => out.push({ i: j, v: 1, rank: 2, why: [a.i, b.i], text: `Comparez les deux chiffres en bleu : le ${kb} attend encore ${mnMinesTxt(b.r)}, ce qui oblige ${a.r > 1 ? `les ${a.r} mines` : "la mine"} du ${ka} à se trouver dans leur partie commune. Les autres voisins du ${ka} sont donc sûrs, dont la case entourée.` }));
    }
    if (done()) return out;
  }
  // 3. Le compte total des mines
  if (unk) {
    const left = M - known;
    if (left === 0) st.forEach((v, j) => { if (v === 0) out.push({ i: j, v: 1, rank: 3, why: [], text: "Toutes les mines de la grille sont déjà trouvées : les cases encore cachées sont sûres." }); });
    else if (left === unk) st.forEach((v, j) => { if (v === 0) out.push({ i: j, v: 2, rank: 3, why: [], text: `Il reste ${mnMinesTxt(left)} à trouver et exactement autant de cases cachées : ce sont toutes des mines.` }); });
  }
  return out;
}
function mnPropagate(n, num, open, st, M, limit = 300) {
  for (let k = 0; k < limit; k++) {
    const r = mnRules(n, num, open, st, M, false);
    if (r === null) return false;
    if (!r.length) return true;
    st[r[0].i] = r[0].v;
  }
  return true;
}
function mnSteps(n, num, open, st, M, sol, all) {
  const out = (mnRules(n, num, open, st, M, all) || []).filter(x => !sol || (sol[x.i] ? 2 : 1) === x.v);
  if (out.length) return out;
  // Essai : supposer une case et suivre les chiffres jusqu’à une contradiction
  const nb = mnNb(n), front = new Set();
  for (let i = 0; i < n * n; i++) if (open[i]) nb[i].forEach(j => { if (st[j] === 0) front.add(j); });
  for (const i of front) for (const v of [2, 1]) {
    const t = st.slice(); t[i] = v;
    if (mnPropagate(n, num, open, t, M)) continue;
    const res = 3 - v;
    if (sol && (sol[i] ? 2 : 1) !== res) continue;
    out.push({ i, v: res, rank: 4, why: [], text: v === 2
      ? "Supposez que la case entourée soit une mine : en suivant les chiffres voisins un à un, l’un d’eux finit par avoir trop de mines ou pas assez de cases. Elle est donc sûre."
      : "Supposez que la case entourée soit sûre : en suivant les chiffres voisins un à un, l’un d’eux finit par manquer de cases pour ses mines. C’est donc une mine." });
    if (!all) return out;
  }
  return out;
}
function mnSolve(n, num, mine, open, M) {
  const st = open.map(v => v ? 1 : 0);
  for (let k = 0; k < 400 && st.includes(0); k++) {
    const s = mnSteps(n, num, open, st, M, null, false);
    if (!s.length) return false;
    const x = s[0];
    if ((mine[x.i] ? 2 : 1) !== x.v) return false;
    st[x.i] = x.v;
    if (x.v === 1) { mnFlood(n, num, mine, open, x.i); open.forEach((v, j) => { if (v) st[j] = 1; }); }
  }
  return !st.includes(0);
}

/* ---------- Génération ---------- */
function mnGenerate(n) {
  const nb = mnNb(n), N = n * n, M = MN_CFG[n].m;
  for (let t = 0; t < 400; t++) {
    const r0 = 1 + Math.floor(Math.random() * (n - 2)), c0 = 1 + Math.floor(Math.random() * (n - 2)), s = r0 * n + c0;
    const safe = new Set([s, ...nb[s]]);
    const pool = shuffle([...Array(N).keys()].filter(i => !safe.has(i)));
    const mine = new Array(N).fill(false);
    pool.slice(0, M).forEach(i => { mine[i] = true; });
    const num = [...Array(N)].map((_, i) => nb[i].filter(j => mine[j]).length);
    const open = new Array(N).fill(0);
    mnFlood(n, num, mine, open, s);
    if (mnSolve(n, num, mine, open.slice(), M)) return { mine, num, start: s };
  }
  return null;
}

/* ---------- Partie ---------- */
// cfg (parcours, défi) : { size: 6 | 8 | 10 }
function initMines(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) mnN = cfg.size;
  else if (resumeFreeSize("mines")) mnN = resumeFreeSize("mines");
  setActiveChips("mines", mnN);
  mnDone = false; mnUndo = []; hintReset("mines");
  const snap = resumeTake("mines", playCtx(mnN));
  if (snap) ({ mine: mnMine, num: mnNum, cells: mnCells, boom: mnBoom, hints: mnHints, errors: mnErrors } = snap);
  else {
    let p = null;
    while (!p) p = mnGenerate(mnN);
    mnMine = p.mine; mnNum = p.num; mnCells = new Array(mnN * mnN).fill(0); mnBoom = []; mnHints = 0; mnErrors = 0;
    mnFlood(mnN, mnNum, mnMine, mnCells, p.start);
  }
  setMinesFlagBtn();
  renderMines();
}
function saveMines() { resumeSave("mines", playCtx(mnN), { mine: mnMine, num: mnNum, cells: mnCells, boom: mnBoom, hints: mnHints, errors: mnErrors }); }
function newMines() { resumeClear("mines"); initMines(); }
function mnCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 520);
  return Math.max(30, Math.min(60, Math.floor((avail - 8) / mnN)));
}
function setMinesFlagBtn() { const b = $("mines-flag-btn"); if (b) { b.classList.toggle("toggle-on", mnFlagMode); b.setAttribute("aria-pressed", mnFlagMode ? "true" : "false"); } }
function toggleMinesFlag() { mnFlagMode = !mnFlagMode; setMinesFlagBtn(); sfx("tick"); }
function mnIsWrong(i) { return mnCells[i] === 2 && !mnMine[i]; }
function mnHintValid(h) { return h.wrong ? mnIsWrong(h.key) : mnCells[h.key] === 0; }
const MN_FLAG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21V4"/><path d="M7 4.5l11 4.2-11 4.3z"/></svg>';
const MN_MINE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>';
function renderMines() {
  const n = mnN, b = $("mn-board");
  hintPanel("mines", "mn-explain", mnHintValid);
  b.style.setProperty("--mnc", mnCellSize() + "px");
  b.style.gridTemplateColumns = `repeat(${n}, var(--mnc))`;
  let h = "";
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, v = mnCells[i], boom = mnBoom.includes(i);
    const shown = mnDone && mnMine[i] && v !== 2;
    const cls = ["mn-cell", v === 1 ? `open n${mnNum[i]}` : v === 2 ? (boom ? "boom" : "flag") : shown ? "mine" : ""].join(" ") + hintCls("mines", i);
    const inner = v === 1 ? (mnNum[i] || "") : v === 2 ? (boom ? MN_MINE : MN_FLAG) : shown ? MN_MINE : "";
    const lab = v === 1 ? (mnNum[i] ? `${mnNum[i]}` : "vide") : v === 2 ? (boom ? "mine touchée" : "drapeau") : "cachée";
    h += `<div class="${cls}" data-i="${i}" data-label="${lab}, ligne ${r + 1}, colonne ${c + 1}">${inner}</div>`;
  }
  b.innerHTML = h;
  const left = MN_CFG[n].m - mnCells.filter(v => v === 2).length;
  $("mn-info").textContent = mnDone ? "" : `${left >= 0 ? `${mnPl(left, "mine")} à trouver` : "Trop de drapeaux"} · ${mnFlagMode ? "touchez pour poser un drapeau" : "touchez pour ouvrir une case"}`;
}
function tapMine(i) {
  if (mnDone || mnCells[i] === 1 || mnBoom.includes(i)) return;
  mnUndo.push({ cells: mnCells.slice(), boom: mnBoom.slice() }); if (mnUndo.length > 300) mnUndo.shift();
  if (mnFlagMode) { mnCells[i] = mnCells[i] === 2 ? 0 : 2; sfx("tick"); }
  else if (mnCells[i] === 2) { mnUndo.pop(); toast("Retirez d’abord le drapeau (bouton Drapeau)"); return; }
  else if (mnMine[i]) {
    mnUndo.pop();
    mnCells[i] = 2; mnBoom.push(i); mnErrors++; addPoints(-3); sfx("bad");
    toast("Une mine ! Elle est marquée, la partie continue");
  } else { mnFlood(mnN, mnNum, mnMine, mnCells, i); sfx("tick"); }
  renderMines(); saveMines(); checkMines();
}
function undoMines() {
  if (mnDone) return;
  const u = mnUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  mnCells = u.cells; mnBoom = u.boom; sfx("tick"); renderMines(); saveMines();
}
function mnState() { return mnCells.map((v, i) => v === 1 ? 1 : v === 2 && mnMine[i] ? 2 : 0); }
function minesReason() {
  const open = mnCells.map(v => v === 1 ? 1 : 0), st = mnState();
  const s = mnSteps(mnN, mnNum, open, st, MN_CFG[mnN].m, mnMine, true).filter(x => mnCells[x.i] === 0);
  if (!s.length) return null;
  const best = Math.min(...s.map(x => x.rank)), pool = s.filter(x => x.rank === best), r = pool[Math.floor(Math.random() * pool.length)];
  return { rank: r.rank, key: r.i, why: r.why, text: r.text, msg: r.v === 2 ? "Une mine se déduit ici. Touchez encore Indice pour l’explication." : "Une case sûre se déduit ici. Touchez encore Indice pour l’explication." };
}
function hintMines() {
  if (mnDone) return;
  hintFlow("mines", {
    valid: mnHintValid,
    wrong: () => { const i = mnCells.findIndex((v, k) => mnIsWrong(k)); return i < 0 ? null : { key: i, msg: "Ce drapeau est mal placé : il n’y a pas de mine ici. Touchez encore Indice pour le retirer." }; },
    find: minesReason,
    fallback: () => { const i = mnCells.findIndex((v, k) => v === 0 && !mnMine[k]); return i < 0 ? null : { key: i, why: [], text: "Cette case se déduit en combinant plusieurs chiffres." }; },
    clear: h => { mnUndo.push({ cells: mnCells.slice(), boom: mnBoom.slice() }); mnCells[h.key] = 0; saveMines(); },
    place: h => { mnUndo.push({ cells: mnCells.slice(), boom: mnBoom.slice() }); if (mnMine[h.key]) mnCells[h.key] = 2; else mnFlood(mnN, mnNum, mnMine, mnCells, h.key); saveMines(); },
    count: () => { mnHints++; saveMines(); },
    render: () => { renderMines(); checkMines(); },
  });
}
function checkMines() {
  if (mnDone) return;
  if (mnMine.some((m, i) => !m && mnCells[i] !== 1)) return;
  mnDone = true;
  resumeClear("mines");
  renderMines();
  const pts = MN_CFG[mnN].pts;
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("mines", mnN);
  save();
  const stars = !mnHints && !mnErrors ? 3 : mnHints <= 2 && mnErrors <= 1 ? 2 : 1;
  later(() => winGame("Terrain déminé", `Grille ${mnN}×${mnN} terminée${mnHints ? `, avec ${mnHints} indice${mnHints > 1 ? "s" : ""}` : " sans indice"}${mnErrors ? `, ${mnErrors} mine${mnErrors > 1 ? "s" : ""} touchée${mnErrors > 1 ? "s" : ""}` : ""}. +${pts} points`, pts, stars), 600);
}

LQ.register({
  id: "mines",
  title: "Démineur",
  desc: "Sans hasard : chaque mine se déduit",
  hue: "#e88f7f",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initMines,
  levelInfo: cfg => ({
    what: `Un champ de ${MN_CFG[cfg.size].m} mines sur ${cfg.size}×${cfg.size}`,
    goals: ["Sans indice ni mine touchée", "Au plus deux indices et une mine touchée", "Ouvrir toutes les cases sûres"],
  }),
  rules: [
    "Chaque chiffre indique combien de mines se cachent parmi les huit cases qui l’entourent, en comptant les diagonales.",
    "Ouvrez toutes les cases sans mine. La grille commence par une zone déjà ouverte, et chaque case suivante se déduit : il n’y a jamais besoin de deviner.",
    "Touchez une case pour l’ouvrir. Avec le bouton <b>Drapeau</b> activé, touchez une case pour y marquer une mine.",
    "Toucher une mine n’arrête pas la partie : elle est marquée et compte comme une erreur.",
    "<b>Indice</b> montre d’abord la prochaine case à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour l’ouvrir ou y poser un drapeau.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="6" onclick="mnN=6;newMines()">Facile · 6×6</button>
      <button class="chip" data-b="8" onclick="mnN=8;newMines()">Moyen · 8×8</button>
      <button class="chip" data-b="10" onclick="mnN=10;newMines()">Difficile · 10×10</button>
    </div>
    <div class="board-wrap">
      <div class="mn-board" id="mn-board"></div>
      <p class="hint-line" id="mn-info"></p>
      <p class="hint-explain" id="mn-explain" aria-live="polite"></p>
      <div class="toolbar">
        <button class="btn ghost small" id="mines-flag-btn" aria-pressed="false" onclick="toggleMinesFlag()">${MN_FLAG} Drapeau</button>
        <button class="btn ghost small" onclick="undoMines()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintMines()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newMines()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Chaque chiffre compte les mines autour de lui, diagonales comprises.</p>`,
  setup() {
    $("mn-board").addEventListener("click", e => { const c = e.target.closest(".mn-cell"); if (c) tapMine(+c.dataset.i); });
    window.addEventListener("resize", () => { if (currentGame === "mines" && mnMine.length) renderMines(); });
  },
});
