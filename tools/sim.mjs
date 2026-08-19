// Simulation déterministe à 60 Hz, sans rasterisation : mesure la physique.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.cwd();
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' }); r.end(d); } });
});
await new Promise((r) => server.listen(8097, r));
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message + ' | ' + (e.stack || '').split('\n')[1]));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8097/index.html');
await page.click('#play');
await page.waitForFunction(() => window.game?.player, null, { timeout: 60000 });
await page.waitForTimeout(500);

const run = (name, setup, seconds) => page.evaluate(({ setup, seconds }) => {
  const g = window.game;
  g.mode = 'sim';                       // coupe la boucle rAF pour piloter à la main
  // eslint-disable-next-line no-new-func
  new Function('g', setup)(g);
  const N = Math.round(seconds * 60), dt = 1 / 60;
  const s = {
    maxSpeed: 0, hDist: 0, minY: 1e9, maxY: -1e9, swing: 0, wall: 0, ground: 0, air: 0, zip: 0,
    attaches0: g.__attaches || 0, t0: performance.now(), stuck: 0,
  };
  let px = g.player.pos.x, pz = g.player.pos.z;
  for (let i = 0; i < N; i++) {
    if (g.__sweep) g.camRig.yaw += Math.sin(i / 90) * 0.006;   // le joueur oriente sa course
    g.step(dt);
    const p = g.player;
    s.maxSpeed = Math.max(s.maxSpeed, p.speed);
    s.hDist += Math.hypot(p.pos.x - px, p.pos.z - pz);
    px = p.pos.x; pz = p.pos.z;
    s.minY = Math.min(s.minY, p.pos.y); s.maxY = Math.max(s.maxY, p.pos.y);
    s[p.state] = (s[p.state] || 0) + 1;
    if (p.speed < 0.4) s.stuck++;
  }
  const ms = (performance.now() - s.t0) / N;
  g.mode = 'play';
  return {
    vitesseMax: +(s.maxSpeed * 3.6).toFixed(0) + ' km/h',
    distanceH: +s.hDist.toFixed(0) + ' m',
    altitude: `${s.minY.toFixed(0)} → ${s.maxY.toFixed(0)} m`,
    etats: { balance: s.swing || 0, air: s.air || 0, sol: s.ground || 0, mur: s.wall || 0, zip: s.zip || 0 },
    accroches: (g.__attaches || 0) - s.attaches0,
    immobile: s.stuck,
    cpuParFrame: +ms.toFixed(2) + ' ms',
    score: Math.round(g.score), vie: Math.round(g.player.health), toile: Math.round(g.player.webFluid),
  };
}, { setup, seconds }).then((r) => { console.log(`\n--- ${name} ---`); console.log(JSON.stringify(r)); return r; });

// 1) balancement continu : clic gauche maintenu + Z
await run('Balancement (20 s, clic maintenu + Z)', `
  g.player.pos.set(180, 110, 180); g.player.vel.set(0, -2, 10); g.player.state = 'air';
  g.camRig.smooth.copy(g.player.pos); g.camRig.yaw = Math.PI; g.camRig.pitch = -0.15;
  g.input.buttons[0] = true; g.input.keys.add('z'); g.__sweep = true;
`, 20);

// 2) course au sol ZQSD
await run('Course au sol (6 s, Z puis D)', `
  g.input.buttons[0] = false; g.input.keys.clear(); g.__sweep = false;
  g.player.pos.set(-40, 3, -40); g.player.vel.set(0,0,0); g.player.state = 'air';
  g.input.keys.add('z');
`, 6);

// 3) escalade de mur
await run('Escalade (6 s, Z contre un mur)', `
  const b = g.world.buildings.find(x => x.h > 45);
  g.player.pos.set(b.x, 6, b.z + b.d / 2 + 0.35); g.player.vel.set(0, 0, -6);
  g.player.state = 'air'; g.camRig.yaw = 0; g.input.keys.add('z');
`, 6);

// 4) toile-éclair
await run('Toile-éclair (4 s)', `
  g.input.keys.clear();
  g.player.pos.set(120, 60, 120); g.player.vel.set(0, 0, 0); g.player.state = 'air';
  g.camRig.yaw = 0.6; g.camRig.pitch = 0.25;
  g.input.clicked[2] = true;
`, 4);

// 5) combat : voyous autour du joueur
await run('Combat (6 s)', `
  g.input.keys.clear(); g.input.buttons[0] = false;
  const r = g.world.roofs.find(p => p.y > 30 && p.y < 60);
  g.player.pos.copy(r); g.player.pos.y += 2; g.player.vel.set(0,0,0);
  for (let i = 0; i < 3; i++) g.npcs.spawn('voyou', r.clone().add(new (g.player.pos.constructor)(i*1.5-1.5, 0.2, 1.6)));
  g.input.pressed.add('e');
`, 6);

console.log('\nerreurs:', errors.length ? errors.slice(0, 6) : 'aucune');
await browser.close(); server.close();
process.exit(errors.length ? 1 : 0);
