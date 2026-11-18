/* ============================================================
   LogiqueQuest — partage, transfert entre appareils, statistiques
   - Partager le résultat du défi du jour (feuille de partage iOS,
     sinon copie dans le presse-papiers).
   - Transférer sa progression d’un appareil à l’autre avec un code
     (AirDrop, Messages, Notes…). L’import fusionne : on garde le
     meilleur des deux appareils, rien n’est perdu.
   - Statistiques détaillées du profil : activité des 12 dernières
     semaines et bilan par jeu.
   ============================================================ */

const APP_URL = "https://abaca94.github.io/logique-quest/";

/* ---------- Suivi de l’activité (appelé par winGame) ---------- */
function trackPlay(game, won) {
  if (!game || !LQ.byId[game]) return;
  state.played[game] = (state.played[game] || 0) + 1;
  const k = dayKey(new Date());
  state.activity[k] = (state.activity[k] || 0) + 1;
  // On ne garde qu’un an d’activité
  const keys = Object.keys(state.activity);
  if (keys.length > 400) keys.sort().slice(0, keys.length - 370).forEach(x => delete state.activity[x]);
}

/* ---------- Partage ---------- */
async function shareText(text, title) {
  if (navigator.share) {
    try { await navigator.share({ title: title || "LogiqueQuest", text }); return "shared"; }
    catch (e) { if (e && e.name === "AbortError") return "cancel"; }
  }
  if (await copyText(text)) { toast("Copié : il ne reste qu’à coller"); return "copied"; }
  toast("Partage impossible sur cet appareil");
  return "fail";
}
async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) { /* repli ci-dessous */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;top:0";
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy"); ta.remove(); return ok;
  } catch (e) { return false; }
}

function dailyShareText(key) {
  const d = keyToDate(key), t = dailyFor(d), g = LQ.byId[t.game], st = dailyStars(key);
  const streak = key === dayKey(new Date()) ? dailyStreak() : 0;
  return [
    `LogiqueQuest · Défi du ${frenchDate(d)}`,
    `${g.title} ${"★".repeat(st)}${"☆".repeat(3 - st)}`,
    streak > 1 ? `Série : ${streak} jours d’affilée` : "",
    "À vous de jouer : " + APP_URL,
  ].filter(Boolean).join("\n");
}
function shareDaily(key) { shareText(dailyShareText(key || dayKey(new Date())), "Défi du jour"); }

/* ---------- Transfert de progression ---------- */
const TRANSFER_KEYS = ["score", "solved", "bestStreak", "best", "levels", "badges", "wins", "played", "daily", "bestDaily", "story", "activity", "seenRules"];

function b64urlFromBytes(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytesFromB64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function streamBytes(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
async function makeTransferCode() {
  const data = { v: 1, at: dayKey(new Date()) };
  for (const k of TRANSFER_KEYS) data[k] = state[k];
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (typeof CompressionStream === "function") {
    try { return "LQ1-" + b64urlFromBytes(await streamBytes(bytes, new CompressionStream("deflate-raw"))); } catch (e) { /* repli */ }
  }
  return "LQ0-" + b64urlFromBytes(bytes);
}
async function readTransferCode(code) {
  const m = String(code || "").replace(/\s+/g, "").match(/^LQ([01])-([A-Za-z0-9_-]+)$/);
  if (!m) throw new Error("format");
  let bytes = bytesFromB64url(m[2]);
  if (m[1] === "1") {
    if (typeof DecompressionStream !== "function") throw new Error("support");
    bytes = await streamBytes(bytes, new DecompressionStream("deflate-raw"));
  }
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || data.v !== 1 || typeof data.levels !== "object") throw new Error("format");
  return data;
}

// Fusionne une progression importée : le meilleur des deux pour chaque valeur.
function mergeProgress(src) {
  const num = v => (typeof v === "number" && isFinite(v) ? v : 0);
  const maxMap = (a, b) => { for (const k in b || {}) a[k] = Math.max(num(a[k]), num(b[k])); };
  for (const k of ["score", "solved", "bestStreak", "bestDaily"]) state[k] = Math.max(num(state[k]), num(src[k]));
  for (const k of ["best", "levels", "wins", "played", "daily", "story", "activity"]) maxMap(state[k], src[k]);
  for (const k in src.badges || {}) {
    const d = String(src.badges[k]);
    if (/^\d{4}-\d\d-\d\d$/.test(d) && (!state.badges[k] || d < state.badges[k])) state.badges[k] = d;
  }
  for (const k in src.seenRules || {}) state.seenRules[k] = true;
}

let transferCode = "";
async function openTransfer(mode) {
  const m = $("transfer-sheet");
  m.dataset.mode = mode;
  $("transfer-title").textContent = mode === "export" ? "Envoyer ma progression" : "Récupérer une progression";
  $("transfer-text").textContent = mode === "export"
    ? "Envoyez ce code à votre autre appareil (AirDrop, Messages, Notes…), puis collez-le dans Profil › Récupérer une progression."
    : "Collez le code reçu de votre autre appareil. Les deux progressions sont fusionnées : on garde le meilleur de chacune, rien n’est effacé.";
  const ta = $("transfer-code");
  ta.readOnly = mode === "export";
  ta.value = "";
  ta.placeholder = mode === "export" ? "" : "Collez le code ici (il commence par LQ1-)";
  $("transfer-actions").innerHTML = mode === "export"
    ? `<button class="btn ghost small" onclick="closeTransfer()">Fermer</button>
       <button class="btn ghost small" onclick="copyTransfer()">Copier</button>
       <button class="btn small" onclick="sendTransfer()">${ICONS.share} Envoyer</button>`
    : `<button class="btn ghost small" onclick="closeTransfer()">Annuler</button>
       <button class="btn small" onclick="importTransfer()">Importer</button>`;
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
  if (mode === "export") {
    transferCode = await makeTransferCode();
    ta.value = transferCode;
  } else {
    setTimeout(() => ta.focus(), 60);
  }
}
function closeTransfer() { const m = $("transfer-sheet"); m.classList.remove("show"); m.setAttribute("aria-hidden", "true"); }
async function copyTransfer() { toast(await copyText(transferCode) ? "Code copié" : "Copie impossible : sélectionnez le code"); }
function sendTransfer() { shareText(transferCode, "Progression LogiqueQuest"); }
async function importTransfer() {
  let data;
  try { data = await readTransferCode($("transfer-code").value); }
  catch (e) {
    toast(e.message === "support" ? "Mettez iOS à jour pour lire ce code" : "Code invalide : vérifiez qu’il est complet");
    return;
  }
  const before = totalStars();
  mergeProgress(data);
  const fresh = checkBadges();
  save();
  closeTransfer();
  renderProfile();
  const gain = totalStars() - before;
  toast(`Progression importée${gain > 0 ? ` · +${gain} étoile${gain > 1 ? "s" : ""}` : ""}${fresh.length ? ` · ${fresh.length} badge${fresh.length > 1 ? "s" : ""}` : ""}`);
}

/* ---------- Statistiques détaillées ---------- */
const ACT_WEEKS = 12;
function renderStats() {
  // Activité : 12 semaines, colonnes = semaines (lundi en haut), aujourd’hui en bas à droite.
  const today = new Date(), tk = dayKey(today);
  const lastMonday = addDays(today, -((today.getDay() + 6) % 7));
  const start = addDays(lastMonday, -7 * (ACT_WEEKS - 1));
  const counts = [];
  for (let d = start; d <= today; d = addDays(d, 1)) counts.push({ d, k: dayKey(d), n: state.activity[dayKey(d)] || 0 });
  const peak = Math.max(1, ...counts.map(c => c.n));
  const level = n => (n === 0 ? 0 : Math.min(4, Math.ceil(n / peak * 4)));
  const cells = counts.map(c => {
    const label = `${frenchDate(c.d)} : ${c.n ? `${c.n} partie${c.n > 1 ? "s" : ""}` : "aucune partie"}${state.daily[c.k] > 0 ? " · défi réussi" : ""}`;
    return `<span class="act-cell a${level(c.n)}${c.k === tk ? " today" : ""}${state.daily[c.k] > 0 ? " dly" : ""}" title="${label}" data-tip="${label}"></span>`;
  }).join("");
  const last30 = counts.slice(-30), days30 = last30.filter(c => c.n > 0).length, games30 = last30.reduce((s, c) => s + c.n, 0);
  const activeDays = Object.values(state.activity).filter(n => n > 0).length;
  const played = LQ.games.reduce((s, g) => s + Math.max(state.played[g.id] || 0, state.wins[g.id] || 0), 0);
  const won = LQ.games.reduce((s, g) => s + (state.wins[g.id] || 0), 0);

  $("act-summary").innerHTML = `
    <div class="stat-box"><div class="v">${days30}</div><div class="l">Jours joués sur 30</div></div>
    <div class="stat-box"><div class="v">${games30}</div><div class="l">Parties sur 30 jours</div></div>
    <div class="stat-box"><div class="v">${played ? Math.round(won / played * 100) + " %" : "–"}</div><div class="l">Parties gagnées</div></div>
    <div class="stat-box"><div class="v">${activeDays}</div><div class="l">Jours joués en tout</div></div>`;
  $("act-grid").innerHTML = cells;
  $("act-tip").textContent = "Touchez un jour pour le détail.";

  // Bilan par jeu
  $("wins-list").innerHTML = LQ.games.map(g => {
    const w = state.wins[g.id] || 0, p = Math.max(state.played[g.id] || 0, w);
    const lv = LEVELS.map((l, i) => (l.game === g.id ? i + 1 : 0)).filter(Boolean);
    const lvStars = lv.reduce((s, n) => s + levelStars(n), 0);
    const rec = state.best[g.id] ? (g.recordLabel ? g.recordLabel(state.best[g.id]) : "Record " + state.best[g.id]) : "Pas encore de record en jeu libre";
    const rate = p ? Math.round(w / p * 100) : 0;
    return `<div class="gstat" style="--hue:${g.hue}">
      <span class="w-ico">${ICONS[g.id]}</span>
      <div class="gs-body">
        <div class="gs-top"><b>${g.title}</b><span>${w} gagnée${w > 1 ? "s" : ""}${p ? ` sur ${p}` : ""}</span></div>
        <div class="gs-bar" role="img" aria-label="${rate} % de parties gagnées"><span style="width:${rate}%"></span></div>
        <div class="gs-meta"><span>${escapeHtml(rec)}</span><span class="ls-stars">${ICONS.star.replace("<svg", '<svg class="on"')} ${lvStars}/${lv.length * 3}</span></div>
      </div>
    </div>`;
  }).join("");
}
function actTip(e) {
  const c = e.target.closest(".act-cell");
  if (!c) return;
  document.querySelectorAll(".act-cell.sel").forEach(x => x.classList.remove("sel"));
  c.classList.add("sel");
  $("act-tip").textContent = c.dataset.tip;
}
