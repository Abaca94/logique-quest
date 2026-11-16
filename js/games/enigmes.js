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
  /* ----- Ajouts v5.0 ----- */
  { q: "Entre midi (exclu) et minuit (inclus), combien de fois les aiguilles des heures et des minutes d’une horloge se superposent-elles exactement ?",
    num: 11, a: "11 fois", accept: ["onze"],
    hint: "Elles ne se superposent pas à 13 h 05 pile, mais un peu après. Combien de fois la grande aiguille rattrape-t-elle la petite en 12 heures ?",
    ex: "La grande aiguille rattrape la petite toutes les 12/11 heures : 11 fois en 12 heures, la dernière à minuit." },
  { q: "Un nombre positif, multiplié par lui-même puis augmenté de lui-même, donne 42. Quel est ce nombre ?",
    num: 6, a: "6", accept: ["six"],
    hint: "Cherchez n tel que n × n + n = 42, c’est-à-dire n × (n + 1) = 42.",
    ex: "6 × 6 + 6 = 36 + 6 = 42." },
  { q: "Dix personnes se rencontrent et chacune serre une seule fois la main de chacune des autres. Combien de poignées de main sont échangées ?",
    num: 45, a: "45", accept: ["quarante-cinq", "quarante cinq"],
    hint: "Chaque personne serre 9 mains, mais chaque poignée de main concerne deux personnes.",
    ex: "10 × 9 = 90, divisé par 2 car chaque poignée est comptée deux fois : 45." },
  { q: "Un cycliste fait un trajet aller à 10 km/h, puis revient par le même chemin à 15 km/h. Quelle est sa vitesse moyenne sur l’aller-retour, en km/h ?",
    num: 12, a: "12 km/h", accept: ["douze"],
    hint: "Ce n’est pas 12,5. Imaginez un trajet de 30 km et calculez le temps total.",
    ex: "Sur 30 km : aller 3 h, retour 2 h. 60 km en 5 h, soit 12 km/h." },
  { q: "Combien de nombres entiers de 1 à 100 (inclus) sont divisibles par 3 ou par 5 ?",
    num: 47, a: "47", accept: ["quarante-sept", "quarante sept"],
    hint: "Comptez les multiples de 3, ceux de 5, puis retirez ceux comptés deux fois.",
    ex: "33 multiples de 3 + 20 multiples de 5 − 6 multiples de 15 = 47." },
  { q: "Quelle est la somme de tous les nombres entiers de 1 à 100 ?",
    num: 5050, a: "5050", accept: ["cinq mille cinquante"],
    hint: "Associez 1 avec 100, 2 avec 99, 3 avec 98…",
    ex: "50 paires valant chacune 101 : 50 × 101 = 5050." },
  { q: "Un rectangle a un périmètre de 20 cm et sa longueur vaut quatre fois sa largeur. Quelle est son aire, en cm² ?",
    num: 16, a: "16 cm²", accept: ["seize"],
    hint: "La longueur plus la largeur font la moitié du périmètre.",
    ex: "Largeur + longueur = 10 et longueur = 4 × largeur : largeur 2, longueur 8, aire 16 cm²." },
  { q: "Un bassin se remplit en 3 heures avec le robinet A seul, et en 6 heures avec le robinet B seul. En combien d’heures se remplit-il avec les deux robinets ouverts ensemble ?",
    num: 2, a: "2 heures", accept: ["deux", "deux heures"],
    hint: "Quelle fraction du bassin chaque robinet remplit-il en une heure ?",
    ex: "En une heure : 1/3 + 1/6 = 1/2 du bassin. Il faut donc 2 heures." },
  { q: "Je suis un nombre de trois chiffres, tous identiques. La somme de mes chiffres vaut 21. Qui suis-je ?",
    num: 777, a: "777", accept: [],
    hint: "Trois chiffres égaux dont la somme fait 21.",
    ex: "21 ÷ 3 = 7 : le nombre est 777." },
  { q: "Combien de triangles différents peut-on dessiner en reliant 3 des 6 sommets d’un hexagone régulier ?",
    num: 20, a: "20", accept: ["vingt"],
    hint: "Dans un hexagone régulier, trois sommets ne sont jamais alignés : il suffit de compter les choix de 3 sommets parmi 6.",
    ex: "Nombre de façons de choisir 3 sommets parmi 6 : (6 × 5 × 4) ÷ (3 × 2 × 1) = 20." },
  { q: "Le prix d’un article augmente de 20 %, puis le nouveau prix baisse de 20 %. De combien de pour cent le prix final est-il inférieur au prix de départ ?",
    num: 4, a: "4 %", accept: ["quatre", "quatre pour cent"],
    hint: "Partez d’un prix de 100 €.",
    ex: "100 € → 120 € → 120 − 24 = 96 €. Le prix a baissé de 4 %." },
  { q: "Quel est le plus petit nombre entier positif dont le produit des chiffres vaut 24 ?",
    num: 38, a: "38", accept: ["trente-huit", "trente huit"],
    hint: "Aucun nombre à un chiffre ne convient. Cherchez parmi les nombres à deux chiffres, en commençant par la plus petite dizaine possible.",
    ex: "Les nombres à deux chiffres qui conviennent sont 38, 46, 64 et 83. Le plus petit est 38." },
  { q: "Sur une île, les chevaliers disent toujours la vérité et les fripons mentent toujours. A déclare : « B et moi sommes tous les deux des fripons. » B est-il un chevalier ou un fripon ?",
    a: "un chevalier", accept: ["chevalier", "un chevalier"],
    hint: "Un chevalier pourrait-il dire « je suis un fripon » ?",
    ex: "Si A était chevalier, il dirait vrai et serait fripon : impossible. A est donc fripon et ment : ils ne sont pas tous deux fripons, donc B est chevalier." },
  { q: "Même île. A déclare : « B et moi sommes du même type. » B déclare : « A et moi sommes de types différents. » A est-il un chevalier ou un fripon ?",
    a: "un fripon", accept: ["fripon", "un fripon"],
    hint: "Leurs deux phrases se contredisent : un seul des deux dit vrai.",
    ex: "Une seule phrase est vraie, donc ils sont de types différents : B dit vrai (chevalier) et A ment (fripon)." },
  { q: "Par combien de zéros se termine le nombre 1 × 2 × 3 × … × 25 ?",
    num: 6, a: "6 zéros", accept: ["six"],
    hint: "Chaque zéro final vient d’une paire 2 × 5. Les facteurs 2 sont nombreux : comptez les facteurs 5.",
    ex: "5, 10, 15, 20 apportent un 5 chacun, et 25 en apporte deux : 6 facteurs 5, donc 6 zéros." },
  { q: "Une boîte contient 5 billes rouges, 5 vertes et 5 bleues. À l’aveugle, combien faut-il en tirer au minimum pour être sûr d’avoir 3 billes de la même couleur ?",
    num: 7, a: "7 billes", accept: ["sept"],
    hint: "Dans le pire des cas, combien de billes peut-on tirer sans avoir 3 billes d’une même couleur ?",
    ex: "On peut tirer 2 rouges, 2 vertes et 2 bleues sans succès. La 7e bille complète forcément un trio." },
  { q: "Un escalier compte 6 marches. On le monte en franchissant 1 ou 2 marches à chaque pas. De combien de façons différentes peut-on le monter ?",
    num: 13, a: "13 façons", accept: ["treize"],
    hint: "Pour atteindre la marche n, on vient soit de la marche n − 1, soit de la marche n − 2.",
    ex: "Nombre de façons pour 1 à 6 marches : 1, 2, 3, 5, 8, 13." },
  { q: "On plie une feuille de papier en deux, puis encore en deux, cinq fois de suite. On la perce ensuite d’un seul trou qui traverse toutes les épaisseurs. Combien de trous compte la feuille une fois dépliée ?",
    num: 32, a: "32 trous", accept: ["trente-deux", "trente deux"],
    hint: "Chaque pliage double le nombre d’épaisseurs.",
    ex: "Après 5 pliages, il y a 2 × 2 × 2 × 2 × 2 = 32 épaisseurs, donc 32 trous." },
  { q: "100 kg de pommes de terre contiennent 99 % d’eau. Après séchage, elles ne contiennent plus que 98 % d’eau. Combien pèsent-elles maintenant, en kilos ?",
    num: 50, a: "50 kg", accept: ["cinquante"],
    hint: "La matière sèche ne change pas : 1 kg. Que représente-t-elle après séchage ?",
    ex: "La matière sèche (1 kg) passe de 1 % à 2 % du poids total : le poids total est de 50 kg." },
  { q: "On trace la diagonale d’un rectangle de 6 cases sur 4 cases, dessiné sur du papier quadrillé. Combien de cases la diagonale traverse-t-elle (en passant à l’intérieur) ?",
    num: 8, a: "8 cases", accept: ["huit"],
    hint: "La diagonale passe exactement par un coin de case, au milieu du rectangle.",
    ex: "Le rectangle se coupe en deux rectangles de 3 × 2, où la diagonale traverse 4 cases : 2 × 4 = 8." },
  { q: "Deux trains partent au même instant de deux gares distantes de 300 km et roulent l’un vers l’autre, à 70 km/h et à 80 km/h. Au bout de combien d’heures se croisent-ils ?",
    num: 2, a: "2 heures", accept: ["deux", "deux heures"],
    hint: "Ensemble, de combien de kilomètres se rapprochent-ils chaque heure ?",
    ex: "Ils se rapprochent de 70 + 80 = 150 km par heure : 300 ÷ 150 = 2 heures." },
  { q: "Même situation : au départ, une mouche vole à 100 km/h d’un train à l’autre, en faisant demi-tour à chaque fois, jusqu’à ce que les trains se croisent. Quelle distance totale parcourt-elle, en km ?",
    num: 200, a: "200 km", accept: ["deux cents"],
    hint: "Inutile de calculer chaque aller-retour : combien de temps vole-t-elle ?",
    ex: "Elle vole pendant les 2 heures avant le croisement, à 100 km/h : 200 km." },
  { q: "Combien de jours y a-t-il au total dans les années 2024 et 2025 réunies ?",
    num: 731, a: "731 jours", accept: [],
    hint: "L’une de ces deux années est bissextile.",
    ex: "2024 est bissextile (366 jours) et 2025 ne l’est pas (365 jours) : 731 jours." },
  { q: "Une horloge indique exactement 3 h 15. Quel angle, en degrés, forment ses deux aiguilles ?",
    num: 7.5, a: "7,5 degrés", accept: ["sept degres et demi", "sept et demi"],
    hint: "À 3 h 15, la petite aiguille n’est plus exactement sur le 3.",
    ex: "La grande aiguille est sur le 3 (90°). La petite a avancé d’un quart de l’intervalle entre 3 et 4 (30° ÷ 4) : 97,5°. Écart : 7,5°." },
  { q: "Combien de diagonales possède un octogone (polygone à 8 côtés) ?",
    num: 20, a: "20", accept: ["vingt"],
    hint: "Depuis chaque sommet, on peut tracer une diagonale vers tous les sommets sauf lui-même et ses deux voisins.",
    ex: "8 sommets × 5 diagonales = 40, chaque diagonale étant comptée deux fois : 20." },
  { q: "Paul a trois fois l’âge de sa fille. Dans 15 ans, il aura deux fois son âge. Quel âge a Paul aujourd’hui ?",
    num: 45, a: "45 ans", accept: ["quarante-cinq", "quarante cinq"],
    hint: "Si la fille a f ans, résolvez 3f + 15 = 2 × (f + 15).",
    ex: "f = 15 : Paul a 45 ans. Dans 15 ans, il aura 60 ans et sa fille 30 ans." },
  { q: "Combien de rectangles différents (carrés compris) peut-on compter dans une grille de 3 cases sur 3 ?",
    num: 36, a: "36", accept: ["trente-six", "trente six"],
    hint: "Un rectangle est défini par 2 lignes verticales et 2 lignes horizontales parmi les 4 de chaque sens.",
    ex: "6 choix de 2 lignes verticales × 6 choix de 2 lignes horizontales = 36." },
  { q: "Un cadenas a un code de 3 chiffres. 682 : un chiffre est bon et bien placé. 614 : un chiffre est bon mais mal placé. 206 : deux chiffres sont bons mais mal placés. 738 : rien n’est bon. 780 : un chiffre est bon mais mal placé. Quel est le code ?",
    num: 42, a: "042", accept: ["042", "0 4 2"],
    hint: "738 élimine 7, 3 et 8. Que vous apprend alors 780 ?",
    ex: "7 et 8 étant exclus, 780 indique que 0 est dans le code, pas en 3e position. On en déduit 0, 4 et 2 : le code 042." },
  { q: "Quel est le nombre maximal de dimanches que peut compter une année de 365 jours ?",
    num: 53, a: "53", accept: ["cinquante-trois", "cinquante trois"],
    hint: "365 jours = 52 semaines + 1 jour.",
    ex: "52 semaines complètes donnent 52 dimanches ; si le jour restant est un dimanche, cela fait 53." },
  { q: "Le 1er janvier d’une année non bissextile tombe un lundi. Quel jour de la semaine sera le 31 décembre de la même année ?",
    a: "lundi", accept: ["lundi"],
    hint: "Entre le 1er janvier et le 31 décembre, il y a 364 jours.",
    ex: "364 jours font exactement 52 semaines : le 31 décembre est aussi un lundi." },
  { q: "Un sac contient autant de billes rouges que de billes bleues. Si l’on ajoute 6 billes rouges, il y a deux fois plus de rouges que de bleues. Combien de billes le sac contenait-il au départ ?",
    num: 12, a: "12 billes", accept: ["douze"],
    hint: "Si r est le nombre de rouges au départ (autant de bleues), r + 6 = 2r.",
    ex: "r = 6 : 6 rouges et 6 bleues, soit 12 billes." },
  { q: "Combien de nombres de trois chiffres (de 100 à 999) ont leurs trois chiffres tous différents ?",
    num: 648, a: "648", accept: [],
    hint: "Le premier chiffre ne peut pas être 0.",
    ex: "9 choix pour les centaines, 9 pour les dizaines (0 redevient possible), 8 pour les unités : 648." },
  { q: "Cinq coureurs finissent une course. Carl arrive avant Ana. Ana arrive avant Ben. Dan arrive juste après Ben. Ève arrive juste avant Ana. Qui termine troisième ?",
    a: "Ana", accept: ["ana"],
    hint: "Ève et Ana se suivent, Ben et Dan aussi, et Carl est devant Ève.",
    ex: "Le seul ordre possible est Carl, Ève, Ana, Ben, Dan : Ana est troisième." },
  { q: "Trois caisses portent les étiquettes « pommes », « oranges » et « mélange », mais toutes les étiquettes sont fausses. Vous pouvez tirer un seul fruit d’une seule caisse. Dans quelle caisse tirer pour pouvoir ensuite réétiqueter les trois caisses correctement ?",
    a: "« mélange »", accept: ["melange", "la caisse melange", "celle marquee melange"],
    hint: "Quelle caisse ne peut certainement pas contenir le mélange ?",
    ex: "La caisse « mélange » contient un seul type de fruit. Si on y tire une pomme, ce sont les pommes ; la caisse « oranges » (forcément fausse) contient alors le mélange, et la dernière les oranges." },
  { q: "Un homme montre un portrait et dit : « Je n’ai ni frère ni sœur, mais le père de cet homme est le fils de mon père. » Qui est sur le portrait ?",
    a: "son fils", accept: ["fils", "son fils", "mon fils", "le fils"],
    hint: "Fils unique, « le fils de mon père » désigne qui ?",
    ex: "Le fils de son père, c’est lui-même. Le père de l’homme du portrait est donc lui : c’est son fils." },
  { q: "Dans un club de 28 membres, 18 font du tennis et 12 de la natation ; 3 membres ne font ni l’un ni l’autre. Combien de membres pratiquent les deux sports ?",
    num: 5, a: "5", accept: ["cinq"],
    hint: "25 membres font au moins un des deux sports.",
    ex: "28 − 3 = 25 font au moins un sport. 18 + 12 = 30 : les 5 en trop sont comptés deux fois, ils font les deux." },
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
    if (!levelCfg()) setBest("enigmes", enigIndex + 1);
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
