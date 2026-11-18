/* ============================================================
   LogiqueQuest — mode histoire
   Tome 1, « Le Secret du cristal » : Venise, printemps 1500.
   Tome 2, « Les Cendres du Fondaco » : Venise, hiver 1505
   (ouvert quand le tome 1 est terminé).
   Chaque épisode = un texte, une épreuve (un jeu avec une
   configuration, parfois un contenu propre à l’histoire), puis la
   suite du récit. Un épisode s’ouvre quand le précédent est réussi.
   Les personnages sont inventés ; le décor et les faits d’époque
   cités sont réels.
   ============================================================ */

const STORIES = [{
  id: "cristal",
  blurb: "10 épisodes à Venise, en 1500",
  title: "Le Secret du cristal",
  era: "Venise, printemps 1500",
  prologue: "La Sérénissime est au sommet de sa puissance. Ses galères dominent la Méditerranée, ses marchands commercent jusqu’à Alexandrie, et les verriers de Murano fabriquent un verre aussi limpide que le cristal, dont la recette est un secret d’État. Une nuit, ce secret disparaît. Le Conseil des Dix vous confie l’enquête : le retrouver avant qu’il ne quitte la lagune.",
  epilogue: "Le secret du cristal est resté vénitien. Merci d’avoir servi la Sérénissime.",
  episodes: [
    {
      place: "Palais des Doges", title: "La gueule du lion",
      text: [
        "À l’aube, un huissier vous conduit sous les arcades du Palais des Doges. Dans le mur, une bouche de lion sculptée reçoit les dénonciations anonymes adressées au Conseil des Dix. Cette nuit, quelqu’un y a glissé un billet.",
        "« Le secret du cristal a quitté son île. Le voleur partira le jour de la Sensa. Cherchez d’abord là où l’on souffle le verre. »",
        "Une partie du billet est chiffrée. Avant d’agir, il faut le déchiffrer.",
      ],
      game: "enigmes",
      cfg: { items: [
        { q: "En bas du billet, un mot chiffré : chaque lettre a été remplacée par celle qui la suit dans l’alphabet (A devient B, B devient C…). Le mot chiffré est « NVSBOP ». Quel est le mot d’origine ?",
          a: "Murano", accept: ["murano"],
          hint: "Remplacez chaque lettre par celle qui la précède : N devient M.",
          ex: "N→M, V→U, S→R, B→A, O→N, P→O : MURANO, l’île des verriers." },
        { q: "La Sensa, fête de l’Ascension, a lieu 39 jours après Pâques. Cette année, Pâques tombe le 19 avril. Quel jour du mois de mai le voleur partira-t-il ?",
          num: 28, a: "le 28 mai", accept: ["vingt-huit", "vingt huit"],
          hint: "Avril compte 30 jours : combien de jours reste-t-il après le 19 avril ?",
          ex: "Du 19 au 30 avril : 11 jours. Il en reste 39 − 11 = 28 : le 28 mai." },
        { q: "Une barque vous attend pour Murano. Elle parcourt 6 milles à la vitesse de 4 milles par heure. Combien de minutes dure la traversée ?",
          num: 90, a: "90 minutes", accept: ["quatre-vingt-dix", "quatre vingt dix", "1h30", "une heure et demie"],
          hint: "6 milles à 4 milles par heure, c’est une heure et quelque chose.",
          ex: "6 ÷ 4 = 1,5 heure, soit 90 minutes." },
      ] },
      outro: "Le voleur partira le 28 mai, jour où le doge épouse la mer. Il vous reste un mois. La barque vous attend : cap sur Murano.",
    },
    {
      place: "Murano", title: "Les fours de Murano",
      text: [
        "Depuis 1291, les verriers de Venise travaillent sur l’île de Murano, loin des maisons de bois que leurs fours pourraient enflammer. Il leur est interdit de quitter la République : leur savoir est trop précieux.",
        "Maître Bortolo vous reçoit dans son atelier dévasté. Étagères renversées, flacons brisés et, surtout, son carnet de recettes envolé. « Mon apprenti Lunardo a disparu la même nuit », souffle-t-il.",
        "Parmi les pièces intactes, il faut reformer les paires : l’une d’elles cache peut-être un indice.",
      ],
      game: "memoire",
      cfg: { pairs: 8, symbols: ["🏺", "🕯️", "💎", "🔥", "🪞", "🍷", "🧪", "🔮", "🫙", "🕰️"] },
      outro: "Au fond d’un vase, un reçu froissé : la veille du vol, Lunardo a changé des pièces d’or chez un changeur du Rialto.",
    },
    {
      place: "Rialto", title: "Le registre du changeur",
      text: [
        "En 1500, le pont du Rialto est encore en bois, avec une partie centrale mobile qui se lève pour laisser passer les navires. Tout autour, banquiers et changeurs alignent leurs comptoirs.",
        "Le vieux Simon accepte d’ouvrir son registre. Ses comptes forment des suites de nombres, mais les pages qui concernent Lunardo sont incomplètes.",
        "Retrouvez les nombres manquants.",
      ],
      game: "sequences",
      cfg: { diff: 0, items: [
        { seq: "3, 6, 12, 24, ?", options: ["36", "48", "30", "42"], answer: "48", explain: "Les ducats prêtés doublent à chaque fois : 24 × 2 = 48.", d: 1 },
        { seq: "5, 8, 11, 14, ?", options: ["16", "17", "18", "20"], answer: "17", explain: "Trois balles de soie de plus chaque jour : 14 + 3 = 17.", d: 1 },
        { seq: "100, 90, 81, 73, ?", options: ["65", "66", "64", "70"], answer: "66", explain: "On retire 10, puis 9, puis 8, puis 7 : 73 − 7 = 66.", d: 2 },
        { seq: "1, 4, 9, 16, ?", options: ["20", "24", "25", "32"], answer: "25", explain: "Ce sont les carrés : 1², 2², 3², 4², puis 5² = 25.", d: 2 },
        { seq: "2, 3, 5, 8, 13, ?", options: ["18", "20", "21", "26"], answer: "21", explain: "Chaque nombre est la somme des deux précédents : 8 + 13 = 21.", d: 2 },
      ] },
      outro: "Le registre est clair : Lunardo a été payé par un marchand du Fondaco des Allemands, l’entrepôt où logent et commercent les négociants du Nord. Quatre noms reviennent.",
    },
    {
      place: "Fondaco dei Tedeschi", title: "Quatre marchands",
      text: [
        "Au pied du Rialto, le Fondaco des Allemands loge les marchands venus du Nord. Ils y stockent et y vendent leurs marchandises sous l’œil des officiers de la République.",
        "Le registre des départs mentionne quatre marchands, quatre cargaisons et quatre navires prêts à appareiller. Le carnet voyagera sans doute caché parmi le verre.",
        "Trouvez qui embarque quoi, et sur quel navire.",
      ],
      game: "logique",
      cfg: { puzzle: {
        story: "<b>Le registre des départs</b>. Quatre marchands, quatre cargaisons, quatre navires.",
        labelA: ["Alvise", "Hans", "Piero", "Zorzi"], labelB: ["Épices", "Soie", "Verre", "Sel"], labelC: ["Fortuna", "Leone", "Sirena", "Stella"],
        qA: "Marchands", qB: "Cargaisons", qC: "Navires",
        clues: [
          "Hans ne vend ni soie ni verre.",
          "Le sel part sur la Sirena.",
          "Alvise ne vend pas de sel et n’embarque pas sur la Fortuna.",
          "Les épices ne partent ni sur la Stella ni sur la Fortuna.",
          "Zorzi ne vend pas d’épices et n’embarque pas sur la Fortuna.",
          "Le verre voyage sur la Fortuna.",
          "Hans n’embarque pas sur la Sirena.",
          "Piero n’embarque ni sur la Leone ni sur la Stella.",
        ],
        solB: [1, 0, 2, 3], solC: [3, 1, 0, 2],
      } },
      outro: "Le verre part sur la Fortuna, au nom de Piero. Mais la Fortuna est en réparation à l’Arsenal : il faut voir ce navire de près.",
    },
    {
      place: "Arsenal", title: "Le plan des cales",
      text: [
        "L’Arsenal est le plus grand chantier d’Europe. Des milliers d’ouvriers, les arsenalotti, y construisent les galères de la République à la chaîne. On raconte qu’il peut armer une galère en une seule journée.",
        "Un contremaître accepte de vous guider, mais le plan des cales a été découpé, puis remis dans le désordre.",
        "Remettez les morceaux à leur place pour trouver la Fortuna.",
      ],
      game: "taquin",
      cfg: { size: 4 },
      outro: "Dans la cale de la Fortuna, une caisse marquée « verre » est vide. Seule trace : une feuille imprimée, sortie d’un atelier du quartier de Sant’Agostin.",
    },
    {
      place: "Sant’Agostin", title: "L’atelier d’Alde Manuce",
      text: [
        "Venise est alors la capitale européenne du livre. À Sant’Agostin, l’imprimeur Alde Manuce publie les classiques grecs et latins dans des formats assez petits pour être emportés partout.",
        "Un compositeur reconnaît la feuille : une épreuve ratée, où des mots ont été mêlés pour cacher un message.",
        "Retrouvez tous les mots cachés.",
      ],
      game: "mots",
      cfg: { size: 10, words: ["GONDOLE", "LAGUNE", "RIALTO", "MURANO", "ARSENAL", "CAMPANILE", "DUCAT", "DOGE"] },
      outro: "Au dos de l’épreuve, une adresse griffonnée : « Remettre au cartographe de la Giudecca ».",
    },
    {
      place: "Giudecca", title: "La grille du cartographe",
      text: [
        "Sur l’île de la Giudecca, un vieux cartographe dessine des cartes de la lagune pour les capitaines. Il n’a rien vu, dit-il, mais un client lui a confié une grille codée : des nombres en marge des lignes et des colonnes.",
        "« Noircissez les bonnes cases, et l’image vous dira qui ce client attend. »",
      ],
      game: "nonogram",
      cfg: { size: 10, picture: "un dessin", image: [
        "....#.....",
        "...###....",
        "....#....#",
        "....#...##",
        "#...#...#.",
        "##..#..##.",
        ".##.#.##..",
        "..#######.",
        "...#####..",
        "....###...",
      ] },
      outro: "Une gondole et son gondolier. Le client attend donc un gondolier pour le soir de la Sensa. Les gondoliers se retrouvent dans une taverne du Castello.",
    },
    {
      place: "Castello", title: "Vrai ou faux à la taverne",
      text: [
        "Dans la taverne enfumée, le gondolier Toni accepte de parler contre un verre de vin. Mais il aime mêler vérités et vantardises.",
        "Pour gagner sa confiance, montrez-lui qu’on ne vous raconte pas d’histoires sur votre ville : démêlez le vrai du faux.",
      ],
      game: "vf",
      cfg: { items: [
        { s: "Venise est bâtie sur plus d’une centaine d’îles.", v: true, e: "On en compte 118, reliées par des centaines de ponts." },
        { s: "En 1500, le pont du Rialto est déjà en pierre.", v: false, e: "Il est en bois. Le pont de pierre actuel a été construit entre 1588 et 1591." },
        { s: "Les verriers ont été regroupés à Murano à la fin du XIIIe siècle, notamment pour éviter les incendies.", v: true, e: "Un décret de 1291 a éloigné les fours du centre de la ville." },
        { s: "Un maître verrier de Murano peut librement partir travailler à l’étranger.", v: false, e: "C’est interdit : la République protège jalousement ses secrets de fabrication." },
        { s: "Chaque année à l’Ascension, le doge jette un anneau dans la mer pour célébrer les « épousailles » de Venise avec la mer.", v: true, e: "C’est la fête de la Sensa : le doge part à bord du Bucentaure, sa galère d’apparat." },
        { s: "Le doge est un roi qui transmet son titre à son fils.", v: false, e: "Le doge est élu à vie par les nobles, et son pouvoir est étroitement surveillé." },
        { s: "À Venise, l’imprimeur Alde Manuce a popularisé les caractères italiques.", v: true, e: "Ses livres en italique, à partir de 1501, permettaient de serrer le texte dans des petits formats." },
        { s: "Le Grand Canal traverse Venise en dessinant un grand S.", v: true, e: "Long d’environ 4 km, il serpente à travers toute la ville." },
      ] },
      outro: "Convaincu, Toni avoue : un noble masqué lui a parlé d’un coffre à combinaison caché dans un palais du Grand Canal. « Il y garde ses papiers », dit-il.",
    },
    {
      place: "Grand Canal", title: "Le coffre à combinaison",
      text: [
        "Le palais est désert. Dans le cabinet du maître des lieux, un coffre de fer est fermé par une grille de chiffres.",
        "Chaque rangée et chaque colonne doit donner la somme gravée dans le métal, sans jamais répéter un chiffre. Le coffre ne s’ouvrira que si la grille est juste.",
      ],
      game: "kakuro",
      cfg: { size: 6 },
      outro: "Dans le coffre, des lettres signées d’une seule initiale, « A. », et un plan du Bucentaure. Le voleur compte disparaître pendant la fête, quand tous les regards seront tournés vers le doge.",
    },
    {
      place: "Bassin de Saint-Marc", title: "La Sensa",
      text: [
        "28 mai. Le Bucentaure, la galère d’apparat dorée du doge, quitte le quai sous les acclamations, suivi de centaines de barques.",
        "Trois suspects sont à bord : l’apprenti Lunardo, le marchand Piero et le noble Alvise. Il vous reste quelques minutes pour démasquer le cerveau du vol et retrouver le carnet.",
      ],
      game: "enigmes",
      cfg: { items: [
        { q: "Le voleur a payé des gondoliers pour couvrir sa fuite : 2 ducats au premier, 4 au deuxième, 8 au troisième, en doublant à chaque fois. Il a dépensé 62 ducats en tout. Combien de gondoliers a-t-il payés ?",
          num: 5, a: "5 gondoliers", accept: ["cinq"],
          hint: "Additionnez 2, 4, 8, 16… jusqu’à atteindre 62.",
          ex: "2 + 4 + 8 + 16 + 32 = 62 : cinq gondoliers." },
        { q: "Un seul des trois suspects est le cerveau du vol, et un seul des trois dit la vérité. Lunardo : « C’est Piero. » Piero : « Ce n’est pas moi. » Alvise : « Ce n’est pas moi. » Qui est le cerveau du vol ?",
          a: "Alvise", accept: ["alvise"],
          hint: "Essayez chaque coupable possible et comptez les phrases vraies.",
          ex: "Si c’était Piero, Lunardo et Alvise diraient vrai. Si c’était Lunardo, Piero et Alvise diraient vrai. Seul « Alvise » laisse une seule phrase vraie, celle de Piero." },
        { q: "Alvise a caché le carnet dans l’un de ses trois coffrets. Coffret d’or : « Le carnet est ici. » Coffret d’argent : « Le carnet n’est pas ici. » Coffret de plomb : « Le carnet n’est pas dans le coffret d’or. » Une seule de ces inscriptions est vraie. Quel coffret contient le carnet : or, argent ou plomb ?",
          a: "le coffret d’argent", accept: ["argent", "coffret d argent", "le coffret d argent", "celui d argent"],
          hint: "Si le carnet était dans le coffret d’or, combien d’inscriptions seraient vraies ?",
          ex: "Or : deux inscriptions vraies (or et argent). Plomb : deux vraies (argent et plomb). Argent : seule l’inscription du plomb est vraie." },
      ] },
      outro: "Au large du Lido, le doge jette son anneau d’or dans la mer : « Nous t’épousons, ô mer, en signe de vraie et perpétuelle domination. » Au même instant, les gardes du Conseil des Dix arrêtent Alvise. Le carnet de maître Bortolo retourne à Murano, et Lunardo, simple complice, implore la clémence du Conseil.",
    },
  ],
}, STORY2];

/* ---------- Progression ----------
   Tome 1 : étoiles rangées sous la clé n (comme avant) ; tomes suivants : « id:n ». */
let storyIdx = 0;              // tome affiché
let STORY = STORIES[0];
function storyKey(s, n) { return s ? `${STORIES[s].id}:${n}` : String(n); }
function storyStars(n, s = storyIdx) { return (state.story || {})[storyKey(s, n)] || 0; }
function storyTotal(s = storyIdx) { return STORIES[s].episodes.reduce((a, _, i) => a + storyStars(i + 1, s), 0); }
function storyUnlocked(n, s = storyIdx) { return storyOpen(s) && (n === 1 || storyStars(n - 1, s) > 0); }
function storyDone(s = storyIdx) { return STORIES[s].episodes.every((_, i) => storyStars(i + 1, s) > 0); }
function storyOpen(s) { return s === 0 || storyDone(s - 1); }
function storyCurrent(s = storyIdx) {
  const eps = STORIES[s].episodes;
  for (let n = 1; n <= eps.length; n++) if (!storyStars(n, s)) return n;
  return eps.length;
}
function selectStory(s) { storyIdx = s; STORY = STORIES[s]; }
// Tome mis en avant : le premier ouvert qui n’est pas terminé (sinon le dernier ouvert)
function storyFeatured() {
  let last = 0;
  for (let s = 0; s < STORIES.length; s++) { if (!storyOpen(s)) break; last = s; if (!storyDone(s)) return s; }
  return last;
}

/* ---------- Écrans ---------- */
function openStory(s) {
  leaveGame();
  LQ.level = null; LQ.daily = null; LQ.story = null;
  currentGame = "story";
  selectStory(s === undefined ? (LQ.lastStory ?? storyFeatured()) : s);
  LQ.lastStory = storyIdx;
  renderStory();
  showScreen("story");
}
function switchStory(s) {
  if (!storyOpen(s)) { toast(`Terminez d’abord « ${STORIES[s - 1].title} »`); return; }
  sfx("tick");
  selectStory(s); LQ.lastStory = s;
  renderStory();
}
function renderStory() {
  const total = storyTotal(), max = STORY.episodes.length * 3, cur = storyCurrent(), done = storyDone();
  $("story-tabs").innerHTML = STORIES.map((t, s) => `<button class="story-tab ${s === storyIdx ? "active" : ""} ${storyOpen(s) ? "" : "locked"}" onclick="switchStory(${s})">
      <span class="stt-k">Tome ${s + 1}${storyOpen(s) ? (storyDone(s) ? " · terminé" : "") : ""}</span>
      <span class="stt-t">${storyOpen(s) ? "" : ICONS.lock}${t.title}</span>
    </button>`).join("");
  $("story-head").innerHTML = `
    <p class="st-era">${STORY.era}</p>
    <h2>${STORY.title}</h2>
    <p class="st-pro">${done ? STORY.epilogue : STORY.prologue}</p>
    <div class="st-meta">${ICONS.star}<b>${total}</b> / ${max}<span>·</span>${STORY.episodes.filter((_, i) => storyStars(i + 1)).length} sur ${STORY.episodes.length} épisodes</div>
    <div class="progress-track"><div class="progress-fill" style="width:${total / max * 100}%"></div></div>`;
  $("story-list").innerHTML = STORY.episodes.map((ep, i) => {
    const n = i + 1, st = storyStars(n), unl = storyUnlocked(n), g = LQ.byId[ep.game];
    const cls = !unl ? "locked" : !st && n === cur ? "current" : st ? "done" : "";
    return `<button class="ep ${cls}" style="--hue:${g.hue}" onclick="openEpisode(${n})">
      <span class="ep-num">${n}</span>
      <span class="ep-body"><span class="ep-place">${ep.place}</span><span class="ep-title">${ep.title}</span></span>
      <span class="ep-side">${!unl ? ICONS.lock : st ? `<span class="ls-stars">${starsHtml(st)}</span>` : `<span class="ep-ico">${ICONS[g.id]}</span>`}</span>
    </button>`;
  }).join("");
}
function openEpisode(n) {
  if (!storyUnlocked(n)) { toast(storyOpen(storyIdx) ? `Réussissez d’abord l’épisode ${n - 1}` : `Terminez d’abord « ${STORIES[storyIdx - 1].title} »`); return; }
  leaveGame();
  LQ.level = null; LQ.daily = null; LQ.story = null;
  currentGame = "episode";
  const ep = STORY.episodes[n - 1], g = LQ.byId[ep.game], info = g.levelInfo(ep.cfg), st = storyStars(n);
  $("episode-body").innerHTML = `
    <p class="st-era">${STORIES.length > 1 ? `Tome ${storyIdx + 1} · ` : ""}Épisode ${n} · ${ep.place}</p>
    <h2>${ep.title}</h2>
    <div class="ep-text">${ep.text.map(p => `<p>${escapeHtml(p)}</p>`).join("")}</div>
    <div class="ep-trial" style="--hue:${g.hue}">
      <span class="dc-ico">${ICONS[g.id]}</span>
      <div><p class="dc-kicker">Épreuve · ${g.title}</p><p class="ep-what">${escapeHtml(info.what)}</p></div>
    </div>
    <ul class="ls-goals">${info.goals.map((x, i) => `<li><span class="ls-stars">${starsHtml(3 - i)}</span><span>${escapeHtml(x)}</span></li>`).join("")}</ul>
    ${st ? `<div class="dc-done"><span class="ls-stars">${starsHtml(st)}</span><span>Épreuve déjà réussie.</span></div>` : ""}
    <button class="btn dc-play" onclick="startEpisode(${n})">${ICONS.play} ${st ? "Rejouer l’épreuve" : "Commencer l’épreuve"}</button>`;
  showScreen("episode");
  $("screenTitle").textContent = `Épisode ${n}`;
}
function startEpisode(n) {
  const ep = STORY.episodes[n - 1];
  LQ.level = null; LQ.daily = null;
  LQ.story = { s: storyIdx, n, cfg: ep.cfg };
  launchGame(ep.game);
}
// Enregistre le résultat ; renvoie la suite du récit et les messages de l’écran de fin.
function recordStory(n, stars) {
  const s = LQ.story ? LQ.story.s : storyIdx, T = STORIES[s];
  const notes = [], prev = storyStars(n, s), ep = T.episodes[n - 1];
  state.story = state.story || {};
  if (stars > prev) state.story[storyKey(s, n)] = stars;
  if (stars > 0) {
    notes.push(`<div class="story-note"><p class="st-era">Suite du récit</p><p>${escapeHtml(ep.outro)}</p></div>`);
    if (n === T.episodes.length && !prev) {
      notes.push(`<span><b>Fin de l’histoire.</b> ${escapeHtml(T.epilogue)}</span>`);
      if (STORIES[s + 1]) notes.push(`<span><b>Un nouveau tome s’ouvre :</b> « ${escapeHtml(STORIES[s + 1].title)} ».</span>`);
    }
  }
  return notes;
}
