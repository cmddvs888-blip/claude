import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((q, r) => {
  const p = path.join(process.cwd(), decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' }); r.end(d); } });
});
await new Promise((r) => server.listen(8095, r));
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
page.on('pageerror', (e) => console.log('ERREUR', e.message));
await page.goto('http://localhost:8095/index.html');
await page.click('#play');
await page.waitForFunction(() => window.game?.player, null, { timeout: 60000 });

const log = await page.evaluate(() => {
  const g = window.game;
  g.mode = 'sim';
  g.player.pos.set(180, 110, 180); g.player.vel.set(0, -2, 10); g.player.state = 'air';
  g.camRig.smooth.copy(g.player.pos); g.camRig.yaw = Math.PI; g.camRig.pitch = -0.15;
  g.input.buttons[0] = true; g.input.keys.add('z');
  const rows = [];
  for (let i = 0; i < 1200; i++) {
    g.step(1 / 60);
    if (i % 15 === 0) {
      const p = g.player;
      const org = g.camera.position.clone().addScaledVector(g.camRig.aimDir(new (p.pos.constructor)()), g.camRig.dist * 0.9);
      const a = g.webs.findAnchor(org, g.camRig.aimDir(new (p.pos.constructor)()), p.pos, true);
      rows.push(`${(i / 60).toFixed(1)}s ${p.state.padEnd(6)} y=${p.pos.y.toFixed(0).padStart(3)} v=${(p.speed * 3.6).toFixed(0).padStart(3)}km/h pitch=${g.camRig.pitch.toFixed(2)} ancre=${a ? 'y' + a.y.toFixed(0) + ' d' + a.distanceTo(p.pos).toFixed(0) : 'AUCUNE'}`);
    }
  }
  g.mode = 'play';
  return rows;
});
console.log(log.join('\n'));
await browser.close(); server.close();
