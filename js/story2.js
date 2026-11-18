/* ============================================================
   LogiqueQuest — histoire, tome 2
   « Les Cendres du Fondaco » : Venise, hiver 1505.
   L’incendie du Fondaco dei Tedeschi, dans la nuit du 27 au
   28 janvier 1505, est réel, comme sa reconstruction (achevée en
   1508, façades peintes par Giorgione et Titien). L’enquête, les
   personnages et le vol sont inventés.
   ============================================================ */

const STORY2 = {
  id: "fondaco",
  blurb: "La suite : 10 épisodes à Venise, en 1505",
  title: "Les Cendres du Fondaco",
  era: "Venise, hiver 1505",
  prologue: "Cinq ans ont passé depuis l’affaire du cristal, et le Conseil des Dix vous a gardé à son service. Dans la nuit du 27 au 28 janvier 1505, le Fondaco des Allemands, le grand entrepôt des marchands du Nord au pied du Rialto, part en fumée. Accident, dit-on. Mais au matin, le coffre où dormaient des lingots d’argent est vide.",
  epilogue: "Le Fondaco renaîtra de ses cendres en 1508, plus beau que jamais. Merci d’avoir, une fois encore, servi la Sérénissime.",
  episodes: [
    {
      place: "Rialto", title: "Le Fondaco en flammes",
      text: [
        "Les cloches de San Bartolomeo sonnent à toute volée. Au bord du Grand Canal, le Fondaco des Allemands brûle : on y entrepose la futaine, le cuivre et l’argent que les marchands du Nord vendent à Venise.",
        "Au petit matin, il ne reste que des murs noircis. Le consul des marchands vous attend devant le coffre de fer, ouvert et vide. « Quarante-huit lingots d’argent », dit-il, la voix blanche.",
        "Sur un mur épargné, quelqu’un a écrit un mot à la suie. Commencez par les faits.",
      ],
      game: "enigmes",
      cfg: { items: [
        { q: "Sur le mur, un mot est écrit à l’envers : « OTNEGRA ». Lu à l’endroit, c’est un mot italien. Lequel ?",
          a: "argento", accept: ["argento"],
          hint: "Lisez les lettres de droite à gauche.",
          ex: "O-T-N-E-G-R-A lu à l’envers donne ARGENTO : « argent » en italien, le métal des lingots." },
        { q: "Le coffre contenait 48 lingots. Un tiers a été retrouvé fondu dans les décombres. La moitié du reste a été repêchée dans le canal par les plongeurs. Combien de lingots manquent encore ?",
          num: 16, a: "16 lingots", accept: ["seize"],
          hint: "Un tiers de 48, c’est 16. Que reste-t-il, et quelle moitié a été repêchée ?",
          ex: "48 ÷ 3 = 16 fondus. Il en reste 32, dont la moitié, 16, a été repêchée. Il manque donc 16 lingots." },
        { q: "Le veilleur a vu la première fumée au moment où la cloche sonnait pour la troisième fois de la nuit. Cette nuit-là, la cloche a sonné toutes les deux heures, la première fois à 18 h. À quelle heure le veilleur a-t-il vu la fumée ?",
          num: 22, a: "à 22 h", accept: ["22h", "22 h", "vingt-deux heures", "vingt deux heures"],
          hint: "Premier coup à 18 h, deuxième deux heures plus tard…",
          ex: "18 h, puis 20 h, puis 22 h : la troisième sonnerie est à 22 h." },
      ] },
      outro: "Seize lingots ont disparu, et le feu n’y est pour rien : on a vidé le coffre avant l’incendie. Le capitaine des arsenalotti, qui a combattu les flammes toute la nuit, veut vous montrer quelque chose.",
    },
    {
      place: "Rio del Fontego", title: "La chaîne des seaux",
      text: [
        "Les ouvriers de l’Arsenal, les arsenalotti, servent aussi de pompiers à Venise. Cette nuit, ils ont amarré des radeaux autour du Fondaco et tendu des chaînes de seaux de l’un à l’autre.",
        "Leur capitaine a noté sur une ardoise combien de chaînes partaient de chaque radeau, mais le plan lui-même s’est effacé.",
        "Reconstituez-le : chaque radeau indique son nombre de chaînes, les chaînes ne se croisent pas et tous les radeaux étaient reliés.",
      ],
      game: "hashi",
      cfg: { size: 7 },
      outro: "Le plan est complet, et il révèle un trou : aucune chaîne n’a jamais été tendue devant la porte d’eau du Fondaco. Quelqu’un a tenu ce côté libre, assez longtemps pour qu’une barque accoste. Des passants traînaient sur le campo San Bartolomeo cette nuit-là.",
    },
    {
      place: "Campo San Bartolomeo", title: "Les témoins du campo",
      text: [
        "Sur le campo voisin du Fondaco, quatre personnes ont vu quelque chose avant que l’alerte ne soit donnée : Nane le porteur d’eau, Zuana la marchande de beignets, fra Tomaso et Bepi le gondolier.",
        "Chacun a vu une seule chose, à une heure différente. Leurs souvenirs sont confus, mais en les recoupant, on peut tout reconstituer.",
      ],
      game: "logique",
      cfg: { puzzle: {
        story: "<b>Les témoins du campo</b>. Quatre témoins, quatre choses vues, quatre heures.",
        labelA: ["Nane", "Zuana", "Tomaso", "Bepi"], labelB: ["Barque", "Lanterne", "Masque", "Fumée"], labelC: ["23 h", "Minuit", "1 h", "2 h"],
        qA: "Témoins", qB: "Choses vues", qC: "Heures",
        clues: [
          "Zuana est passée sur le campo avant tous les autres.",
          "La fumée a été vue en dernier, à 2 h.",
          "L’homme masqué a été vu une heure exactement après la barque.",
          "Bepi n’a vu ni la lanterne ni la fumée.",
          "Fra Tomaso n’a vu ni la barque ni la fumée.",
          "Zuana n’a vu aucune barque.",
        ],
        solB: [3, 1, 2, 0], solC: [3, 0, 2, 1],
      } },
      outro: "Bepi a vu une barque accoster à minuit, Tomaso un homme masqué sortir du Fondaco à 1 h, et Nane la fumée à 2 h. Le feu a donc pris après le passage du masque. Fra Tomaso ajoute un détail : l’homme serrait un registre sous le bras.",
    },
    {
      place: "Fondaco, dans les cendres", title: "Le registre noirci",
      text: [
        "Dans les décombres, un commis retrouve le registre des entrées, à moitié brûlé. Chaque page aligne des quantités qui suivent une règle, mais le feu a mangé le dernier nombre de chaque ligne.",
        "Retrouvez les nombres manquants : ils diront quelles marchandises ont vraiment disparu.",
      ],
      game: "sequences",
      cfg: { diff: 0, items: [
        { seq: "7, 14, 21, 28, ?", options: ["30", "35", "36", "42"], answer: "35", explain: "Une balle de futaine de plus tous les sept jours : 28 + 7 = 35.", d: 1 },
        { seq: "2, 6, 18, 54, ?", options: ["108", "160", "162", "72"], answer: "162", explain: "Chaque nombre est le triple du précédent : 54 × 3 = 162.", d: 1 },
        { seq: "50, 47, 41, 32, ?", options: ["23", "20", "26", "18"], answer: "20", explain: "On retire 3, puis 6, puis 9, puis 12 : 32 − 12 = 20.", d: 2 },
        { seq: "3, 5, 9, 17, ?", options: ["25", "31", "33", "34"], answer: "33", explain: "On double et on retire 1 : 17 × 2 − 1 = 33.", d: 2 },
        { seq: "1, 1, 2, 6, 24, ?", options: ["48", "96", "120", "72"], answer: "120", explain: "On multiplie par 1, 2, 3, 4, puis 5 : 24 × 5 = 120.", d: 3 },
      ] },
      outro: "Les comptes reconstitués sont formels : seize lingots sont entrés, aucun n’est sorti. Trois noms reviennent autour de l’argent : le courtier vénitien Benedetto, que la loi impose comme intermédiaire aux marchands du Nord, le facteur allemand Gaspar, et la veuve Isotta, qui loue l’entrepôt voisin.",
    },
    {
      place: "Ca’ d’Isotta", title: "Le dallage",
      text: [
        "Isotta vous reçoit dans son palais du Grand Canal. Elle n’a rien à cacher, dit-elle. Pendant l’incendie, la foule a envahi son portego et brisé le dallage de marbre blanc et noir.",
        "Les ouvriers doivent le reposer selon la règle de l’ancien maître d’œuvre : autant de dalles blanches que de noires sur chaque rangée et chaque colonne, jamais trois de la même couleur à la suite, et pas deux rangées identiques.",
        "Ici, 0 désigne une dalle blanche et 1 une dalle noire. Une des dalles sonne creux…",
      ],
      game: "takuzu",
      cfg: { size: 6 },
      outro: "Sous la dalle creuse, pas d’argent : des lettres de Gaspar à Isotta. Elle rougit. Gaspar était chez elle la nuit du feu, jusqu’à une heure passée. Puis elle se souvient : « La veille, le courtier Benedetto achetait un cadenas dans les Mercerie. »",
    },
    {
      place: "Les Mercerie", title: "Le cadenas du mercier",
      text: [
        "Les Mercerie, la rue marchande qui relie le Rialto à la place Saint-Marc, débordent de boutiques. Le mercier se souvient de Benedetto, mais il ne parlera qu’à quelqu’un d’habile.",
        "Il pose sur le comptoir le jumeau du cadenas vendu : des anneaux de couleur à aligner. « Ouvrez-le, et je vous dirai ce qu’il a acheté d’autre. »",
      ],
      game: "code",
      cfg: { mode: 1 },
      outro: "Le cadenas s’ouvre. Le mercier tient parole : Benedetto a aussi pris de la toile cirée, de quoi emballer des objets lourds pour les plonger dans l’eau. Et il a demandé l’adresse de maître Zuan, un peintre de fresques.",
    },
    {
      place: "Campo Santo Stefano", title: "Les cartons du fresquiste",
      text: [
        "Maître Zuan prépare des dessins pour de futurs décors. Benedetto lui a commandé un petit motif à peindre sur une bouée, « pour retrouver un filet perdu », dit-il.",
        "Le peintre a gardé le carton, piqué de trous et quadrillé. Les nombres en marge disent quelles cases noircir.",
      ],
      game: "nonogram",
      cfg: { size: 10, picture: "un dessin", image: [
        "....##....",
        "...####...",
        "....##....",
        ".########.",
        "....##....",
        "#...##...#",
        "#...##...#",
        "##..##..##",
        ".########.",
        "...####...",
      ] },
      outro: "Une ancre. Les lingots ne sont pas cachés dans une maison : ils attendent sous l’eau, au pied d’une bouée marquée d’une ancre. Dans l’atelier, le peintre retrouve aussi une lettre oubliée par Benedetto, écrite en allemand.",
    },
    {
      place: "San Polo", title: "La lettre du Nord",
      text: [
        "La lettre n’est pas de Benedetto. Il l’a volée au facteur Gaspar, qui écrivait à son maître, à Augsbourg. Un traducteur des Dix la parcourt, mais l’encre a coulé.",
        "Retrouvez les mots qu’il a pu déchiffrer.",
      ],
      game: "mots",
      cfg: { size: 10, words: ["AUGSBOURG", "FONDACO", "FUTAINE", "LINGOT", "ARGENT", "ANCRE", "BOUEE", "MINUIT"] },
      outro: "Gaspar mettait son maître en garde : « Le courtier compte vendre notre argent au Levant. » Gaspar n’est donc pas le voleur, il avait des soupçons. Les Dix font saisir les papiers de Benedetto, enfermés dans un coffre au palais des Doges.",
    },
    {
      place: "Palais des Doges", title: "Le coffre des Dix",
      text: [
        "Le coffre de Benedetto est fermé par une serrure à molettes : une grille de chiffres, avec des signes gravés entre certaines molettes.",
        "Chaque chiffre doit apparaître une fois par ligne et par colonne, et chaque signe désigner la plus petite des deux molettes. Le serrurier des Dix vous laisse faire.",
      ],
      game: "futoshiki",
      cfg: { size: 5 },
      outro: "Dans le coffre, un reçu signé d’un patron de navire en partance pour Alexandrie : « seize caisses de plomb ». Seize, comme les lingots. Le navire lève l’ancre demain à l’aube, devant l’île de San Giorgio.",
    },
    {
      place: "Bassin de San Giorgio", title: "L’aube sur la lagune",
      text: [
        "Avant le jour, la barque des Dix glisse vers San Giorgio. Près de la bouée à l’ancre, une autre barque remonte des caisses : Benedetto, son batelier et un marin.",
        "Il faut agir vite, et juste.",
      ],
      game: "enigmes",
      cfg: { items: [
        { q: "La bouée est à 300 pas du quai. Avec le courant, votre barque avance de 100 pas par minute ; contre le courant, au retour, de 60 pas par minute. Combien de minutes dure l’aller-retour ?",
          num: 8, a: "8 minutes", accept: ["huit"],
          hint: "Calculez l’aller et le retour séparément.",
          ex: "Aller : 300 ÷ 100 = 3 minutes. Retour : 300 ÷ 60 = 5 minutes. Total : 8 minutes." },
        { q: "L’un des trois hommes cache sur lui la clé des caisses. Benedetto : « C’est le batelier qui l’a. » Le batelier : « Benedetto ment. » Le marin : « Je ne l’ai pas. » Un seul des trois dit la vérité. Qui a la clé : Benedetto, le batelier ou le marin ?",
          a: "le marin", accept: ["marin", "le marin"],
          hint: "Supposez tour à tour que chacun a la clé, et comptez les phrases vraies.",
          ex: "Si Benedetto l’avait, le batelier et le marin diraient vrai. Si c’était le batelier, Benedetto et le marin diraient vrai. Seul le marin laisse une seule phrase vraie : celle du batelier." },
        { q: "Les 16 caisses pèsent ensemble 152 livres. Une caisse qui contient un lingot d’argent pèse 10 livres ; une caisse leurre, remplie de plomb, en pèse 8. Combien de caisses contiennent un lingot d’argent ?",
          num: 12, a: "12 caisses", accept: ["douze"],
          hint: "Si les 16 caisses étaient en plomb, elles pèseraient 128 livres. D’où vient la différence ?",
          ex: "16 × 8 = 128 livres. Chaque caisse d’argent ajoute 2 livres : (152 − 128) ÷ 2 = 12 caisses d’argent." },
      ] },
      outro: "Douze lingots sont remontés. Les quatre autres ont payé le batelier et le marin, qui avouent tout. Benedetto avait vidé le coffre, puis mis le feu pour effacer ses traces dans les registres. Le Fondaco sera rebâti en pierre, et en 1508 ses façades seront peintes par Giorgione et le jeune Titien.",
    },
  ],
};
