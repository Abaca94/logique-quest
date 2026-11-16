/* ============================================================
   Énigmes — questions à réponse libre, indice contre points
   ============================================================ */
const ENIGMES = [
  { q: "Je suis le début de l’ennui, la fin de la vie, le début de l’été et la fin de la mer. Qui suis-je ?", a: "la lettre E", accept: ["e", "lettre e", "la lettre e", "le e", "un e"], hint: "Ne regardez pas le sens des mots, mais leurs lettres au début et à la fin." },
  { q: "Plus il y en a, moins on voit. Que suis-je ?", a: "l’obscurité", accept: ["obscurite", "l obscurite", "le noir", "noir", "les tenebres", "tenebres", "la nuit", "nuit", "brouillard", "un brouillard"], hint: "Allumez la lumière et elle disparaît." },
  { q: "Qu’est-ce qui peut remplir une pièce entière sans prendre la moindre place ?", a: "la lumière", accept: ["lumiere", "la lumiere", "l air", "air", "gaz", "le gaz", "un parfum", "parfum", "le son", "son"], hint: "Il suffit d’appuyer sur l’interrupteur. L’air ou un parfum sont aussi acceptés." },
  { q: "Qu’est-ce qui a des dents mais ne mord jamais ?", a: "un peigne", accept: ["peigne", "un peigne", "le peigne", "une scie", "scie", "une fermeture eclair", "fermeture eclair"], hint: "On le trouve dans la salle de bain." },
  { q: "Un fermier a 17 moutons. Tous meurent sauf 9. Combien en reste-t-il ?", a: "9", accept: ["9", "neuf", "9 moutons", "neuf moutons"], hint: "Relisez bien : « tous meurent SAUF 9 »." },
  { q: "Je peux faire le tour du monde tout en restant dans mon coin. Qui suis-je ?", a: "un timbre", accept: ["timbre", "un timbre", "le timbre"], hint: "Il se colle sur une enveloppe." },
  { q: "Qu’est-ce qui monte et descend sans jamais bouger ?", a: "la température", accept: ["temperature", "la temperature", "un escalier", "escalier", "l escalier"], hint: "On la consulte chaque matin. L’escalier est aussi accepté." },
  { q: "Le père de Paul a trois fils : Pierre, Jacques et… ?", a: "Paul", accept: ["paul"], hint: "Relisez le début de la phrase." },
  { q: "Plus on m’enlève de matière, plus je grandis. Que suis-je ?", a: "un trou", accept: ["trou", "un trou", "le trou"], hint: "On en creuse dans le sable." },
  { q: "Je n’ai pas de voix mais je vous réponds. Je n’ai pas de corps mais je résonne. Qui suis-je ?", a: "l’écho", accept: ["echo", "l echo", "un echo"], hint: "Criez dans la montagne." },
  { q: "Qu’y a-t-il au bout de tout ?", a: "la lettre T", accept: ["t", "la lettre t", "lettre t", "le t"], hint: "C’est une lettre." },
  { q: "Deux pères et deux fils pêchent chacun un poisson, mais seuls 3 poissons sont pêchés. Pourquoi ?", a: "ils ne sont que trois", accept: ["3", "trois", "3 personnes", "trois personnes", "grand pere", "grand-pere", "il y a 3 personnes", "ils sont trois", "ils sont 3"], hint: "Un grand-père, son fils et son petit-fils…" },
  { q: "Quel mot commence par E, finit par E et ne contient qu’une seule lettre ?", a: "une enveloppe", accept: ["enveloppe", "une enveloppe", "l enveloppe"], hint: "Ouvrez-la et regardez à l’intérieur." },
  { q: "Trois chats attrapent trois souris en trois minutes. Combien de temps faut-il à cent chats pour attraper cent souris ?", a: "trois minutes", accept: ["trois minutes", "3 minutes", "3", "trois", "3 min", "trois min", "la meme duree"], hint: "Un seul chat attrape déjà une souris en trois minutes." },
  { q: "Combien de fois peut-on soustraire 5 de 25 ?", a: "une seule fois", accept: ["une seule fois", "une fois", "1", "1 fois", "une seule", "1 seule fois"], hint: "Après la première soustraction, ce n’est plus 25." },
  { q: "Toutes les fenêtres de ma maison donnent au sud. Un ours passe devant. De quelle couleur est-il ?", a: "blanc", accept: ["blanc", "blanche", "un ours blanc", "il est blanc", "ours polaire", "ours blanc", "un ours polaire"], hint: "Si toutes les fenêtres donnent au sud, la maison est… au pôle Nord." },
  { q: "Qu’est-ce qui vous appartient, mais que les autres utilisent bien plus que vous ?", a: "votre prénom", accept: ["prenom", "votre prenom", "ton prenom", "mon prenom", "son prenom", "nom", "votre nom", "ton nom", "mon nom"], hint: "On vous l’a choisi à la naissance." },
  { q: "Qu’est-ce qui a une tête et une queue, mais pas de corps ?", a: "une pièce de monnaie", accept: ["piece", "une piece", "la piece", "piece de monnaie", "une piece de monnaie", "une monnaie"], hint: "Pile ou face ?" },
  { q: "Comment appelle-t-on un mot qui se lit de la même façon dans les deux sens ?", a: "un palindrome", accept: ["palindrome", "un palindrome"], hint: "« Kayak » et « radar » en sont deux exemples." },
  { q: "J’ai besoin d’air pour vivre, mais l’eau me tue. Qui suis-je ?", a: "le feu", accept: ["feu", "le feu", "un feu", "la flamme", "une flamme", "flamme", "l incendie"], hint: "Il danse dans la cheminée." },
];

let enigIndex = 0, enigHintUsed = false, enigLock = false;

function initEnigmes() {
  navToken++;
  enigIndex = 0;
  renderEnigme();
}
function renderEnigme() {
  const e = ENIGMES[enigIndex];
  $("enig-progress").textContent = `Énigme ${enigIndex + 1} sur ${ENIGMES.length}`;
  $("enig-fill").style.width = (enigIndex / ENIGMES.length * 100) + "%";
  $("enig-question").textContent = e.q;
  $("enig-input").value = "";
  $("enig-hint").classList.remove("show");
  $("enig-feedback").className = "feedback";
  enigHintUsed = false;
  enigLock = false;
  // Pas de focus() automatique : sur iOS en plein écran, il fait clignoter ou figer l’affichage.
}
function enigmeMatches(raw, e) {
  const r = normalize(raw);
  return e.accept.some(a => {
    const n = normalize(a);
    return r === n || (n.length > 2 && (" " + r + " ").includes(" " + n + " "));
  });
}
function submitEnigme() {
  if (enigLock) return;
  const e = ENIGMES[enigIndex];
  const raw = $("enig-input").value;
  if (raw.trim() === "") { toast("Écrivez d’abord votre réponse"); return; }
  const fb = $("enig-feedback");
  if (enigmeMatches(raw, e)) {
    enigLock = true;
    const pts = enigHintUsed ? 5 : 10;
    addPoints(pts); sfx("good");
    state.solved++;
    setBest("enigmes", enigIndex + 1);
    save();
    fb.className = "feedback show ok";
    fb.innerHTML = `<b>Exact.</b> La réponse était « ${escapeHtml(e.a)} ». +${pts} points`;
    later(() => {
      enigIndex++;
      if (enigIndex < ENIGMES.length) renderEnigme();
      else winGame("Enquête bouclée", `Les ${ENIGMES.length} énigmes sont résolues.`, 240);
    }, 1400);
  } else {
    addPoints(-3); sfx("bad");
    fb.className = "feedback show ko";
    fb.innerHTML = `Ce n’est pas « ${escapeHtml(raw)} ». Essayez encore, ou prenez un indice.`;
    $("enig-input").value = "";
  }
}
function showEnigmeHint() {
  const e = ENIGMES[enigIndex];
  const h = $("enig-hint");
  h.textContent = e.hint;
  h.classList.add("show");
  if (!enigHintUsed) { addPoints(-5); enigHintUsed = true; toast("Indice affiché (−5 points)"); }
}

LQ.register({
  id: "enigmes",
  title: "Énigmes",
  desc: "Devinettes et pièges de langage",
  hue: "#d8a657",
  recordLabel: v => `Record : ${v} résolues`,
  init: initEnigmes,
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
      <div class="actions-row">
        <button class="btn ghost small" onclick="showEnigmeHint()">${ICONS.bulb} Indice (−5 points)</button>
      </div>
    </div>`,
  setup() {
    $("enig-input").addEventListener("keydown", e => { if (e.key === "Enter") submitEnigme(); });
  },
});
