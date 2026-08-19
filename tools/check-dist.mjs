// Vérifie que le fichier unique fonctionne en file:// (hors ligne, sans serveur).
import { chromium } from 'playwright';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
const errs = [];
page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 160)); });
page.on('requestfailed', (r) => errs.push('[réseau] ' + r.url().slice(0, 80)));
const externes = [];
page.on('request', (r) => { if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) externes.push(r.url()); });

await page.goto('file://' + process.cwd() + '/dist/spider-neuille.html');
await page.click('#play');
await page.waitForFunction(() => window.game?.player, null, { timeout: 90000 });
const r = await page.evaluate(() => {
  const g = window.game;
  g.mode = 'sim';
  g.player.pos.set(180, 100, 180); g.player.vel.set(0, -2, 10); g.player.state = 'air';
  g.camRig.smooth.copy(g.player.pos); g.camRig.yaw = Math.PI;
  g.input.buttons[0] = true; g.input.keys.add('z');
  let maxSpeed = 0;
  for (let i = 0; i < 600; i++) { g.step(1 / 60); maxSpeed = Math.max(maxSpeed, g.player.speed); }
  g.mode = 'play';
  return {
    immeubles: g.world.buildings.length, colliders: g.world.colliders.length,
    vitesseMax: Math.round(maxSpeed * 3.6) + ' km/h', score: Math.round(g.score),
    etat: g.player.state, accroches: g.__attaches || 0,
  };
});
await page.waitForTimeout(800);
await page.screenshot({ path: 'tools/vue-dist.png' });
console.log(JSON.stringify(r, null, 2));
console.log('requêtes externes :', externes.length ? externes : 'aucune (100 % hors ligne)');
console.log('erreurs :', errs.length ? errs.slice(0, 6) : 'aucune');
await browser.close();
process.exit(errs.length ? 1 : 0);
