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
| `photos` | Sur une étape : une ou deux clés du bloc `PHOTOS`. Une étape avec photos n'affiche pas d'icône, et sa carte s'agrandit |
| `lettre` | La lettre finale. Chaque ligne du tableau = une page. Les textes trop longs se recoupent automatiquement |
| `signature` | La phrase qui reste affichée à la toute fin |

Les icônes possibles pour une étape : `coeur`, `etoile`, `note`, `lune`,
`cadeau`, `fleur`, `tasse`, `doudou`.

Les accents français sont gérés (é è ê à â î ô û ù ç). La police est dessinée
pixel par pixel dans le fichier, donc les caractères en dehors de cette liste
s'affichent comme une espace.

## Les photos

Elles sont encodées en data URI dans le bloc `PHOTOS`, en bas de la config :
le fichier reste donc autonome, sans dossier d'images à trimballer.

Elles ne sont **pas** dessinées dans le canvas. Celui-ci ne fait que 160×256
pixels : une photo y serait réduite à 60 pixels de large puis réagrandie en
gros carrés. Elles sont donc superposées en HTML (`#photos`), positionnées en
pourcentages qui correspondent exactement à l'emplacement prévu dans la carte,
et affichées en pleine qualité dans un cadre dessiné, lui, au pixel.

Pour en ajouter une : recadrer au ratio 60/86 (portrait), réduire à 400 px de
large, exporter en JPEG qualité ~78, encoder en base64 et ajouter l'entrée
dans `PHOTOS`. Compter ~50 Ko par photo.

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
