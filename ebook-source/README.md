# Cheapsappes — Le Guide de l'Achat-Revente sur Vinted (source)

Générateur de l'ebook premium `Cheapsappes-Guide-Vinted-Premium-2026.pdf` (60 pages A4, bleu & blanc inspiré de Vinted).

## Fichiers
- `build.py` — contenu + composants (couverture, pages-chapitres, encadrés, tableaux, schémas, CTA…). Remplit une liste `PAGES`.
- `style.css` — design system print (A4, `@page` avec pied de page + numéro auto, pages pleine page pour la couverture et les intercalaires).
- `finalize.py` — assemble `index.html`, calcule les vrais numéros de page (deux passes, ancres invisibles) et rend le PDF via Chromium headless.
- `render.sh` — rendu HTML → PDF + contrôle du nombre de pages.
- `fonts/` — Bricolage Grotesque, Instrument Sans/Serif, IBM Plex Mono (embarquées).

## Régénérer
```bash
python3 finalize.py        # écrit index.html + ebook.pdf (Chromium headless)
```
Chromium : `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

## Notes de conception
- Chaque chapitre contient : citation, étude de cas, « Erreur à éviter », « Astuce Cheapsappes », exercice pratique, « À retenir ».
- CTA vers `cheapsappes.shop` répartis dans tout le guide.
- Numérotation (sommaire, intercalaires, pieds de page) calculée sur la mise en page réelle, donc toujours exacte.
