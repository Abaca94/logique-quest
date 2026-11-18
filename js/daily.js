/* ============================================================
   LogiqueQuest — défi du jour
   Chaque jour, un jeu différent (rotation sur tous les jeux) avec une
   grille tirée d’une graine qui dépend de la date : tout le monde a
   le même défi le même jour. Réussir le défi (au moins 1 étoile)
   rapporte un bonus et prolonge la série de jours.
   ============================================================ */

const DAILY_BONUS = 50;
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

// Ordre de rotation ; cfg(rng, k) reçoit le générateur du jour et le numéro de passage du jeu.
const DAILY_ROTA = [
  { game: "nonogram", cfg: () => ({ size: 8 }) },
  { game: "enigmes", cfg: rng => ({ ids: dailyPick(rng, ENIGMES.length, 3).sort((a, b) => a - b) }) },
  { game: "sudoku", cfg: () => ({ size: 9 }) },
  { game: "vf", cfg: rng => ({ ids: dailyPick(rng, VF_LIST.length, 10) }) },
  { game: "kakuro", cfg: () => ({ size: 8 }) },
  { game: "sequences", cfg: rng => {
    // Deux suites de chaque difficulté
    const ids = [1, 2, 3].flatMap(d => {
      const pool = SEQUENCES.map((s, i) => s.d === d ? i : -1).filter(i => i >= 0);
      return dailyPick(rng, pool.length, 2).map(j => pool[j]);
    });
    return { diff: 1, ids };
  } },
  { game: "mots", cfg: () => ({ size: 10 }) },
  { game: "logique", cfg: (rng, k) => ({ grid: k % LOGIC_PL.length }) },
  { game: "taquin", cfg: () => ({ size: 4 }) },
  { game: "memoire", cfg: () => ({ pairs: 10 }) },
];
// À partir du 1er décembre 2026, la rotation inclut les jeux de la v9 (14 jours, la déduction y est générée).
// Les jours précédents gardent l’ancienne rotation pour que le calendrier ne change pas.
const DAILY_ROTA2_FROM = Math.round(Date.UTC(2026, 11, 1) / 864e5);
const DAILY_ROTA2 = [
  ...DAILY_ROTA.slice(0, 5),
  { game: "takuzu", cfg: () => ({ size: 8 }) },
  ...DAILY_ROTA.slice(5, 7),
  { game: "futoshiki", cfg: () => ({ size: 5 }) },
  { game: "code", cfg: () => ({ mode: 2 }) },
  { game: "logique", cfg: () => ({ gen: 5 }) },
  ...DAILY_ROTA.slice(8, 10),
  { game: "hashi", cfg: () => ({ size: 9 }) },
];

/* ---------- Dates et hasard reproductible ---------- */
function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function keyToDate(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function dayNumber(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function frenchDate(d, withDay = true) { return (withDay ? WEEKDAYS[d.getDay()] + " " : "") + `${d.getDate() === 1 ? "1er" : d.getDate()} ${MONTHS[d.getMonth()]}`; }
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function dailyPick(rng, n, k) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, k);
}
// Exécute fn avec un Math.random reproductible (utilisé pendant la création de la grille).
function withSeed(seed, fn) {
  const orig = Math.random;
  Math.random = mulberry32(seed);
  try { return fn(); } finally { Math.random = orig; }
}

// Le défi d’une date donnée.
function dailyFor(d) {
  const num = dayNumber(d);
  const rota = num >= DAILY_ROTA2_FROM ? DAILY_ROTA2 : DAILY_ROTA;
  const slot = rota[num % rota.length];
  const k = Math.floor(num / rota.length);
  const seed = (num * 2654435761) >>> 0;
  return { key: dayKey(d), date: d, game: slot.game, cfg: slot.cfg(mulberry32(seed), k), seed };
}
function dailyToday() { return dailyFor(new Date()); }
function dailyStars(k) { return state.daily[k] || 0; }

// Série en cours : jours consécutifs réussis jusqu’à aujourd’hui
// (ou jusqu’à hier si le défi d’aujourd’hui n’est pas encore fait).
function dailyStreak() {
  let d = new Date();
  if (!dailyStars(dayKey(d))) d = addDays(d, -1);
  let n = 0;
  while (dailyStars(dayKey(d)) > 0) { n++; d = addDays(d, -1); }
  return n;
}
function dailyCount() { return Object.values(state.daily).filter(v => v > 0).length; }

/* ---------- Partie ---------- */
function startDaily() {
  const t = dailyToday();
  LQ.level = null;
  LQ.story = null;
  LQ.daily = { key: t.key, cfg: t.cfg };
  withSeed(t.seed + 1, () => launchGame(t.game));
}
// Enregistre le résultat ; renvoie des messages pour l’écran de fin.
function recordDaily(k, stars) {
  const notes = [], prev = dailyStars(k);
  if (stars > prev) state.daily[k] = stars;
  if (stars > 0 && !prev) {
    addPoints(DAILY_BONUS);
    const s = dailyStreak();
    state.bestDaily = Math.max(state.bestDaily || 0, s);
    notes.push(`Défi du jour réussi : +${DAILY_BONUS} points de bonus.`);
    notes.push(s > 1 ? `Série de ${s} jours d’affilée. Revenez demain pour la prolonger.` : "Revenez demain pour commencer une série.");
  } else if (stars > prev) {
    notes.push(`Nouveau record pour aujourd’hui : ${stars} étoile${stars > 1 ? "s" : ""} au lieu de ${prev}.`);
  }
  return notes;
}

/* ---------- Écran du défi ---------- */
let calMonth = null; // premier jour du mois affiché
function openDaily() {
  leaveGame();
  LQ.level = null;
  LQ.daily = null;
  LQ.story = null;
  currentGame = "daily";
  const now = new Date();
  calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  renderDaily();
  showScreen("daily");
}
function untilTomorrow() {
  const now = new Date(), t = addDays(now, 1);
  const min = Math.max(1, Math.round((t - now) / 60000));
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}
function renderDaily() {
  const t = dailyToday(), g = LQ.byId[t.game], info = g.levelInfo(t.cfg), st = dailyStars(t.key);
  $("daily-card").innerHTML = `
    <p class="dc-date">${frenchDate(t.date)}</p>
    <div class="dc-head">
      <span class="dc-ico" style="--hue:${g.hue}">${ICONS[g.id]}</span>
      <div><p class="dc-kicker">Défi du jour</p><h2>${g.title}</h2></div>
    </div>
    <p class="dc-what">${escapeHtml(info.what)}. Le même défi pour tout le monde aujourd’hui.</p>
    <ul class="ls-goals">${info.goals.map((x, i) => `<li><span class="ls-stars">${starsHtml(3 - i)}</span><span>${escapeHtml(x)}</span></li>`).join("")}</ul>
    ${st ? `<div class="dc-done"><span class="ls-stars">${starsHtml(st)}</span><span>Réussi aujourd’hui. Prochain défi dans ${untilTomorrow()}.</span></div>` : ""}
    <div class="dc-btns">
      <button class="btn dc-play ${st ? "ghost" : ""}" onclick="startDaily()">${ICONS.play} ${st ? (st < 3 ? "Rejouer pour faire mieux" : "Rejouer") : "Relever le défi"}</button>
      ${st ? `<button class="btn dc-play" onclick="shareDaily('${t.key}')">${ICONS.share} Partager</button>` : ""}
    </div>
    ${st ? "" : `<p class="dc-bonus">Bonus de ${DAILY_BONUS} points à la première réussite du jour.</p>`}`;
  $("daily-streak").textContent = dailyStreak();
  $("daily-best").textContent = Math.max(state.bestDaily || 0, dailyStreak());
  $("daily-count").textContent = dailyCount();
  renderCalendar();
}
function moveCalendar(delta) {
  calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + delta, 1);
  renderCalendar();
}
function renderCalendar() {
  const today = new Date(), tk = dayKey(today);
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // semaine commençant le lundi
  const isCurrent = y === today.getFullYear() && m === today.getMonth();
  let cells = "";
  for (let i = 0; i < offset; i++) cells += `<span class="cal-day empty"></span>`;
  let done = 0;
  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d), k = dayKey(date), st = dailyStars(k);
    if (st) done++;
    const g = LQ.byId[dailyFor(date).game];
    const cls = ["cal-day", st ? "done" : "", k === tk ? "today" : "", date > today ? "future" : ""].join(" ");
    cells += `<span class="${cls}" style="--hue:${g.hue}" title="${g.title}"><b>${d}</b>${st ? `<span class="cal-stars">${starsHtml(st)}</span>` : date > today ? "" : `<span class="cal-ico">${ICONS[g.id]}</span>`}</span>`;
  }
  $("daily-cal").innerHTML = `
    <div class="cal-head">
      <button class="icon-btn" onclick="moveCalendar(-1)" aria-label="Mois précédent">${ICONS.chevL}</button>
      <div><b>${MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1)} ${y}</b><small>${done} défi${done > 1 ? "s" : ""} réussi${done > 1 ? "s" : ""}</small></div>
      <button class="icon-btn" onclick="moveCalendar(1)" aria-label="Mois suivant" ${isCurrent ? "disabled" : ""}>${ICONS.chevR}</button>
    </div>
    <div class="cal-grid">
      ${["L", "M", "M", "J", "V", "S", "D"].map(x => `<span class="cal-wd">${x}</span>`).join("")}
      ${cells}
    </div>`;
}
