/* ============================================================
   Séquences logiques — trouver le terme suivant (3 niveaux)
   ============================================================ */
const SEQUENCES = [
  { seq: "2, 4, 8, 16, ?", options: ["20", "24", "32", "18"], answer: "32", explain: "On double à chaque étape.", d: 1 },
  { seq: "81, 27, 9, 3, ?", options: ["0", "1", "2", "1,5"], answer: "1", explain: "On divise par 3 à chaque étape.", d: 1 },
  { seq: "5, 10, 20, 40, ?", options: ["50", "60", "80", "100"], answer: "80", explain: "On double à chaque étape.", d: 1 },
  { seq: "4, 7, 10, 13, ?", options: ["14", "15", "16", "17"], answer: "16", explain: "On ajoute 3 à chaque fois.", d: 1 },
  { seq: "96, 48, 24, 12, ?", options: ["8", "10", "6", "4"], answer: "6", explain: "On divise par 2 à chaque étape.", d: 1 },
  { seq: "2, 3, 5, 8, 13, ?", options: ["18", "20", "21", "26"], answer: "21", explain: "Chaque terme est la somme des deux précédents (suite de Fibonacci).", d: 2 },
  { seq: "1, 4, 9, 16, 25, ?", options: ["30", "36", "35", "49"], answer: "36", explain: "Ce sont les carrés : 1², 2², 3²… donc 6² = 36.", d: 2 },
  { seq: "1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "14"], answer: "13", explain: "Suite de Fibonacci : 5 + 8 = 13.", d: 2 },
  { seq: "1, 8, 27, 64, ?", options: ["100", "125", "128", "216"], answer: "125", explain: "Ce sont les cubes : 1³, 2³, 3³, 4³, donc 5³ = 125.", d: 2 },
  { seq: "1, 3, 7, 15, 31, ?", options: ["47", "63", "62", "51"], answer: "63", explain: "On multiplie par 2 puis on ajoute 1 : 31 × 2 + 1 = 63.", d: 2 },
  { seq: "3, 6, 11, 18, 27, ?", options: ["36", "38", "41", "40"], answer: "38", explain: "Les écarts sont +3, +5, +7, +9, puis +11 : 27 + 11 = 38.", d: 3 },
  { seq: "2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], answer: "42", explain: "Les écarts sont +4, +6, +8, +10, puis +12 : 30 + 12 = 42.", d: 3 },
  { seq: "100, 50, 52, 26, 28, ?", options: ["14", "30", "16", "12"], answer: "14", explain: "On divise par 2, puis on ajoute 2, en alternance : 28 ÷ 2 = 14.", d: 3 },
  { seq: "1, 2, 6, 24, ?", options: ["96", "120", "144", "48"], answer: "120", explain: "Factorielles : ×2, ×3, ×4, puis ×5 : 24 × 5 = 120.", d: 3 },
  { seq: "2, 5, 11, 23, ?", options: ["35", "43", "47", "45"], answer: "47", explain: "On multiplie par 2 puis on ajoute 1 : 23 × 2 + 1 = 47.", d: 3 },
  /* ----- Ajouts v5.0 ----- */
  { seq: "3, 9, 27, 81, ?", options: ["162", "243", "108", "324"], answer: "243", explain: "On multiplie par 3 à chaque étape.", d: 1 },
  { seq: "50, 45, 40, 35, ?", options: ["25", "30", "32", "20"], answer: "30", explain: "On retire 5 à chaque fois.", d: 1 },
  { seq: "1, 3, 5, 7, 9, ?", options: ["10", "11", "12", "13"], answer: "11", explain: "Ce sont les nombres impairs : on ajoute 2.", d: 1 },
  { seq: "7, 14, 21, 28, ?", options: ["32", "35", "36", "42"], answer: "35", explain: "La table de 7 : on ajoute 7.", d: 1 },
  { seq: "1000, 100, 10, ?", options: ["0", "1", "0,1", "5"], answer: "1", explain: "On divise par 10 à chaque étape.", d: 1 },
  { seq: "2, 3, 5, 7, 11, ?", options: ["12", "13", "14", "15"], answer: "13", explain: "Ce sont les nombres premiers : après 11 vient 13.", d: 2 },
  { seq: "1, 2, 4, 7, 11, ?", options: ["15", "16", "17", "18"], answer: "16", explain: "Les écarts augmentent de 1 : +1, +2, +3, +4, puis +5.", d: 2 },
  { seq: "0, 3, 8, 15, 24, ?", options: ["33", "35", "36", "48"], answer: "35", explain: "Ce sont les carrés moins 1 : 1−1, 4−1, 9−1… donc 36 − 1 = 35.", d: 2 },
  { seq: "1, 4, 13, 40, ?", options: ["120", "121", "118", "160"], answer: "121", explain: "On multiplie par 3 puis on ajoute 1 : 40 × 3 + 1 = 121.", d: 2 },
  { seq: "2, 4, 3, 6, 5, 10, ?", options: ["9", "11", "8", "20"], answer: "9", explain: "On multiplie par 2, puis on retire 1, en alternance : 10 − 1 = 9.", d: 2 },
  { seq: "1, 4, 27, 256, ?", options: ["625", "1024", "3125", "3000"], answer: "3125", explain: "Chaque nombre élevé à sa propre puissance : 1¹, 2², 3³, 4⁴, donc 5⁵ = 3125.", d: 3 },
  { seq: "2, 3, 5, 9, 17, ?", options: ["31", "33", "34", "35"], answer: "33", explain: "Les écarts doublent : +1, +2, +4, +8, puis +16 : 17 + 16 = 33.", d: 3 },
  { seq: "1, 2, 5, 14, 41, ?", options: ["121", "122", "123", "124"], answer: "122", explain: "On multiplie par 3 puis on retire 1 : 41 × 3 − 1 = 122.", d: 3 },
  { seq: "6, 11, 21, 36, 56, ?", options: ["76", "80", "81", "86"], answer: "81", explain: "Les écarts sont +5, +10, +15, +20, puis +25 : 56 + 25 = 81.", d: 3 },
  { seq: "4 ; 6 ; 9 ; 13,5 ; ?", options: ["18", "20,25", "19,5", "22"], answer: "20,25", explain: "On multiplie par 1,5 à chaque étape : 13,5 × 1,5 = 20,25.", d: 3 },
];
const SEQ_LEVELS = ["Facile", "Moyen", "Difficile"];
let seqShuffled = [], seqIndex = 0, seqDiff = 1, seqLock = false, seqGood = 0;

function setSeqDiff(i) {
  seqDiff = i;
  initSequences();
}
// cfg (mode parcours) : { diff: 0 | 1 | 2, ids?: [indices dans SEQUENCES] }
function initSequences(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) seqDiff = cfg.diff;
  seqGood = 0;
  setActiveChips("sequences", seqDiff);
  // cfg.ids (parcours) : une sélection précise ; sinon toutes les suites du niveau choisi.
  seqShuffled = shuffle(cfg && cfg.ids ? cfg.ids.map(i => SEQUENCES[i]) : SEQUENCES.filter(s => s.d === seqDiff + 1));
  seqIndex = 0;
  renderSequence();
}
function renderSequence() {
  const s = seqShuffled[seqIndex];
  seqLock = false;
  $("seq-progress").textContent = `Suite ${seqIndex + 1} sur ${seqShuffled.length}`;
  $("seq-fill").style.width = (seqIndex / seqShuffled.length * 100) + "%";
  $("seq-question").innerHTML = `Quel nombre complète la suite ?<span class="seq">${escapeHtml(s.seq)}</span>`;
  $("seq-feedback").className = "feedback";
  $("seq-next").style.display = "none";
  const box = $("seq-answers");
  box.innerHTML = "";
  shuffle(s.options).forEach(o => {
    const b = document.createElement("button");
    b.className = "answer-btn";
    b.textContent = o;
    b.onclick = () => answerSequence(b, o);
    box.appendChild(b);
  });
}
function answerSequence(btn, val) {
  if (seqLock) return;
  seqLock = true;
  const s = seqShuffled[seqIndex];
  document.querySelectorAll("#seq-answers .answer-btn").forEach(b => b.disabled = true);
  const ok = val === s.answer;
  if (ok) {
    btn.classList.add("correct");
    sfx("good");
    addPoints(10); state.solved++; seqGood++;
    setBest("sequences", seqDiff + 1);
    save();
    $("seq-feedback").className = "feedback show ok";
    $("seq-feedback").innerHTML = `<b>Bien vu.</b> +10 points. ${escapeHtml(s.explain)}`;
  } else {
    btn.classList.add("wrong");
    addPoints(-3);
    sfx("bad");
    [...document.querySelectorAll("#seq-answers .answer-btn")].find(b => b.textContent === s.answer)?.classList.add("correct");
    $("seq-feedback").className = "feedback show ko";
    $("seq-feedback").innerHTML = `La bonne réponse était <b>${escapeHtml(s.answer)}</b>. ${escapeHtml(s.explain)}`;
  }
  $("seq-next").style.display = "";
  $("seq-next-btn").textContent = seqIndex < seqShuffled.length - 1 ? "Suite suivante →" : "Terminer";
}
function nextSequence() {
  seqIndex++;
  if (seqIndex < seqShuffled.length) { renderSequence(); window.scrollTo(0, 0); }
  else winGame("Série terminée", `${seqGood} bonne${seqGood > 1 ? "s" : ""} réponse${seqGood > 1 ? "s" : ""} sur ${seqShuffled.length} (niveau ${SEQ_LEVELS[seqDiff].toLowerCase()}).`, 0, starsByCount(seqGood, seqShuffled.length));
}

LQ.register({
  id: "sequences",
  title: "Séquences",
  desc: "Trouver le terme suivant",
  hue: "#8fb3ff",
  recordLabel: v => `Record : niveau ${SEQ_LEVELS[v - 1] ? SEQ_LEVELS[v - 1].toLowerCase() : v}`,
  init: initSequences,
  levelInfo: cfg => {
    const n = cfg.ids ? cfg.ids.length : SEQUENCES.filter(s => s.d === cfg.diff + 1).length;
    return { what: `${n} suites, niveau ${SEQ_LEVELS[cfg.diff].toLowerCase()}`, goals: countGoals(n) };
  },
  screen: `
    <div class="chips lvl-hide">
      ${SEQ_LEVELS.map((l, i) => `<button class="chip" data-b="${i}" onclick="setSeqDiff(${i})">${l}</button>`).join("")}
    </div>
    <div class="quiz-card">
      <div class="quiz-progress" id="seq-progress"></div>
      <div class="progress-track"><div class="progress-fill" id="seq-fill"></div></div>
      <div class="question-txt" id="seq-question"></div>
      <div class="answers" id="seq-answers"></div>
      <div class="feedback" id="seq-feedback"></div>
      <div class="actions-row" id="seq-next" style="display:none">
        <button class="btn" id="seq-next-btn" onclick="nextSequence()">Suite suivante →</button>
      </div>
    </div>`,
});
