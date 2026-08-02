# Parcours d'anniversaire

Une page interactive en pixel art : un p'tit doudou brun grimpe un chemin qui va
de l'aube (en bas) jusqu'aux étoiles (en haut). Chaque étape ouvre un souvenir,
et l'arrivée débouche sur une lettre.

- `index.html` — la page complète. Un seul fichier, aucune dépendance :
  pas de police externe, pas d'image, pas de script tiers. Elle marche hors ligne,
  il suffit de l'ouvrir dans un navigateur.
- `qr-anniversaire.png` — le QR code qui pointe vers la version en ligne.

## Personnaliser

Tout ce qui est perso est regroupé tout en haut du `<script>`, dans le bloc
`CONFIG`. Il n'y a que du texte entre guillemets à changer :

| Champ | À quoi ça sert |
|---|---|
| `prenom` | Le petit nom affiché sur l'écran titre et à la fin |
| `age` | Un badge « ★ N ANS ★ ». Mettre `null` pour ne pas l'afficher |
| `etapes` | Les souvenirs du parcours. En ajouter ou en enlever : le chemin, la carte et le compteur s'adaptent tout seuls |
| `lettre` | La lettre finale. Chaque ligne du tableau = une page. Les textes trop longs se recoupent automatiquement |
| `signature` | La phrase qui reste affichée à la toute fin |

Les icônes possibles pour une étape : `coeur`, `etoile`, `note`, `lune`,
`cadeau`, `fleur`, `tasse`, `doudou`.

Les accents français sont gérés (é è ê à â î ô û ù ç). La police est dessinée
pixel par pixel dans le fichier, donc les caractères en dehors de cette liste
s'affichent comme une espace.

## Détails techniques

- Écran logique de 160×256 pixels, agrandi au pixel près (`image-rendering: pixelated`).
- Le décor fixe (herbe, chemin, arbres) est peint une seule fois dans un canvas
  hors écran, puis recopié par tranches — c'est ce qui garde le rendu fluide sur téléphone.
- Le dégradé du monde est tramé avec une matrice de Bayer 4×4, pour éviter les
  bandes horizontales.
- La musique est un chiptune généré à la volée via l'API Web Audio. Le bouton
  en haut à droite coupe le son (ou la touche `M`).
- `prefers-reduced-motion` est respecté : les animations d'ambiance s'arrêtent
  et les déplacements sont accélérés.
