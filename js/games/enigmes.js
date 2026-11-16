/* ============================================================
   Énigmes — problèmes de logique à réponse unique
   Chaque énigme a une seule bonne réponse, vérifiable, et une explication.
   num : réponse numérique (on accepte « 47 », « 47 jours », « quarante-sept »…)
   accept : autres formes acceptées (comparées sans accents ni majuscules)
   ============================================================ */
const ENIGMES = [
  { q: "Une batte et une balle coûtent 1,10 € au total. La batte coûte exactement 1 € de plus que la balle. Combien coûte la balle, en centimes ?",
    num: 5, a: "5 centimes", accept: ["cinq", "cinq centimes", "0,05", "0.05"],
    hint: "Si la balle coûtait 10 centimes, la batte coûterait 1,10 € et le total 1,20 €.",
    ex: "Balle 0,05 € + batte 1,05 € = 1,10 €, et la batte coûte bien 1 € de plus." },
  { q: "Un nénuphar double de surface chaque jour. Il lui faut 48 jours pour couvrir tout l’étang. Au bout de combien de jours en couvrait-il exactement la moitié ?",
    num: 47, a: "47 jours", accept: ["quarante-sept", "quarante sept"],
    hint: "Raisonnez à rebours : que se passe-t-il entre l’avant-dernier et le dernier jour ?",
    ex: "Comme il double chaque jour, la veille du 48e jour il couvrait la moitié de l’étang." },
  { q: "5 machines fabriquent 5 objets en 5 minutes. Combien de minutes faut-il à 100 machines pour fabriquer 100 objets ?",
    num: 5, a: "5 minutes", accept: ["cinq", "cinq minutes"],
    hint: "Combien de temps faut-il à une seule machine pour fabriquer un seul objet ?",
    ex: "Chaque machine fabrique un objet en 5 minutes : 100 machines font 100 objets en 5 minutes." },
  { q: "Pendant une course, vous dépassez le coureur qui est deuxième. À quelle place êtes-vous maintenant ?",
    num: 2, a: "deuxième", accept: ["deuxieme", "second", "seconde", "2e", "2eme", "2nd"],
    hint: "Vous prenez la place de celui que vous dépassez.",
    ex: "En doublant le deuxième, vous prenez sa place : vous êtes deuxième, pas premier." },
  { q: "Le père de Marie a cinq filles : Lala, Lélé, Lili et Lolo. Comment s’appelle la cinquième ?",
    a: "Marie", accept: ["marie"],
    hint: "Relisez le début de la phrase.",
    ex: "La cinquième fille est Marie elle-même." },
  { q: "En écrivant tous les nombres entiers de 1 à 100, combien de fois écrit-on le chiffre 9 ?",
    num: 20, a: "20 fois", accept: ["vingt"],
    hint: "Comptez séparément les 9 en position des unités et en position des dizaines.",
    ex: "Dix fois aux unités (9, 19… 99) et dix fois aux dizaines (90 à 99) : 20 au total." },
  { q: "Un escargot est au fond d’un puits de 10 mètres. Chaque jour il grimpe de 3 mètres, chaque nuit il glisse de 2 mètres. Au cours de quel jour sort-il du puits ?",
    num: 8, a: "le 8e jour", accept: ["huit", "huitieme"],
    hint: "Attention au dernier jour : une fois sorti, il ne glisse plus.",
    ex: "Il gagne 1 m par jour complet : au matin du 8e jour il est à 7 m, et grimpe jusqu’à 10 m." },
  { q: "Il faut 10 minutes pour scier une bûche en 2 morceaux. Au même rythme, combien de minutes faut-il pour la scier en 4 morceaux ?",
    num: 30, a: "30 minutes", accept: ["trente"],
    hint: "Combien de coups de scie faut-il pour obtenir 4 morceaux ?",
    ex: "2 morceaux = 1 coupe (10 min). 4 morceaux = 3 coupes, donc 30 minutes." },
  { q: "Un médecin vous donne 3 comprimés à prendre, un toutes les demi-heures, en commençant tout de suite. Combien de minutes durera le traitement ?",
    num: 60, a: "60 minutes", accept: ["soixante", "une heure", "1 heure", "1h"],
    hint: "Vous prenez le premier comprimé à la minute 0.",
    ex: "Comprimés à 0, 30 et 60 minutes : le traitement dure une heure." },
  { q: "Un tiroir contient 10 chaussettes noires et 10 blanches, mélangées. Dans le noir, combien devez-vous en prendre au minimum pour être sûr d’avoir deux chaussettes de la même couleur ?",
    num: 3, a: "3", accept: ["trois"],
    hint: "Il n’y a que deux couleurs possibles.",
    ex: "Avec 2 chaussettes, on peut tomber sur une noire et une blanche. La 3e forme forcément une paire." },
  { q: "Même tiroir : 10 chaussettes noires et 10 blanches. Combien devez-vous en prendre au minimum pour être sûr d’avoir deux chaussettes noires ?",
    num: 12, a: "12", accept: ["douze"],
    hint: "Imaginez la pire malchance possible.",
    ex: "Dans le pire cas, on prend d’abord les 10 blanches. Il faut ensuite 2 noires : 12 chaussettes." },
  { q: "Si 3 poules pondent 3 œufs en 3 jours, combien d’œufs pondent 12 poules en 12 jours ?",
    num: 48, a: "48 œufs", accept: ["quarante-huit", "quarante huit"],
    hint: "Combien d’œufs une poule pond-elle en 3 jours ?",
    ex: "Une poule pond 1 œuf en 3 jours, donc 4 œufs en 12 jours. 12 poules × 4 = 48." },
  { q: "Quel nombre vient ensuite : 1, 11, 21, 1211, 111221, … ?",
    num: 312211, a: "312211", accept: [],
    hint: "Lisez chaque terme à voix haute en décrivant le précédent : « un 1 », « deux 1 »…",
    ex: "111221 se lit « trois 1, deux 2, un 1 » : 312211." },
  { q: "Les pages d’un livre sont numérotées de 1 à 120. Combien de chiffres faut-il imprimer au total ?",
    num: 252, a: "252 chiffres", accept: [],
    hint: "Séparez les pages à 1, 2 et 3 chiffres.",
    ex: "9 pages × 1 + 90 pages × 2 + 21 pages × 3 = 9 + 180 + 63 = 252." },
  { q: "Nous sommes mardi. Quel jour de la semaine serons-nous dans 100 jours ?",
    a: "jeudi", accept: ["jeudi"],
    hint: "Combien reste-t-il de jours après avoir retiré des semaines entières ?",
    ex: "100 = 14 semaines + 2 jours. Mardi + 2 jours = jeudi." },
  { q: "Je suis un nombre à deux chiffres. Mon chiffre des dizaines est le double de mon chiffre des unités, et la somme de mes deux chiffres vaut 9. Qui suis-je ?",
    num: 63, a: "63", accept: ["soixante-trois", "soixante trois"],
    hint: "Si les unités valent u, les dizaines valent 2u et la somme fait 3u.",
    ex: "3u = 9 donc u = 3 et les dizaines valent 6 : 63." },
  { q: "Une horloge met 5 secondes pour sonner les 6 coups de 6 heures. Combien de secondes lui faut-il pour sonner les 12 coups de midi ?",
    num: 11, a: "11 secondes", accept: ["onze"],
    hint: "Ce qui prend du temps, ce sont les intervalles entre les coups.",
    ex: "6 coups = 5 intervalles d’une seconde. 12 coups = 11 intervalles, donc 11 secondes." },
  { q: "Combien de carrés de toutes tailles peut-on compter sur un échiquier de 8 × 8 cases ?",
    num: 204, a: "204", accept: ["deux cent quatre"],
    hint: "Comptez les carrés de 1×1, puis de 2×2, et ainsi de suite jusqu’à 8×8.",
    ex: "64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204." },
  { q: "Anne a autant de frères que de sœurs. Son frère Paul a deux fois plus de sœurs que de frères. Combien d’enfants y a-t-il dans la famille ?",
    num: 7, a: "7 enfants", accept: ["sept"],
    hint: "Anne ne se compte pas parmi ses sœurs, Paul ne se compte pas parmi ses frères.",
    ex: "4 filles et 3 garçons : Anne a 3 sœurs et 3 frères, Paul a 4 sœurs et 2 frères." },
  { q: "Quel est le plus petit nombre entier supérieur à 1 qui, divisé par 2, 3, 4, 5 ou 6, laisse toujours un reste de 1 ?",
    num: 61, a: "61", accept: ["soixante et un", "soixante-et-un"],
    hint: "Retirez 1 : le nombre obtenu doit être divisible par 2, 3, 4, 5 et 6.",
    ex: "Le plus petit multiple commun de 2, 3, 4, 5 et 6 est 60. Donc 60 + 1 = 61." },
  { q: "Un père a 36 ans et son fils 12 ans. Dans combien d’années le père aura-t-il exactement le double de l’âge de son fils ?",
    num: 12, a: "dans 12 ans", accept: ["douze"],
    hint: "Posez 36 + x = 2 × (12 + x).",
    ex: "Dans 12 ans, le père aura 48 ans et le fils 24 ans." },
  { q: "En écrivant tous les nombres entiers de 1 à 50, combien de fois écrit-on le chiffre 1 ?",
    num: 15, a: "15 fois", accept: ["quinze"],
    hint: "N’oubliez pas que 11 contient deux fois le chiffre 1.",
    ex: "1, puis 10 à 19 (11 chiffres « 1 » car 11 en a deux), puis 21, 31 et 41 : 1 + 11 + 3 = 15." },
  { q: "Vous entrez dans une pièce sombre avec une seule allumette. Il y a une bougie, une lampe à huile et un poêle à bois. Qu’allumez-vous en premier ?",
    a: "l’allumette", accept: ["allumette", "l allumette", "une allumette"],
    hint: "Comment allumeriez-vous la bougie ?",
    ex: "Avant tout le reste, il faut allumer l’allumette." },
  { q: "Un train de 100 m roule à vitesse constante. Il met 10 secondes pour traverser entièrement un tunnel de 400 m, de l’entrée de la locomotive à la sortie du dernier wagon. Quelle est sa vitesse, en mètres par seconde ?",
    num: 50, a: "50 m/s", accept: ["cinquante"],
    hint: "Le train doit parcourir la longueur du tunnel plus sa propre longueur.",
    ex: "Il parcourt 400 + 100 = 500 m en 10 s, soit 50 m/s (180 km/h)." },
];

let enigIndex = 0, enigHintUsed = false, enigLock = false;
let enigList = [], enigWrong = 0, enigHints = 0, enigReveals = 0, enigSolved = 0;

// cfg (mode parcours) : { ids: [indices dans ENIGMES] }. Sans cfg : toutes les énigmes.
function initEnigmes(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  enigList = cfg && cfg.ids ? cfg.ids.map(i => ENIGMES[i]) : ENIGMES;
  enigIndex = 0; enigWrong = 0; enigHints = 0; enigReveals = 0; enigSolved = 0;
  renderEnigme();
}
function renderEnigme() {
  const e = enigList[enigIndex];
  $("enig-progress").textContent = `Énigme ${enigIndex + 1} sur ${enigList.length}`;
  $("enig-fill").style.width = (enigIndex / enigList.length * 100) + "%";
  $("enig-question").textContent = e.q;
  $("enig-input").value = "";
  $("enig-hint").classList.remove("show");
  $("enig-feedback").className = "feedback";
  $("enig-actions").style.display = "";
  $("enig-next").style.display = "none";
  enigHintUsed = false;
  enigLock = false;
  // Pas de focus() automatique : sur iOS en plein écran, il fait clignoter ou figer l’affichage.
}
// 3 étoiles : tout résolu sans indice, au plus une erreur.
// 2 étoiles : tout résolu sans voir de réponse. 1 étoile : au moins une résolue.
function enigStars() {
  if (enigSolved === 0) return 0;
  if (enigReveals > 0) return 1;
  return enigHints === 0 && enigWrong <= 1 ? 3 : 2;
}
function enigmeMatches(raw, e) {
  if (e.num !== undefined) {
    const nums = (raw.replace(/\s/g, "").match(/\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(",", ".")));
    if (nums.length && nums[0] === e.num) return true;
  }
  const r = normalize(raw);
  return e.accept.some(a => {
    const n = normalize(a);
    return r === n || (n.length > 2 && (" " + r + " ").includes(" " + n + " "));
  });
}
// Après une réponse, on attend que le joueur touche « Énigme suivante ».
function endEnigme() {
  enigLock = true;
  $("enig-actions").style.display = "none";
  $("enig-next").style.display = "";
  $("enig-next-btn").textContent = enigIndex < enigList.length - 1 ? "Énigme suivante →" : "Terminer";
}
function nextEnigme() {
  enigIndex++;
  if (enigIndex < enigList.length) { renderEnigme(); window.scrollTo(0, 0); }
  else winGame("Enquête bouclée", `${enigSolved} énigme${enigSolved > 1 ? "s" : ""} résolue${enigSolved > 1 ? "s" : ""} sur ${enigList.length}.`, 0, enigStars());
}
function submitEnigme() {
  if (enigLock) return;
  const e = enigList[enigIndex];
  const raw = $("enig-input").value;
  if (raw.trim() === "") { toast("Écrivez d’abord votre réponse"); return; }
  const fb = $("enig-feedback");
  if (enigmeMatches(raw, e)) {
    const pts = enigHintUsed ? 5 : 10;
    addPoints(pts); sfx("good");
    state.solved++; enigSolved++;
    if (!LQ.level) setBest("enigmes", enigIndex + 1);
    save();
    fb.className = "feedback show ok";
    fb.innerHTML = `<b>Exact : ${escapeHtml(e.a)}.</b> ${escapeHtml(e.ex)} +${pts} points`;
    endEnigme();
  } else {
    addPoints(-3); sfx("bad"); enigWrong++;
    fb.className = "feedback show ko";
    fb.innerHTML = `Ce n’est pas « ${escapeHtml(raw)} ». Essayez encore, prenez un indice ou passez.`;
    $("enig-input").value = "";
  }
}
function showEnigmeHint() {
  if (enigLock) return;
  const e = enigList[enigIndex];
  const h = $("enig-hint");
  h.textContent = e.hint;
  h.classList.add("show");
  if (!enigHintUsed) { addPoints(-5); enigHintUsed = true; enigHints++; toast("Indice affiché (−5 points)"); }
}
function revealEnigme() {
  if (enigLock) return;
  const e = enigList[enigIndex];
  sfx("flip"); enigReveals++;
  const fb = $("enig-feedback");
  fb.className = "feedback show ko";
  fb.innerHTML = `La réponse était <b>${escapeHtml(e.a)}</b>. ${escapeHtml(e.ex)}`;
  endEnigme();
}

LQ.register({
  id: "enigmes",
  title: "Énigmes",
  desc: "Problèmes de logique à réponse unique",
  hue: "#d8a657",
  recordLabel: v => `Record : énigme ${v}`,
  init: initEnigmes,
  levelInfo: cfg => ({
    what: `${cfg.ids.length} énigmes à résoudre`,
    goals: ["Tout résoudre sans indice, avec au plus une erreur", "Tout résoudre sans voir de réponse", "Résoudre au moins une énigme"],
  }),
  screen: `
    <div class="quiz-card">
      <div class="quiz-progress" id="enig-progress"></div>
      <div class="progress-track"><div class="progress-fill" id="enig-fill"></div></div>
      <div class="question-txt" id="enig-question"></div>
      <div class="text-input-row">
        <input class="text-input" id="enig-input" placeholder="Votre réponse" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">
        <button class="btn" onclick="submitEnigme()">Valider</button>
      </div>
      <div class="hint-box" id="enig-hint"></div>
      <div class="feedback" id="enig-feedback"></div>
      <div class="actions-row" id="enig-next" style="display:none">
        <button class="btn" id="enig-next-btn" onclick="nextEnigme()">Énigme suivante →</button>
      </div>
      <div class="actions-row" id="enig-actions">
        <button class="btn ghost small" onclick="showEnigmeHint()">${ICONS.bulb} Indice (−5 points)</button>
        <button class="btn ghost small" onclick="revealEnigme()">Voir la réponse</button>
      </div>
    </div>`,
  setup() {
    $("enig-input").addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      if (enigLock) nextEnigme(); else submitEnigme();
    });
  },
});
