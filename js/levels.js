/* ============================================================
   LogiqueQuest — parcours en niveaux, rangs et badges
   Chaque niveau lance un jeu existant avec une configuration (cfg).
   Le jeu calcule 0 à 3 étoiles et appelle winGame(), qui enregistre
   le résultat via recordLevel().
   ============================================================ */

const CHAPTERS = [
  { name: "Premiers pas", roman: "I", need: 0 },
  { name: "Raisonnement", roman: "II", need: 18 },
  { name: "Expertise", roman: "III", need: 45 },
];

// 10 niveaux par chapitre, dans l’ordre.
const LEVELS = [
  // Chapitre I
  { game: "enigmes", cfg: { ids: [0, 2, 4] } },
  { game: "memoire", cfg: { pairs: 8 } },
  { game: "sequences", cfg: { diff: 0 } },
  { game: "sudoku", cfg: { size: 4 } },
  { game: "logique", cfg: { grid: 0 } },
  { game: "taquin", cfg: { size: 3 } },
  { game: "vf", cfg: { ids: [0, 1, 2, 3, 4, 5] } },
  { game: "mots", cfg: { size: 8 } },
  { game: "enigmes", cfg: { ids: [3, 7, 9] } },
  { game: "logique", cfg: { grid: 1 } },
  // Chapitre II
  { game: "sequences", cfg: { diff: 1 } },
  { game: "sudoku", cfg: { size: 6 } },
  { game: "enigmes", cfg: { ids: [1, 8, 11] } },
  { game: "memoire", cfg: { pairs: 10 } },
  { game: "logique", cfg: { grid: 2 } },
  { game: "mots", cfg: { size: 10 } },
  { game: "vf", cfg: { ids: [6, 7, 8, 9, 10, 11] } },
  { game: "taquin", cfg: { size: 4 } },
  { game: "enigmes", cfg: { ids: [5, 14, 16] } },
  { game: "logique", cfg: { grid: 3 } },
  // Chapitre III
  { game: "sequences", cfg: { diff: 2 } },
  { game: "enigmes", cfg: { ids: [6, 10, 15] } },
  { game: "sudoku", cfg: { size: 9 } },
  { game: "logique", cfg: { grid: 4 } },
  { game: "memoire", cfg: { pairs: 12 } },
  { game: "enigmes", cfg: { ids: [12, 13, 17] } },
  { game: "mots", cfg: { size: 12 } },
  { game: "taquin", cfg: { size: 5 } },
  { game: "enigmes", cfg: { ids: [18, 19, 23] } },
  { game: "logique", cfg: { grid: 5 } },
];
const PER_CHAPTER = 10;
const MAX_STARS = LEVELS.length * 3;

const RANKS = [
  { min: 0, name: "Apprenti" },
  { min: 8, name: "Curieux" },
  { min: 20, name: "Enquêteur" },
  { min: 35, name: "Analyste" },
  { min: 55, name: "Stratège" },
  { min: 75, name: "Maître" },
  { min: 90, name: "Grand maître" },
];

/* ---------- Calculs de progression ---------- */
function levelStars(n) { return state.levels[n] || 0; }
function totalStars() { return Object.values(state.levels).reduce((a, v) => a + v, 0); }
function chapterOf(n) { return Math.floor((n - 1) / PER_CHAPTER); }
function chapterLevels(c) { return Array.from({ length: PER_CHAPTER }, (_, i) => c * PER_CHAPTER + i + 1); }
function chapterStars(c) { return chapterLevels(c).reduce((a, n) => a + levelStars(n), 0); }
function chapterOpen(c) { return totalStars() >= CHAPTERS[c].need; }
function chapterDone(c) { return chapterLevels(c).every(n => levelStars(n) > 0); }
function levelUnlocked(n) {
  if (n < 1 || n > LEVELS.length) return false;
  if (!chapterOpen(chapterOf(n))) return false;
  return n === 1 || levelStars(n - 1) > 0;
}
function currentLevel() { // premier niveau débloqué pas encore validé, sinon le dernier débloqué
  let last = 1;
  for (let n = 1; n <= LEVELS.length; n++) {
    if (!levelUnlocked(n)) break;
    last = n;
    if (!levelStars(n)) return n;
  }
  return last;
}
function nextLevel(n) { return levelUnlocked(n + 1) ? n + 1 : null; }
function rankFor(stars) {
  let r = 0;
  RANKS.forEach((x, i) => { if (stars >= x.min) r = i; });
  return { ...RANKS[r], index: r, next: RANKS[r + 1] || null };
}

// Enregistre le résultat d’un niveau ; renvoie des messages pour l’écran de fin.
function recordLevel(n, stars) {
  const notes = [];
  const prev = levelStars(n);
  const openBefore = CHAPTERS.map((_, c) => chapterOpen(c));
  const rankBefore = rankFor(totalStars()).index;
  if (stars > prev) {
    state.levels[n] = stars;
    if (prev > 0) notes.push(`Nouveau record sur ce niveau : ${stars} étoile${stars > 1 ? "s" : ""} au lieu de ${prev}.`);
  }
  CHAPTERS.forEach((ch, c) => {
    if (!openBefore[c] && chapterOpen(c)) notes.push(`Chapitre ${ch.roman} débloqué : ${ch.name}.`);
  });
  const rank = rankFor(totalStars());
  if (rank.index > rankBefore) notes.push(`Nouveau rang : ${rank.name}.`);
  // Fin de chapitre sans assez d’étoiles pour ouvrir le suivant
  const c = chapterOf(n);
  if (stars > 0 && n % PER_CHAPTER === 0 && CHAPTERS[c + 1] && !chapterOpen(c + 1)) {
    const miss = CHAPTERS[c + 1].need - totalStars();
    notes.push(`Encore ${miss} étoile${miss > 1 ? "s" : ""} pour ouvrir le chapitre ${CHAPTERS[c + 1].roman}. Rejouez des niveaux pour améliorer vos scores.`);
  }
  return notes;
}

/* ---------- Badges ---------- */
const BADGES = [
  { id: "first", name: "Premiers pas", desc: "Valider le niveau 1", test: () => levelStars(1) > 0 },
  { id: "perfect", name: "Sans faute", desc: "Obtenir 3 étoiles sur un niveau", test: () => Object.values(state.levels).some(v => v >= 3) },
  { id: "chap1", name: "Chapitre I", desc: "Valider les 10 niveaux du chapitre I", test: () => chapterDone(0) },
  { id: "chap2", name: "Chapitre II", desc: "Valider les 10 niveaux du chapitre II", test: () => chapterDone(1) },
  { id: "chap3", name: "Chapitre III", desc: "Valider les 10 niveaux du chapitre III", test: () => chapterDone(2) },
  { id: "chapperfect", name: "Perfectionniste", desc: "3 étoiles sur tous les niveaux d’un chapitre", test: () => CHAPTERS.some((_, c) => chapterStars(c) === PER_CHAPTER * 3) },
  { id: "allstars", name: "Grand maître", desc: `Réunir les ${MAX_STARS} étoiles du parcours`, test: () => totalStars() >= MAX_STARS },
  { id: "poly", name: "Touche-à-tout", desc: "Gagner une partie dans chacun des 8 jeux", test: () => LQ.games.every(g => (state.wins[g.id] || 0) > 0) },
  { id: "detective", name: "Détective", desc: "3 étoiles sur les 6 grilles de déduction du parcours", test: () => LEVELS.every((l, i) => l.game !== "logique" || levelStars(i + 1) === 3) },
  { id: "streak10", name: "En série", desc: "Enchaîner 10 réussites sans erreur", test: () => state.bestStreak >= 10 },
  { id: "streak25", name: "Implacable", desc: "Enchaîner 25 réussites sans erreur", test: () => state.bestStreak >= 25 },
  { id: "solved100", name: "Centurion", desc: "Réussir 100 défis", test: () => state.solved >= 100 },
  { id: "score1000", name: "Mille points", desc: "Atteindre 1 000 points", test: () => state.score >= 1000 },
];
// Attribue les badges nouvellement mérités ; renvoie la liste des nouveaux.
function checkBadges() {
  const fresh = [];
  for (const b of BADGES) {
    if (!state.badges[b.id] && b.test()) {
      state.badges[b.id] = new Date().toISOString().slice(0, 10);
      fresh.push(b);
    }
  }
  return fresh;
}

/* ---------- Lancer un niveau ---------- */
function startLevel(n) {
  closeLevelSheet();
  if (!levelUnlocked(n)) { toast("Ce niveau n’est pas encore débloqué"); return; }
  const L = LEVELS[n - 1];
  LQ.level = { n, cfg: L.cfg };
  launchGame(L.game);
}
function openLevelSheet(n) {
  if (!levelUnlocked(n)) {
    const c = chapterOf(n);
    toast(chapterOpen(c) ? `Validez d’abord le niveau ${n - 1}` : `Chapitre ${CHAPTERS[c].roman} : ${CHAPTERS[c].need} étoiles nécessaires`);
    return;
  }
  const L = LEVELS[n - 1], g = LQ.byId[L.game];
  const info = g.levelInfo(L.cfg);
  const best = levelStars(n);
  $("ls-ico").innerHTML = ICONS[g.id];
  $("ls-ico").style.setProperty("--hue", g.hue);
  $("ls-kicker").textContent = `Chapitre ${CHAPTERS[chapterOf(n)].roman} · Niveau ${n}`;
  $("ls-title").textContent = g.title;
  $("ls-what").innerHTML = escapeHtml(info.what) + (best ? `<span class="ls-best">Votre meilleur résultat : ${starsHtml(best)}</span>` : "");
  $("ls-goals").innerHTML = info.goals.map((t, i) => `<li><span class="ls-stars">${starsHtml(3 - i)}</span><span>${escapeHtml(t)}</span></li>`).join("");
  $("ls-play").textContent = best ? "Rejouer" : "Jouer";
  $("ls-play").onclick = () => startLevel(n);
  const m = $("level-sheet");
  m.onclick = e => { if (e.target === m) closeLevelSheet(); };
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
}
function closeLevelSheet() {
  const m = $("level-sheet");
  m.classList.remove("show");
  m.setAttribute("aria-hidden", "true");
}

/* ---------- Carte du parcours ---------- */
const MAP_X = [50, 76, 50, 24]; // positions horizontales (%) en zigzag
const MAP_ROW = 104;             // hauteur d’une étape (px)
function openMap() {
  leaveGame();
  LQ.level = null;
  currentGame = "map";
  renderMap();
  showScreen("map");
  const cur = document.querySelector(".node.current");
  if (cur) cur.scrollIntoView({ block: "center" });
}
function renderMap() {
  const total = totalStars(), rank = rankFor(total);
  $("map-head").innerHTML = `
    <div class="mh-stars">${ICONS.star}<b>${total}</b><span>/ ${MAX_STARS}</span></div>
    <div class="mh-rank">Rang : <b>${rank.name}</b>${rank.next ? ` · prochain rang à ${rank.next.min} étoiles` : ""}</div>
    <div class="progress-track"><div class="progress-fill" style="width:${total / MAX_STARS * 100}%"></div></div>`;
  const cur = currentLevel();
  $("map-chapters").innerHTML = CHAPTERS.map((ch, c) => {
    const open = chapterOpen(c);
    const lv = chapterLevels(c);
    const h = lv.length * MAP_ROW;
    const pts = lv.map((_, i) => `${MAP_X[i % 4]},${i * MAP_ROW + MAP_ROW / 2}`).join(" ");
    const nodes = lv.map((n, i) => {
      const L = LEVELS[n - 1], g = LQ.byId[L.game], st = levelStars(n), unl = levelUnlocked(n);
      const cls = !unl ? "locked" : n === cur && !st ? "current" : st ? "done" : "";
      return `<button class="node ${cls}" style="left:${MAP_X[i % 4]}%;top:${i * MAP_ROW + MAP_ROW / 2}px;--hue:${g.hue}" onclick="openLevelSheet(${n})" aria-label="Niveau ${n}, ${g.title}">
        <span class="disc">${unl ? ICONS[g.id] : ICONS.lock}<span class="num">${n}</span></span>
        <span class="nstars">${st ? starsHtml(st) : `<em>${g.title}</em>`}</span>
      </button>`;
    }).join("");
    const miss = ch.need - total;
    return `<section class="chapter ${open ? "" : "closed"}">
      <div class="ch-head">
        <div><p class="ch-kicker">Chapitre ${ch.roman}</p><h3>${ch.name}</h3></div>
        <div class="ch-stars">${open ? `${ICONS.star}<b>${chapterStars(c)}</b>/${PER_CHAPTER * 3}` : `${ICONS.lock}<span>${ch.need} ${ICONS.star} requises<br><small>encore ${miss}</small></span>`}</div>
      </div>
      <div class="path" style="height:${h}px">
        <svg class="path-line" viewBox="0 0 100 ${h}" preserveAspectRatio="none"><polyline points="${pts}" /></svg>
        ${nodes}
      </div>
    </section>`;
  }).join("");
}

/* ---------- Profil ---------- */
function openProfile() {
  leaveGame();
  LQ.level = null;
  currentGame = "profile";
  renderProfile();
  showScreen("profile");
}
function renderProfile() {
  const total = totalStars(), rank = rankFor(total);
  const pct = rank.next ? (total - rank.min) / (rank.next.min - rank.min) * 100 : 100;
  $("rank-card").innerHTML = `
    <div class="rk-medal">${ICONS.medal}</div>
    <p class="rk-kicker">Rang ${rank.index + 1} sur ${RANKS.length}</p>
    <h2>${rank.name}</h2>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <p class="rk-next">${rank.next ? `${total} étoiles · ${rank.next.name} à ${rank.next.min}` : `${total} étoiles · rang maximal atteint`}</p>`;
  $("stat-levels").textContent = Object.values(state.levels).filter(v => v > 0).length + "/" + LEVELS.length;
  $("stat-stars").textContent = total;
  $("stat-badges").textContent = Object.keys(state.badges).length + "/" + BADGES.length;
  $("badge-grid").innerHTML = BADGES.map(b => {
    const got = state.badges[b.id];
    return `<div class="badge ${got ? "got" : ""}">
      <span class="b-ico">${got ? ICONS.medal : ICONS.lock}</span>
      <div><b>${b.name}</b><p>${b.desc}</p>${got ? `<small>Obtenu le ${got.split("-").reverse().join("/")}</small>` : ""}</div>
    </div>`;
  }).join("");
  $("wins-list").innerHTML = LQ.games.map(g => `<div class="win-row" style="--hue:${g.hue}"><span class="w-ico">${ICONS[g.id]}</span><span>${g.title}</span><b>${state.wins[g.id] || 0}</b></div>`).join("");
}

/* ---------- Cartes de l’accueil ---------- */
function renderHome() {
  const total = totalStars(), rank = rankFor(total), n = currentLevel();
  const L = LEVELS[n - 1], g = LQ.byId[L.game];
  const allDone = LEVELS.every((_, i) => levelStars(i + 1) > 0);
  const badges = Object.keys(state.badges).length;
  $("home-cards").innerHTML = `
    <button class="home-card hc-main" onclick="openMap()">
      <span class="hc-ico">${ICONS.map}</span>
      <span class="hc-body">
        <span class="hc-kicker">Parcours · ${total} / ${MAX_STARS} étoiles</span>
        <span class="hc-title">${allDone ? "Parcours terminé" : total === 0 && n === 1 ? "Commencer le parcours" : `Continuer : niveau ${n}`}</span>
        <span class="hc-sub">${allDone ? "Rejouez les niveaux pour décrocher 3 étoiles partout." : `Chapitre ${CHAPTERS[chapterOf(n)].roman} · ${g.title}`}</span>
        <span class="progress-track"><span class="progress-fill" style="width:${total / MAX_STARS * 100}%"></span></span>
      </span>
      <span class="hc-go">${ICONS.play}</span>
    </button>
    <button class="home-card" onclick="openProfile()">
      <span class="hc-ico">${ICONS.user}</span>
      <span class="hc-body">
        <span class="hc-kicker">Profil</span>
        <span class="hc-title">${rank.name}</span>
        <span class="hc-sub">${badges} badge${badges > 1 ? "s" : ""} sur ${BADGES.length} · ${state.score} points</span>
      </span>
    </button>`;
}
