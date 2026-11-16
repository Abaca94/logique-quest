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
  /* ----- Ajouts v5.0 ----- */
  { s: "Au sens botanique, la banane est une baie.", v: true, e: "Elle provient d’une seule fleur, avec un seul ovaire, et ses graines sont dans la chair : c’est une baie." },
  { s: "Au sens botanique, la fraise est une baie.", v: false, e: "C’est un « faux fruit » : les vrais fruits sont les petits grains (akènes) à sa surface." },
  { s: "Vénus tourne sur elle-même dans le sens inverse de la plupart des planètes.", v: true, e: "Sa rotation est rétrograde : sur Vénus, le Soleil se lève à l’ouest." },
  { s: "Sur Vénus, un jour dure plus longtemps qu’une année.", v: true, e: "Elle fait un tour sur elle-même en 243 jours terrestres, et le tour du Soleil en 225." },
  { s: "Le son se propage plus vite dans l’eau que dans l’air.", v: true, e: "Environ 1 500 m/s dans l’eau, contre 340 m/s dans l’air." },
  { s: "L’Everest est la plus haute montagne du Système solaire.", v: false, e: "Olympus Mons, sur Mars, culmine à plus de 20 km, plus du double de l’Everest." },
  { s: "L’Australie est plus large, d’est en ouest, que le diamètre de la Lune.", v: true, e: "L’Australie fait environ 4 000 km de large, la Lune 3 474 km de diamètre." },
  { s: "Les chauves-souris sont aveugles.", v: false, e: "Toutes voient ; beaucoup s’orientent en plus grâce à l’écholocation." },
  { s: "Le diamant et le graphite des crayons sont faits du même élément.", v: true, e: "Tous deux sont du carbone pur, organisé différemment." },
  { s: "Au sommet du mont Blanc, l’eau bout à 100 °C.", v: false, e: "La pression y est plus faible : l’eau bout vers 85 °C." },
  { s: "Nous n’utilisons que 10 % de notre cerveau.", v: false, e: "C’est un mythe : l’imagerie montre que toutes les zones du cerveau sont actives." },
  { s: "Le koala peut dormir environ 20 heures par jour.", v: true, e: "Son régime d’eucalyptus apporte très peu d’énergie : il dort de 18 à 22 heures par jour." },
  { s: "L’année-lumière est une unité de temps.", v: false, e: "C’est une distance : celle que parcourt la lumière en un an, environ 9 500 milliards de km." },
  { s: "La lumière du Soleil met environ 8 minutes pour nous parvenir.", v: true, e: "Elle parcourt 150 millions de km à 300 000 km/s : environ 8 minutes 20." },
  { s: "Napoléon était particulièrement petit pour son époque.", v: false, e: "Il mesurait environ 1,69 m, un peu plus que la moyenne des Français d’alors." },
  { s: "Les Vikings portaient des casques à cornes au combat.", v: false, e: "Aucun casque à cornes viking n’a été retrouvé : l’image vient de l’opéra du XIXe siècle." },
  { s: "L’océan Pacifique est le plus grand océan du monde.", v: true, e: "Il couvre environ un tiers de la surface de la Terre, plus que toutes les terres émergées." },
  { s: "Le Nil coule du sud vers le nord.", v: true, e: "Il prend sa source en Afrique de l’Est et se jette dans la Méditerranée, au nord de l’Égypte." },
  { s: "Les vitraux anciens sont plus épais en bas parce que le verre coule lentement.", v: false, e: "Le verre ne coule pas à température ambiante ; les verriers posaient souvent le côté épais en bas." },
  { s: "Les plantes rejettent aussi du dioxyde de carbone.", v: true, e: "Elles respirent jour et nuit ; le jour, la photosynthèse absorbe davantage de CO₂ qu’elles n’en rejettent." },
  { s: "La Joconde a été volée au Louvre en 1911.", v: true, e: "Volée par Vincenzo Peruggia, elle n’a été retrouvée qu’en 1913, à Florence." },
  { s: "La Grande Pyramide de Gizeh a été construite après la fondation de Rome.", v: false, e: "Elle date d’environ 2560 av. J.-C., près de 1 800 ans avant la fondation légendaire de Rome (753 av. J.-C.)." },
  { s: "Cléopâtre a vécu plus près de notre époque que de la construction de la Grande Pyramide.", v: true, e: "Environ 2 500 ans la séparent de la pyramide, et environ 2 050 ans de nous." },
  { s: "Les requins existaient déjà avant les premiers arbres.", v: true, e: "Les premiers requins ont plus de 400 millions d’années, les premiers arbres environ 385 millions." },
  { s: "Le squelette d’un adulte compte 206 os.", v: true, e: "C’est le chiffre habituel ; il varie un peu d’une personne à l’autre." },
  { s: "Un bébé a moins d’os qu’un adulte.", v: false, e: "Il en a environ 300 : beaucoup se soudent en grandissant." },
  { s: "Le cuivre conduit mieux l’électricité que l’argent.", v: false, e: "L’argent est le meilleur conducteur ; le cuivre, presque aussi bon, est bien moins cher." },
  { s: "Les flamants roses naissent roses.", v: false, e: "Les poussins sont gris-blanc ; leur couleur vient des pigments de leur alimentation." },
  { s: "Le mot « robot » vient du tchèque.", v: true, e: "Il a été popularisé en 1920 par la pièce de Karel Čapek, d’après « robota », le travail forcé." },
  { s: "La France compte plus d’habitants que l’Allemagne.", v: false, e: "L’Allemagne compte environ 84 millions d’habitants, la France environ 68 millions." },
  { s: "Une pièce de monnaie lâchée du haut de la tour Eiffel peut tuer un passant.", v: false, e: "Freinée par l’air, elle ne dépasse pas environ 40 km/h : douloureux, mais pas mortel." },
  { s: "Le moustique est l’animal responsable du plus grand nombre de morts humaines chaque année.", v: true, e: "Par les maladies qu’il transmet (paludisme, dengue…), il cause des centaines de milliers de morts par an." },
  { s: "La Lune s’éloigne de la Terre de quelques centimètres chaque année.", v: true, e: "Environ 3,8 cm par an, mesurés grâce aux réflecteurs laissés par les missions Apollo." },
  { s: "Il fait plus chaud en été parce que la Terre est alors plus proche du Soleil.", v: false, e: "C’est l’inclinaison de la Terre qui compte : elle est même au plus près du Soleil début janvier." },
  { s: "Le sommet de l’Everest est le point de la surface terrestre le plus éloigné du centre de la Terre.", v: false, e: "C’est le Chimborazo, en Équateur : la Terre est renflée à l’équateur." },
  { s: "On trouve des manchots à l’état sauvage au pôle Nord.", v: false, e: "Ils vivent tous dans l’hémisphère Sud." },
  { s: "Paris est située plus au nord que Montréal.", v: true, e: "Paris est vers 48,9° de latitude nord, Montréal vers 45,5°." },
  { s: "Le Japon compte plus de 6 000 îles.", v: true, e: "Un recensement de 2023 en a dénombré plus de 14 000." },
];
let vfShuffled = [], vfIndex = 0, vfGood = 0, vfLock = false;

// cfg (mode parcours) : { ids: [indices dans VF_LIST] }
function initVF(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  // Jeu libre : une série de 12 affirmations tirées au hasard parmi toutes.
  vfShuffled = cfg && cfg.items ? shuffle(cfg.items) : cfg && cfg.ids ? shuffle(cfg.ids.map(i => VF_LIST[i])) : shuffle([...VF_LIST]).slice(0, 12);
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
    if (!levelCfg()) setBest("vf", vfGood);
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
  levelInfo: cfg => { const n = (cfg.items || cfg.ids).length; return { what: `${n} affirmations à départager`, goals: countGoals(n) }; },
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
