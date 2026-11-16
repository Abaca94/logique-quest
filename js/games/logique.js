/* ============================================================
   Déduction (Cross-Logic) — grilles à cocher ✘ / ✔
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
let lgIdx = 0, lgLock = false;

function initLogic() {
  renderLogicChips();
  renderLogic();
}
function selectLogic(i) {
  navToken++;
  lgIdx = i;
  renderLogicChips();
  renderLogic();
}
function renderLogicChips() {
  $("lg-chips").innerHTML = LOGIC_PL.map((_, i) =>
    `<button class="chip ${i === lgIdx ? "active" : ""}" onclick="selectLogic(${i})">Grille ${i + 1}</button>`).join("");
}
function renderLogic() {
  const P = LOGIC_PL[lgIdx];
  lgLock = false;
  $("lg-story").innerHTML = P.story;
  $("lg-clues").innerHTML = "<ul>" + P.clues.map((c, i) => `<li><span class="n">${i + 1}.</span><span>${c}</span></li>`).join("") + "</ul>";
  $("lg-grids").innerHTML = logicTable(P, "B") + logicTable(P, "C");
  $("lg-feedback").className = "feedback";
}
function logicTable(P, side) {
  const labels = P["label" + side];
  const big = labels.length > 4 ? " lgx" : "";
  let html = `<p class="lg-title">${P.qA} × ${P["q" + side]}</p>
  <div class="lg-scroll"><table class="lg"><tr><th></th>${labels.map(l => `<th>${l}</th>`).join("")}</tr>`;
  for (let a = 0; a < P.labelA.length; a++) {
    html += `<tr><td class="a">${P.labelA[a]}</td>`;
    for (let s = 0; s < labels.length; s++) {
      html += `<td class="lgc${big}" data-a="${a}" data-s="${side}" data-i="${s}"></td>`;
    }
    html += "</tr>";
  }
  return html + "</table></div>";
}
function cycleLogicCell(c) {
  const next = c.textContent === "" ? "✘" : c.textContent === "✘" ? "✔" : "";
  c.textContent = next;
  c.classList.toggle("x", next === "✘");
  c.classList.toggle("v", next === "✔");
  sfx("tick");
}
function checkLogic() {
  if (lgLock) return;
  const P = LOGIC_PL[lgIdx];
  const marks = {};
  ["B", "C"].forEach(side => {
    marks[side] = P.labelA.map(() => P["label" + side].map(() => ""));
    document.querySelectorAll(`#lg-grids .lgc[data-s="${side}"]`).forEach(c => {
      marks[side][+c.dataset.a][+c.dataset.i] = c.textContent;
    });
  });
  const okSide = side => {
    const sol = P["sol" + side];
    return P.labelA.every((_, a) =>
      marks[side][a][sol[a]] === "✔" && marks[side][a].every((m, i) => m !== "✔" || i === sol[a]));
  };
  const fb = $("lg-feedback");
  if (!["B", "C"].every(side => marks[side].some(row => row.includes("✔")))) {
    fb.className = "feedback show ko";
    fb.innerHTML = "Placez d’abord vos ✘ et ✔ dans les deux tableaux.";
    return;
  }
  const doneB = okSide("B"), doneC = okSide("C");
  if (doneB && doneC) {
    lgLock = true;
    const pts = 40 + lgIdx * 10;
    addPoints(pts); state.solved++;
    setBest("logique", lgIdx + 1);
    save(); sfx("good");
    fb.className = "feedback show ok";
    fb.innerHTML = `<b>Déductions exactes.</b> +${pts} points`;
    later(() => {
      if (lgIdx < LOGIC_PL.length - 1) selectLogic(lgIdx + 1);
      else { lgIdx = 0; winGame("Esprit de détective", `Les ${LOGIC_PL.length} grilles de déduction sont résolues.`, 240); }
    }, 1600);
  } else {
    addPoints(-3); sfx("bad");
    const where = !doneB && !doneC ? "les deux tableaux" : doneB ? "le second tableau" : "le premier tableau";
    fb.className = "feedback show ko";
    fb.innerHTML = `Quelque chose cloche dans ${where}. Chaque ligne doit avoir exactement un ✔, au bon endroit.`;
  }
}

LQ.register({
  id: "logique",
  title: "Déduction",
  desc: "Qui fait quoi ? Croisez les indices",
  hue: "#c79bf2",
  recordLabel: v => `Record : grille ${v}`,
  init: initLogic,
  screen: `
    <div class="chips" id="lg-chips"></div>
    <div class="quiz-card">
      <div class="lg-story" id="lg-story"></div>
      <div class="clues" id="lg-clues"></div>
      <div id="lg-grids"></div>
      <div class="feedback" id="lg-feedback"></div>
      <div class="actions-row">
        <button class="btn small" onclick="checkLogic()">${ICONS.check} Vérifier</button>
      </div>
    </div>
    <p class="hint-line">Touchez une case : une fois pour ✘, deux fois pour ✔, trois fois pour l’effacer.</p>`,
  setup() {
    $("lg-grids").addEventListener("click", e => {
      const c = e.target.closest(".lgc");
      if (c) cycleLogicCell(c);
    });
  },
});
