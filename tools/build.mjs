// Fabrique la version autonome : un seul fichier HTML, three.js inclus,
// aucune ressource externe (jouable hors ligne, publiable telle quelle).
import { build } from 'esbuild';
import fs from 'node:fs';

const out = await build({
  entryPoints: ['src/main.js'],
  bundle: true, format: 'iife', minify: true, target: 'es2020',
  alias: { three: './vendor/three.module.min.js' },
  write: false, legalComments: 'none',
});
const js = out.outputFiles[0].text;
const css = fs.readFileSync('styles.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

// on récupère le balisage de <body> sans le <script type="module">
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .trim();

const TITLE = 'Spider Neuille';
const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>🕷️</text></svg>";

const content = `<title>${TITLE}</title>
<style>
${css}
</style>
${body}
<script>
${js}
</script>`;

fs.mkdirSync('dist', { recursive: true });
// 1) page complète : double-clic depuis le disque
fs.writeFileSync('dist/spider-neuille.html',
`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<link rel="icon" href="${FAVICON}" />
${content.slice(0, content.indexOf('</style>') + 8)}
</head>
<body>
${content.slice(content.indexOf('</style>') + 8)}
</body>
</html>`);
// 2) fragment : pour publication (le squelette HTML est ajouté à la publication)
fs.writeFileSync('dist/artifact.html', content);

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + ' Ko';
console.log('dist/spider-neuille.html', kb('dist/spider-neuille.html'));
console.log('dist/artifact.html      ', kb('dist/artifact.html'));
