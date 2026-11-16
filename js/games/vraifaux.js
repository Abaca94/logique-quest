/* ============================================================
   Vrai ou faux — affirmations surprenantes, avec explication
   ============================================================ */
const VF_LIST = [
  { s: "Le plus grand désert du monde est l’Antarctique.", v: true, e: "Un désert se définit par l’absence de précipitations : l’Antarctique est le plus vaste." },
  { s: "Les araignées sont des insectes.", v: false, e: "Elles ont huit pattes, les insectes six : ce sont des arachnides." },
  { s: "Le miel ne se périme pas.", v: true, e: "Des pots vieux de plus de 3 000 ans retrouvés en Égypte étaient encore comestibles." },
  { s: "La tour Eiffel peut gagner jusqu’à 15 cm en été.", v: true, e: "Le fer se dilate à la chaleur : la tour grandit au soleil." },
  { s: "Les poissons rouges ont une mémoire de trois secondes.", v: false, e: "C’est un mythe : ils retiennent des informations pendant des mois." },
  { s: "Les étoiles filantes sont des étoiles.", v: false, e: "Ce sont des poussières et des petits cailloux qui brûlent en entrant dans l’atmosphère." },
  { s: "On voit la Grande Muraille de Chine depuis la Lune à l’œil nu.", v: false, e: "C’est une légende : même depuis l’orbite basse, elle est à peine visible." },
  { s: "Pour un botaniste, la tomate est un fruit.", v: true, e: "Elle se forme à partir d’une fleur et contient des graines : c’est un fruit." },
  { s: "Un éclair est plus chaud que la surface du Soleil.", v: true, e: "Environ 30 000 °C, contre à peu près 5 500 °C à la surface du Soleil." },
  { s: "Un chewing-gum avalé reste sept ans dans l’estomac.", v: false, e: "Il est évacué comme le reste, en quelques jours." },
  { s: "Les pieuvres ont trois cœurs.", v: true, e: "Deux irriguent les branchies, le troisième le reste du corps." },
  { s: "L’autruche enfouit sa tête dans le sable quand elle a peur.", v: false, e: "Elle baisse la tête au ras du sol pour se faire discrète, mais ne l’enterre pas." },
];
let vfShuffled = [], vfIndex = 0, vfGood = 0, vfLock = false;

// cfg (mode parcours) : { ids: [indices dans VF_LIST] }
function initVF(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  vfShuffled = shuffle(cfg && cfg.ids ? cfg.ids.map(i => VF_LIST[i]) : VF_LIST);
  vfIndex = 0; vfGood = 0;
  renderVF();
}
function renderVF() {
  const item = vfShuffled[vfIndex];
  $("vf-progress").textContent = `Affirmation ${vfIndex + 1} sur ${vfShuffled.length}`;
  $("vf-fill").style.width = (vfIndex / vfShuffled.length * 100) + "%";
  $("vf-question").textContent = "« " + item.s + " »";
  $("vf-feedback").className = "feedback";
  document.querySelectorAll("#screen-vf .vf-btn").forEach(b => b.disabled = false);
  $("vf-next").style.display = "none";
  vfLock = false;
}
function answerVF(v) {
  if (vfLock) return;
  vfLock = true;
  document.querySelectorAll("#screen-vf .vf-btn").forEach(b => b.disabled = true);
  const item = vfShuffled[vfIndex];
  const ok = v === item.v;
  const fb = $("vf-feedback");
  if (ok) {
    vfGood++;
    addPoints(10); state.solved++;
    if (!LQ.level) setBest("vf", vfGood);
    save();
    sfx("good");
    fb.className = "feedback show ok";
    fb.innerHTML = `<b>Bonne réponse.</b> ${escapeHtml(item.e)} +10 points`;
  } else {
    addPoints(-3);
    sfx("bad");
    fb.className = "feedback show ko";
    fb.innerHTML = `C’était <b>${item.v ? "vrai" : "faux"}</b>. ${escapeHtml(item.e)}`;
  }
  $("vf-next").style.display = "";
  $("vf-next-btn").textContent = vfIndex < vfShuffled.length - 1 ? "Affirmation suivante →" : "Voir le résultat";
}
function nextVF() {
  vfIndex++;
  if (vfIndex < vfShuffled.length) { renderVF(); window.scrollTo(0, 0); }
  else winGame("Démêlé", `${vfGood} bonne${vfGood > 1 ? "s" : ""} réponse${vfGood > 1 ? "s" : ""} sur ${vfShuffled.length}.`, 0, starsByCount(vfGood, vfShuffled.length));
}

LQ.register({
  id: "vf",
  title: "Vrai ou faux",
  desc: "Idées reçues et faits étonnants",
  hue: "#e58fb0",
  recordLabel: v => `Record : ${v} bonnes réponses`,
  init: initVF,
  levelInfo: cfg => ({ what: `${cfg.ids.length} affirmations à départager`, goals: countGoals(cfg.ids.length) }),
  screen: `
    <div class="quiz-card">
      <div class="quiz-progress" id="vf-progress"></div>
      <div class="progress-track"><div class="progress-fill" id="vf-fill"></div></div>
      <div class="question-txt" id="vf-question" style="text-align:center"></div>
      <div class="vf-row">
        <button class="vf-btn v" onclick="answerVF(true)">${ICONS.check} VRAI</button>
        <button class="vf-btn f" onclick="answerVF(false)">${ICONS.cross} FAUX</button>
      </div>
      <div class="feedback" id="vf-feedback"></div>
      <div class="actions-row" id="vf-next" style="display:none">
        <button class="btn" id="vf-next-btn" onclick="nextVF()">Affirmation suivante →</button>
      </div>
    </div>`,
});
