# -*- coding: utf-8 -*-
"""Deux passes : (1) rend l'ebook et localise les ancres PGMARK sur les pages
physiques ; (2) réinjecte les vrais numéros de page dans le sommaire et les
pages-chapitres, puis écrit l'index final."""
import re, subprocess, os, sys, fitz

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
KEYS = ["00","01","02","03","04","05","06","07","08","09","10","CC"]
# Sous-chaînes uniques des titres de pages-chapitres (le divider précède son contenu,
# donc la 1re occurrence est bien la page-chapitre).
NEEDLE = {
 "00":"Pourquoi cet ebook", "01":"lexique indispensable", "02":"mindset du revendeur",
 "03":"la clé du succès", "04":"Budget de départ", "05":"setup du revendeur",
 "06":"annonce qui vend", "07":"KPIs et tableau", "08":"Stratégies de scaling",
 "09":"accès ultime", "10":"checklist de lancement", "CC":"À toi de jouer",
}

def build_body():
    ns = {}
    exec(open(os.path.join(HERE, "build.py"), encoding="utf-8").read(), ns)
    body = "".join(ns["PAGES"])
    body = re.sub(r"([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ])", r"\1’\2", body)  # apostrophes courbes FR
    return body

def wrap(body):
    return ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Cheapsappes — Le Guide de l\'Achat-Revente sur Vinted</title>'
            '<link rel="stylesheet" href="style.css"></head><body>'
            '<div class="pagebg"></div>' + body + '</body></html>')

def render(html_path, pdf_path):
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        "--no-pdf-header-footer", "--print-to-pdf-no-header",
        f"--print-to-pdf={pdf_path}", "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=10000", f"file://{html_path}"],
        cwd=HERE, check=True, stderr=subprocess.DEVNULL)

def locate(pdf_path):
    """Retourne {key: numéro de page physique 1-based} via les ancres PGMARK."""
    doc = fitz.open(pdf_path)
    pos = {}
    for i in range(doc.page_count):
        txt = doc[i].get_text()
        for k in KEYS:
            if f"PGMARK{k}" in txt and k not in pos:
                pos[k] = i + 1
    doc.close()
    return pos

def inject(body, pos):
    b = body
    for k, n in pos.items():
        b = b.replace(f"@@TOC:{k}@@", str(n)).replace(f"@@PG:{k}@@", str(n))
    return re.sub(r"@@(TOC|PG):[^@]+@@", "…", b)

# Itère render→localise→réinjecte jusqu'à ce que les numéros de page soient stables.
raw = build_body()
tmp = os.path.join(HERE, "_work.html")
pos = {}
for it in range(6):
    body = inject(raw, pos)
    open(tmp, "w", encoding="utf-8").write(wrap(body))
    render(tmp, os.path.join(HERE, "_work.pdf"))
    new = locate(os.path.join(HERE, "_work.pdf"))
    if new == pos and it > 0:
        break
    pos = new
missing = [k for k in KEYS if k not in pos]
if missing:
    print("WARN ancres manquantes:", missing)

body = inject(raw, pos)
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(wrap(body))
render(os.path.join(HERE, "index.html"), os.path.join(HERE, "ebook.pdf"))
doc = fitz.open(os.path.join(HERE, "ebook.pdf"))
print(f"OK — {doc.page_count} pages physiques (convergé en {it+1} passes). Ancres: {pos}")
