/* ============================================================
   Déduction — grilles générées
   Tire une solution au hasard dans un thème, produit tous les
   indices vrais, en ajoute jusqu’à ce que la solution soit unique,
   puis retire ceux qui ne servent à rien. La grille obtenue a donc
   exactement une solution et aucun indice superflu.
   ============================================================ */
const LG_THEMES = [
  {
    story: "<b>Le vide-grenier</b>. Des vendeurs, des objets, des villes d’origine.",
    qA: "Vendeurs", qB: "Objets", qC: "Villes",
    A: ["Alice", "Bruno", "Chloé", "David", "Emma"],
    B: [["Lampe", "vend la lampe", "ne vend pas la lampe"], ["Horloge", "vend l’horloge", "ne vend pas l’horloge"], ["Vase", "vend le vase", "ne vend pas le vase"], ["Miroir", "vend le miroir", "ne vend pas le miroir"], ["Tapis", "vend le tapis", "ne vend pas le tapis"]],
    C: [["Lyon", "vient de Lyon", "ne vient pas de Lyon"], ["Nantes", "vient de Nantes", "ne vient pas de Nantes"], ["Lille", "vient de Lille", "ne vient pas de Lille"], ["Brest", "vient de Brest", "ne vient pas de Brest"], ["Metz", "vient de Metz", "ne vient pas de Metz"]],
  },
  {
    story: "<b>La résidence</b>. Des voisins, des étages, des animaux.",
    qA: "Voisins", qB: "Étages", qC: "Animaux",
    A: ["Paul", "Nina", "Marc", "Lina", "Rémi"],
    B: [["1er", "habite au 1er étage", "n’habite pas au 1er étage"], ["2e", "habite au 2e étage", "n’habite pas au 2e étage"], ["3e", "habite au 3e étage", "n’habite pas au 3e étage"], ["4e", "habite au 4e étage", "n’habite pas au 4e étage"], ["5e", "habite au 5e étage", "n’habite pas au 5e étage"]],
    order: { less: "habite plus bas que", more: "habite plus haut que", prev: "habite juste en dessous de", next: "habite juste au-dessus de" },
    C: [["Chat", "a un chat", "n’a pas de chat"], ["Chien", "a un chien", "n’a pas de chien"], ["Lapin", "a un lapin", "n’a pas de lapin"], ["Perroquet", "a un perroquet", "n’a pas de perroquet"], ["Tortue", "a une tortue", "n’a pas de tortue"]],
  },
  {
    story: "<b>Le semi-marathon</b>. Des coureurs, leur place à l’arrivée, leur maillot.",
    qA: "Coureurs", qB: "Places", qC: "Maillots",
    A: ["Sarah", "Tom", "Julie", "Karim", "Zoé"],
    B: [["1re", "a terminé à la 1re place", "n’a pas terminé à la 1re place"], ["2e", "a terminé à la 2e place", "n’a pas terminé à la 2e place"], ["3e", "a terminé à la 3e place", "n’a pas terminé à la 3e place"], ["4e", "a terminé à la 4e place", "n’a pas terminé à la 4e place"], ["5e", "a terminé à la 5e place", "n’a pas terminé à la 5e place"]],
    vB: 2,
    order: { less: "a terminé avant", more: "a terminé après", prev: "a terminé juste avant", next: "a terminé juste après" },
    C: [["Rouge", "porte le maillot rouge", "ne porte pas le maillot rouge"], ["Bleu", "porte le maillot bleu", "ne porte pas le maillot bleu"], ["Vert", "porte le maillot vert", "ne porte pas le maillot vert"], ["Jaune", "porte le maillot jaune", "ne porte pas le maillot jaune"], ["Noir", "porte le maillot noir", "ne porte pas le maillot noir"]],
  },
  {
    story: "<b>La scène ouverte</b>. Des musiciens, leur heure de passage, leur instrument.",
    qA: "Musiciens", qB: "Heures", qC: "Instruments",
    A: ["Léo", "Maya", "Noah", "Rosa", "Sami"],
    B: [["18 h", "passe à 18 h", "ne passe pas à 18 h"], ["19 h", "passe à 19 h", "ne passe pas à 19 h"], ["20 h", "passe à 20 h", "ne passe pas à 20 h"], ["21 h", "passe à 21 h", "ne passe pas à 21 h"], ["22 h", "passe à 22 h", "ne passe pas à 22 h"]],
    order: { less: "passe avant", more: "passe après", prev: "passe juste avant", next: "passe juste après" },
    C: [["Piano", "joue du piano", "ne joue pas du piano"], ["Guitare", "joue de la guitare", "ne joue pas de la guitare"], ["Violon", "joue du violon", "ne joue pas du violon"], ["Batterie", "joue de la batterie", "ne joue pas de la batterie"], ["Saxo", "joue du saxophone", "ne joue pas du saxophone"]],
  },
  {
    story: "<b>Les vacances</b>. Des amis, leur destination, leur moyen de transport.",
    qA: "Amis", qB: "Destinations", qC: "Transports",
    A: ["Jade", "Louis", "Mila", "Nathan", "Rose"],
    B: [["Rome", "part à Rome", "ne part pas à Rome"], ["Lisbonne", "part à Lisbonne", "ne part pas à Lisbonne"], ["Vienne", "part à Vienne", "ne part pas à Vienne"], ["Prague", "part à Prague", "ne part pas à Prague"], ["Oslo", "part à Oslo", "ne part pas à Oslo"]],
    C: [["Train", "voyage en train", "ne voyage pas en train"], ["Avion", "voyage en avion", "ne voyage pas en avion"], ["Voiture", "voyage en voiture", "ne voyage pas en voiture"], ["Bus", "voyage en bus", "ne voyage pas en bus"], ["Bateau", "voyage en bateau", "ne voyage pas en bateau"]],
  },
  {
    story: "<b>Le jardin partagé</b>. Des jardiniers, leur jour de présence, leur culture.",
    qA: "Jardiniers", qB: "Jours", qC: "Cultures",
    A: ["Basile", "Clara", "Félix", "Margot", "Victor"],
    B: [["Lundi", "vient le lundi", "ne vient pas le lundi"], ["Mardi", "vient le mardi", "ne vient pas le mardi"], ["Mercredi", "vient le mercredi", "ne vient pas le mercredi"], ["Jeudi", "vient le jeudi", "ne vient pas le jeudi"], ["Vendredi", "vient le vendredi", "ne vient pas le vendredi"]],
    order: { less: "vient plus tôt dans la semaine que", more: "vient plus tard dans la semaine que", prev: "vient la veille du jour de", next: "vient le lendemain du jour de" },
    C: [["Tomates", "cultive des tomates", "ne cultive pas de tomates"], ["Courgettes", "cultive des courgettes", "ne cultive pas de courgettes"], ["Carottes", "cultive des carottes", "ne cultive pas de carottes"], ["Radis", "cultive des radis", "ne cultive pas de radis"], ["Salades", "cultive des salades", "ne cultive pas de salades"]],
  },
];

function lgPerms(n) {
  const out = [];
  (function rec(a, used) {
    if (a.length === n) { out.push(a.slice()); return; }
    for (let i = 0; i < n; i++) if (!used[i]) { used[i] = 1; a.push(i); rec(a, used); a.pop(); used[i] = 0; }
  })([], []);
  return out;
}
// Élision devant une voyelle : « que Inès » → « qu’Inès », « de Inès » → « d’Inès »
function lgElide(word, name) { return /^[aeiouyéèêh]/i.test(name) ? word.slice(0, -1) + "’" + name : word + " " + name; }

function lgGenerate(n, themeIdx) {
  const th = LG_THEMES[themeIdx === undefined ? Math.floor(Math.random() * LG_THEMES.length) : themeIdx];
  const A = shuffle(th.A).slice(0, n), B = th.B.slice(0, n), C = shuffle(th.C).slice(0, n);
  const solB = shuffle([...Array(n).keys()]), solC = shuffle([...Array(n).keys()]);
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const who = c => `La personne qui ${C[c][1]}`;
  // Tous les indices vrais : { text, kind, f(sb, sc) }
  const cand = [];
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    if (solB[a] === b) cand.push({ w: 3, text: `${A[a]} ${B[b][1]}.`, f: sb => sb[a] === b });
    else cand.push({ w: 1, text: `${A[a]} ${B[b][2]}.`, f: sb => sb[a] !== b });
  }
  for (let a = 0; a < n; a++) for (let c = 0; c < n; c++) {
    if (solC[a] === c) cand.push({ w: 3, text: `${A[a]} ${C[c][1]}.`, f: (sb, sc) => sc[a] === c });
    else cand.push({ w: 1, text: `${A[a]} ${C[c][2]}.`, f: (sb, sc) => sc[a] !== c });
  }
  for (let c = 0; c < n; c++) for (let b = 0; b < n; b++) {
    const owner = (sc, k) => sc.indexOf(k);
    if (solB[solC.indexOf(c)] === b) cand.push({ w: 2, text: `${who(c)} ${B[b][1]}.`, f: (sb, sc) => sb[owner(sc, c)] === b });
    else cand.push({ w: 1, text: `${who(c)} ${B[b][2]}.`, f: (sb, sc) => sb[owner(sc, c)] !== b });
  }
  // « X vend la lampe ou le vase » : une des deux possibilités est la bonne
  const tail = (phrase, v) => phrase.split(" ").slice(v).join(" ");
  for (let a = 0; a < n; a++) for (let k = 0; k < n; k++) {
    if (k === solB[a]) continue;
    const [b1, b2] = Math.random() < .5 ? [solB[a], k] : [k, solB[a]];
    cand.push({ w: 1.5, text: `${A[a]} ${B[b1][1]} ou ${tail(B[b2][1], th.vB || 1)}.`, f: sb => sb[a] === b1 || sb[a] === b2 });
  }
  for (let a = 0; a < n; a++) for (let k = 0; k < n; k++) {
    if (k === solC[a]) continue;
    const [c1, c2] = Math.random() < .5 ? [solC[a], k] : [k, solC[a]];
    cand.push({ w: 1.5, text: `${A[a]} ${C[c1][1]} ou ${tail(C[c2][1], th.vC || 1)}.`, f: (sb, sc) => sc[a] === c1 || sc[a] === c2 });
  }
  if (th.order) {
    const O = th.order;
    // Sujet : une personne ou « la personne qui… » ; complément : une personne
    const subjects = [...A.map((_, a) => ({ t: A[a], get: (sb, sc) => a })), ...C.map((_, c) => ({ t: who(c), get: (sb, sc) => sc.indexOf(c) }))];
    for (const s of subjects) for (let y = 0; y < n; y++) {
      const sx = s.get(solB, solC);
      if (sx === y) continue;
      const d = solB[sx] - solB[y];
      if (d === 1) cand.push({ w: 2, text: `${s.t} ${O.next} ${A[y]}.`, ord: true, f: (sb, sc) => { const x = s.get(sb, sc); return x !== y && sb[x] - sb[y] === 1; } });
      if (d === -1) cand.push({ w: 2, text: `${s.t} ${O.prev} ${A[y]}.`, ord: true, f: (sb, sc) => { const x = s.get(sb, sc); return x !== y && sb[x] - sb[y] === -1; } });
      cand.push({ w: 2, text: `${s.t} ${d > 0 ? O.more : O.less} ${A[y]}.`, ord: true, f: (sb, sc) => { const x = s.get(sb, sc); return x !== y && (d > 0 ? sb[x] > sb[y] : sb[x] < sb[y]); } });
    }
    cand.forEach(c => { if (c.ord) c.text = c.text.replace(/ (que|de) ([A-ZÉÈ][\wéèëïî]*)\.$/, (m, w, nm) => " " + lgElide(w, nm) + "."); });
  }
  const perms = lgPerms(n);
  const count = clues => {
    let k = 0;
    for (const sb of perms) {
      for (const sc of perms) if (clues.every(c => c.f(sb, sc))) { if (++k > 1) return k; }
    }
    return k;
  };
  // Indices dans un ordre aléatoire, les positifs (trop directs) plutôt à la fin
  const order = cand.map(c => ({ c, k: Math.random() * (c.w === 3 ? 2.2 : c.ord ? .6 : c.w === 1.5 ? .7 : c.w === 2 ? .9 : 1.4) })).sort((x, y) => x.k - y.k).map(x => x.c);
  const chosen = [];
  for (const c of order) { chosen.push(c); if (count(chosen) === 1) break; }
  // Retire les indices superflus (en commençant par les plus directs)
  for (const c of chosen.slice().sort((x, y) => y.w - x.w)) {
    const rest = chosen.filter(x => x !== c);
    if (count(rest) === 1) chosen.splice(chosen.indexOf(c), 1);
  }
  return {
    story: th.story, generated: true,
    labelA: A, labelB: B.map(x => x[0]), labelC: C.map(x => x[0]),
    qA: th.qA, qB: th.qB, qC: th.qC,
    clues: shuffle(chosen).map(c => cap(c.text)),
    solB, solC,
  };
}
