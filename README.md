# LogiqueQuest

Jeu de logique, d’énigmes et de casse-tête pour adultes, pensé pour iPhone et iPad (fonctionne aussi sur ordinateur).
100 % local, aucune dépendance, jouable hors connexion une fois installé.

## Utilisation
Ouvrir `index.html` dans un navigateur, ou mettre le dossier en ligne (HTTPS) pour l’installer :
Safari → *Partager* → *« Sur l’écran d’accueil »*. L’app se lance alors en plein écran et garde les scores.

## Parcours (50 niveaux)
5 chapitres de 10 niveaux (Premiers pas, Raisonnement, Expertise, Maîtrise, Virtuose) qui piochent dans les 10 jeux.
Chaque niveau rapporte 1 à 3 étoiles selon des objectifs affichés avant de jouer.
Le niveau suivant s’ouvre quand le précédent est validé ; les chapitres s’ouvrent à 18, 45, 70 puis 95 étoiles.
Le **profil** affiche le rang (7 rangs selon les étoiles), les statistiques et 19 badges.

## Défi du jour
Chaque jour, un nouveau défi qui tourne entre les 10 jeux. La grille est tirée d’une graine qui dépend
de la date : tout le monde a le même défi le même jour. Première réussite du jour : +50 points.
L’écran du défi montre la série de jours, la meilleure série et un calendrier du mois.

## Histoire : « Le Secret du cristal »
Venise, printemps 1500 : le secret du verre cristallin de Murano a été volé. 10 épisodes, du Palais
des Doges à la fête de la Sensa, chacun avec un texte, une épreuve (parfois au contenu propre à
l’histoire : énigmes, tableau croisé, mots mêlés, nonogram dessiné, vrai ou faux sur Venise) et la suite
du récit. Les personnages sont inventés, le décor et les faits d’époque sont réels.

## Confort de jeu (v8)
- **Reprise de partie** : quitter un jeu en cours (ou fermer l’app) garde la partie ; on la retrouve en revenant.
- **Annuler** : sudoku, kakuro et nonogram.
- **Mode crayon** : petites notes de candidats au sudoku et au kakuro, effacées automatiquement quand un chiffre est posé.
- **Indices** : sudoku, kakuro, nonogram et taquin. Au taquin, l’indice indique quelle tuile placer et laquelle bouger
  (méthode rangée par rangée puis colonne par colonne). Un indice utilisé retire la 3ᵉ étoile.
- **Règles** de chaque jeu : affichées à la première ouverture, puis via le bouton « ? » en haut.
- **Texte agrandi** (bouton sur l’accueil) et clavier numérique pour les énigmes à réponse chiffrée.

## Partage, changement d’appareil, statistiques (v8.1)
- **Partager le défi du jour** : une fois réussi, un bouton envoie le résultat (jeu, étoiles, série) par la feuille de partage d’iOS.
- **Changer d’appareil** (Profil) : « Envoyer ma progression » produit un code à transmettre par AirDrop, Messages ou Notes ;
  sur l’autre appareil, « Récupérer une progression » le lit et **fusionne** : on garde le meilleur des deux, rien n’est effacé.
- **Statistiques** (Profil) : activité des 12 dernières semaines (jours joués, défis réussis), taux de parties gagnées,
  et un bilan par jeu (parties gagnées, record en jeu libre, étoiles du parcours).

## Jeux libres (10)
Chaque jeu reste jouable seul, avec le choix de la difficulté.
| Jeu | Contenu |
|---|---|
| Énigmes | 60 problèmes de logique à réponse unique, avec indice et explication |
| Séquences | 30 suites logiques, 3 niveaux |
| Déduction | 6 tableaux croisés « qui fait quoi » (✘ / ✔), jusqu’à 6×6, croix automatiques en option |
| Sudoku | 4×4, 6×6, 9×9, grilles à solution unique générées à la volée |
| Taquin | 3×3, 4×4, 5×5, mélanges toujours solvables, chronomètre |
| Mémoire | 8, 10 ou 12 paires, étoiles selon le nombre d’essais |
| Mots mêlés | 8×8, 10×10, 12×12, mots cachés dans 8 directions (le mot est validé même si on glisse au-delà) |
| Vrai ou faux | 50 affirmations avec explication (séries de 12 tirées au hasard) |
| Nonogram | 5×5, 8×8, 10×10, grilles générées et toujours résolubles par déduction, sans deviner |
| Kakuro | 6×6, 8×8, 10×10, grilles générées à solution unique |

## Organisation des fichiers
```
index.html            coquille de l’app (barre du haut, accueil, écran de victoire)
css/style.css         tout le style (thème sombre, iPhone et iPad)
js/core.js            commun : sauvegarde, points, sons, navigation, icônes
js/games/*.js         un fichier par jeu, déclaré avec LQ.register({...})
js/levels.js          parcours : chapitres, niveaux, rangs, badges, carte et profil
js/daily.js           défi du jour : rotation, graine par date, série, calendrier
js/story.js           mode histoire : texte des épisodes, épreuves, progression
js/share.js           partage du défi, code de transfert entre appareils, statistiques du profil
js/app.js             menu d’accueil, mises à jour, mode hors ligne
sw.js                 service worker (cache hors ligne)
archive/              ancienne version en un seul fichier (v2.7)
```

### Ajouter un jeu
Créer `js/games/monjeu.js` qui appelle `LQ.register({ id, title, desc, hue, init, screen })`,
ajouter sa balise `<script>` dans `index.html` et son chemin dans la liste `ASSETS` de `sw.js`.
Une icône peut être ajoutée dans `ICONS` (js/core.js) sous le même `id`.

Pour qu’un jeu soit utilisable dans le parcours, sa fonction `init(cfg)` lit la configuration
du niveau, il fournit `levelInfo(cfg)` (description et objectifs) et il appelle
`winGame(titre, texte, points, étoiles)` avec 0 à 3 étoiles. Les niveaux se déclarent dans `LEVELS` (js/levels.js).

### Publier une nouvelle version
Changer le numéro dans `index.html` (badge `verBadge`) **et** `LOCAL_VERSION` dans `js/app.js`,
puis incrémenter `CACHE` dans `sw.js`. Les appareils installés se mettent à jour seuls au lancement suivant.
