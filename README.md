# LogiqueQuest

Jeu de logique, d’énigmes et de casse-tête pour adultes, pensé pour iPhone et iPad (fonctionne aussi sur ordinateur).
100 % local, aucune dépendance, jouable hors connexion une fois installé.

## Utilisation
Ouvrir `index.html` dans un navigateur, ou mettre le dossier en ligne (HTTPS) pour l’installer :
Safari → *Partager* → *« Sur l’écran d’accueil »*. L’app se lance alors en plein écran et garde les scores.

## Jeux libres (8)
| Jeu | Contenu |
|---|---|
| Énigmes | 24 problèmes de logique à réponse unique, avec indice et explication |
| Séquences | 15 suites logiques, 3 niveaux |
| Déduction | 6 tableaux croisés « qui fait quoi » (✘ / ✔), jusqu’à 6×6, croix automatiques en option |
| Sudoku | 4×4, 6×6, 9×9, grilles à solution unique générées à la volée |
| Taquin | 3×3, 4×4, 5×5, mélanges toujours solvables, chronomètre |
| Mémoire | 8, 10 ou 12 paires, étoiles selon le nombre d’essais |
| Mots mêlés | 8×8, 10×10, 12×12, mots cachés dans 8 directions (le mot est validé même si on glisse au-delà) |
| Vrai ou faux | 12 affirmations avec explication |

## Organisation des fichiers
```
index.html            coquille de l’app (barre du haut, accueil, écran de victoire)
css/style.css         tout le style (thème sombre, iPhone et iPad)
js/core.js            commun : sauvegarde, points, sons, navigation, icônes
js/games/*.js         un fichier par jeu, déclaré avec LQ.register({...})
js/app.js             menu d’accueil, mises à jour, mode hors ligne
sw.js                 service worker (cache hors ligne)
archive/              ancienne version en un seul fichier (v2.7)
```

### Ajouter un jeu
Créer `js/games/monjeu.js` qui appelle `LQ.register({ id, title, desc, hue, init, screen })`,
ajouter sa balise `<script>` dans `index.html` et son chemin dans la liste `ASSETS` de `sw.js`.
Une icône peut être ajoutée dans `ICONS` (js/core.js) sous le même `id`.

### Publier une nouvelle version
Changer le numéro dans `index.html` (badge `verBadge`) **et** `LOCAL_VERSION` dans `js/app.js`,
puis incrémenter `CACHE` dans `sw.js`. Les appareils installés se mettent à jour seuls au lancement suivant.
