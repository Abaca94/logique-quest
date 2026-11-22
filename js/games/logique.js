/* ============================================================
   Déduction — tableaux croisés à cocher ✘ / ✔
   ============================================================ */
const LOGIC_PL = [
  {
    story: "<b>Le quatuor</b>. Quatre musiciens, quatre instruments, quatre pulls.",
    labelA: ["Léa", "Marc", "Nina", "Tom"], labelB: ["Piano", "Violon", "Batterie", "Guitare"], labelC: ["Rouge", "Bleu", "Vert", "Jaune"],
    qA: "Musiciens", qB: "Instruments", qC: "Pulls",
    clues: ["Nina joue de la batterie.", "Marc ne touche à aucun instrument à cordes (ni violon ni guitare).", "Léa joue du violon.", "Nina porte un pull rouge.", "Léa porte un pull vert.", "Marc porte un pull bleu."],
    solB: [1, 0, 2, 3], solC: [2, 1, 0, 3],
  },
  {
    story: "<b>L’immeuble</b>. Quatre voisins, quatre étages, quatre animaux.",
    labelA: ["Sacha", "Ana", "Hugo", "Mia"], labelB: ["1er", "2e", "3e", "4e"], labelC: ["Chat", "Chien", "Lapin", "Poisson"],
    qA: "Voisins", qB: "Étages", qC: "Animaux",
    clues: ["Ana vit au 2e étage.", "Mia vit juste au-dessus de Sacha.", "Ana n’a pas d’animal à quatre pattes.", "Mia a un lapin.", "Sacha n’a pas de chien."],
    solB: [2, 1, 0, 3], solC: [0, 3, 1, 2],
  },
  {
    story: "<b>Le dîner</b>. Quatre convives, quatre desserts, quatre boissons.",
    labelA: ["Noé", "Rose", "Ugo", "Zia"], labelB: ["Tarte", "Fondant", "Sorbet", "Crêpe"], labelC: ["Thé", "Café", "Tisane", "Eau"],
    qA: "Convives", qB: "Desserts", qC: "Boissons",
    clues: ["Rose a choisi le sorbet.", "Noé ne prend ni fondant ni crêpe.", "Ugo ne prend pas de crêpe.", "Zia boit de l’eau.", "Rose boit une tisane.", "Noé boit du thé."],
    solB: [0, 2, 1, 3], solC: [0, 2, 1, 3],
  },
  {
    story: "<b>Le club de sport</b>. Quatre sportifs, quatre disciplines, quatre jours d’entraînement.",
    labelA: ["Ili", "Jo", "Ken", "Lou"], labelB: ["Foot", "Natation", "Tennis", "Vélo"], labelC: ["Lundi", "Mardi", "Mercredi", "Jeudi"],
    qA: "Sportifs", qB: "Disciplines", qC: "Jours",
    clues: ["Lou fait de la natation.", "Jo ne fait ni foot ni tennis.", "Ken ne fait pas de tennis.", "Ken s’entraîne le jeudi.", "Le cycliste s’entraîne le lundi.", "Lou s’entraîne avant Ili."],
    solB: [2, 3, 0, 1], solC: [2, 0, 3, 1],
  },
  {
    story: "<b>L’île au trésor</b> (expert). Cinq pirates, cinq cachettes, cinq compagnons.",
    labelA: ["Barbe-Rousse", "Léon", "Miss Croche", "Pablo", "Zéphyr"],
    labelB: ["Crique Ouest", "Grotte du Crâne", "Lagon Nord", "Rade Cachée", "Baie Tortue"],
    labelC: ["Perroquet", "Singe", "Iguane", "Rat", "Chat"],
    qA: "Pirates", qB: "Cachettes", qC: "Compagnons",
    clues: [
      "Léon se cache à la Crique Ouest.",
      "Miss Croche ne se cache ni au Lagon Nord ni à la Grotte du Crâne.",
      "Barbe-Rousse possède un perroquet.",
      "Le pirate caché au Lagon Nord a un chat.",
      "Le pirate qui a un rat se cache à la Baie Tortue.",
      "Pablo n’a ni rat ni perroquet.",
      "Le pirate de la Rade Cachée n’a pas de singe.",
      "Zéphyr ne se cache ni à la Rade Cachée ni à la Baie Tortue.",
      "Barbe-Rousse ne se cache pas à la Rade Cachée.",
      "Zéphyr possède le chat.",
    ],
    solB: [1, 0, 4, 3, 2], solC: [0, 1, 3, 2, 4],
  },
  {
    story: "<b>Le train de 8 h 06</b> (expert+). Six voyageurs, six destinations, six valises.",
    labelA: ["Ida", "Joachim", "Kenza", "Ludo", "Nat", "Ivan"],
    labelB: ["Bordeaux", "Calais", "Dijon", "Lille", "Nice", "Tours"],
    labelC: ["Rouge", "Verte", "Bleue", "Jaune", "Noire", "Violette"],
    qA: "Voyageurs", qB: "Destinations", qC: "Valises",
    clues: [
      "Joachim a une valise jaune.",
      "Le voyageur qui va à Dijon a une valise jaune.",
      "Ida va à Nice.",
      "Kenza va à Bordeaux.",
      "Le voyageur à la valise rouge va à Tours.",
      "Nat n’a pas de valise rouge.",
      "Ludo va à Lille ou à Nice.",
      "La valise verte n’est pas celle de Ludo.",
      "La valise bleue appartient au voyageur qui va à Calais.",
      "Ivan n’a pas de valise verte.",
      "Kenza a une valise violette ou noire.",
      "Nat ne va ni à Lille ni à Nice.",
      "Ida n’a pas de valise noire.",
      "Le voyageur à la valise noire ne va pas à Tours.",
      "La valise violette va à Dijon ou à Bordeaux.",
    ],
    solB: [4, 2, 0, 3, 1, 5], solC: [1, 3, 5, 4, 2, 0],
  },
];
let lgIdx = 0, lgLock = false, lgErrors = 0, lgGen = null, lgGenN = 4, lgGenX = false;
// Grille en cours : celle imposée par un épisode de l’histoire (cfg.puzzle), sinon LOGIC_PL[lgIdx].
// Grille générée (cfg.gen en parcours ou défi, ou bouton « Nouvelle grille ») : lgGen.
function lgP() { const c = levelCfg(); return (c && c.puzzle) || ((c && c.gen) || lgIdx < 0 ? lgGen : LOGIC_PL[lgIdx]); }
let lgAuto = true; // ✘ automatiques sur la ligne et la colonne d’un ✔

/* Tableau croisé (grille en escalier) :
            | B (colonnes) | C (colonnes)
   A (lignes)|    A × B     |    A × C
   C (lignes)|    C × B     |
   Les blocs A×B et A×C sont vérifiés ; le bloc C×B sert d’aide au raisonnement. */

// cfg (mode parcours) : { grid: indice dans LOGIC_PL }
function initLogic(cfg) {
  cfg = cfg || levelCfg();
  if (cfg && cfg.grid !== undefined) lgIdx = cfg.grid;
  if (cfg && cfg.gen) lgGen = lgGenerate(cfg.gen, undefined, cfg.expert);
  else if (!cfg && lgIdx < 0) lgGen = lgGenerate(lgGenN, undefined, lgGenX);
  try { lgAuto = localStorage.getItem("lq_lg_auto") !== "0"; } catch (e) {}
  renderLogicChips();
  renderLogic();
}
function selectLogic(i) {
  navToken++;
  lgIdx = i;
  renderLogicChips();
  renderLogic();
}
function newLogicGen(n, expert) {
  navToken++;
  lgIdx = -1; lgGenN = n; lgGenX = !!expert; lgGen = lgGenerate(n, undefined, lgGenX);
  renderLogicChips();
  renderLogic();
}
function renderLogicChips() {
  $("lg-chips").innerHTML = LOGIC_PL.map((_, i) =>
    `<button class="chip ${i === lgIdx ? "active" : ""}" onclick="selectLogic(${i})">Grille ${i + 1}</button>`).join("")
    + `<span class="chips-break"></span>`
    + [[4, 0, "Facile 4×4"], [5, 0, "Moyen 5×5"], [6, 0, "Difficile 6×6"], [6, 1, "Expert 6×6"]].map(([n, x, l]) => `<button class="chip chip-gen ${lgIdx < 0 && lgGenN === n && lgGenX === !!x ? "active" : ""}" onclick="newLogicGen(${n}, ${x})">${ICONS.shuffle} ${l}</button>`).join("");
}
function renderLogic() {
  const P = lgP();
  lgLock = false; lgErrors = 0;
  $("lg-story").innerHTML = P.story;
  $("lg-clues").innerHTML = "<ul>" + P.clues.map((c, i) => `<li><span class="n">${i + 1}.</span><span>${c}</span></li>`).join("") + "</ul>";
  $("lg-grids").innerHTML = logicCrossTable(P);
  $("lg-feedback").className = "feedback";
  $("lg-auto").classList.toggle("active", lgAuto); $("lg-auto").setAttribute("aria-pressed", String(lgAuto));
}
function logicCrossTable(P) {
  const n = P.labelA.length;
  const cell = (g, r, c) => `<td class="lgc" data-g="${g}" data-r="${r}" data-c="${c}"></td>`;
  const sp = '<td class="sp"></td>';
  let h = `<table class="lg lg-cross lg-n${n}">`;
  // Titres des groupes de colonnes
  h += `<tr><th colspan="2"></th><th class="grp" colspan="${n}">${P.qB}</th>${sp}<th class="grp" colspan="${n}">${P.qC}</th></tr>`;
  // Noms des colonnes (verticaux)
  h += `<tr><th colspan="2"></th>${P.labelB.map(l => `<th class="col"><span>${l}</span></th>`).join("")}${sp}${P.labelC.map(l => `<th class="col"><span>${l}</span></th>`).join("")}</tr>`;
  // Bloc A : A×B puis A×C
  for (let a = 0; a < n; a++) {
    h += "<tr>";
    if (a === 0) h += `<th class="grp-row" rowspan="${n}"><span>${P.qA}</span></th>`;
    h += `<td class="a">${P.labelA[a]}</td>`;
    for (let b = 0; b < n; b++) h += cell("AB", a, b);
    h += sp;
    for (let c = 0; c < n; c++) h += cell("AC", a, c);
    h += "</tr>";
  }
  h += `<tr class="sp-row"><td colspan="${2 * n + 3}"></td></tr>`;
  // Bloc C : C×B
  for (let c = 0; c < n; c++) {
    h += "<tr>";
    if (c === 0) h += `<th class="grp-row" rowspan="${n}"><span>${P.qC}</span></th>`;
    h += `<td class="a">${P.labelC[c]}</td>`;
    for (let b = 0; b < n; b++) h += cell("CB", c, b);
    h += "</tr>";
  }
  return `<div class="lg-scroll">${h}</table></div>`;
}
function lgCell(g, r, c) {
  return document.querySelector(`#lg-grids .lgc[data-g="${g}"][data-r="${r}"][data-c="${c}"]`);
}
function setLogicMark(el, mark) {
  el.textContent = mark;
  el.classList.toggle("x", mark === "✘");
  el.classList.toggle("v", mark === "✔");
}
function cycleLogicCell(el) {
  const next = el.textContent === "" ? "✘" : el.textContent === "✘" ? "✔" : "";
  setLogicMark(el, next);
  if (next === "✔" && lgAuto) {
    // Un seul ✔ par ligne et par colonne dans un bloc : on barre le reste automatiquement.
    const g = el.dataset.g, r = +el.dataset.r, c = +el.dataset.c;
    const n = lgP().labelA.length;
    for (let k = 0; k < n; k++) {
      if (k !== c) { const o = lgCell(g, r, k); if (o.textContent === "") setLogicMark(o, "✘"); }
      if (k !== r) { const o = lgCell(g, k, c); if (o.textContent === "") setLogicMark(o, "✘"); }
    }
  }
  sfx("tick");
}
function toggleLogicAuto() {
  lgAuto = !lgAuto;
  try { localStorage.setItem("lq_lg_auto", lgAuto ? "1" : "0"); } catch (e) {}
  $("lg-auto").classList.toggle("active", lgAuto); $("lg-auto").setAttribute("aria-pressed", String(lgAuto));
  toast(lgAuto ? "Croix automatiques activées" : "Croix automatiques désactivées");
}
function clearLogic() {
  document.querySelectorAll("#lg-grids .lgc").forEach(el => setLogicMark(el, ""));
  $("lg-feedback").className = "feedback";
}
function checkLogic() {
  if (lgLock) return;
  const P = lgP();
  const n = P.labelA.length;
  const read = g => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => lgCell(g, r, c).textContent));
  const AB = read("AB"), AC = read("AC");
  const okBlock = (m, sol) => m.every((row, r) => row[sol[r]] === "✔" && row.every((x, c) => x !== "✔" || c === sol[r]));
  const fb = $("lg-feedback");
  if (![AB, AC].every(m => m.some(row => row.includes("✔")))) {
    fb.className = "feedback show ko";
    fb.innerHTML = `Placez vos ✔ dans les blocs « ${P.qA} × ${P.qB} » et « ${P.qA} × ${P.qC} ».`;
    return;
  }
  const doneB = okBlock(AB, P.solB), doneC = okBlock(AC, P.solC);
  if (doneB && doneC) {
    lgLock = true;
    const gen = !!P.generated;
    const pts = gen ? ({ 4: 50, 5: 80, 6: 120 }[n] || 80) + (P.expert ? 40 : 0) : 40 + lgIdx * 10;
    addPoints(pts); state.solved++;
    if (!levelCfg() && !gen) setBest("logique", lgIdx + 1);
    save(); sfx("good");
    fb.className = "feedback show ok";
    fb.innerHTML = `<b>Déductions exactes.</b> +${pts} points`;
    // 3 étoiles sans erreur de vérification, 2 avec une erreur, 1 au-delà.
    const stars = lgErrors === 0 ? 3 : lgErrors === 1 ? 2 : 1;
    if (levelCfg()) {
      later(() => winGame("Déductions exactes", `${P.story.replace(/<[^>]+>/g, "").split(".")[0]} : grille résolue${lgErrors ? ` après ${lgErrors} vérification${lgErrors > 1 ? "s" : ""} ratée${lgErrors > 1 ? "s" : ""}` : " du premier coup"}.`, 0, stars), 1200);
      return;
    }
    if (gen) {
      later(() => winGame("Déductions exactes", `Grille ${P.expert ? "experte" : "générée"} ${n}×${n} résolue${lgErrors ? ` après ${lgErrors} vérification${lgErrors > 1 ? "s" : ""} ratée${lgErrors > 1 ? "s" : ""}` : " du premier coup"}. +${pts} points`, pts, stars), 1200);
      return;
    }
    later(() => {
      if (lgIdx < LOGIC_PL.length - 1) selectLogic(lgIdx + 1);
      else { lgIdx = 0; winGame("Esprit de détective", `Les ${LOGIC_PL.length} grilles de déduction sont résolues.`, 240); }
    }, 1600);
  } else {
    addPoints(-3); sfx("bad"); lgErrors++;
    const where = !doneB && !doneC ? "les deux blocs du haut" : doneB ? `le bloc « ${P.qA} × ${P.qC} »` : `le bloc « ${P.qA} × ${P.qB} »`;
    fb.className = "feedback show ko";
    fb.innerHTML = `Quelque chose cloche dans ${where}. Chaque ligne doit avoir exactement un ✔, au bon endroit.`;
  }
}

LQ.register({
  id: "logique",
  title: "Déduction",
  desc: "Qui fait quoi ? Tableaux croisés",
  hue: "#c79bf2",
  recordLabel: v => `Record : grille ${v}`,
  init: initLogic,
  levelInfo: cfg => ({
    what: cfg.gen ? `Une grille de déduction ${cfg.gen}×${cfg.gen} inédite${cfg.expert ? ", niveau expert (aucun indice direct)" : ", tirée au hasard"}` : (cfg.puzzle || LOGIC_PL[cfg.grid]).story.replace(/<[^>]+>/g, ""),
    goals: ["Résoudre sans erreur de vérification", "Au plus une vérification ratée", "Résoudre la grille"],
  }),
  rules: [
    "Lisez les indices : chaque élément de la première catégorie correspond à exactement un élément de chacune des deux autres.",
    "Touchez une case une fois pour ✘ (impossible), deux fois pour ✔ (certain), trois fois pour l’effacer.",
    "Un ✔ exclut le reste de sa ligne et de sa colonne : l’option « croix automatiques » les place pour vous.",
    "Le bloc du bas croise les deux autres catégories entre elles : il aide à combiner les indices. Touchez <b>Vérifier</b> quand vous pensez avoir trouvé.",
    "Les boutons du bas tirent une grille inédite, de 4×4 à 6×6 : une seule solution, et aucun indice superflu. En <b>Expert</b>, aucun indice ne donne directement une réponse : tout se croise.",
  ],
  screen: `
    <div class="chips lvl-hide" id="lg-chips"></div>
    <div class="quiz-card">
      <div class="lg-story" id="lg-story"></div>
      <div class="clues" id="lg-clues"></div>
      <div id="lg-grids"></div>
      <div class="feedback" id="lg-feedback"></div>
      <div class="actions-row">
        <button class="btn small" onclick="checkLogic()">${ICONS.check} Vérifier</button>
        <button class="chip" id="lg-auto" aria-pressed="true" onclick="toggleLogicAuto()">Croix automatiques</button>
        <button class="btn ghost small" onclick="clearLogic()">${ICONS.erase} Tout effacer</button>
      </div>
    </div>
    <p class="hint-line">Touchez une case : une fois pour ✘, deux fois pour ✔, trois fois pour l’effacer.<br>Le bloc du bas sert à croiser les deux autres catégories entre elles.</p>`,
  setup() {
    $("lg-grids").addEventListener("click", e => {
      const c = e.target.closest(".lgc");
      if (c) cycleLogicCell(c);
    });
  },
});
