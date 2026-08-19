// Captures de contrôle depuis plusieurs points de vue.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((q, r) => {
  const p = path.join(process.cwd(), decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' }); r.end(d); } });
});
await new Promise((r) => server.listen(8096, r));
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto('http://localhost:8096/index.html');
await page.click('#play');
await page.waitForFunction(() => window.game?.player, null, { timeout: 60000 });
await page.waitForTimeout(600);

const shots = [
  ['toits', 'g.player.pos.set(150, 70, 150); g.camRig.yaw = 2.2; g.camRig.pitch = 0.12; g.camRig.wantDist = 7;'],
  ['tour',  'g.player.pos.set(70, 130, 70); g.camRig.yaw = 0.78; g.camRig.pitch = 0.05; g.camRig.wantDist = 9;'],
  ['rue',   'g.player.pos.set(40, 2, 0); g.camRig.yaw = 1.57; g.camRig.pitch = -0.05; g.camRig.wantDist = 6;'],
  ['ciel',  'g.player.pos.set(0, 200, 300); g.camRig.yaw = 0; g.camRig.pitch = 0.35; g.camRig.wantDist = 10;'],
];
for (const [name, setup] of shots) {
  await page.evaluate((setup) => {
    const g = window.game;
    new Function('g', setup)(g);
    g.player.vel.set(0, 0, 0); g.player.state = 'air';
    g.camRig.smooth.copy(g.player.pos);
    for (let i = 0; i < 12; i++) g.step(1 / 60);
  }, setup);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `tools/vue-${name}.png` });
}
console.log('erreurs:', errs.length ? errs : 'aucune');
await browser.close(); server.close();
