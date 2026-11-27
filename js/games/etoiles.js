/* ============================================================
   Étoiles — une étoile par ligne, par colonne et par région
   Deux étoiles ne se touchent jamais, même en diagonale.
   Les grilles générées se résolvent pas à pas, sans deviner.
   ============================================================ */
const ET_PTS = { 5: 40, 6: 80, 8: 160 };
let etN = 6, etSol = [], etReg = [], etCells = [], etUndo = [], etHints = 0, etErrors = 0, etDone = false;
// etCells : 0 vide, 1 point (case sans étoile), 2 étoile

/* ---------- Génération ---------- */
function etStars(n) {
  for (let t = 0; t < 500; t++) {
    const p = [];
    let ok = true;
    for (let r = 0; r < n && ok; r++) {
      const opts = shuffle([...Array(n).keys()]).filter(c => !p.includes(c) && (r === 0 || Math.abs(c - p[r - 1]) > 1));
      if (!opts.length) ok = false; else p.push(opts[0]);
    }
    if (ok) return p;
  }
  return null;
}
function etRegions(n, p) {
  const reg = new Array(n * n).fill(-1), front = [];
  p.forEach((c, r) => { reg[r * n + c] = r; front.push(r * n + c); });
  let left = n * n - n;
  while (left) {
    const i = front[Math.floor(Math.random() * front.length)], r = Math.floor(i / n), c = i % n;
    const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && reg[a * n + b] < 0);
    if (!nb.length) { front.splice(front.indexOf(i), 1); continue; }
    const [a, b] = nb[Math.floor(Math.random() * nb.length)];
    reg[a * n + b] = reg[i]; front.push(a * n + b); left--;
  }
  return reg;
}

/* ---------- Raisonnement pas à pas ---------- */
function etUnits(n, reg) {
  const U = [];
  for (let r = 0; r < n; r++) U.push({ kind: "ligne", name: `la ligne ${r + 1}`, cells: [...Array(n)].map((_, c) => r * n + c) });
  for (let c = 0; c < n; c++) U.push({ kind: "colonne", name: `la colonne ${c + 1}`, cells: [...Array(n)].map((_, r) => r * n + c) });
  for (let k = 0; k < n; k++) U.push({ kind: "région", name: "la région", cells: [...Array(n * n).keys()].filter(i => reg[i] === k) });
  return U;
}
function etNear(n, i, j) { return Math.abs(Math.floor(i / n) - Math.floor(j / n)) <= 1 && Math.abs(i % n - j % n) <= 1; }
// Cases encore possibles pour une étoile : ni point, ni à côté d’une étoile, ni dans
// la ligne, la colonne ou la région d’une étoile.
function etAvail(n, reg, st) {
  const stars = st.map((v, i) => v === 2 ? i : -1).filter(i => i >= 0);
  return st.map((v, i) => v === 0 && !stars.some(s => etNear(n, s, i) || Math.floor(s / n) === Math.floor(i / n) || s % n === i % n || reg[s] === reg[i]));
}
// Déductions possibles : { i, v (1 point, 2 étoile), rank, why, text }
function etSteps(n, reg, st, sol, firstOnly) {
  const U = etUnits(n, reg), av = etAvail(n, reg, st), out = [];
  const add = (rank, i, v, why, text) => { if (!sol || (sol[i] === 1) === (v === 2)) out.push({ rank, i, v, why: [...new Set(why)], text }); };
  const open = U.filter(u => !u.cells.some(i => st[i] === 2)).map(u => ({ ...u, av: u.cells.filter(i => av[i]) }));
  if (open.some(u => !u.av.length)) return [];
  const rowOf = i => Math.floor(i / n), colOf = i => i % n;
  for (const u of open) if (u.av.length === 1) {
    const i = u.av[0], blockers = st.map((v, j) => v === 2 ? j : -1).filter(j => j >= 0 && u.cells.some(q => q !== i && st[q] === 0 && (etNear(n, j, q) || rowOf(j) === rowOf(q) || colOf(j) === colOf(q) || reg[j] === reg[q])));
    add(u.kind === "région" ? 0 : 1, i, 2, [...blockers, ...u.cells.filter(q => q !== i)], `Dans ${u.name === "la région" ? "la région de la case entourée" : u.name}, il ne reste qu’une place possible pour l’étoile : les autres cases (en bleu) sont marquées d’un point, touchent une étoile, ou partagent déjà sa ligne, sa colonne ou sa région.`);
  }
  if (firstOnly && out.length) return out;
  // Une région (ou ligne, colonne) dont les places possibles tiennent dans une seule ligne ou colonne
  for (const u of open) {
    for (const axis of ["ligne", "colonne"]) {
      if (u.kind === axis || u.av.length < 2) continue;
      const f = axis === "ligne" ? rowOf : colOf, k = f(u.av[0]);
      if (!u.av.every(i => f(i) === k)) continue;
      const line = open.find(w => w.kind === axis && f(w.cells[0]) === k);
      if (!line) continue;
      line.av.filter(i => !u.cells.includes(i)).forEach(i => add(2, i, 1, u.av,
        `Toutes les places possibles de ${u.kind === "région" ? "la région en bleu" : u.name} sont sur ${axis === "ligne" ? "la ligne" : "la colonne"} ${k + 1} : l’étoile de cette ${axis} sera donc dans ${u.kind === "région" ? "cette région" : u.name}. La case entourée, sur la même ${axis} mais en dehors, ne peut pas avoir d’étoile : mettez-y un point.`));
    }
    if (u.kind !== "région" && u.av.length >= 2) {
      const k = reg[u.av[0]];
      if (u.av.every(i => reg[i] === k)) {
        const R = open.find(w => w.kind === "région" && reg[w.cells[0]] === k);
        if (R) R.av.filter(i => !u.cells.includes(i)).forEach(i => add(2, i, 1, u.av,
          `Toutes les places possibles de ${u.name} (en bleu) sont dans la même région : l’étoile de cette région sera donc sur ${u.name}. La case entourée, dans cette région mais pas sur ${u.name}, ne peut pas avoir d’étoile : mettez-y un point.`));
      }
    }
  }
  if (firstOnly && out.length) return out;
  // Une étoile ici ne laisserait plus aucune place à une ligne, une colonne ou une région
  for (let i = 0; i < n * n; i++) {
    if (!av[i]) continue;
    const kills = j => j === i || etNear(n, i, j) || rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || reg[i] === reg[j];
    const dead = open.find(u => !u.cells.includes(i) && u.av.every(kills));
    if (dead) add(3, i, 1, dead.av, `Une étoile dans la case entourée supprimerait toutes les places possibles de ${dead.name === "la région" ? "la région en bleu" : dead.name} (cases en bleu) : elle n’aurait plus d’étoile. La case entourée est donc sans étoile : mettez-y un point.`);
  }
  // Deux régions enfermées dans les deux mêmes lignes (ou colonnes)
  if (!out.length) {
    const regs = open.filter(u => u.kind === "région");
    for (const axis of ["ligne", "colonne"]) {
      const f = axis === "ligne" ? rowOf : colOf;
      for (let a = 0; a < regs.length; a++) for (let b = a + 1; b < regs.length; b++) {
        const ks = new Set([...regs[a].av, ...regs[b].av].map(f));
        if (ks.size !== 2) continue;
        const both = new Set([...regs[a].cells, ...regs[b].cells]), lines = [...ks].sort((x, y) => x - y);
        open.filter(w => w.kind === axis && ks.has(f(w.cells[0]))).forEach(w => w.av.filter(i => !both.has(i)).forEach(i => add(4, i, 1, [...regs[a].av, ...regs[b].av],
          `Les deux régions en bleu ont toutes leurs places possibles sur les ${axis}s ${lines[0] + 1} et ${lines[1] + 1} : leurs deux étoiles occuperont ces deux ${axis}s. La case entourée, sur l’une de ces ${axis}s mais hors de ces régions, ne peut donc pas avoir d’étoile : mettez-y un point.`)));
      }
    }
  }
  // Essai : une étoile ici forcerait d’autres étoiles, jusqu’à une impasse
  if (!out.length) {
    for (let i = 0; i < n * n; i++) {
      if (!av[i]) continue;
      const t = st.slice(); t[i] = 2;
      let dead = null, forced = 0;
      for (let guard = 0; guard < n && !dead; guard++) {
        const a2 = etAvail(n, reg, t), op = U.filter(u => !u.cells.some(q => t[q] === 2)).map(u => ({ ...u, av: u.cells.filter(q => a2[q]) }));
        dead = op.find(u => !u.av.length) || null;
        if (dead) break;
        const single = op.find(u => u.av.length === 1);
        if (!single) break;
        t[single.av[0]] = 2; forced++;
      }
      if (dead) add(5, i, 1, dead.cells, `Essayez une étoile dans la case entourée : ${forced ? `elle obligerait à placer ${forced > 1 ? forced + " autres étoiles" : "une autre étoile"} (là où il ne resterait qu’une place), et ` : ""}${dead.name === "la région" ? "la région en bleu" : dead.name} n’aurait plus aucune place pour son étoile. La case entourée est donc sans étoile : mettez-y un point.`);
    }
  }
  return out;
}
// Nombre de déductions enchaînées avant blocage (Infinity si la grille est résolue)
function etProgress(n, reg, sol) {
  const st = new Array(n * n).fill(0);
  let steps = 0;
  while (st.filter(v => v === 2).length < n && steps < 400) {
    const s = etSteps(n, reg, st, null, true);
    if (!s.length) return steps;
    const best = s.reduce((a, x) => x.rank < a.rank ? x : a);
    if ((sol[best.i] === 1) !== (best.v === 2)) return -1;
    st[best.i] = best.v; steps++;
  }
  return st.filter(v => v === 2).length === n ? Infinity : steps;
}
function etConnected(n, reg, k) {
  const cells = reg.map((g, i) => g === k ? i : -1).filter(i => i >= 0);
  if (!cells.length) return false;
  const seen = new Set([cells[0]]), stack = [cells[0]];
  while (stack.length) {
    const i = stack.pop(), r = Math.floor(i / n), c = i % n;
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([a, b]) => { const j = a * n + b; if (a >= 0 && b >= 0 && a < n && b < n && reg[j] === k && !seen.has(j)) { seen.add(j); stack.push(j); } });
  }
  return seen.size === cells.length;
}
function etGenerate(n) {
  for (let t = 0; t < 40; t++) {
    const p = etStars(n);
    if (!p) continue;
    let reg = etRegions(n, p);
    const sol = new Array(n * n).fill(0);
    p.forEach((c, r) => { sol[r * n + c] = 1; });
    let score = etProgress(n, reg, sol);
    // Retouches : on déplace une case d’une région à sa voisine tant que le raisonnement avance plus loin
    for (let it = 0; it < 250 && score !== Infinity; it++) {
      const i = Math.floor(Math.random() * n * n);
      if (sol[i]) continue;
      const r = Math.floor(i / n), c = i % n;
      const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && reg[a * n + b] !== reg[i]);
      if (!nb.length) continue;
      const [a, b] = nb[Math.floor(Math.random() * nb.length)], from = reg[i];
      const r2 = reg.slice(); r2[i] = reg[a * n + b];
      if (!etConnected(n, r2, from)) continue;
      const s2 = etProgress(n, r2, sol);
      if (s2 >= score) { reg = r2; score = s2; }
    }
    if (score === Infinity) return { sol, reg };
  }
  return null;
}

// Grilles 8×8 pré-calculées (régions puis colonne de l’étoile de chaque ligne) :
// les trouver demande plusieurs secondes sur un téléphone. Chaque partie les tourne
// ou les retourne au hasard.
const ET_BANK8 = [
  "000001110303011103333221003355210077544400775555606775756667777517526403",
  "111112041511120415522244115336445556666456666666555566765777777662537041",
  "144400251444222514333225444432554744425547444655777666557777765550642731",
  "411333004413322544132225466336654666666544666565666555556677555572640513",
  "733003117333331172366361723363617753666475556644757556667777776646137250",
  "111110002111110324111103244133336641113366444553666666556666667573042516",
  "000022220011222200022222033424420444442204455722755577627777776602715364",
  "000000110000111122000163420661634600666746066557460655574666667724170536",
  "100000001000330033000342333333423355664433355646355556665576666640716352",
  "122222001122222255522222554224365544246655544466565666666666776671462035",
  "000000001100440000044432440443325444433254552222555622275556777741752036",
  "110000003100222031222666344266657742265577662665766666667777766661402753",
  "222222202442120024222222442323334223336342653663766666337776663374260351",
  "111111011111111112111334524113345241334454444444554644745666647764152037",
  "333300063321116633224466344444463334445634445556447756667775566664203571",
  "200000002000001122222001422330774523000755555007667757076667777757240316",
  "303331123333111233111512433355114466551164466555666665656776666615730642",
  "111111101151322311533223555333334553663355536633555556637775556673640251",
  "310004443110444433332444333324443344444466644445664444556644447731425706",
  "023331132222311342253333455535534455555555555555557555565577555606241573",
  "000011110333311205553332077534427755334477577774675777776777777715746203",
  "000111110331111100311211333312613345126133555261333355613777766617502463",
  "110022221133222233332425333224453433445534444555344666553447766520614753",
  "111112201113122044131122433355554355555533355555736556557766666674620351",
  "200111112205511122055111222533415225534655555546755555567555555525146370",
  "110022241002222410020024330002246500224465555224666572246666774430617425",
  "422222024111222244222223455233334452223354555736544557765555777761350274",
  "333333003331330033322222333255554332225566677775666777556777777763520714",
  "111112026111220261322222613325526644475267777755677777577777777761524703",
  "041111334411133342555333444555334444455544445556444457664444477703162475",
  "300002223301622233556662335554665355546655555666555666675555677713705246",
  "311110023133110233333122334434466334446666346566666666666667766661703524",
  "111102221111111213333222113334421133334251333337511663775555666741526037",
  "200222122202211222222222333344223555444235444442555446665666667726304157",
  "145330001453330244553332445533334455535355555555777777667777766650741362",
  "221111002211110122221111332444152226451522266555722655557726555575204631",
  "111111013131311133313342633334446663344466757444677777776667777761725304",
  "110064441100644411126644133366641133644416366445663666676666677720315746",
  "333111103311111033114220333144403334400035344446753666467556666673624150",
  "213330332113003322233333233333332433333324775766222757767777776652061473",
  "011111110111111122331311333333117733644573336465733366667777666606135742",
  "311100443112222433144244531444445554744457777744777776647777777442517063",
  "111100554411225544432255433355554443335565555557656657776665577742531607",
  "555000025511522255555242533522445575544557755555575555657755566642715360",
  "111111031141123344412233444553334445555544655555466565557766665563571420",
  "000000020001000200011122001133320333333405333364057766647777764403647152",
  "000001110000001100021111300221113622222466255444665555555555777726307415",
  "000000001100022013020020130222221332422213522662335722663377766650614273",
  "210001112111111121113311222233314422233166666531666665116666771137061524",
  "111332005113322255113332553332225333446255566662556666725666677261724035",
  "000000000000011000000212004032124444322244455552674555526775555535741602",
  "000000000000000102203111043031310433333144455537444657774446577707241536",
  "203314442333114422311444233344643356446435566664355566663777766615037264",
  "222223002112335022223550444335554443355545555555455665554555555762041537",
  "414444004144000044432200444333304553330044533366545566675555566761530247",
  "224011112241113142444133444333335544433355443336757333367777333335164072",
  "133220001322225513325225335555553355554437555444375555647775556450317462",
  "222200331120033322220333555200035554403355547733555773635557333350274163",
  "002221112224231144242334444423344444444466664445666666556777555506253741",
  "122222201112422413124244132242241222444412255744176677441777777770316425",
  "333111003311222233344424633454246634544463375554677777746677777772613504",
  "111112021111122213312222331114224341444244444665444466657776666663502741",
  "111110001111100011134020333340223334444254446466544466675444446752613047",
  "000001110033011144332211433355114443355144435551446355517766555547531620",
  "111222003112222233332222333337773353374736577747665744477777777771536204",
  "100044221100444231044442314455443555544455575546577775665777777731705264",
  "553330015533311175231141755334447756444475566644775666447766666657246130",
  "111000331111111311122333155444331154543315555336155553361577336650463172",
  "200011112222111122211331222133112421133144453333444533365555377726041375",
  "110003331111002310000223110111734111177744111755446777754447775531570624",
  "111000054211105542100005441113354441555544445555446655557776665564152730",
  "000000000011000051111202513132225533342255336422753362227555666263725140",
  "144400031144002344442223422223334442333354444433555444365777444651462073",
  "000001225501112235514222355444445544464455746666757444667774444635704162",
  "111111002111111022211100333311104353100043533600443336007777777764130257",
  "011111110011771302117773024117334441173374445776774457767777777703162475",
  "111110021112222231555252311555564444455677775556777777567777777761502473",
  "111110221133144231334422333334423334444537333445677334556677745551624703",
  "100000021333300233553042335544443555544435555454375566553775555540716352",
  "110000001112000011120000144203001444450064454550644545556655557741352607",
  "211000062211140622224406222444362244446652244466224446662774666653164072",
  "004444410000441122444111223444443334444433554444333447463777776616025374",
  "223333002223311023333555233335556465555766655557666555776555577775031426",
  "300000003033011133300221330000004340000044440555766700557777055547502613",
  "011111110211333302411333224113334441776345555763557777665577776603162475",
  "111000001123333044233333442335557444333573333355773376557777765560241753",
  "111111001111110011111102311111123344511236465112666655176667777763702415",
  "112000334122203342232333473333334733366347755633447776367776666651460372",
  "111111102211111121111111277344112773444477544464775474667777777674035261",
  "220001112000011120021111222233112422355524443335667443557777455546351702",
  "111100001111202213222222133252221555524255544446555446665555557740316257",
  "021111112214141122444413224474132444741124477555264677752666775504172635",
  "110000001550200015502040553320445556000465566664665666646666667450427136",
  "022222210222231152222313552223137522433375524433775566637755633306374251",
  "332200113332200133322251344422554444555544444555466455754444557747302516",
  "111111001151100011512222115423445154224455544444556644445567777461753024",
  "310024443122224433222447333234773333344753666667536776675367777731426057",
  "111000001111443311162433111664335516643351116333555666335777663362475031",
  "100000001222000011220000114220331146255311765555117656557776666540362751",
  "331110023311111231111122315554243155444435555555357556555575566563704152",
  "022244440244444152244441524444335544467355444673577446735777777707264153",
  "001122223311444233114222355544225555545255555555555755765557777613605274",
  "510000005111110052221100533111115534411155541111554441615577666675314062",
  "110033331122233312222233222233335224433355246337555463375566637720573146",
  "100003331003333315233333552333335224333355543376577773765577777740263175",
  "000000000200011122040131200443336604444766654447677774776666777726175304",
  "444000114440011144400112433033554433333544333355663735557777555535741602",
  "200111112011111121111713111117735445117755457777555557665577777625071364",
  "000000001112000712220077124222374442273755447777444476777777777741362057",
  "330000023110220233322002333322223332224273325566733377667777777751306472",
  "000000024011222243332222443332224433322244353322445533267555322652641370",
  "220111222200012222222222322622223366442263364725666667776666777725304716",
  "022224410224441122244113722441537444455574447577776675577777777706173524",
  "000111110200111102311111223331112533331425563334226666676666677705137246",
  "110000001110000013110022131155426551544265555542666654426666554742615307",
  "111111001111112241111222411143224441432255444662766646227766662264752031",
  "000044441100444412203344124334441544444415444444555444765555577630246175",
  "001111112021122122222211223111112333344433554464355776643377776617025364",
  "111111001211011012210010333130004333300044553000446666006666677763140257",
  "100000221111111211113322111132241161111465666667666666676666777720647135",
];
function etFromBank(n) {
  const e = ET_BANK8[Math.floor(Math.random() * ET_BANK8.length)];
  const reg0 = [...e.slice(0, n * n)].map(Number), cols = [...e.slice(n * n)].map(Number);
  const sym = Math.floor(Math.random() * 8), map = (r, c) => {
    let a = r, b = c;
    if (sym & 1) b = n - 1 - b;
    if (sym & 2) a = n - 1 - a;
    if (sym & 4) [a, b] = [b, a];
    return a * n + b;
  };
  const reg = new Array(n * n), sol = new Array(n * n).fill(0);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) reg[map(r, c)] = reg0[r * n + c];
  cols.forEach((c, r) => { sol[map(r, c)] = 1; });
  return { sol, reg };
}

/* ---------- Partie ---------- */
// cfg (parcours, défi) : { size: 5 | 6 | 8 }
function initEtoiles(cfg) {
  navToken++;
  cfg = cfg || levelCfg();
  if (cfg) etN = cfg.size;
  else if (resumeFreeSize("etoiles")) etN = resumeFreeSize("etoiles");
  setActiveChips("etoiles", etN);
  etDone = false; etUndo = []; hintReset("etoiles");
  const snap = resumeTake("etoiles", playCtx(etN));
  if (snap) ({ sol: etSol, reg: etReg, cells: etCells, hints: etHints, errors: etErrors } = snap);
  else {
    let p = null;
    if (etN === 8) p = etFromBank(8);
    while (!p) p = etGenerate(etN);
    etSol = p.sol; etReg = p.reg; etCells = new Array(etN * etN).fill(0); etHints = 0; etErrors = 0;
  }
  renderEtoiles();
}
function saveEtoiles() { resumeSave("etoiles", playCtx(etN), { sol: etSol, reg: etReg, cells: etCells, hints: etHints, errors: etErrors }); }
function newEtoiles() { resumeClear("etoiles"); initEtoiles(); }
function etConflicts() {
  const n = etN, bad = new Array(n * n).fill(false), stars = etCells.map((v, i) => v === 2 ? i : -1).filter(i => i >= 0);
  stars.forEach(a => stars.forEach(b => {
    if (a >= b) return;
    if (etNear(n, a, b) || Math.floor(a / n) === Math.floor(b / n) || a % n === b % n || etReg[a] === etReg[b]) bad[a] = bad[b] = true;
  }));
  return bad;
}
function etCellSize() {
  const avail = Math.min(document.documentElement.clientWidth - 32, 520);
  return Math.max(34, Math.min(64, Math.floor((avail - 8) / etN)));
}
const ET_TINTS = ["#3d4457", "#454036", "#3a4a48", "#47394a", "#3b4256", "#4a4235", "#36474a", "#463a40"];
function etHintValid(h) { return h.wrong ? etIsWrong(h.key) : etCells[h.key] === 0; }
function etIsWrong(i) { return (etCells[i] === 2 && !etSol[i]) || (etCells[i] === 1 && etSol[i]); }
function renderEtoiles() {
  const n = etN, b = $("et-board"), bad = etConflicts();
  hintPanel("etoiles", "et-explain", etHintValid);
  b.style.setProperty("--etc", etCellSize() + "px");
  b.style.gridTemplateColumns = `repeat(${n}, var(--etc))`;
  // Couleurs de régions : deux régions voisines n’ont pas la même teinte
  const col = [];
  for (let k = 0; k < n; k++) {
    const nbs = new Set();
    etReg.forEach((g, i) => { if (g !== k) return; const r = Math.floor(i / n), c = i % n; [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([a, q]) => { if (a >= 0 && q >= 0 && a < n && q < n && etReg[a * n + q] !== k && col[etReg[a * n + q]] !== undefined) nbs.add(col[etReg[a * n + q]]); }); });
    col[k] = [...ET_TINTS.keys()].map(t => (t + k) % ET_TINTS.length).find(t => !nbs.has(t)) ?? k % ET_TINTS.length;
  }
  let h = "";
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, k = etReg[i], v = etCells[i];
    const edge = (rr, cc) => rr < 0 || cc < 0 || rr >= n || cc >= n || etReg[rr * n + cc] !== k;
    const cls = ["et-cell", edge(r - 1, c) ? "bt" : "", edge(r + 1, c) ? "bb" : "", edge(r, c - 1) ? "bl" : "", edge(r, c + 1) ? "br" : "", v === 2 ? "star" : v === 1 ? "dot" : "", bad[i] ? "bad" : ""].join(" ") + hintCls("etoiles", i);
    const inner = v === 2 ? ICONS.star : v === 1 ? "<i></i>" : "";
    h += `<div class="${cls}" style="background:${ET_TINTS[col[k]]}" data-i="${i}" data-label="${v === 2 ? "étoile" : v === 1 ? "point" : "vide"}, ligne ${r + 1}, colonne ${c + 1}">${inner}</div>`;
  }
  b.innerHTML = h;
  const left = n - etCells.filter(v => v === 2).length;
  $("et-info").textContent = left > 0 ? `${left} étoile${left > 1 ? "s" : ""} à placer` : "";
}
function tapEtoile(i) {
  if (etDone) return;
  etUndo.push(etCells.slice()); if (etUndo.length > 300) etUndo.shift();
  etCells[i] = etCells[i] === 0 ? 2 : etCells[i] === 2 ? 1 : 0;
  sfx("tick"); renderEtoiles(); saveEtoiles(); checkEtoiles();
}
function undoEtoiles() {
  if (etDone) return;
  const u = etUndo.pop();
  if (!u) { toast("Rien à annuler"); return; }
  etCells = u; sfx("tick"); renderEtoiles(); saveEtoiles();
}
function etoilesReason() {
  const st = etCells.map((v, i) => v === 2 ? 2 : v === 1 ? 1 : 0);
  const s = etSteps(etN, etReg, st, etSol).filter(x => st[x.i] === 0);
  if (!s.length) return null;
  const best = Math.min(...s.map(x => x.rank)), pool = s.filter(x => x.rank === best), r = pool[Math.floor(Math.random() * pool.length)];
  return { rank: r.rank, key: r.i, why: r.why, text: r.text, msg: r.v === 2 ? "Cette case se déduit maintenant. Touchez encore Indice pour l’explication." : "Une case sans étoile se déduit ici. Touchez encore Indice pour l’explication." };
}
function hintEtoiles() {
  if (etDone) return;
  hintFlow("etoiles", {
    valid: etHintValid,
    wrong: () => { const i = etCells.findIndex((v, k) => etIsWrong(k)); return i < 0 ? null : { key: i, msg: etCells[i] === 2 ? "Cette étoile est mal placée. Touchez encore Indice pour l’effacer." : "Ce point cache une étoile. Touchez encore Indice pour l’effacer." }; },
    find: etoilesReason,
    fallback: () => { const i = etSol.findIndex((v, k) => v && etCells[k] !== 2); return i < 0 ? null : { key: i, why: [], text: "Cette étoile se déduit en croisant plusieurs régions." }; },
    clear: h => { etUndo.push(etCells.slice()); etCells[h.key] = 0; saveEtoiles(); },
    place: h => { etUndo.push(etCells.slice()); etCells[h.key] = etSol[h.key] ? 2 : 1; saveEtoiles(); },
    count: () => { etHints++; saveEtoiles(); },
    render: () => { renderEtoiles(); checkEtoiles(); },
  });
}
function checkEtoiles() {
  if (etDone) return;
  const stars = etCells.filter(v => v === 2).length;
  if (stars < etN) return;
  if (stars > etN || etConflicts().some(Boolean) || etCells.some((v, i) => v === 2 && !etSol[i])) {
    etErrors++; addPoints(-3); sfx("bad"); saveEtoiles();
    toast("Toutes les étoiles sont posées, mais certaines enfreignent une règle");
    return;
  }
  etDone = true;
  resumeClear("etoiles");
  etCells = etCells.map(v => v === 2 ? 2 : 1); renderEtoiles();
  const pts = ET_PTS[etN];
  addPoints(pts); state.solved++;
  if (!levelCfg()) setBest("etoiles", etN);
  save();
  const stars3 = !etHints && !etErrors ? 3 : etHints <= 2 && etErrors <= 1 ? 2 : 1;
  later(() => winGame("Ciel étoilé", `Grille ${etN}×${etN} terminée${etHints ? `, avec ${etHints} indice${etHints > 1 ? "s" : ""}` : " sans indice"}. +${pts} points`, pts, stars3), 600);
}

LQ.register({
  id: "etoiles",
  title: "Étoiles",
  desc: "Une étoile par ligne et par région",
  hue: "#f2c86b",
  recordLabel: v => `Record : ${v}×${v}`,
  init: initEtoiles,
  levelInfo: cfg => ({
    what: `Une grille d’étoiles ${cfg.size}×${cfg.size}`,
    goals: ["Sans indice ni erreur", "Au plus deux indices et une erreur", "Terminer la grille"],
  }),
  rules: [
    "Placez une étoile dans chaque ligne, dans chaque colonne et dans chaque région (zones de couleur aux bords épais).",
    "Deux étoiles ne se touchent jamais, même par un coin.",
    "Touchez une case : une étoile, puis un point (case sans étoile, pour vous aider), puis vide. Les étoiles en conflit s’affichent en rouge.",
    "<b>Indice</b> montre d’abord la prochaine case à déduire ; touchez-le encore pour l’explication, puis une troisième fois pour y placer l’étoile ou le point.",
  ],
  screen: `
    <div class="chips lvl-hide">
      <button class="chip" data-b="5" onclick="etN=5;newEtoiles()">Facile · 5×5</button>
      <button class="chip" data-b="6" onclick="etN=6;newEtoiles()">Moyen · 6×6</button>
      <button class="chip" data-b="8" onclick="etN=8;newEtoiles()">Difficile · 8×8</button>
    </div>
    <div class="board-wrap">
      <div class="et-board" id="et-board"></div>
      <p class="hint-line" id="et-info"></p>
      <p class="hint-explain" id="et-explain" aria-live="polite"></p>
      <div class="toolbar">
        <button class="btn ghost small" onclick="undoEtoiles()">${ICONS.undo} Annuler</button>
        <button class="btn ghost small" onclick="hintEtoiles()">${ICONS.bulb} Indice</button>
        <button class="btn ghost small lvl-hide" onclick="newEtoiles()">${ICONS.refresh} Nouvelle grille</button>
      </div>
    </div>
    <p class="hint-line">Une étoile par ligne, par colonne et par région ; deux étoiles ne se touchent jamais.</p>`,
  setup() {
    $("et-board").addEventListener("click", e => { const c = e.target.closest(".et-cell"); if (c) tapEtoile(+c.dataset.i); });
    window.addEventListener("resize", () => { if (currentGame === "etoiles" && etSol.length) renderEtoiles(); });
  },
});
