// Test de fumée : charge le jeu dans Chromium headless (WebGL logiciel),
// lance une partie, simule des entrées et vérifie qu'aucune erreur ne sort.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(8099, r));

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message + '\n' + (e.stack || '')));

await page.goto('http://localhost:8099/index.html', { waitUntil: 'load' });
await page.waitForTimeout(600);
await page.screenshot({ path: 'tools/shot-menu.png' });

await page.click('#play');
try { await page.waitForFunction(() => window.game && window.game.player, null, { timeout: 60000 }); }
catch (e) { errors.push('[boot] jeu non initialisé'); }
await page.waitForTimeout(1500);

const scenario = async () => {
  const stats = [];
  const snap = async (tag) => {
    const s = await page.evaluate(() => {
      const g = window.game;
      return {
        state: g.player.state, y: +g.player.pos.y.toFixed(1),
        speed: +g.player.speed.toFixed(1), health: Math.round(g.player.health),
        web: Math.round(g.player.webFluid), score: Math.round(g.score),
        attached: g.webs.attached, fps: g.__fps || 0,
        obj: g.missions.label, npcs: g.npcs.active.length,
      };
    });
    stats.push([tag, s]);
    return s;
  };
  await snap('depart');

  // chute + accroche de toile (clic gauche maintenu)
  await page.mouse.down();
  await page.waitForTimeout(2500);
  await snap('balancement');
  await page.mouse.move(700, 340);
  await page.waitForTimeout(2000);
  const swing = await snap('balancement2');
  await page.mouse.up();
  await page.waitForTimeout(1200);
  await snap('lache');

  // déplacement clavier ZQSD
  for (const k of ['z', 'q', 's', 'd']) {
    await page.keyboard.down(k); await page.waitForTimeout(400); await page.keyboard.up(k);
  }
  await snap('zqsd');

  // saut + toile-éclair (clic droit)
  await page.keyboard.press(' ');
  await page.waitForTimeout(300);
  await page.mouse.click(640, 360, { button: 'right' });
  await page.waitForTimeout(1800);
  await snap('zip');

  // attaques
  await page.keyboard.press('e');
  await page.keyboard.press('f');
  await page.waitForTimeout(500);
  await page.keyboard.press('r');
  await page.waitForTimeout(1200);
  await snap('reset');

  // longue session : on laisse tourner pour attraper les erreurs tardives
  await page.mouse.down();
  await page.waitForTimeout(6000);
  await page.mouse.up();
  await snap('fin');
  return { stats, swing };
};

let stats = [];
try { ({ stats } = await scenario()); } catch (e) { errors.push('[scenario] ' + e.message); }
await page.screenshot({ path: 'tools/shot-play.png' });

// mesure du framerate
const fps = errors.length ? 0 : await page.evaluate(() => new Promise((res) => {
  let n = 0; const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res(Math.round(n / ((performance.now() - t0) / 1000))); };
  requestAnimationFrame(tick);
}));

console.log('\n=== ÉTATS ===');
for (const [tag, s] of stats) console.log(tag.padEnd(14), JSON.stringify(s));
console.log('\nFPS (rendu logiciel):', fps);
console.log('\n=== ERREURS ===');
console.log(errors.length ? errors.slice(0, 12).join('\n---\n') : 'aucune');

await browser.close();
server.close();
process.exit(errors.length ? 1 : 0);
