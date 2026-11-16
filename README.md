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
Le **profil** affiche le rang (7 rangs selon les étoiles), les statistiques et 18 badges.

## Défi du jour
Chaque jour, un nouveau défi qui tourne entre les 10 jeux. La grille est tirée d’une graine qui dépend
de la date : tout le monde a le même défi le même jour. Première réussite du jour : +50 points.
L’écran du défi montre la série de jours, la meilleure série et un calendrier du mois.

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
