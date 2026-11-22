# LogiqueQuest : système visuel

Ce document fixe les règles de design de l'app pour que chaque nouveau jeu ou écran reste cohérent. Les valeurs vivent dans `css/style.css`, sous `:root`.

## Identité

- Thème sombre mais pas noir. Le fond ne doit pas être assombri : `--bg #333948` est la limite basse.
- Une seule audace : les titres en **EB Garamond** (héritage des imprimeurs vénitiens) et la feuille de lierre (hedera) devant les titres de section. Tout le reste reste sobre.
- Pas de petites capitales espacées pour les étiquettes : on utilise l'italique de Garamond ou une police système en casse normale.

## Couleurs

| Jeton | Valeur | Usage |
|---|---|---|
| `--bg` | `#333948` | Fond de page |
| `--surface` / `-2` / `-3` | `#3b4252` / `#444b5d` / `#4f5769` | Cartes, boutons secondaires, cases |
| `--text` | `#ece8df` | Texte principal |
| `--muted` | `#bcc0cc` | Texte secondaire (contraste ≥ 4,5:1 sur toutes les surfaces) |
| `--text-story`, `--text-story-soft` | `#e3dccf`, `#cfc6b8` | Texte de récit (mode Histoire) |
| `--accent` | `#d8a657` | Laiton : action principale, sélection, étoiles |
| `--accent-soft` | laiton à 14 % | Fond d'un élément actif |
| `--cool` | `#8fb3ff` | Suites de nombres, informations neutres |
| `--good` / `--bad` | `#67c79f` / `#e5707a` | Réussite / erreur, toujours accompagnés d'un texte ou d'une icône |

Chaque jeu a une teinte (`hue` dans `LQ.register`), utilisée seulement pour son icône et ses reflets, jamais pour du texte courant.

## Typographie

| Rôle | Police | Taille |
|---|---|---|
| Titres d'écran et de carte | `--font-display` (EB Garamond 600) | 23 à 33 px |
| Titres de section | Garamond italique 400 + fleuron | 22 px |
| Étiquettes (chapitre, époque, tome) | Garamond italique 400 | 15,5 px |
| Texte courant, boutons | `--font` (police système) | 14,5 à 17 px |
| Énoncés et récit | Garamond | 17 à 24 px |
| Chiffres de grille | police système, chiffres tabulaires | selon la grille |

Garamond dessine par défaut des chiffres elzéviriens (de hauteurs variables). `body` impose `font-variant-numeric: lining-nums` pour que les chiffres restent alignés.

## Formes

- Rayons : 999 px (pastilles, puces), 18 px (`--radius`, cartes), 12 px (`--radius-sm`, boutons, cases), 14 px (boutons principaux).
- Ombre : une seule, `--shadow`, réservée aux cartes.

## Composants

| Composant | Classe | Règle |
|---|---|---|
| Bouton principal | `.btn` | Une seule action principale par écran (Vérifier, Valider, Relever le défi) |
| Bouton secondaire | `.btn.ghost.small` | Annuler, Indice, Crayon, Nouvelle grille |
| Puce de choix | `.chip` (`.active`) | Taille ou difficulté ; bascule avec `aria-pressed` |
| Pastille de compteur | `.pill` dans `.stat-pills` | Compteurs (coups, temps, paires), jamais cliquable |
| Consigne | `.hint-line` | Une phrase sous le plateau |
| Message court | `toast()` | Dit ce qui se passe et quoi faire |

## Disposition d'un écran de jeu

1. Puces de difficulté (masquées en parcours, défi et histoire via `.lvl-hide`).
2. Compteurs (`.stat-pills`) et objectifs (`.goals`).
3. Plateau.
4. Pavé de saisie, s'il y en a un.
5. Actions : Crayon, Annuler, Indice, puis Vérifier et « Nouvelle grille ».
6. Consigne.

## Textes

- Nouvelle partie : « Nouvelle grille » pour les grilles, « Nouvel archipel » (Hashi), « Nouveau code » (Code secret), « Nouvelle partie » (Mémoire), « Mélanger » (Taquin).
- Un message d'erreur dit ce qui ne va pas et comment corriger : « Les cases en rouge sont fausses : corrigez-les puis vérifiez à nouveau ».
- Les énigmes ont une seule réponse possible. Les questions ne passent jamais seules à la suivante.

## Accessibilité

- Contraste du texte ≥ 4,5:1 (vérifié avec axe-core en v9.5).
- Zones tactiles d'au moins 44 px (les boutons-icônes ont une zone élargie invisible).
- Focus clavier visible (`:focus-visible`, contour laiton) et `prefers-reduced-motion` respecté.
- Les boutons-icônes ont un `aria-label`.
- Au clavier (iPad avec clavier) : les cases des grilles se parcourent avec Tab et se jouent avec Entrée ou Espace ; les chiffres 1 à 9 et Effacer passent par le pavé ; Échap ferme une fenêtre. Une nouvelle grille ajoute sa classe de case à `KB_CELLS` (js/core.js) et son libellé dans `kbLabel`.
- Le nom lu par VoiceOver commence par le contenu visible de la case (« 5, ligne 2, colonne 3 »).
- Une fenêtre (`.modal`) reçoit le focus à l'ouverture et le rend à la fermeture.

## Performances

- Les polices sont préchargées dans `index.html`.
- Tout ce que le JavaScript construit au chargement doit éviter de pousser le contenu déjà affiché (le pied de l'accueil attend `body.ready`).
- Repères mesurés en v9.5 (iPhone simulé, réseau lent, processeur ralenti) : affichage principal 2,1 s, décalage 0,04, réactivité 136 ms.
