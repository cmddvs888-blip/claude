# -*- coding: utf-8 -*-
"""Génère l'ebook Cheapsappes (index.html) — Le Guide de l'Achat-Revente sur Vinted."""

PAGES = []
def add(html): PAGES.append(html)

SITE = "cheapsappes.shop"

def foot():
    return ('<div class="foot"><span>Cheapsappes · Le guide de l\'achat-revente sur Vinted</span>'
            '<span><b>cheapsappes.shop</b> — @@N@@</span></div>')

def page(inner, cls=""):
    add(f'<section class="page {cls}">{inner}</section>')

def _key(num):
    return "CC" if num == "★" else num
def divider(num, eyebrow, title, sub, chips, rt):
    chip_html = "".join(f'<span class="chip">{c}</span>' for c in chips)
    k = _key(num)
    inner = f'''<div class="wrap">
      <span class="pgmark">PGMARK{k}</span>
      <div class="num">{num}</div>
      <div class="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <div class="dsub">{sub}</div>
      <div class="chips">{chip_html}</div>
      <div class="rt">◷ Lecture&nbsp;: {rt}</div>
      <div class="bfoot"><span>Cheapsappes · Le guide de l'achat-revente sur Vinted</span><span>cheapsappes.shop — @@PG:{k}@@</span></div>
    </div>'''
    add(f'<section class="page divider">{inner}</section>')

def eyebrow(txt): return f'<div class="eyebrow">{txt}</div>'
def hsec(txt): return f'<h2 class="h-sec">{txt}</h2>'
def hsub(txt): return f'<h3 class="h-sub">{txt}</h3>'

def quote(txt, author):
    return (f'<div class="quote"><div class="mk">“</div>'
            f'<div class="qt">{txt}</div><div class="au">{author}</div></div>')

_BOX = {
 "case":("box--case","▣","Étude de cas"),
 "error":("box--error","✕","Erreur à éviter"),
 "tip":("box--tip","✦","Astuce Cheapsappes"),
 "ex":("box--ex","✎","Exercice pratique"),
}
def box(kind, body, label=None, tail=None):
    cls, ic, deflabel = _BOX[kind]
    label = label or deflabel
    pre = '<div class="pbreak"></div>' if tail else ''
    return f'{pre}<div class="box {cls}"><div class="bt"><span class="ic">{ic}</span> {label}</div>{body}</div>'

def mini_cta(text, label="Découvrir l’agent Cheapsappes"):
    return (f'<div class="mini-cta"><div class="mc-txt">{text}</div>'
            f'<div class="mc-btn">{label} <span class="ar">→</span></div></div>')

def recap(items, cta=None):
    lis = "".join(f'<li>{i}</li>' for i in items)
    tail = mini_cta(cta) if cta else ''
    return (f'<div class="box box--recap"><div class="bt"><span class="ic">★</span> À retenir</div>'
            f'<ul>{lis}</ul></div>{tail}')

def cta_band(title, text, btn="Découvrir l'agent Cheapsappes"):
    return (f'<div class="cta-band"><div class="ct2">{title}</div><p>{text}</p>'
            f'<span class="btn">{btn} <span class="ar">→</span></span>'
            f'<div class="urlline">→ rends-toi sur <b style="color:#fff">cheapsappes.shop</b> pour accéder à ton stock</div></div>')

def cards(items, cols=4, numbered=True):
    out = [f'<div class="grid g{cols}">']
    for i,(t,d) in enumerate(items,1):
        idx = f'<div class="idx">{i}</div>' if numbered else ''
        cls = "card card--num" if numbered else "card"
        out.append(f'<div class="{cls}">{idx}<div class="ct">{t}</div><p>{d}</p></div>')
    out.append('</div>')
    return "".join(out)

def flow(steps):
    parts=['<div class="flow">']
    for i,(ic,n,s) in enumerate(steps):
        if i>0: parts.append('<div class="ar">→</div>')
        parts.append(f'<div class="st"><div class="fi">{ic}</div><div class="fn">{n}</div><div class="fs">{s}</div></div>')
    parts.append('</div>')
    return "".join(parts)

def kpis(items):
    out=['<div class="kpis">']
    for n,l,teal in items:
        out.append(f'<div class="kpi {"tealk" if teal else ""}"><div class="kn">{n}</div><div class="kl">{l}</div></div>')
    out.append('</div>')
    return "".join(out)

def vs(title_a, list_a, title_b, list_b, label="VS"):
    la="".join(f'<li>{x}</li>' for x in list_a)
    lb="".join(f'<li>{x}</li>' for x in list_b)
    return (f'<div class="vswrap"><div class="divlabel">{label}</div><div class="vs">'
            f'<div class="col col--a"><div class="ch">✕ {title_a}</div><ul>{la}</ul></div>'
            f'<div class="col col--b"><div class="ch">✓ {title_b}</div><ul>{lb}</ul></div>'
            f'</div></div>')

def table(headers, rows):
    th="".join(f'<th>{h}</th>' for h in headers)
    tr=""
    for r in rows:
        tds="".join(f'<td>{c}</td>' for c in r)
        tr+=f'<tr>{tds}</tr>'
    return f'<table class="tbl"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'

# =====================================================================
# CONTENT
# =====================================================================

# ---- P1 COVER ----
page(('<div class="wrap">'
  '<div class="brand">CHEAPSAPPES<span class="dot">.</span></div>'
  '<div class="kicker">GUIDE PREMIUM · ÉDITION 2026</div>'
  '<div class="headblock">'
    '<span class="tag">◆ De zéro à tes premiers revenus</span>'
    '<h1>L\'Achat-<br>Revente<br>sur <em>Vinted</em>.</h1>'
  '</div>'
  '<div class="pcard"><div class="ph"></div>'
    '<div class="ttl">Sweat Nike vintage · M</div>'
    '<div class="meta">Très bon état · Envoi 24 h</div>'
    '<div class="price">24,00 €</div>'
    '<div class="stars">★★★★★</div>'
    '<div class="marge"><span>MARGE / VENTE</span><span>+15,50 €</span></div>'
  '</div>'
  '<div class="feats">'
    '<div class="feat"><div class="n">12</div><div class="t">chapitres</div><div class="s">Du lexique de base aux stratégies de scaling avancées.</div></div>'
    '<div class="feat"><div class="n">100%</div><div class="t">Chiffres réels</div><div class="s">Budgets, marges et projections réalistes.</div></div>'
    '<div class="feat"><div class="n">7+30</div><div class="t">Plans d\'action</div><div class="s">Checklist complète + plans sur 7 et 30 jours.</div></div>'
  '</div>'
  '<div class="base"><span>PAR L\'ÉQUIPE <b>CHEAPSAPPES</b></span><span>cheapsappes.shop</span></div>'
  '</div>'), "cover")

# ---- P2 BIENVENUE ----
page(
  eyebrow("Avant de commencer") + hsec("Bienvenue dans ton nouveau projet.") +
  '<p class="lead">Tu tiens entre les mains bien plus qu\'un ebook&nbsp;: un <strong>plan d\'exécution complet</strong>, pensé pour t\'emmener de «&nbsp;je ne sais pas par où commencer&nbsp;» à «&nbsp;je viens d\'encaisser ma première semaine rentable sur Vinted&nbsp;».</p>'
  '<p>Ce guide a été conçu avec une obsession&nbsp;: <strong>que tu passes à l\'action</strong>. Chaque chapitre se termine par un exercice concret, chaque concept est illustré par un cas réel, et chaque promesse est appuyée par des chiffres prudents — pas des captures d\'écran de gains truqués.</p>' +
  hsub("Comment lire ce guide") +
  cards([
    ("Lis dans l\'ordre","Les chapitres s\'empilent comme des briques&nbsp;: le lexique nourrit le mindset, le mindset nourrit la stratégie, la stratégie nourrit les résultats."),
    ("Fais chaque exercice","10 minutes par chapitre. C\'est toute la différence entre «&nbsp;j\'ai lu un ebook&nbsp;» et «&nbsp;j\'ai lancé un business&nbsp;»."),
    ("Reviens-y souvent","Les chapitres KPIs et Checklist sont conçus pour être relus chaque semaine pendant tes 3 premiers mois."),
  ], cols=3) +
  box("tip","<p>Garde un carnet (papier ou notes du téléphone) rien que pour ce guide. Tu y écriras tes réponses aux exercices&nbsp;: c\'est là que ton business prend forme, noir sur blanc.</p>") +
  '<p class="small mut"><strong>Note de transparence.</strong> Les simulations et projections de ce guide sont des exemples pédagogiques fondés sur des hypothèses réalistes. Elles ne constituent ni une promesse ni une garantie de revenus&nbsp;: tes résultats dépendront de ton exécution.</p>' +
  foot()
)

# ---- P3 SOMMAIRE ----
toc = [
 ("00","Introduction — Pourquoi cet ebook&nbsp;?","Mon histoire, l\'opportunité Vinted, et ce que tu vas apprendre.","5"),
 ("01","Le lexique indispensable de Vinted","Les 24 termes du métier, expliqués simplement avec des exemples.","8"),
 ("02","Le mindset du revendeur performant","Les croyances à adopter, les erreurs de débutant, les pièges qui font abandonner.","13"),
 ("03","Le fournisseur / l\'agent : la clé du succès","Pourquoi les meilleurs revendeurs ne sourcent jamais seuls.","17"),
 ("04","Budget de départ et projections","Simulations réalistes à 100&nbsp;€, 300&nbsp;€ et 500&nbsp;€ — marges et objectifs.","22"),
 ("05","Le setup du revendeur professionnel","Matériel minimum, applications utiles, organisation — sans surinvestir.","27"),
 ("06","Créer une annonce qui vend","Photos, descriptions, prix, timing, hashtags et exemples optimisés.","31"),
 ("07","KPIs et tableau de bord","Les chiffres à suivre chaque semaine pour piloter comme un pro.","36"),
 ("08","Stratégies de scaling","Passer de quelques ventes par mois à plusieurs ventes par jour.","40"),
 ("09","L\'accès ultime : l\'agent premium Cheapsappes","Présentation complète, bénéfices et résultats possibles.","44"),
 ("10","La checklist de lancement","Toutes les étapes à cocher + plans d\'action 7 jours et 30 jours.","49"),
 ("★","Conclusion — À toi de jouer","Le message final et ton passage à l\'action immédiat.","54"),
]
rows=""
for n,t,d,p in toc:
    rows+=(f'<div class="tocrow"><div class="tocn">{n}</div>'
           f'<div class="toct"><div class="tt">{t}</div><div class="td">{d}</div></div>'
           f'<div class="tocp">@@TOC:{_key(n)}@@</div></div>')
page(
  eyebrow("Sommaire") + hsec("Ton parcours, chapitre par chapitre.") +
  f'<div class="toc">{rows}</div>' +
  foot()
)

# ---- P4 REPERES VISUELS ----
page(
  eyebrow("Mode d\'emploi") + hsec("Les repères visuels de ce guide.") +
  '<p class="lead">Tout au long de ta lecture, tu croiseras ces cinq encadrés. Chacun a un rôle précis&nbsp;: repère-les, ils sont le squelette de la méthode.</p>' +
  '<div class="grid g2" style="margin-top:5mm">'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">▣ Étude de cas</div><p>Un parcours réel et chiffré, pour voir la méthode appliquée à une vraie personne.</p></div>'
  '<div class="card" style="border-left:3px solid #E24435"><div class="ct">✕ Erreur à éviter</div><p>Le piège classique du débutant sur ce chapitre — et comment le contourner.</p></div>'
  '<div class="card" style="border-left:3px solid #0FB5B0"><div class="ct">✦ Astuce Cheapsappes</div><p>Le raccourci d\'initié&nbsp;: ce que font les revendeurs qui vont vite.</p></div>'
  '<div class="card" style="border-left:3px solid #E39A2B"><div class="ct">✎ Exercice pratique</div><p>10 minutes, de quoi transformer la lecture en action concrète.</p></div>'
  '</div>' +
  '<div class="box box--recap" style="margin-top:5mm"><div class="bt"><span class="ic">★</span> À retenir</div>'
  '<p style="color:#e6eeff;margin:0">En fin de chapitre, l\'essentiel condensé en 3 à 4 points. Si tu ne devais relire qu\'une chose, ce serait ça.</p></div>' +
  cta_band("Envie de prendre de l\'avance&nbsp;?",
           "Découvre dès maintenant l\'agent Cheapsappes&nbsp;: le raccourci sourcing utilisé par notre communauté pour ne jamais tomber en rupture de stock.") +
  foot()
)

# =====================================================================
# INTRODUCTION (00)
# =====================================================================
divider("00","Introduction","Pourquoi cet ebook&nbsp;?",
  "Mon histoire, la raison pour laquelle l'achat-revente est l'une des meilleures portes d'entrée vers l'indépendance financière, et ce que tu vas apprendre dans les pages qui suivent.",
  ["Mon histoire","L'opportunité","Le programme"], "8 min")

# Intro content A
page(
  eyebrow("Introduction · Mon histoire") + hsec("D'un placard qui déborde à un business qui tourne.") +
  '<p class="lead">Il y a quelques années, j\'étais exactement là où tu es peut-être aujourd\'hui&nbsp;: le compte en banque dans le rouge dès le 15 du mois, et cette envie tenace de me construire un revenu à côté — sans y laisser mes nuits.</p>'
  '<p>Mon premier «&nbsp;flip&nbsp;», je ne l\'ai même pas fait exprès. J\'avais mis en vente un sweat que je ne portais plus, payé 15&nbsp;€ deux ans plus tôt. Il est parti en <strong>quarante minutes, à 22&nbsp;€</strong>. Ce jour-là, je n\'ai pas gagné 22&nbsp;€&nbsp;: j\'ai gagné une révélation. Des millions de personnes achètent du vêtement de seconde main, à toute heure, et la demande dépasse largement l\'offre de qualité.</p>'
  '<p>Alors j\'ai vidé mon placard, puis celui de ma famille. Premier mois&nbsp;: 180&nbsp;€. Puis le mur&nbsp;: <strong>plus rien à vendre.</strong> C\'est là que j\'ai compris la vraie règle du jeu — vendre sur Vinted est facile&nbsp;; <strong>trouver quoi vendre, à quel prix et en quantité régulière, c\'est ça le métier.</strong></p>' +
  quote("Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.","Winston Churchill") +
  box("case",
    '<div class="who">Le déclic — mes 3 premiers mois</div>'
    '<p>Mois&nbsp;1&nbsp;: je vide mes placards → 180&nbsp;€, puis rupture. Mois&nbsp;2&nbsp;: je teste friperies au kilo et brocantes à 6&nbsp;h → beaucoup d\'heures, peu de marge. Mois&nbsp;3&nbsp;: je fiabilise mon approvisionnement et je structure mes annonces → <strong>le business commence enfin à tourner tout seul.</strong> La leçon&nbsp;: ce n\'est pas la motivation qui manquait, c\'était le <strong>système</strong>.</p>') +
  foot()
)

# Intro content B — opportunité + ce que tu vas apprendre
page(
  eyebrow("Introduction · L'opportunité") + hsec("Pourquoi l'achat-revente est une vraie opportunité.") +
  '<div class="grid g2" style="margin-top:1mm">'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">🌍 Un marché immense</div><p>Des dizaines de millions d\'acheteurs actifs sur la seconde main, une demande qui explose et une offre de qualité toujours insuffisante.</p></div>'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">⚡ Zéro frais fixes</div><p>Pas de local, pas de stock imposé, pas d\'abonnement. Tu commences avec ce que tu as et tu réinvestis tes gains.</p></div>'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">💸 Cash-flow rapide</div><p>Un article publié le dimanche peut être vendu et payé dans la semaine. Le cycle argent → stock → argent est court.</p></div>'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">🎓 Compétences réelles</div><p>Sourcing, pricing, photo, négociation, gestion de stock&nbsp;: un vrai socle d\'entrepreneur, réutilisable partout.</p></div>'
  '</div>' +
  box("case",
    '<div class="who">Le premier mois de Lucas — 22 ans, étudiant à Lille · budget 120&nbsp;€</div>'
    '<p>Lucas vend d\'abord 8 pièces de son placard&nbsp;: <strong>96&nbsp;€ encaissés, zéro investissement.</strong> Il réinvestit tout dans un premier lot de 12 pièces sourcées (~9&nbsp;€/pièce). En trois semaines, il en vend 9 à 21&nbsp;€ de moyenne&nbsp;: <strong>189&nbsp;€ de CA, ~108&nbsp;€ de bénéfice net,</strong> et un stock qui continue de tourner. Son mot&nbsp;: «&nbsp;Le plus dur, c\'était la première annonce. Après, c\'est un jeu.&nbsp;»</p>') +
  box("error",
    '<p><strong>Lire sans agir.</strong> L\'erreur n°1 n\'est pas technique, elle est comportementale&nbsp;: accumuler du contenu sans jamais publier sa première annonce. Un guide lu à 100&nbsp;% et appliqué à 0&nbsp;% rapporte exactement 0&nbsp;€. Règle immédiate&nbsp;: chaque chapitre lu = son exercice fait dans la foulée.</p>') +
  foot()
)

# Intro content C — exercice + à retenir
page(
  eyebrow("Introduction · Le programme") + hsec("Ce que tu vas apprendre dans ce guide.") +
  '<p class="lead">Dix chapitres progressifs qui transforment une bonne intention en système qui tourne&nbsp;:</p>' +
  '<div class="grid g2">'
  '<div class="card" style="border-left:3px solid #0FB5B0"><div class="ct">Les fondations</div><p>Le vocabulaire du métier, le mindset qui fait durer, et le levier n°1 du secteur&nbsp;: un approvisionnement fiable.</p></div>'
  '<div class="card" style="border-left:3px solid #0FB5B0"><div class="ct">La mécanique</div><p>Budgets chiffrés, setup à moins de 50&nbsp;€, la recette complète d\'une annonce qui vend, et un tableau de bord de pilotage.</p></div>'
  '<div class="card" style="border-left:3px solid #0FB5B0"><div class="ct">L\'accélération</div><p>Les stratégies de scaling pour passer de quelques ventes à plusieurs par jour, sans y passer tes nuits.</p></div>'
  '<div class="card" style="border-left:3px solid #0FB5B0"><div class="ct">Le passage à l\'action</div><p>Une checklist complète et deux plans datés&nbsp;: 7 jours pour être en ligne, 30 jours pour un système autonome.</p></div>'
  '</div>' +
  hsub("Comment ce guide est construit") +
  flow([("🧱","Fondations","lexique + mindset"),("⚙️","Mécanique","sourcing + budget + annonces"),("🚀","Accélération","KPIs + scaling"),("✅","Passage à l'action","checklist + plans datés")]) +
  '<p>Chaque chapitre est une brique&nbsp;: pris isolément ils informent, empilés dans l\'ordre ils construisent un business qui tourne.</p>' +
  box("tip","<p>Bloque dès maintenant 3 créneaux de 45 minutes dans ton agenda cette semaine&nbsp;: un pour lire, un pour préparer ton setup, un pour publier tes premières annonces. Un projet qui n\'a pas de créneau n\'a pas de réalité.</p>", tail=True) +
  box("ex",
    '<p>Prends 5 minutes et écris — sur papier ou dans tes notes — ton «&nbsp;pourquoi&nbsp;»&nbsp;:</p>'
    '<ol>'
    '<li>La somme mensuelle qui changerait ton quotidien (sois précis&nbsp;: 150&nbsp;€&nbsp;? 400&nbsp;€&nbsp;? 1&nbsp;000&nbsp;€&nbsp;?)&nbsp;: <span class="fill"></span></li>'
    '<li>Ce que tu en ferais réellement (rembourser, épargner, voyager, réinvestir)&nbsp;: <span class="fill"></span></li>'
    '<li>La date de ta première vente. Indice&nbsp;: si c\'est dans plus de 14 jours, tu es trop prudent. <span class="fill"></span></li>'
    '</ol>'
    '<p style="margin-top:2mm">Garde cette note visible&nbsp;: c\'est ton carburant pour les 30 prochains jours.</p>', "Exercice pratique — ton «&nbsp;pourquoi&nbsp;»") +
  recap([
    "Vinted est la porte d'entrée la plus accessible vers un revenu complémentaire&nbsp;: zéro frais fixes, demande énorme, cash-flow rapide.",
    "Vendre est facile&nbsp;; <strong>sourcer</strong> est le vrai métier — et c'est le problème que ce guide va résoudre pour toi.",
    "La lecture ne paie pas, l'exécution paie&nbsp;: un exercice par chapitre, sans exception.",
  ], cta="Prêt à sauter l’étape la plus difficile du métier&nbsp;? L’agent Cheapsappes source à ta place.") +
  foot()
)

# =====================================================================
# CHAPITRE 1 — LEXIQUE
# =====================================================================
def lexc(term, defn, ex):
    return (f'<div class="lexc"><div class="lt">{term}</div>'
            f'<div class="ld">{defn}</div><div class="le">Ex.&nbsp;: {ex}</div></div>')
def lexgrid(items):
    return '<div class="lex">' + "".join(lexc(*it) for it in items) + '</div>'

divider("01","Chapitre 1","Le lexique indispensable de Vinted.",
  "On ne joue bien qu'à un jeu dont on connaît les règles — et le vocabulaire. Voici les 24 termes que tout revendeur doit maîtriser, expliqués simplement, avec des exemples concrets.",
  ["24 définitions","Exemples concrets","Plateforme + métier"], "10 min")

# Lex page 1
page(
  eyebrow("Chapitre 1 · Le vocabulaire du jeu") + hsec("Parle la langue du métier.") +
  '<p class="lead">Parcours ce lexique une première fois maintenant, puis reviens-y comme à un dictionnaire. À la fin du chapitre, un petit test vérifie que l\'essentiel est acquis.</p>' +
  quote("Les limites de mon langage signifient les limites de mon propre monde.","Ludwig Wittgenstein") +
  hsub("Les termes de la plateforme") +
  lexgrid([
    ("Dressing","Ta boutique sur Vinted&nbsp;: l'ensemble de tes annonces visibles sur ton profil.","«&nbsp;Un dressing de 40 annonces vend mécaniquement plus qu'un de 5.&nbsp;»"),
    ("Annonce (listing)","La fiche d'un article&nbsp;: photos, titre, description, prix, taille, état.","«&nbsp;Je publie 5 annonces chaque dimanche soir.&nbsp;»"),
    ("Vue","Nombre de fois où ton annonce a été affichée. Premier indicateur de visibilité.","«&nbsp;200 vues et 0 favori = problème de photo ou de prix.&nbsp;»"),
    ("Favori (like)","Un acheteur a enregistré ton article. Signal d'intérêt fort&nbsp;: un prospect chaud.","«&nbsp;10 favoris en 24&nbsp;h&nbsp;? Ton prix est peut-être trop bas.&nbsp;»"),
    ("Boost (mise en avant)","Option payante qui remonte ton annonce dans les résultats plusieurs jours.","«&nbsp;Je booste mes pièces à forte marge, jamais les petites.&nbsp;»"),
    ("Dressing en vitrine","Option payante qui expose tout ton dressing en tête de recherche.","«&nbsp;Utile lors d'un gros réassort pour créer un pic de vues.&nbsp;»"),
  ]) +
  foot()
)

# Lex page 2
page(
  eyebrow("Chapitre 1 · Plateforme (suite)") + hsub("Transactions & confiance") +
  lexgrid([
    ("Offre / proposition","Un acheteur (ou toi) propose un prix négocié via le bouton dédié.","«&nbsp;Je laisse toujours 10&nbsp;% de marge de négociation dans mon prix.&nbsp;»"),
    ("Remise sur lot (bundle)","Réduction automatique quand un acheteur regroupe plusieurs pièces.","«&nbsp;Mes remises de lot font grimper le panier moyen de 30&nbsp;%.&nbsp;»"),
    ("Protection acheteurs","Frais de service + garantie Vinted qui sécurise la transaction.","«&nbsp;Rassure l'acheteur&nbsp;: en cas de litige, il est couvert.&nbsp;»"),
    ("Évaluation (note)","La note laissée après une vente. Ta réputation, en étoiles.","«&nbsp;Envoi rapide + colis soigné = des 5 étoiles qui rassurent.&nbsp;»"),
    ("Porte-monnaie","Le solde de tes ventes sur Vinted, transférable vers ta banque.","«&nbsp;Je vire mon porte-monnaie une fois par semaine dans mon compte dédié.&nbsp;»"),
    ("Litige","Réclamation d'un acheteur (article non conforme ou non reçu). À traiter vite.","«&nbsp;Photos précises + description honnête = quasi zéro litige.&nbsp;»"),
    ("Prix d'appel","Un prix volontairement bas pour déclencher vues, favoris et premières ventes.","«&nbsp;Au lancement, -10&nbsp;% pour amorcer la pompe.&nbsp;»"),
    ("DAC7","Directive européenne&nbsp;: les plateformes déclarent les revenus des vendeurs actifs.","«&nbsp;Raison de plus pour être en règle dès le départ.&nbsp;»"),
  ]) +
  foot()
)

# Lex page 3
page(
  eyebrow("Chapitre 1 · Le métier de revendeur") + hsub("Les termes du business") +
  lexgrid([
    ("Flip","Acheter un article pour le revendre plus cher. Le cœur du jeu.","«&nbsp;Acheté 8&nbsp;€, revendu 24&nbsp;€&nbsp;: un flip à +16&nbsp;€.&nbsp;»"),
    ("Sourcing","L'art de trouver des articles à fort potentiel de revente, au bon prix.","«&nbsp;Friperie, destockage, agent&nbsp;: trois canaux de sourcing.&nbsp;»"),
    ("Fournisseur","Structure qui te vend du stock en quantité&nbsp;: grossiste, destockeur.","«&nbsp;Un bon fournisseur = prix stables et qualité constante.&nbsp;»"),
    ("Agent","Intermédiaire qui source, négocie, contrôle et expédie pour toi.","«&nbsp;Mon agent me trouve des sweats de marque à 30&nbsp;% du prix boutique.&nbsp;»"),
    ("Prix de revient","Tout ce que l'article t'a coûté&nbsp;: achat + livraison + consommables.","«&nbsp;7&nbsp;€ d'achat + 1,50&nbsp;€ de frais = 8,50&nbsp;€ de revient.&nbsp;»"),
    ("Marge nette","Prix de vente moins tous les frais. C'est elle qui compte vraiment.","«&nbsp;Vendu 25&nbsp;€, revient 9&nbsp;€&nbsp;: marge nette de 16&nbsp;€.&nbsp;»"),
    ("Rotation","La vitesse à laquelle ton stock se vend et se renouvelle.","«&nbsp;Une pièce qui ne tourne pas en 30 jours&nbsp;: on la déstocke.&nbsp;»"),
    ("Sell-through","Part de ton stock vendue sur une période. Le pouls de ton business.","«&nbsp;20 vendues sur 40 en ligne = 50&nbsp;% de sell-through.&nbsp;»"),
  ]) +
  foot()
)

# Lex page 4 — derniers termes + boîtes
page(
  eyebrow("Chapitre 1 · Métier (suite)") + hsub("Croissance & organisation") +
  lexgrid([
    ("Réassort","Le fait de recommander du stock pour ne jamais tomber en rupture.","«&nbsp;Je commande mon réassort quand il me reste 10 pièces.&nbsp;»"),
    ("Niche","La catégorie sur laquelle tu te spécialises&nbsp;: streetwear, enfant, marque.","«&nbsp;Ma niche&nbsp;: sweats de marque taille M-L. Je connais ses prix par cœur.&nbsp;»"),
  ]) +
  box("error",
    '<p><strong>Confondre marge brute et marge nette.</strong> Beaucoup de débutants se réjouissent d\'un «&nbsp;acheté 8&nbsp;€, vendu 24&nbsp;€&nbsp;» sans compter les frais d\'expédition, les consommables et le temps. On raisonne <strong>toujours en marge nette</strong>&nbsp;: c\'est le seul chiffre qui finit sur ton compte.</p>') +
  box("tip",
    '<p>Crée un mémo sur ton téléphone avec ces 24 termes. Quand tu liras un tuto ou échangeras dans la communauté, tu comprendras tout du premier coup — et tu paraîtras (à juste titre) déjà pro.</p>') +
  box("case",
    '<div class="who">Le réflexe pricing de Léa — 24 ans, Rennes</div>'
    '<p>Léa applique une règle tirée de ce lexique&nbsp;: toujours calculer la <strong>marge nette</strong>, jamais la brute. Sur une veste «&nbsp;achetée 12&nbsp;€, vendue 30&nbsp;€&nbsp;», elle déduit 1,50&nbsp;€ de frais et 0,80&nbsp;€ de consommables&nbsp;: marge nette réelle de 15,70&nbsp;€, pas 18&nbsp;€. Multiplié par 40 ventes/mois, ce réflexe lui évite de surestimer ses gains de plus de 90&nbsp;€. «&nbsp;Connaître les mots, c’est déjà éviter les pièges.&nbsp;»', tail=True) +
  box("ex",
    '<p>Sans regarder&nbsp;: écris la définition de ces 4 termes. Si tu bloques, relis la fiche.</p>'
    '<ol><li><strong>Sell-through</strong>&nbsp;: <span class="fill"></span></li>'
    '<li><strong>Prix de revient</strong>&nbsp;: <span class="fill"></span></li>'
    '<li><strong>Agent</strong>&nbsp;: <span class="fill"></span></li>'
    '<li><strong>Rotation</strong>&nbsp;: <span class="fill"></span></li></ol>', "Exercice pratique — le test des 4 mots") +
  recap([
    "Le vocabulaire n'est pas du jargon&nbsp;: c'est la carte du terrain sur lequel tu vas jouer.",
    "Deux familles&nbsp;: les termes de la <strong>plateforme</strong> (vues, favoris, boost…) et ceux du <strong>métier</strong> (sourcing, marge, rotation…).",
    "Le trio qui décide de ta rentabilité&nbsp;: <strong>prix de revient, marge nette, rotation.</strong>",
  ], cta="Passe de la théorie au stock réel&nbsp;: découvre l’agent Cheapsappes.") +
  foot()
)

# =====================================================================
# CHAPITRE 2 — MINDSET
# =====================================================================
divider("02","Chapitre 2","Le mindset du revendeur performant.",
  "Tu peux avoir la meilleure méthode du monde&nbsp;: sans le bon état d'esprit, tu abandonneras au premier obstacle. Voici les croyances qui font durer, et les pièges qui font arrêter.",
  ["Croyances à adopter","Erreurs de débutant","Pièges à éviter"], "9 min")

# Mindset p1 — croyances
page(
  eyebrow("Chapitre 2 · L'état d'esprit") + hsec("Ce business se gagne d'abord dans la tête.") +
  '<p class="lead">La différence entre celui qui encaisse 400&nbsp;€/mois dans six mois et celui qui aura abandonné n\'est ni le talent ni la chance&nbsp;: c\'est une poignée de <strong>croyances</strong>. Voici le basculement à opérer.</p>' +
  table(["Croyance de débutant 🙅","Croyance de pro ✅"],
    [["«&nbsp;Il faut un gros budget pour démarrer.&nbsp;»","«&nbsp;Je démarre avec mon placard et je réinvestis mes gains.&nbsp;»"],
     ["«&nbsp;Ça se vend tout seul.&nbsp;»","«&nbsp;La marge se fait à l'achat&nbsp;; la vente se travaille.&nbsp;»"],
     ["«&nbsp;J'attends d'être prêt / parfait.&nbsp;»","«&nbsp;Je publie imparfait aujourd'hui, j'améliore avec les données.&nbsp;»"],
     ["«&nbsp;Une pièce ne se vend pas&nbsp;? Je suis nul.&nbsp;»","«&nbsp;Une pièce ne tourne pas&nbsp;? Je change la photo ou le prix.&nbsp;»"],
     ["«&nbsp;C'est de l'argent facile.&nbsp;»","«&nbsp;C'est un vrai métier, avec des chiffres à piloter.&nbsp;»"]]) +
  quote("La qualité n'est jamais un accident&nbsp;; c'est toujours le résultat d'un effort intelligent.","John Ruskin") +
  foot()
)

# Mindset p2 — erreurs débutants + étude de cas
page(
  eyebrow("Chapitre 2 · Les erreurs classiques") + hsec("Les 4 erreurs qui coûtent le plus cher.") +
  cards([
    ("Vouloir tout vendre","Sans niche, tu ne connais aucun prix par cœur et tu sources au hasard. La spécialisation crée l'expertise — et la marge."),
    ("Sous-estimer la photo","La photo, c'est 80&nbsp;% de la décision d'achat. Une belle pièce mal photographiée reste invendue."),
    ("Fixer un prix à l'émotion","«&nbsp;Je l'aime bien donc ça vaut cher&nbsp;»&nbsp;: non. Le prix se fixe sur le marché, pas sur ton ressenti."),
    ("Négliger l'après-vente","Réponses lentes, colis bâclé&nbsp;: mauvaises notes, moins de visibilité. Le service EST le produit."),
  ], cols=2) +
  box("case",
    '<div class="who">Le tournant de Sarah — 25 ans, Toulouse</div>'
    '<p>Sarah vend «&nbsp;un peu de tout&nbsp;» pendant deux mois&nbsp;: 60&nbsp;€, beaucoup de découragement. Elle décide de se <strong>concentrer sur une seule niche</strong> (vestes en jean de marque) et d\'appliquer une règle&nbsp;: 5 photos soignées minimum par pièce. Résultat le mois suivant&nbsp;: <strong>230&nbsp;€ de ventes</strong>, des favoris qui grimpent, et surtout la sensation de <em>savoir ce qu\'elle fait</em>. «&nbsp;J\'ai arrêté de deviner, j\'ai commencé à piloter.&nbsp;»</p>') +
  box("error",
    '<p><strong>Comparer ses coulisses aux vitrines des autres.</strong> Tu vois des dressings à 2&nbsp;000 ventes et tu te sens minuscule. Souviens-toi&nbsp;: ils ont eux aussi publié une <em>première</em> annonce, un jour, avec zéro évaluation. Ton concurrent, ce n\'est pas eux — c\'est la version de toi qui n\'a pas encore commencé.</p>') +
  foot()
)

# Mindset p3 — pièges + astuce + exercice + recap
page(
  eyebrow("Chapitre 2 · Tenir dans la durée") + hsec("Les 3 pièges qui font abandonner.") +
  cards([
    ("Le mur du sourcing","Après le placard vidé, plus rien à vendre. C'est LE moment où 80&nbsp;% arrêtent. La solution&nbsp;: un approvisionnement fiable, préparé <em>avant</em> la rupture."),
    ("Le silence des débuts","Les 2 premières semaines sont lentes&nbsp;: peu de vues, peu de ventes. C'est normal — l'algorithme t'apprend. Tiens bon, la courbe est exponentielle, pas linéaire."),
    ("La dispersion","Trop d'outils, trop de conseils, trop de niches. La performance vient de la répétition d'un geste simple, pas de la nouveauté permanente."),
  ], cols=3) +
  hsub("Reconnais les signaux d'alerte") +
  table(["Ce que tu ressens","Ce que ça cache vraiment","Ta réaction de pro"],
    [["«&nbsp;Je n'ai plus rien à vendre.&nbsp;»","Le mur du sourcing","Sécuriser un réassort <em>avant</em> la rupture (ch.&nbsp;3)"],
     ["«&nbsp;Personne ne like mes annonces.&nbsp;»","La visibilité met du temps à démarrer","Tenir 2 semaines, optimiser photos et titres"],
     ["«&nbsp;Je teste 5 méthodes en même temps.&nbsp;»","La dispersion","Revenir à un geste simple, répété chaque semaine"]]) +
  box("tip",
    '<p>Signe un «&nbsp;contrat 90 jours&nbsp;» avec toi-même&nbsp;: quoi qu\'il arrive, tu publies et tu pilotes pendant 90 jours avant de juger. La plupart des abandons arrivent à la semaine 3, juste avant que ça décolle. Ne fais pas partie des 80&nbsp;%.</p>', tail=True) +
  box("ex",
    '<p>Complète ton contrat d\'engagement, à voix haute puis par écrit&nbsp;:</p>'
    '<ol><li>Je m\'engage à publier au moins <span class="fill"></span> annonces par semaine.</li>'
    '<li>Je ne juge pas mes résultats avant le <span class="fill"></span> (date à +90 jours).</li>'
    '<li>Face à un obstacle, ma règle sera&nbsp;: <span class="fill"></span></li></ol>', "Exercice pratique — ton contrat 90 jours") +
  recap([
    "La marge se fait à l'achat&nbsp;; le mindset se travaille chaque jour.",
    "Spécialise-toi, soigne tes photos, fixe tes prix sur le marché, chouchoute l'après-vente.",
    "Le mur du sourcing fait abandonner la majorité&nbsp;: anticipe-le <strong>avant</strong> qu'il n'arrive (chapitre suivant).",
    "90 jours d'exécution constante battent 900 jours d'hésitation.",
  ], cta="Le bon mindset mérite un stock qui tourne. Découvre l’agent Cheapsappes.") +
  foot()
)

# =====================================================================
# CHAPITRE 3 — L'AGENT
# =====================================================================
divider("03","Chapitre 3","Le fournisseur / l'agent&nbsp;: la clé du succès.",
  "Tu peux avoir le meilleur mindset et les plus belles annonces du monde&nbsp;: sans un approvisionnement fiable et rentable, ton business s'arrête net. Voici le levier que les meilleurs revendeurs ne partagent presque jamais.",
  ["Le rôle de l'agent","Temps gagné","Meilleurs produits"], "9 min")

# Agent p1 — 4 rôles + quote
page(
  eyebrow("Chapitre 3 · Le rôle de l'agent") + hsec("Qu'est-ce qu'un agent, concrètement&nbsp;?") +
  '<p class="lead">Un agent de sourcing, c\'est ton <strong>acheteur professionnel personnel</strong>. Là où un simple fournisseur vend ce qu\'il a en rayon, l\'agent travaille <em>pour toi</em> sur les 4 tâches les plus chronophages du métier&nbsp;:</p>' +
  cards([
    ("Il source","Il écume en permanence les circuits que tu n'as ni le temps ni les contacts d'atteindre&nbsp;: destockages de marques, fins de séries, lots pros."),
    ("Il négocie","Parce qu'il achète en volume pour toute sa clientèle, il obtient des prix qu'un particulier seul ne verra jamais."),
    ("Il contrôle","Tri, vérification de l'état et de l'authenticité, conformité des tailles — avant que la marchandise n'arrive chez toi."),
    ("Il expédie","Tu reçois un stock trié, prêt à photographier et à mettre en ligne. Zéro logistique de ton côté."),
  ], cols=4) +
  '<p style="margin-top:2mm">En clair&nbsp;: l\'agent transforme la partie la plus difficile, la plus longue et la plus risquée du métier en un <strong>simple passage de commande</strong>.</p>' +
  quote("Si tu veux aller vite, va seul. Si tu veux aller loin, va accompagné.","Proverbe africain") +
  box("tip",
    '<p>Même avec le meilleur agent, commence par une <strong>commande test</strong>&nbsp;: un petit lot pour valider la qualité, tes photos, ton positionnement prix et ta rotation. Une fois le cycle validé (acheté → publié → vendu → réinvesti), tu montes les volumes en confiance. C\'est exactement le parcours que propose l\'agent Cheapsappes, du starter pack au réassort.</p>') +
  foot()
)

# Agent p2 — 3 murs + VS
page(
  eyebrow("Chapitre 3 · Pourquoi c'est indispensable") + hsec("Les 3 murs du solo — et comment ils tombent.") +
  '<p class="lead">Sourcer soi-même se heurte vite à trois plafonds. L\'agent les fait tomber d\'un coup.</p>' +
  cards([
    ("⏱️ Le temps","Friperies et brocantes&nbsp;: 4 à 6&nbsp;h pour 5-10 pièces. Un loisir sympa, pas un système. L'agent te rend ces heures pour ce qui vend&nbsp;: annonces, photos, clients."),
    ("🔁 La régularité","Le vrai défi n'est pas de trouver une pièce, mais 30 par mois, tous les mois. La chine est une loterie&nbsp;; un business a besoin d'un flux."),
    ("🏷️ Le prix","Seul, tu paies au prix du particulier. En volume via un agent, tu accèdes à des tarifs pros — et la marge se fait à l'achat."),
  ], cols=3) +
  hsub("Solo vs. agent&nbsp;: le match en un coup d'œil") +
  vs("Sourcing en solo",
     ["4-6&nbsp;h par session pour quelques pièces","Qualité inégale, aléas de la chine","Prix particulier, marge écrasée","Ruptures fréquentes, revenus en dents de scie","Aucune scalabilité&nbsp;: ton temps est le plafond"],
     "Sourcing via agent",
     ["Une commande en 10 minutes depuis ton canapé","Qualité contrôlée et homogène","Prix négocié en volume, vraie marge","Réassort régulier, revenus prévisibles","Scalable&nbsp;: tu commandes plus sans travailler plus"]) +
  foot()
)

# Agent p3 — pourquoi les meilleurs + étude de cas + erreur + exercice + recap + CTA
page(
  eyebrow("Chapitre 3 · Le secret des gros dressings") + hsec("Pourquoi les meilleurs l'utilisent tous.") +
  '<p>Observe les gros dressings&nbsp;: 500, 1&nbsp;000, 3&nbsp;000 ventes. Crois-tu qu\'ils passent leurs week-ends en brocante&nbsp;? Impossible — <strong>le volume trahit la méthode</strong>. Tous ont industrialisé leur approvisionnement. C\'est le secret le moins partagé du milieu&nbsp;: un bon canal de sourcing est un avantage concurrentiel, et personne ne donne son avantage.</p>' +
  box("case",
    '<div class="who">L\'avant / après de Thomas — 28 ans, Lyon</div>'
    '<p><strong>Avant&nbsp;:</strong> 6&nbsp;h de chine chaque samedi, 8 pièces à ~11&nbsp;€, qualité inégale, ~150&nbsp;€ de bénéfice/mois. <strong>Après passage à un agent&nbsp;:</strong> commande de 30 pièces en 10 minutes, coût unitaire -40&nbsp;%, qualité homogène. Ses samedis libérés servent aux photos et à l\'optimisation. Troisième mois&nbsp;: <strong>420&nbsp;€ de bénéfice</strong>, pour moins de temps qu\'avant. «&nbsp;Je pensais économiser en sourçant moi-même. En réalité, je brûlais mon temps et ma marge.&nbsp;»</p>') +
  box("error",
    '<p><strong>Le «&nbsp;lot mystère&nbsp;» à 2&nbsp;€ la pièce.</strong> Les plateformes regorgent de lots «&nbsp;incroyables&nbsp;» vendus au kilo par des inconnus&nbsp;: photos volées, vêtements tachés, tailles mortes, contrefaçons. Le prix bas cache un coût réel énorme (invendables + temps perdu). Un vrai agent, c\'est l\'inverse&nbsp;: sélection, contrôle, traçabilité.</p>') +
  box("ex",
    '<p>Calcule ton <strong>vrai taux horaire</strong> de sourcing solo&nbsp;:</p>'
    '<ol><li>Heures passées (trajet + recherche + tri + lavage)&nbsp;: <span class="fill"></span> h</li>'
    '<li>Marge nette totale dégagée&nbsp;: <span class="fill"></span> €</li>'
    '<li>Taux horaire = marge ÷ heures = <span class="fill"></span> €/h</li></ol>'
    '<p style="margin-top:2mm">Sous le SMIC horaire&nbsp;? Tu viens de prouver, par tes chiffres, que déléguer le sourcing n\'est pas un luxe&nbsp;: c\'est un calcul.</p>', "Exercice pratique — ton vrai taux horaire", tail=True) +
  recap([
    "L'agent source, négocie, contrôle et expédie&nbsp;: il transforme le sourcing en simple commande.",
    "Les 3 murs du solo — temps, régularité, prix — plafonnent ton business&nbsp;; l'agent les fait tomber.",
    "Tous les gros vendeurs ont industrialisé leur approvisionnement&nbsp;: c'est la condition du volume.",
    "Commande test d'abord, volume ensuite&nbsp;: on valide le cycle avant de l'amplifier.",
  ]) +
  cta_band("Je découvre l'agent Cheapsappes",
           "L'accès sourcing pensé pour les revendeurs Vinted francophones&nbsp;: stock sélectionné, prix négociés, contrôle qualité. Du starter pack au réassort en volume.") +
  foot()
)

# =====================================================================
# CHAPITRE 4 — BUDGET & PROJECTIONS
# =====================================================================
divider("04","Chapitre 4","Budget de départ et projections.",
  "Combien faut-il pour commencer&nbsp;? Combien peux-tu espérer gagner, et en combien de temps&nbsp;? Voici les chiffres — réalistes, prudents, et surtout actionnables quel que soit ton budget.",
  ["3 budgets types","Simulations sur 6 mois","Objectif de progression"], "10 min")

# Budget p1 — 3 budgets + quote
page(
  eyebrow("Chapitre 4 · Par où commencer") + hsec("Trois budgets, une même méthode.") +
  '<p class="lead">Bonne nouvelle&nbsp;: le budget de départ n\'est <strong>pas</strong> le facteur décisif. Il change ta vitesse, pas ta destination. Voici trois points de départ réalistes.</p>' +
  table(["","🟢 Starter — 100&nbsp;€","🔵 Ambitieux — 300&nbsp;€","🟣 Accéléré — 500&nbsp;€"],
    [["Pièces sourcées","~10-12 pièces","~30-35 pièces","~55-60 pièces"],
     ["Prix d'achat moyen","~9&nbsp;€ / pièce","~9&nbsp;€ / pièce","~8,5&nbsp;€ / pièce"],
     ["Prix de vente visé","~22&nbsp;€ / pièce","~22&nbsp;€ / pièce","~23&nbsp;€ / pièce"],
     ["Marge nette / pièce","<span class='pos'>~11&nbsp;€</span>","<span class='pos'>~11&nbsp;€</span>","<span class='pos'>~12&nbsp;€</span>"],
     ["Potentiel mois 1*","~90-120&nbsp;€","~250-320&nbsp;€","~450-550&nbsp;€"]]) +
  '<p class="small mut">*Hypothèses prudentes&nbsp;: sell-through de 60&nbsp;% le premier mois, le reste tournant les semaines suivantes. Exemples pédagogiques, pas des garanties.</p>' +
  quote("Ce n'est pas le montant que tu investis qui compte, c'est le nombre de fois que tu le fais tourner.","Adage du revendeur") +
  foot()
)

# Budget p2 — projection 6 mois + réinvestissement
page(
  eyebrow("Chapitre 4 · La magie du réinvestissement") + hsec("Ce que le starter à 100&nbsp;€ peut devenir.") +
  '<p class="lead">Le secret n\'est pas la mise de départ, c\'est <strong>de tout réinvestir</strong> pendant les premiers mois. Voici la trajectoire d\'un capital de 100&nbsp;€ réinvesti (scénario prudent)&nbsp;:</p>' +
  table(["Mois","Stock en ligne","Ventes","Marge nette","Capital réinvesti"],
    [["M1","~12 pièces","7","<span class='num'>~80&nbsp;€</span>","100&nbsp;€ → 180&nbsp;€"],
     ["M2","~20 pièces","14","<span class='num'>~150&nbsp;€</span>","tout réinvesti"],
     ["M3","~32 pièces","22","<span class='num'>~240&nbsp;€</span>","70&nbsp;% réinvesti"],
     ["M4","~45 pièces","30","<span class='num'>~330&nbsp;€</span>","70&nbsp;% réinvesti"],
     ["M5","~60 pièces","40","<span class='num'>~440&nbsp;€</span>","70&nbsp;% réinvesti"],
     ["M6","~75 pièces","50","<span class='num pos'>~550&nbsp;€</span>","tu te verses un revenu"]]) +
  flow([("💶","Capital","tu investis"),("👕","Stock","tu sources"),("📸","Annonces","tu publies"),("✅","Ventes","tu encaisses"),("🔁","Réassort","tu amplifies")]) +
  box("tip",
    '<p>Applique la règle <strong>70/30</strong> dès le mois 3&nbsp;: 70&nbsp;% de ta marge repart en stock (ta croissance), 30&nbsp;% pour toi (ta récompense). Tu grandis <em>et</em> tu profites — c\'est ce qui rend le jeu tenable sur la durée.</p>') +
  foot()
)

# Budget p3 — objectif progression + étude de cas + erreur + exercice + recap
page(
  eyebrow("Chapitre 4 · Ton objectif de progression") + hsec("Vise des paliers, pas la lune.") +
  '<p class="lead">Un objectif flou ne se pilote pas. Voici une échelle de progression saine, palier par palier&nbsp;:</p>' +
  table(["Palier","Rythme","Marge nette / mois","Ce que ça change"],
    [["🐣 Découverte","3-5 ventes / semaine","150-300&nbsp;€","Tu prouves que la méthode marche."],
     ["🚀 Confirmation","1-2 ventes / jour","400-700&nbsp;€","Un vrai complément de revenu."],
     ["🔥 Accélération","3-5 ventes / jour","900-1&nbsp;500&nbsp;€","Un second salaire, un système qui tourne."]]) +
  box("case",
    '<div class="who">Le calcul de Naïma — 24 ans, Bruxelles · budget 100&nbsp;€</div>'
    '<p>Naïma refuse de «&nbsp;deviner&nbsp;». Elle fixe un objectif simple&nbsp;: <strong>10 ventes/mois au palier 1</strong>. Elle réinvestit tout pendant 3 mois. M1&nbsp;: 7 ventes. M2&nbsp;: 15. M3&nbsp;: 24 ventes, ~250&nbsp;€ de marge, et un stock qui ne désemplit plus grâce à un réassort régulier. «&nbsp;Je n\'ai jamais eu de gros mois miracle. J\'ai eu des petits mois réguliers qui se sont empilés.&nbsp;»</p>') +
  box("error",
    '<p><strong>Griller son capital en «&nbsp;coups de cœur&nbsp;».</strong> Le débutant achète des pièces qu\'il aime, pas des pièces qui <em>tournent</em>. Résultat&nbsp;: du stock immobilisé et zéro cash pour réassortir. Achète pour le marché, pas pour ta garde-robe.</p>', tail=True) +
  box("ex",
    '<p>Pose tes chiffres de départ&nbsp;:</p>'
    '<ol><li>Mon budget de lancement&nbsp;: <span class="fill"></span> €</li>'
    '<li>Mon objectif de marge nette au 3ᵉ mois&nbsp;: <span class="fill"></span> €</li>'
    '<li>Nombre de ventes/semaine que cela suppose&nbsp;: <span class="fill"></span></li></ol>', "Exercice pratique — ta feuille de route chiffrée") +
  recap([
    "Le budget change ta vitesse, pas ta destination&nbsp;: on peut démarrer à 100&nbsp;€.",
    "Le moteur, c'est le <strong>réinvestissement</strong>&nbsp;: fais tourner ton capital, applique le 70/30.",
    "Vise des paliers concrets et mesurables plutôt qu'un rêve flou.",
    "Achète ce qui tourne, pas ce que tu aimes.",
  ], cta="Fais tourner ton capital plus vite grâce à un réassort régulier.") +
  foot()
)

# =====================================================================
# CHAPITRE 5 — SETUP
# =====================================================================
divider("05","Chapitre 5","Le setup du revendeur professionnel.",
  "Pas besoin d'un studio ni de matériel coûteux. Voici l'équipement minimum, les applications utiles et l'organisation qui te feront gagner des heures — le tout pour moins de 50&nbsp;€.",
  ["Matériel &lt; 50&nbsp;€","Applications utiles","Organisation"], "8 min")

# Setup p1 — matériel + quote
page(
  eyebrow("Chapitre 5 · L'équipement") + hsec("Ton studio tient sur une table.") +
  '<p class="lead">La règle d\'or&nbsp;: <strong>ne surinvestis jamais avant d\'avoir vendu.</strong> Voici le kit complet du débutant sérieux, sans superflu.</p>' +
  table(["Élément","À quoi ça sert","Budget"],
    [["Smartphone (le tien)","Photos + gestion des annonces. Aucun appareil pro nécessaire.","<span class='num'>0&nbsp;€</span>"],
     ["Fond neutre (drap / mur blanc)","Des photos propres qui font ressortir la pièce.","<span class='num'>0-8&nbsp;€</span>"],
     ["Défroisseur / fer","Une pièce défroissée se vend jusqu'à 30&nbsp;% plus cher.","<span class='num'>15-25&nbsp;€</span>"],
     ["Cintres + porte / mannequin souple","Présenter les pièces «&nbsp;portées&nbsp;», bien plus vendeur.","<span class='num'>5-10&nbsp;€</span>"],
     ["Enveloppes & pochettes d'envoi","Expédier proprement, protéger, soigner l'unboxing.","<span class='num'>8-12&nbsp;€</span>"],
     ["3 bacs de rangement","Trier&nbsp;: à publier / en ligne / vendu à expédier.","<span class='num'>0-10&nbsp;€</span>"]]) +
  '<p><strong>Total&nbsp;: 30 à 50&nbsp;€</strong>, une seule fois. Tout le reste, c\'est de la méthode.</p>' +
  quote("Donnez-moi six heures pour abattre un arbre et j'en passerai quatre à aiguiser ma hache.","Abraham Lincoln") +
  foot()
)

# Setup p2 — apps + organisation + boxes
page(
  eyebrow("Chapitre 5 · Outils & organisation") + hsec("Travaille par lots, pas au coup par coup.") +
  '<div class="grid g2" style="margin-top:1mm">'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">📸 Appli photo</div><p>Un outil de retouche simple (luminosité, recadrage) — pas de filtres trompeurs. La photo doit être fidèle.</p></div>'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">📊 Tableur</div><p>Ton tableau de bord&nbsp;: stock, coûts, ventes, marges. Deux onglets suffisent (voir chapitre 7).</p></div>'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">📝 Notes / modèles</div><p>Tes descriptions «&nbsp;à trous&nbsp;» et réponses types, pour publier une annonce en 4 minutes.</p></div>'
  '<div class="card" style="border-left:3px solid #1B63F0"><div class="ct">🏦 Sous-compte bancaire</div><p>Sépare l\'argent du business de ton argent perso. Clarté comptable et mentale.</p></div>'
  '</div>' +
  hsub("La chaîne de production, en 4 gestes") +
  flow([("🧺","Trier","3 bacs"),("💨","Défroisser","par lots"),("📷","Photographier","5 photos/pièce"),("⬆️","Publier","au créneau d'or")]) +
  box("case",
    '<div class="who">Le déclic organisation de Kevin — 26 ans, Nantes</div>'
    '<p>Kevin photographiait une pièce, la publiait, en prenait une autre… 20 minutes par annonce. En passant au <strong>travail par lots</strong> (défroisser 15 pièces, puis les shooter à la chaîne, puis tout publier le dimanche), il est descendu à <strong>4 minutes par annonce</strong>. Même temps de travail, 3&nbsp;fois plus d\'annonces en ligne.</p>') +
  box("error",
    '<p><strong>Surinvestir avant la première vente.</strong> Ring light, imprimante d’étiquettes, logiciels payants… s’équiper «&nbsp;comme un pro&nbsp;» avant d’avoir vendu une seule pièce transforme un business rentable en passe-temps coûteux. Ton smartphone et la lumière du jour suffisent pour tes 50 premières ventes.</p>') +
  box("tip",
    '<p>Monte une <strong>station de production permanente</strong>&nbsp;: un coin fixe avec ton fond, ta lumière et tes 3 bacs, opérationnel en 30 secondes. Le frein n°1 à la publication, c’est le temps d’installation&nbsp;; en le supprimant, tu publies bien plus souvent — exactement comme la communauté Cheapsappes qui reçoit un stock déjà trié, prêt à photographier.</p>', tail=True) +
  box("ex",
    '<p>Prépare ton poste en 3 décisions&nbsp;: où sera ta <strong>station photo</strong> (<span class="fill"></span>), quand sera ton <strong>créneau publication</strong> hebdo (<span class="fill"></span>), et quel <strong>jour</strong> tu expédies (<span class="fill"></span>).</p>', "Exercice pratique — installe ton poste") +
  recap([
    "30 à 50&nbsp;€ suffisent&nbsp;: ne surinvestis jamais avant d'avoir vendu.",
    "Le vrai gain de temps vient du <strong>travail par lots</strong>, pas d'outils coûteux.",
    "Sépare l'argent du business dès le premier euro.",
  ], cta="Ton setup est prêt&nbsp;? Il ne te manque que le stock. Accède à l’agent.") +
  foot()
)

# =====================================================================
# CHAPITRE 6 — ANNONCE QUI VEND
# =====================================================================
divider("06","Chapitre 6","Créer une annonce qui vend.",
  "Une même pièce peut dormir six mois ou partir en 48&nbsp;heures. La différence&nbsp;? L'annonce. Voici la recette complète&nbsp;: photos, titre, description, prix, timing et hashtags.",
  ["Photos & titre","Prix & timing","Exemples avant / après"], "11 min")

# Annonce p1 — 5 leviers + quote + astuce photo
page(
  eyebrow("Chapitre 6 · L'anatomie d'une annonce") + hsec("Les 5 leviers d'une annonce qui vend.") +
  '<p class="lead">Une annonce performante n\'a rien de magique&nbsp;: c\'est l\'addition de cinq leviers, chacun optimisé. Rate-en un, et tu perds des ventes.</p>' +
  cards([
    ("La photo","80&nbsp;% de la décision. Lumière du jour, fond neutre, pièce défroissée, 5 angles minimum + étiquette et défauts éventuels."),
    ("Le titre","Marque + type + taille + mot-clé recherché. «&nbsp;Sweat Nike vintage gris — M&nbsp;» bat «&nbsp;joli pull&nbsp;»."),
    ("La description","Rassure et projette&nbsp;: état, mesures, matière, argument. Une description honnête tue les litiges."),
    ("Le prix","Positionné au marché, avec 10&nbsp;% de marge de négociation intégrée. Ni bradé, ni délirant."),
    ("Le timing","Publier quand les acheteurs sont là&nbsp;: le dimanche soir est le pic d'audience de la semaine."),
  ], cols=5) +
  quote("Les gens n'achètent pas ce que tu fais, ils achètent la raison pour laquelle tu le fais… et la confiance que tu inspires.","Adapté de Simon Sinek") +
  box("tip",
    '<p>La <strong>première photo</strong> est ta vitrine dans le flux&nbsp;: cadrage serré, lumière naturelle, pièce nette. Les 4 suivantes rassurent&nbsp;; la première, elle, <em>vend le clic</em>.</p>') +
  foot()
)

# Annonce p2 — description 4 blocs + prix/timing + hashtags
page(
  eyebrow("Chapitre 6 · Décrire, prix & timing") + hsec("La description en 4 blocs.") +
  cards([
    ("1 · L'accroche","Une phrase qui projette&nbsp;: «&nbsp;La veste en jean parfaite pour la mi-saison.&nbsp;»"),
    ("2 · Les faits","Marque, taille, matière, mesures (épaules, poitrine, longueur). Précis = zéro litige."),
    ("3 · L'état","Honnête et rassurant&nbsp;: «&nbsp;Très bon état, porté 2&nbsp;fois, aucun défaut.&nbsp;»"),
    ("4 · L'appel à l'action","«&nbsp;Envoi soigné sous 24&nbsp;h · Bundle possible · N'hésite pas à faire une offre.&nbsp;»"),
  ], cols=4) +
  hsub("Le prix dans le temps&nbsp;: quand monter, quand baisser") +
  table(["Situation observée","Ce que ça signifie","Ton action"],
    [["Beaucoup de vues, peu de favoris","Photo/titre ok, prix trop haut","Baisse de 5-10&nbsp;% ou améliore la 1ʳᵉ photo"],
     ["Beaucoup de favoris, pas d'achat","Prix presque bon, hésitation","Envoie une offre privée aux favoris (-10&nbsp;%)"],
     ["Peu de vues après 72&nbsp;h","Problème de visibilité","Réédite l'annonce / envisage un boost ciblé"],
     ["Vente en < 24&nbsp;h","Prix (peut-être) trop bas","Monte légèrement le prix des pièces similaires"]]) +
  hsub("Hashtags &amp; mots-clés") +
  '<p>Pense comme l\'acheteur qui <em>tape</em> sa recherche&nbsp;: <span class="pill">#nike</span> <span class="pill">#vintage</span> <span class="pill">#sweat</span> <span class="pill">#streetwear</span> <span class="pill">#tailleM</span>. Marque + style + type + taille. Pas de hashtags fourre-tout&nbsp;: ils diluent ta pertinence.</p>' +
  foot()
)

# Annonce p3 — avant/après + étude de cas + erreur + exercice + recap
page(
  eyebrow("Chapitre 6 · Avant / après") + hsec("La même pièce, deux destins.") +
  vs("Annonce qui dort",
     ["Photo sombre, pièce froissée sur le lit","Titre&nbsp;: «&nbsp;pull sympa&nbsp;»","Description&nbsp;: «&nbsp;bon état&nbsp;» (3 mots)","Prix rond posé au hasard&nbsp;: 25&nbsp;€","Publiée un mardi 14&nbsp;h"],
     "Annonce qui vend",
     ["5 photos lumineuses, pièce défroissée sur cintre","Titre&nbsp;: «&nbsp;Sweat Nike vintage gris — M&nbsp;»","Description en 4 blocs, mesures incluses","Prix étudié&nbsp;: 23,90&nbsp;€ (marge négo intégrée)","Publiée dimanche 19&nbsp;h + hashtags ciblés"]) +
  box("case",
    '<div class="who">Le relooking d\'annonces d\'Inès — 23 ans, Marseille</div>'
    '<p>Inès avait 15 annonces «&nbsp;mortes&nbsp;» depuis des semaines. Un dimanche, elle refait <strong>seulement les photos et les titres</strong> — sans toucher aux prix. Dans les 5 jours&nbsp;: <strong>6 ventes</strong>. Même stock, même prix, autre présentation. «&nbsp;Je croyais que mes pièces ne valaient rien. En fait, mes annonces ne les vendaient pas.&nbsp;»</p>') +
  box("error",
    '<p><strong>Mentir sur l\'état pour vendre plus vite.</strong> Un petit défaut caché = un litige, un remboursement, une mauvaise note, et un algorithme qui te punit. L\'honnêteté n\'est pas qu\'une valeur&nbsp;: c\'est la stratégie la plus rentable à long terme.</p>', tail=True) +
  box("ex",
    '<p>Choisis une pièce et rédige son annonce complète&nbsp;: titre (<span class="fill"></span>), les 4 blocs de description, et le prix avec 10&nbsp;% de marge négo. Chronomètre-toi&nbsp;: vise moins de 5 minutes.</p>', "Exercice pratique — ta première annonce optimisée") +
  recap([
    "Cinq leviers&nbsp;: photo, titre, description, prix, timing. Chacun compte.",
    "La 1ʳᵉ photo vend le clic&nbsp;; la description honnête tue les litiges.",
    "Le prix est vivant&nbsp;: lis les signaux (vues/favoris) et ajuste.",
    "Publie au créneau d'or&nbsp;: dimanche soir.",
  ], cta="De belles annonces méritent de belles pièces&nbsp;: source-les via l’agent.") +
  foot()
)

# =====================================================================
# CHAPITRE 7 — KPIs
# =====================================================================
divider("07","Chapitre 7","KPIs et tableau de bord.",
  "Ce qui ne se mesure pas ne s’améliore pas. Voici les quelques chiffres qui suffisent à piloter ton business comme un pro — et le modèle de tableau de bord à recopier.",
  ["Les chiffres clés","Mesurer sa progression","Modèle de suivi"], "8 min")

# KPI p1 — les chiffres + quote
page(
  eyebrow("Chapitre 7 · Piloter par les chiffres") + hsec("Cinq indicateurs, zéro au hasard.") +
  '<p class="lead">Pas besoin d’un tableau de bord d’ingénieur. Cinq KPIs suffisent à savoir, chaque semaine, si ton business avance — et où appuyer.</p>' +
  kpis([("€","Marge nette / semaine",False),("%","Sell-through",True),("j","Délai de vente",False),("★","Note moyenne",True)]) +
  table(["KPI","Ce qu’il mesure","Cible saine"],
    [["Marge nette hebdo","L’argent réellement gagné après tous les frais","En hausse semaine après semaine"],
     ["Sell-through","Part du stock vendue sur la période","≥ 40-50&nbsp;% / mois"],
     ["Délai moyen de vente","Vitesse de rotation de ton stock","&lt; 21 jours par pièce"],
     ["Panier moyen","Recette moyenne par transaction (bundles inclus)","En hausse grâce aux lots"],
     ["Note moyenne","Ta réputation, moteur de visibilité","≥ 4,8 / 5"]]) +
  quote("Ce qui se mesure s’améliore. Ce qui se mesure et se rapporte s’améliore de façon exponentielle.","Pearson / Karl Pearson") +
  foot()
)

# KPI p2 — modèle tableau de bord + boxes
page(
  eyebrow("Chapitre 7 · Ton tableau de bord") + hsec("Le modèle à recopier ce soir.") +
  '<p class="lead">Deux onglets dans un simple tableur. Onglet 1&nbsp;: ton stock, pièce par pièce. Onglet 2&nbsp;: ton bilan hebdo.</p>' +
  hsub("Onglet 1 — Stock (une ligne par pièce)") +
  table(["Pièce","Achat","Frais","Prix vente","Statut","Marge nette"],
    [["Sweat Nike M","9,00&nbsp;€","1,50&nbsp;€","24,00&nbsp;€","Vendu","<span class='pos'>+13,50&nbsp;€</span>"],
     ["Veste jean L","11,00&nbsp;€","—","En ligne","En ligne","<span class='num'>à venir</span>"],
     ["Polo Lacoste M","8,00&nbsp;€","1,50&nbsp;€","19,00&nbsp;€","Vendu","<span class='pos'>+9,50&nbsp;€</span>"]]) +
  hsub("Onglet 2 — Bilan de la semaine") +
  table(["Semaine","Ventes","CA","Marge nette","Sell-through"],
    [["S-1","5","104&nbsp;€","<span class='num'>58&nbsp;€</span>","42&nbsp;%"],
     ["Cette semaine","8","171&nbsp;€","<span class='num pos'>96&nbsp;€</span>","51&nbsp;%"]]) +
  box("case",
    '<div class="who">Le pilotage de Rayan — 27 ans, Strasbourg</div>'
    '<p>Rayan tenait tout «&nbsp;de tête&nbsp;». En montant un tableau de bord, il découvre que <strong>3 pièces immobilisaient 40&nbsp;% de son capital</strong> depuis 2 mois. Il les déstocke, réinvestit dans des références qui tournent, et sa marge mensuelle bondit de 210 à 340&nbsp;€ — sans travailler plus. «&nbsp;Les chiffres m’ont montré ce que mon intuition me cachait.&nbsp;»') +
  box("error",
    '<p><strong>Piloter au feeling.</strong> «&nbsp;J’ai l’impression que ça marche&nbsp;» n’est pas un KPI. Sans chiffres, tu ignores quelles pièces immobilisent ton cash et quelles photos sous-performent — et tu réinvestis à l’aveugle. Cinq minutes de tableau de bord par semaine valent mieux qu’une heure d’intuition.</p>') +
  box("tip",
    '<p>Chaque dimanche, ne regarde qu’UN chiffre pour décider&nbsp;: le <strong>sell-through</strong>. S’il monte, réassortis&nbsp;; s’il stagne, retravaille photos et prix avant d’acheter davantage. Un canal de réassort fiable (comme l’agent Cheapsappes) te laisse agir dès que le chiffre le dit, sans attendre ta prochaine chine.</p>', tail=True) +
  box("ex",
    '<p>Crée ton tableau ce soir (15 min). Renseigne tes 3 KPIs de départ&nbsp;: marge nette de la semaine (<span class="fill"></span>), sell-through (<span class="fill"></span>), délai moyen de vente (<span class="fill"></span>).</p>', "Exercice pratique — monte ton tableau de bord") +
  recap([
    "Cinq KPIs suffisent&nbsp;: marge nette, sell-through, délai de vente, panier moyen, note.",
    "Deux onglets&nbsp;: le stock pièce par pièce, le bilan hebdomadaire.",
    "Les chiffres révèlent le capital <em>mort</em>&nbsp;: déstocke, réinvestis dans ce qui tourne.",
  ], cta="Des pièces qui tournent = des KPIs qui montent. Découvre l’agent.") +
  foot()
)

# =====================================================================
# CHAPITRE 8 — SCALING
# =====================================================================
divider("08","Chapitre 8","Stratégies de scaling.",
  "Passer de quelques ventes par mois à plusieurs par jour ne demande pas de travailler plus dur, mais de travailler en système. Voici comment amplifier sans t’épuiser.",
  ["Volume & organisation","Réinvestissement","Automatisation"], "9 min")

# Scaling p1 — leviers + semaine type + quote
page(
  eyebrow("Chapitre 8 · Changer d’échelle") + hsec("Scaler, c’est répéter mieux — pas courir plus.") +
  '<p class="lead">Le débutant ajoute des heures&nbsp;; le pro ajoute du <strong>système</strong>. Quatre leviers font toute la différence entre stagner et décoller.</p>' +
  cards([
    ("Le volume","Plus d’annonces en ligne = plus de vues = plus de ventes. Le stock est ton moteur&nbsp;: ne tombe jamais en rupture."),
    ("L’organisation","Travaille par lots et par créneaux fixes. Une routine hebdo bat dix élans de motivation."),
    ("Le réinvestissement","La règle 70/30 transforme chaque vente en carburant de croissance."),
    ("L’automatisation","Modèles, réponses types, sourcing délégué&nbsp;: tu élimines les tâches répétitives."),
  ], cols=4) +
  hsub("Ta semaine type de revendeur qui scale") +
  table(["Jour","Bloc de 45 min","Objectif"],
    [["Lundi","Sourcing / réassort","Commander le prochain lot avant la rupture"],
     ["Mercredi","Photos en série","Shooter tout le nouveau stock d’un coup"],
     ["Vendredi","Rédaction d’annonces","Préparer 10 annonces prêtes à publier"],
     ["Dimanche 19&nbsp;h","Publication + offres","Publier, relancer les favoris, expédier"]]) +
  quote("On ne peut pas gérer ce qu’on ne systématise pas. La liberté naît de la routine.","Adage entrepreneurial") +
  foot()
)

# Scaling p2 — automatisation + étude + erreur + astuce + exercice + recap
page(
  eyebrow("Chapitre 8 · Le moteur qui tourne seul") + hsec("Automatiser le nerf de la guerre&nbsp;: le stock.") +
  '<p class="lead">De toutes les tâches, le <strong>sourcing</strong> est celle qui plafonne ta croissance. L’automatiser via un agent, c’est débloquer le volume sans y laisser tes soirées.</p>' +
  flow([("🔁","Réassort auto","commande récurrente"),("📦","Stock trié","prêt à shooter"),("📸","Batch photo","1 session/sem."),("📈","Volume","ventes en hausse")]) +
  box("case",
    '<div class="who">Le passage à l’échelle de Dylan — 29 ans, Genève</div>'
    '<p>Dylan plafonnait à 15 ventes/mois&nbsp;: tout son temps partait en sourcing. Il met en place un <strong>réassort régulier via un agent</strong> et bloque 4 créneaux fixes par semaine. Trois mois plus tard&nbsp;: <strong>2 à 3 ventes par jour</strong>, un dressing de 90 annonces, et… le même nombre d’heures qu’avant. «&nbsp;J’ai arrêté de chercher du stock. J’ai commencé à vendre.&nbsp;»') +
  box("error",
    '<p><strong>Scaler le chaos.</strong> Amplifier un business désorganisé ne fait qu’amplifier le désordre&nbsp;: ruptures, retards d’envoi, mauvaises notes. Systématise <em>avant</em> d’accélérer&nbsp;: routine, tableau de bord et approvisionnement fiable d’abord.</p>') +
  box("tip",
    '<p>La contrainte n°1 du scaling, c’est presque toujours le stock. Sécurise un <strong>réassort automatique</strong> (c’est le rôle de l’agent Cheapsappes) avant d’augmenter tes volumes de publication&nbsp;: tu ne veux jamais que tes meilleures annonces pointent vers un dressing vide.</p>', tail=True) +
  box("ex",
    '<p>Dessine ta semaine type&nbsp;: place tes 4 blocs de 45 min dans ton agenda réel. Lundi <span class="fill"></span> · Mercredi <span class="fill"></span> · Vendredi <span class="fill"></span> · Dimanche <span class="fill"></span>.</p>', "Exercice pratique — verrouille ta routine") +
  recap([
    "Scaler, c’est systématiser&nbsp;: volume, organisation, réinvestissement, automatisation.",
    "Une semaine type en 4 blocs bat toutes les poussées de motivation.",
    "Le stock est le goulot d’étranglement&nbsp;: automatise le sourcing en priorité.",
    "Systématise avant d’accélérer&nbsp;: on n’amplifie pas le chaos.",
  ], cta="Le stock est le nerf du scaling&nbsp;: automatise-le avec l’agent Cheapsappes.") +
  foot()
)

# =====================================================================
# CHAPITRE 9 — AGENT PREMIUM CHEAPSAPPES
# =====================================================================
def benefits(items):
    return '<div class="benefits">' + "".join(f'<div class="bi">{x}</div>' for x in items) + '</div>'
def tmo(stars, q, initial, name, role):
    return (f'<div class="tmo"><div class="st">{stars}</div><div class="tq">{q}</div>'
            f'<div class="who2"><div class="av">{initial}</div><div><div class="nm">{name}</div>'
            f'<div class="rl">{role}</div></div></div></div>')

divider("09","Chapitre 9","L’accès ultime&nbsp;: l’agent premium Cheapsappes.",
  "Tu as maintenant la méthode complète. Voici l’accélérateur&nbsp;: le service de sourcing que nous avons construit pour que la partie la plus difficile du métier devienne la plus simple.",
  ["Présentation","Bénéfices","Résultats possibles"], "7 min")

# Agent premium p1 — ce que c'est + pourquoi ça change + quote
page(
  eyebrow("Chapitre 9 · Présentation") + hsec("Ce que c’est, concrètement.") +
  '<p class="lead">L’agent premium Cheapsappes, c’est l’accès direct à notre <strong>réseau de sourcing professionnel</strong> — celui que nous avons mis des années à construire et à fiabiliser. En pratique&nbsp;:</p>' +
  benefits([
    "<b>Des arrivages réguliers</b> de pièces sélectionnées pour la revente Vinted&nbsp;: marques recherchées, tailles qui tournent.",
    "<b>Des prix négociés en volume</b>, pensés pour laisser une vraie marge&nbsp;: la marge se fait à l’achat, appliquée pour toi.",
    "<b>Un contrôle qualité systématique</b> avant expédition&nbsp;: état vérifié, tri effectué, mauvaises surprises éliminées.",
    "<b>Des packs adaptés à chaque budget</b>, du starter (~100&nbsp;€) aux lots de volume pour les dressings en scaling.",
    "<b>Un accompagnement communauté</b>&nbsp;: conseils de pricing, tendances, retours d’expérience — tu n’es plus jamais seul.",
    "<b>Zéro logistique de sourcing</b>&nbsp;: tu reçois, tu photographies, tu vends. Le plus dur est déjà fait.",
  ]) +
  hsub("Pourquoi ça change ta trajectoire") +
  '<p>Reprends les chapitres précédents et observe où l’agent intervient&nbsp;: le <strong>mindset</strong> (ch.&nbsp;2) t’a appris que la marge se fait à l’achat — l’agent optimise ton achat. Le <strong>budget</strong> (ch.&nbsp;4) repose sur des rotations rapides — l’agent fournit des pièces qui tournent. Le <strong>scaling</strong> (ch.&nbsp;8) exige un flux d’approvisionnement — l’agent <em>est</em> ce flux. Chaque brique de la méthode devient plus simple, plus rapide et plus rentable. C’est le raccourci le plus efficace de tout ce guide.</p>' +
  quote("Le meilleur moment pour sécuriser ton approvisionnement, c’était à ton premier flip. Le deuxième meilleur moment, c’est aujourd’hui.","Sagesse Cheapsappes") +
  foot()
)

# Agent premium p2 — packs + à qui + témoignages
page(
  eyebrow("Chapitre 9 · Les packs & pour qui") + hsec("Un pack pour chaque étape.") +
  table(["Pack","Idéal pour","Contenu type","Objectif"],
    [["🟢 Starter","Valider ton cycle","~ un petit lot sélectionné","Prouver acheté → vendu → réinvesti"],
     ["🔵 Croissance","Alimenter un dressing actif","Lot moyen, marques variées","Tenir 1-2 ventes/jour sans rupture"],
     ["🟣 Volume","Scaler sérieusement","Gros lot, réassort régulier","Soutenir plusieurs ventes/jour"]]) +
  '<div class="grid g2" style="margin:3mm 0">'
  '<div class="card" style="border-left:3px solid #12A06B"><div class="ct">✓ Pour toi si…</div><p>tu veux des résultats rapides et mesurables, tu valorises ton temps, et tu es prêt à exécuter la méthode de ce guide avec un approvisionnement fiable.</p></div>'
  '<div class="card" style="border-left:3px solid #E24435"><div class="ct">✕ Pas pour toi si…</div><p>tu cherches «&nbsp;de l’argent facile sans rien faire&nbsp;» (ça n’existe pas), ou si tu préfères la chine comme loisir du dimanche — ce qui est parfaitement respectable.</p></div>'
  '</div>' +
  hsub("Ils ont pris le raccourci") +
  '<p class="small mut" style="margin-top:-1mm">Parcours types illustratifs, représentatifs des trajectoires visées. Ils n’ont pas valeur de garantie.</p>' +
  '<div class="tmos">' +
  tmo("★★★★★","«&nbsp;Premier pack commandé un lundi, reçu le vendredi, 6 pièces vendues la semaine suivante. J’ai remboursé le pack en 12 jours.&nbsp;»","J","Jordan, 21 ans","Étudiant · Lille · starter pack") +
  tmo("★★★★★","«&nbsp;Ce qui m’a convaincue, c’est la constance&nbsp;: chaque lot est propre, trié, conforme. Mon dressing est passé de 20 à 90 annonces.&nbsp;»","M","Manon, 27 ans","Assistante RH · Liège · en scaling") +
  tmo("★★★★★","«&nbsp;Je travaille à temps plein. L’agent m’a rendu le business possible&nbsp;: 45 min/jour, ~500&nbsp;€ de marge le 3ᵉ mois.&nbsp;»","S","Sofiane, 30 ans","Technicien · Paris · 3 mois") +
  tmo("★★★★★","«&nbsp;Débutante totale, j’avais peur de la qualité. Le premier lot m’a rassurée&nbsp;: tout conforme aux photos. 15 ventes en un mois.&nbsp;»","C","Clara, 23 ans","En reconversion · Bordeaux") +
  '</div>' +
  foot()
)

# Agent premium p3 — étude 30j + astuce + exercice + recap + CTA
page(
  eyebrow("Chapitre 9 · Résultats possibles") + hsec("30 jours avec le starter pack.") +
  box("case",
    '<div class="who">Scénario type — starter pack, budget ~100&nbsp;€</div>'
    '<p><strong>J1-J3&nbsp;:</strong> commande passée, lot reçu, trié et prêt. <strong>J4-J7&nbsp;:</strong> photos en série et 10 annonces publiées le dimanche. <strong>J8-J15&nbsp;:</strong> premières ventes, offres aux favoris, expéditions sous 24&nbsp;h → ~6 ventes. <strong>J16-J30&nbsp;:</strong> réassort commandé avec les gains, dressing porté à 20+ annonces. <strong>Bilan&nbsp;:</strong> pack remboursé, premières dizaines d’euros de marge nette, et un cycle validé prêt à être amplifié.</p>') +
  box("tip",
    '<p>Commence <strong>petit mais vite</strong>&nbsp;: un starter pack aujourd’hui vaut mieux qu’un «&nbsp;gros lancement&nbsp;» dans trois mois. Le délai de livraison de ta première commande devient ton compte à rebours&nbsp;: il t’oblige à préparer ton setup et tes annonces pendant que le stock arrive.</p>') +
  box("error",
    '<p><strong>Croire au «&nbsp;stock magique&nbsp;» sans méthode.</strong> Un bon approvisionnement accélère un système qui fonctionne — il ne remplace ni les photos, ni les prix, ni le service. L’agent Cheapsappes optimise ton achat&nbsp;; à toi d’appliquer les chapitres 6 et 7. Ce n’est pas un substitut au volant, c’est un turbo.</p>') +
  box("ex",
    '<p>Décide maintenant&nbsp;: quel pack correspond à ton budget de départ (<span class="fill"></span>), et quelle date tu te fixes pour passer ta première commande sur cheapsappes.shop (<span class="fill"></span>).</p>', "Exercice pratique — choisis ton point de départ", tail=True) +
  recap([
    "L’agent premium Cheapsappes&nbsp;: stock sélectionné, prix négociés, contrôle qualité, réassort régulier.",
    "Il renforce chaque brique de la méthode&nbsp;: mindset, budget, annonces, scaling.",
    "Un pack pour chaque étape&nbsp;: starter pour valider, volume pour scaler.",
    "Le meilleur moment pour sécuriser ton stock, c’est <strong>maintenant</strong>.",
  ]) +
  cta_band("Accède à ton stock dès aujourd’hui",
           "Choisis le pack adapté à ton budget et lance ton compte à rebours. Sélection, contrôle qualité et réassort inclus&nbsp;: tu n’as plus qu’à vendre.",
           "Accéder à l’agent Cheapsappes") +
  foot()
)

# =====================================================================
# CHAPITRE 10 — CHECKLIST DE LANCEMENT
# =====================================================================
def checklist(groups):
    out=['<ul class="check">']
    for grp, items in groups:
        out.append(f'<li class="grp" style="list-style:none">{grp}</li>')
        for it in items:
            out.append(f'<li>{it}</li>')
    out.append('</ul>')
    return "".join(out)
def timeline(days):
    out=['<div class="tl">']
    for d,t,p in days:
        out.append(f'<div class="d"><div class="db">{d}</div><div class="dc"><div class="dt">{t}</div><p>{p}</p></div></div>')
    out.append('</div>')
    return "".join(out)

divider("10","Chapitre 10","La checklist de lancement.",
  "Tout ce que tu as appris, transformé en cases à cocher. Imprime ces pages, affiche-les, et coche. Dans 7 jours tu es en ligne&nbsp;; dans 30 jours tu as un business.",
  ["Checklist complète","Plan 7 jours","Plan 30 jours"], "8 min")

# Checklist p1 — checklist maîtresse + quote
page(
  eyebrow("Chapitre 10 · La checklist maîtresse") + hsec("Coche, et tu seras en ligne.") +
  '<div class="grid g2" style="gap:0 10mm;margin-top:2mm"><div>' +
  checklist([
    ("① Fondations", ["Mon «&nbsp;pourquoi&nbsp;» écrit (intro)","Contrat 90 jours signé (ch.&nbsp;2)","Budget défini en 70/30 (ch.&nbsp;4)"]),
    ("② Administratif", ["Sous-compte bancaire dédié ouvert","Statut adapté vérifié (micro-entrepreneur)"]),
  ]) +
  '</div><div>' +
  checklist([
    ("③ Setup", ["Station photo installée (ch.&nbsp;5)","3 bacs en place","Cintres, enveloppes, défroisseur reçus"]),
    ("④ Approvisionnement", ["Niche de départ choisie (ch.&nbsp;3)","Premier pack commandé sur cheapsappes.shop"]),
    ("⑤ Outils", ["Profil Vinted complété (photo, bio, ville)","Modèle de description prêt · tableau de bord monté"]),
  ]) +
  '</div></div>' +
  quote("Un objectif sans plan n’est qu’un souhait.","Antoine de Saint-Exupéry") +
  foot()
)

# Checklist p2 — plan 7 jours + astuce
page(
  eyebrow("Chapitre 10 · Plan d’action") + hsec("7 jours pour être en ligne.") +
  timeline([
    ("J1","Fondations & budget","Écris ton pourquoi, signe ton contrat 90 jours, fixe ton budget 70/30. Commande ton premier pack — le délai de livraison devient ton compte à rebours."),
    ("J2","Setup physique & digital","Station photo, 3 bacs, sous-compte bancaire. Complète ton profil Vinted&nbsp;: photo, bio sérieuse («&nbsp;envoi sous 24&nbsp;h&nbsp;»), ville."),
    ("J3","Ton marché","Analyse 20 annonces vendues dans ta niche&nbsp;: prix réels, photos gagnantes, titres efficaces. Note les fourchettes dans ton tableau de bord."),
    ("J4","Tes outils de production","Crée ton modèle de description à trous et tes réponses types. Objectif&nbsp;: publier une annonce en 4 minutes chrono."),
    ("J5","Session photo en série","Ton stock est arrivé&nbsp;: défroissage puis 5 photos par pièce, à la chaîne, sur ta station."),
    ("J6","Les annonces en batch","Rédige 10 annonces complètes&nbsp;: titres à mots-clés, descriptions 4 blocs, prix à -10&nbsp;% (prix d’appel), hashtags."),
    ("J7","Publication au créneau d’or","Dimanche 18-21&nbsp;h&nbsp;: publie tes 10 annonces. Active les remises sur lots. Réponds à chaque message en moins de 2&nbsp;h. Ton business est en ligne."),
  ]) +
  box("tip",
    '<p>Ne cherche pas la perfection au J7&nbsp;: cherche le <strong>lancement</strong>. Une annonce publiée et perfectible bat mille annonces parfaites restées dans ta tête. Tu optimiseras avec les données de la vraie vie, pas avant.</p>') +
  foot()
)

# Checklist p3 — plan 30 jours + étude + erreur + exercice + recap
page(
  eyebrow("Chapitre 10 · Le mois de lancement") + hsec("30 jours pour un système qui tourne.") +
  table(["Semaine","Objectif","Actions clés","Cible fin de semaine"],
    [["S1 · Lancer","Être en ligne","Plan 7 jours exécuté intégralement","10+ annonces actives"],
     ["S2 · Vendre","Premières ventes","Offres privées aux favoris · expéditions 24&nbsp;h · repricing des annonces froides","3-5 ventes · premières 5★"],
     ["S3 · Optimiser","Améliorer via les chiffres","Pilotage KPIs · refaire les 3 photos les plus faibles · tester un boost","Sell-through en hausse · 20+ annonces"],
     ["S4 · Réinvestir","Boucler le 1ᵉʳ cycle","Bilan du mois · déstockage des pièces mortes · réassort commandé","Capital &gt; capital de départ"]]) +
  box("case",
    '<div class="who">Le plan suivi à la lettre — Yanis, 20 ans, Charleroi · budget 150&nbsp;€</div>'
    '<p>Yanis n’a rien inventé&nbsp;: il a imprimé la checklist et suivi le plan jour par jour, sans improviser. <strong>J7&nbsp;:</strong> 10 annonces en ligne un dimanche soir. <strong>J9&nbsp;:</strong> première vente. <strong>J30&nbsp;:</strong> 11 ventes, 142&nbsp;€ de marge nette, réassort commandé. «&nbsp;J’ai juste fait ce qui était écrit, dans l’ordre.&nbsp;»') +
  box("error",
    '<p><strong>Vouloir tout faire en un jour.</strong> Le plan est réparti sur 7 jours pour une raison&nbsp;: chaque étape prépare la suivante. Brûler les étapes, c’est publier des annonces bâclées — et repartir de zéro. La régularité bat l’intensité.</p>', tail=True) +
  box("ex",
    '<p>Date ton plan maintenant. Mon J1 sera le&nbsp;: <span class="fill"></span>. Donc ma publication (J7) tombera le&nbsp;: <span class="fill"></span>. Écris ces deux dates là où tu les verras chaque jour.</p>', "Exercice pratique — pose tes dates") +
  recap([
    "La checklist transforme la méthode en actions cochables.",
    "7 jours pour être en ligne&nbsp;; 30 jours pour un système qui tourne.",
    "Régularité &gt; intensité&nbsp;: une étape par jour, dans l’ordre.",
    "Fin du mois 1&nbsp;: capital &gt; capital de départ, et cycle 2 lancé.",
  ], cta="Coche la première vraie case dès aujourd’hui&nbsp;: commande ton premier pack.") +
  foot()
)

# =====================================================================
# CONCLUSION
# =====================================================================
divider("★","Conclusion","À toi de jouer.",
  "Tu as la méthode complète entre les mains. Il ne manque plus qu’une seule chose — et c’est la seule que personne ne peut faire à ta place.",
  ["Le message final","Tes 10 minutes","Passe à l’action"], "4 min")

page(
  eyebrow("Conclusion · Le message final") + hsec("La seule différence, c’est l’action.") +
  '<p class="lead">Fais le compte de ce que tu possèdes maintenant&nbsp;: le vocabulaire du métier, le mindset des revendeurs qui durent, le levier n°1 du secteur, des budgets chiffrés, un setup à moins de 50&nbsp;€, la recette de l’annonce qui vend, un tableau de bord, les stratégies de scaling, et deux plans d’action datés.</p>' +
  '<p>Il y a six mois, ces vendeurs n’en savaient pas plus que toi. La seule différence entre eux et la version de toi qui lira encore des guides dans un an, c’est ce que tu fais dans les <strong>dix prochaines minutes</strong>. Pas demain. Maintenant, pendant que la motivation est chaude.</p>' +
  hsub("Tes dix minutes, chronomètre en main") +
  timeline([
    ("0-2","Date ton plan 7 jours","Ouvre ton agenda et pose ta date de J1 (exercice du chapitre 10)."),
    ("2-5","Écris ton pourquoi","Ton objectif à 90 jours, en une phrase. Colle-le en fond d’écran."),
    ("5-10","Passe ta première commande","Va sur cheapsappes.shop, choisis le pack adapté à ton budget. Ton compte à rebours démarre à la confirmation."),
  ]) +
  quote("Dans un an, tu regretteras peut-être de ne pas avoir commencé aujourd’hui.","Karen Lamb") +
  cta_band("Commence maintenant, pas «&nbsp;un jour&nbsp;»",
           "Dans une semaine, ton dressing sera en ligne. Dans un mois, tes premières dizaines de ventes. Tout commence par la première pièce mise en vente.",
           "Accéder à mon stock sur cheapsappes.shop") +
  '<p class="center mut" style="margin-top:4mm">On se retrouve de l’autre côté — dans la communauté, et en haut des résultats de recherche Vinted.<br><strong style="color:#0E1B39">— L’équipe Cheapsappes</strong></p>' +
  foot()
)

# =====================================================================
# BACK COVER
# =====================================================================
add('<section class="page divider"><div class="wrap">'
  '<div class="brand" style="font-family:\'Bricolage\';font-weight:700;font-size:15pt;letter-spacing:.16em;color:#fff">CHEAPSAPPES<span style="color:#0FB5B0">.</span></div>'
  '<div style="font-family:\'Plex\';font-size:7.6pt;letter-spacing:.3em;color:#9fc0ff;margin-top:2mm">GUIDE DE L’ACHAT-REVENTE VINTED</div>'
  '<h1 style="font-size:44pt;margin-top:22mm;max-width:150mm">Le guide francophone de <span style="color:#0FB5B0">référence</span> pour générer des revenus sur Vinted.</h1>'
  '<div class="dsub" style="margin-top:8mm">Du premier euro investi à plusieurs ventes par jour&nbsp;: la méthode complète — lexique, mindset, sourcing, budgets, annonces, KPIs, scaling — avec plans d’action sur 7 et 30 jours.</div>'
  '<div style="margin-top:9mm">'
    '<div style="font-family:\'Plex\';font-weight:700;font-size:8.4pt;letter-spacing:.18em;text-transform:uppercase;color:#0FB5B0;margin-bottom:4mm">Dans ce guide</div>'
    '<ul class="ticks" style="color:#dbe8ff">'
    '<li>12 chapitres progressifs, conçus pour les débutants</li>'
    '<li>Des simulations chiffrées réalistes à 100&nbsp;€, 300&nbsp;€ et 500&nbsp;€</li>'
    '<li>La recette complète de l’annonce qui vend, avec exemples avant / après</li>'
    '<li>Un tableau de bord de pilotage prêt à reproduire</li>'
    '<li>L’accès au levier n°1 des meilleurs revendeurs&nbsp;: l’agent de sourcing</li>'
    '</ul>'
  '</div>'
  '<div style="position:absolute;left:20mm;right:20mm;bottom:30mm">'
    '<span class="btn">Accéder à mon stock sur cheapsappes.shop <span class="ar">→</span></span>'
    '<p style="color:#8fa8d6;font-size:7.6pt;line-height:1.5;margin-top:6mm;max-width:150mm">© Cheapsappes — Tous droits réservés. Ce guide est fourni à titre informatif et pédagogique&nbsp;; il ne constitue pas un conseil financier, juridique ou fiscal. Les simulations, études de cas et témoignages sont des illustrations de parcours types et ne garantissent aucun résultat.</p>'
  '</div>'
  '<div class="bfoot"><span>Cheapsappes · Le guide de l’achat-revente sur Vinted</span><span>cheapsappes.shop — @@N@@</span></div>'
  '</div></section>')
