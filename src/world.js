import * as THREE from 'three';
import { mulberry32, rand, pick, clamp } from './util.js';
import { makeFacade, makeRoof, makeAsphalt, makeDash, makeSky, makeGlow, FACADE_TILE } from './textures.js';

const BLOCK = 62;      // côté d'un pâté de maisons
const ROAD = 18;       // largeur des rues
const SPAN = BLOCK + ROAD;
const GRID = 11;       // 11 x 11 pâtés
export const CITY_RADIUS = (GRID * SPAN) / 2;
const STYLES = ['haussmann', 'brick', 'concrete', 'glass'];

/* ------------------------------------------------------------------ */
/* Fusion de géométries : évite d'avoir des centaines de draw calls.   */
/* ------------------------------------------------------------------ */
class GeoBatch {
  constructor() { this.pos = []; this.nor = []; this.uv = []; }

  /** Ajoute une boîte (centre cx,cy,cz / dimensions w,h,d) avec UV en mètres. */
  box(cx, cy, cz, w, h, d, tile = FACADE_TILE, uvOffset = 0) {
    const hx = w / 2, hy = h / 2, hz = d / 2;
    const faces = [
      { n: [1, 0, 0],  v: [[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,-hy,hz],[hx,hy,-hz],[hx,hy,hz]] },
      { n: [-1, 0, 0], v: [[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,-hy,-hz],[-hx,hy,hz],[-hx,hy,-hz]] },
      { n: [0, 1, 0],  v: [[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]] },
      { n: [0, -1, 0], v: [[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]] },
      { n: [0, 0, 1],  v: [[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]] },
      { n: [0, 0, -1], v: [[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]] },
    ];
    for (const f of faces) {
      for (const v of f.v) {
        const x = v[0] + cx, y = v[1] + cy, z = v[2] + cz;
        this.pos.push(x, y, z);
        this.nor.push(f.n[0], f.n[1], f.n[2]);
        // UV calées sur le monde : fenêtres alignées d'un immeuble à l'autre
        if (Math.abs(f.n[1]) > 0.5) this.uv.push(x / tile, z / tile);
        else if (Math.abs(f.n[0]) > 0.5) this.uv.push(z / tile, y / tile + uvOffset);
        else this.uv.push(x / tile, y / tile + uvOffset);
      }
    }
  }

  /** Quad horizontal (toitures, trottoirs). */
  quad(cx, y, cz, w, d, tile) {
    const hx = w / 2, hz = d / 2;
    const v = [[-hx,hz],[hx,hz],[hx,-hz],[-hx,hz],[hx,-hz],[-hx,-hz]];
    for (const p of v) {
      const x = p[0] + cx, z = p[1] + cz;
      this.pos.push(x, y, z);
      this.nor.push(0, 1, 0);
      this.uv.push(x / tile, z / tile);
    }
  }

  get count() { return this.pos.length / 3; }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeBoundingSphere();
    return g;
  }
}

/* ------------------------------------------------------------------ */
/* Monde                                                               */
/* ------------------------------------------------------------------ */
export class World {
  constructor(scene, { shadows = true, seed = 20250819 } = {}) {
    this.scene = scene;
    this.shadows = shadows;
    this.rng = mulberry32(seed);
    this.colliders = [];     // AABB : {minX,minY,minZ,maxX,maxY,maxZ}
    this.buildings = [];     // métadonnées (minimap, apparitions)
    this.roofs = [];         // points d'apparition sur les toits
    this.cell = 48;          // taille des cases de la grille d'accélération
    this.gridMap = new Map();

    this._sky(scene);
    this._lights(scene);
    this._ground(scene);
    this._city(scene);
    this._tower(scene);
    this._cars(scene);
    this._index();
  }

  /* -------------------- décor -------------------- */
  _sky(scene) {
    const geo = new THREE.SphereGeometry(2600, 32, 20);
    const mat = new THREE.MeshBasicMaterial({ map: makeSky(), side: THREE.BackSide, fog: false, depthWrite: false });
    this.skyMesh = new THREE.Mesh(geo, mat);
    scene.add(this.skyMesh);

    // soleil bas sur l'horizon + halo
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow('#fff2d0'), transparent: true, depthWrite: false, fog: false,
      blending: THREE.AdditiveBlending, opacity: 0.95,
    }));
    sunSprite.scale.set(520, 520, 1);
    sunSprite.position.set(-1500, 620, 1120);
    this.skyMesh.add(sunSprite);

    scene.fog = new THREE.FogExp2(0xc9cbd0, 0.0017);
  }

  _lights(scene) {
    scene.add(new THREE.HemisphereLight(0xbcd6ff, 0x4a3b32, 1.15));
    const sun = new THREE.DirectionalLight(0xffd9a8, 2.6);
    sun.position.set(-160, 210, 120);
    if (this.shadows) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      const s = 150;
      Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 700 });
      sun.shadow.bias = -0.0009;
      sun.shadow.normalBias = 0.6;
    }
    scene.add(sun, sun.target);
    this.sun = sun;
    // lumière d'appoint froide pour décoller les ombres
    const fill = new THREE.DirectionalLight(0x93b8ff, 0.5);
    fill.position.set(140, 90, -160);
    scene.add(fill);
  }

  _ground(scene) {
    const asphalt = makeAsphalt();
    const size = GRID * SPAN + 1400;
    asphalt.repeat.set(size / 12, size / 12);
    const g = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.95, metalness: 0 })
    );
    g.rotation.x = -Math.PI / 2;
    g.receiveShadow = this.shadows;
    scene.add(g);
    this.ground = g;

    // axes des rues : bandes discontinues posées sur la grille réelle
    const dash = makeDash();
    const len = GRID * SPAN;
    const mat = new THREE.MeshBasicMaterial({ map: dash, transparent: true, depthWrite: false });
    const half = (GRID - 1) / 2;
    const marks = new THREE.Group();
    for (let i = -half - 1; i <= half; i++) {
      const c = i * SPAN + SPAN / 2;
      for (const axis of [0, 1]) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, len), mat);
        m.rotation.x = -Math.PI / 2;
        if (axis === 0) { m.position.set(c, 0.03, 0); }
        else { m.position.set(0, 0.03, c); m.rotation.z = Math.PI / 2; }
        marks.add(m);
      }
    }
    dash.repeat.set(1, len / 9);
    scene.add(marks);
  }

  /* -------------------- immeubles -------------------- */
  _city(scene) {
    const rng = this.rng;
    const batches = {};
    STYLES.forEach((s) => (batches[s] = new GeoBatch()));
    const roofBatch = new GeoBatch();
    const propBatch = new GeoBatch();
    const walkBatch = new GeoBatch();

    const half = (GRID - 1) / 2;
    for (let gx = -half; gx <= half; gx++) {
      for (let gz = -half; gz <= half; gz++) {
        const bx = gx * SPAN, bz = gz * SPAN;
        const dist = Math.hypot(gx, gz) / half;              // 0 = centre-ville
        // trottoir du pâté
        walkBatch.quad(bx, 0.16, bz, BLOCK + 7, BLOCK + 7, 8);

        if (gx === 0 && gz === 0) continue;                  // réservé à la Tour Neuille
        if (rng() < 0.07) { this._park(propBatch, bx, bz); continue; }

        // découpe du pâté en 1, 2 ou 4 parcelles
        const split = rng() < 0.42 ? 2 : rng() < 0.72 ? 1 : 4;
        const lots = split === 1 ? [[0, 0, 1, 1]]
          : split === 2 ? (rng() < 0.5 ? [[0, -0.25, 1, 0.5], [0, 0.25, 1, 0.5]]
                                       : [[-0.25, 0, 0.5, 1], [0.25, 0, 0.5, 1]])
          : [[-0.25, -0.25, 0.5, 0.5], [0.25, -0.25, 0.5, 0.5], [-0.25, 0.25, 0.5, 0.5], [0.25, 0.25, 0.5, 0.5]];

        for (const [ox, oz, sw, sd] of lots) {
          const gap = rand(rng, 2.5, 6);
          const w = BLOCK * sw - gap, d = BLOCK * sd - gap;
          const cx = bx + ox * BLOCK, cz = bz + oz * BLOCK;
          const tall = Math.pow(Math.max(0, 1 - dist), 2.1);
          let h = rand(rng, 14, 26) + tall * rand(rng, 40, 115);
          h = Math.round(h / 3.5) * 3.5;                     // hauteurs calées sur les étages
          const style = dist < 0.45 && rng() < 0.55 ? 'glass' : pick(rng, STYLES);

          batches[style].box(cx, h / 2, cz, w, h, d);
          roofBatch.quad(cx, h + 0.02, cz, w, d, 8);
          // acrotère (muret de toit) : donne de la prise visuelle
          const p = 0.55, ph = rand(rng, 0.9, 1.7);
          propBatch.box(cx, h + ph / 2, cz + d / 2 - p / 2, w, ph, p, 4);
          propBatch.box(cx, h + ph / 2, cz - d / 2 + p / 2, w, ph, p, 4);
          propBatch.box(cx + w / 2 - p / 2, h + ph / 2, cz, p, ph, d, 4);
          propBatch.box(cx - w / 2 + p / 2, h + ph / 2, cz, p, ph, d, 4);
          this._roofProps(propBatch, cx, cz, w, d, h, rng);

          this.addCollider(cx - w / 2, 0, cz - d / 2, cx + w / 2, h, cz + d / 2);
          this.buildings.push({ x: cx, z: cz, w, d, h });
          this.roofs.push(new THREE.Vector3(cx, h + 2.2, cz));
        }
      }
    }

    const facadeMats = {};
    STYLES.forEach((s, i) => {
      const { map, emissive } = makeFacade(s, 11 + i * 7);
      facadeMats[s] = new THREE.MeshStandardMaterial({
        map, emissiveMap: emissive, emissive: 0xffffff, emissiveIntensity: 0.85,
        roughness: s === 'glass' ? 0.25 : 0.88, metalness: s === 'glass' ? 0.55 : 0.05,
      });
    });
    for (const s of STYLES) {
      if (!batches[s].count) continue;
      const m = new THREE.Mesh(batches[s].build(), facadeMats[s]);
      m.castShadow = this.shadows; m.receiveShadow = this.shadows;
      scene.add(m);
    }
    const roofMat = new THREE.MeshStandardMaterial({ map: makeRoof(), roughness: 0.95 });
    const roofMesh = new THREE.Mesh(roofBatch.build(), roofMat);
    roofMesh.receiveShadow = this.shadows;
    scene.add(roofMesh);

    const propMat = new THREE.MeshStandardMaterial({ color: 0x8d939c, roughness: 0.85 });
    const propMesh = new THREE.Mesh(propBatch.build(), propMat);
    propMesh.castShadow = this.shadows; propMesh.receiveShadow = this.shadows;
    scene.add(propMesh);

    const walkMat = new THREE.MeshStandardMaterial({ color: 0x9a9a94, roughness: 1 });
    const walkMesh = new THREE.Mesh(walkBatch.build(), walkMat);
    walkMesh.receiveShadow = this.shadows;
    scene.add(walkMesh);
  }

  _roofProps(b, cx, cz, w, d, h, rng) {
    const n = 1 + (rng() * 3) | 0;
    for (let i = 0; i < n; i++) {
      const pw = rand(rng, 2, 5.5), pd = rand(rng, 2, 5.5), ph = rand(rng, 1.6, 4.5);
      const px = cx + rand(rng, -1, 1) * (w / 2 - pw / 2 - 2);
      const pz = cz + rand(rng, -1, 1) * (d / 2 - pd / 2 - 2);
      b.box(px, h + ph / 2, pz, pw, ph, pd, 4);
      this.addCollider(px - pw / 2, h, pz - pd / 2, px + pw / 2, h + ph, pz + pd / 2);
    }
    if (rng() < 0.35) {   // antenne
      const ah = rand(rng, 6, 16);
      b.box(cx + rand(rng, -w / 4, w / 4), h + ah / 2, cz + rand(rng, -d / 4, d / 4), 0.5, ah, 0.5, 4);
    }
  }

  _park(b, bx, bz) {
    // petit square : quelques arbres cubistes, pas d'immeuble
    const rng = this.rng;
    for (let i = 0; i < 7; i++) {
      const x = bx + rand(rng, -BLOCK / 2 + 6, BLOCK / 2 - 6);
      const z = bz + rand(rng, -BLOCK / 2 + 6, BLOCK / 2 - 6);
      const th = rand(rng, 5, 9);
      b.box(x, th / 2, z, 0.8, th, 0.8, 3);
      b.box(x, th + 2.2, z, 5.5, 5, 5.5, 3);
      this.addCollider(x - 2.7, 0, z - 2.7, x + 2.7, th + 4.5, z + 2.7);
    }
  }

  /* -------------------- la Tour Neuille -------------------- */
  _tower(scene) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.7, metalness: 0.45 });
    const H = 235;
    const levels = [
      { y: 0,    r: 30 }, { y: 58, r: 17 }, { y: 118, r: 9 }, { y: 180, r: 5 }, { y: H, r: 1.6 },
    ];
    // 4 piliers inclinés
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      for (let s = 0; s < levels.length - 1; s++) {
        const A = levels[s], B = levels[s + 1];
        const p0 = new THREE.Vector3(Math.cos(a) * A.r, A.y, Math.sin(a) * A.r);
        const p1 = new THREE.Vector3(Math.cos(a) * B.r, B.y, Math.sin(a) * B.r);
        const len = p0.distanceTo(p1);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(2.6, len, 2.6), mat);
        leg.position.copy(p0).add(p1).multiplyScalar(0.5);
        leg.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          p1.clone().sub(p0).normalize()
        );
        leg.castShadow = this.shadows;
        g.add(leg);
      }
    }
    // plateformes
    for (const L of levels.slice(0, 4)) {
      const plat = new THREE.Mesh(new THREE.BoxGeometry(L.r * 2.5, 2.4, L.r * 2.5), mat);
      plat.position.y = L.y + 1.2;
      plat.castShadow = this.shadows; plat.receiveShadow = this.shadows;
      g.add(plat);
      this.addCollider(-L.r * 1.25, L.y, -L.r * 1.25, L.r * 1.25, L.y + 2.4, L.r * 1.25);
      this.roofs.push(new THREE.Vector3(Math.max(6, L.r * 0.6), L.y + 4.6, 0));
    }
    // flèche + balise
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.2, 26, 8), mat);
    spire.position.y = H + 13; g.add(spire);
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xff3355 })
    );
    beacon.position.y = H + 27; g.add(beacon);
    this.beacon = beacon;
    this.addCollider(-4, 0, -4, 4, H, 4);          // fût central grimpable
    scene.add(g);
    this.tower = g;
  }

  /* -------------------- circulation -------------------- */
  _cars(scene) {
    const rng = this.rng;
    const N = 90;
    const geo = new THREE.BoxGeometry(2.1, 1.5, 4.4);
    const mesh = new THREE.InstancedMesh(
      geo, new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.4 }), N
    );
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = this.shadows;
    const colors = [0xd8d8dc, 0x2b2f38, 0xb62d3a, 0x2f5fa8, 0xd8a83a, 0x3a7a52];
    this.cars = [];
    const half = (GRID - 1) / 2;
    for (let i = 0; i < N; i++) {
      const axis = rng() < 0.5 ? 'x' : 'z';
      const line = (((rng() * GRID) | 0) - half) * SPAN + (rng() < 0.5 ? -4.5 : 4.5);
      const dir = line > 0 ? 1 : -1;
      this.cars.push({
        axis, line, t: rand(rng, -CITY_RADIUS, CITY_RADIUS),
        speed: rand(rng, 9, 18) * (axis === 'x' ? dir : -dir),
      });
      mesh.setColorAt(i, new THREE.Color(pick(rng, colors)));
    }
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    this.carMesh = mesh;
    this._m4 = new THREE.Matrix4();
  }

  /* -------------------- collisions -------------------- */
  addCollider(minX, minY, minZ, maxX, maxY, maxZ) {
    this.colliders.push({ minX, minY, minZ, maxX, maxY, maxZ });
  }

  _index() {
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      const x0 = Math.floor(c.minX / this.cell), x1 = Math.floor(c.maxX / this.cell);
      const z0 = Math.floor(c.minZ / this.cell), z1 = Math.floor(c.maxZ / this.cell);
      for (let x = x0; x <= x1; x++) {
        for (let z = z0; z <= z1; z++) {
          const k = x + ',' + z;
          let a = this.gridMap.get(k);
          if (!a) this.gridMap.set(k, (a = []));
          a.push(c);
        }
      }
    }
  }

  /** Colliders potentiellement proches d'un point (rayon r). */
  near(x, z, r, out = []) {
    out.length = 0;
    const x0 = Math.floor((x - r) / this.cell), x1 = Math.floor((x + r) / this.cell);
    const z0 = Math.floor((z - r) / this.cell), z1 = Math.floor((z + r) / this.cell);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cz = z0; cz <= z1; cz++) {
        const a = this.gridMap.get(cx + ',' + cz);
        if (!a) continue;
        for (const c of a) if (!out.includes(c)) out.push(c);
      }
    }
    return out;
  }

  /**
   * Lancer de rayon contre les boîtes de la ville (méthode des tranches).
   * Renvoie { point, normal, dist } ou null. Bien plus rapide qu'un
   * THREE.Raycaster sur des maillages fusionnés.
   */
  raycast(origin, dir, maxDist = 220, hit = {}) {
    let best = maxDist, bestC = null, bestAxis = 0, bestSign = 1;
    const step = this.cell;
    const px = origin.x, py = origin.y, pz = origin.z;
    // parcours grossier le long du rayon, case par case
    const seen = new Set();
    for (let t = 0; t <= maxDist; t += step * 0.75) {
      const cx = Math.floor((px + dir.x * t) / this.cell);
      const cz = Math.floor((pz + dir.z * t) / this.cell);
      for (let ox = -1; ox <= 1; ox++) {
        for (let oz = -1; oz <= 1; oz++) {
          const k = (cx + ox) + ',' + (cz + oz);
          if (seen.has(k)) continue;
          seen.add(k);
          const list = this.gridMap.get(k);
          if (!list) continue;
          for (const c of list) {
            let tmin = 0, tmax = best, axis = 0, sign = 1;
            for (let a = 0; a < 3; a++) {
              const o = a === 0 ? px : a === 1 ? py : pz;
              const d = a === 0 ? dir.x : a === 1 ? dir.y : dir.z;
              const lo = a === 0 ? c.minX : a === 1 ? c.minY : c.minZ;
              const hi = a === 0 ? c.maxX : a === 1 ? c.maxY : c.maxZ;
              if (Math.abs(d) < 1e-8) { if (o < lo || o > hi) { tmin = Infinity; break; } continue; }
              let t1 = (lo - o) / d, t2 = (hi - o) / d, s = -1;
              if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; s = 1; }
              if (t1 > tmin) { tmin = t1; axis = a; sign = s; }
              if (t2 < tmax) tmax = t2;
              if (tmin > tmax) { tmin = Infinity; break; }
            }
            if (tmin < best && tmin > 0.2) { best = tmin; bestC = c; bestAxis = axis; bestSign = sign; }
          }
        }
      }
      if (bestC && best < t) break;   // plus rien de plus proche à trouver
    }
    // sol
    if (dir.y < -1e-6) {
      const t = -py / dir.y;
      if (t > 0.2 && t < best) {
        best = t; bestC = null; bestAxis = 1; bestSign = 1;
        hit.point = new THREE.Vector3(px + dir.x * t, 0, pz + dir.z * t);
        hit.normal = new THREE.Vector3(0, 1, 0);
        hit.dist = t; hit.ground = true;
        return hit;
      }
    }
    if (!bestC) return null;
    hit.point = new THREE.Vector3(px + dir.x * best, py + dir.y * best, pz + dir.z * best);
    hit.normal = new THREE.Vector3(
      bestAxis === 0 ? bestSign : 0, bestAxis === 1 ? bestSign : 0, bestAxis === 2 ? bestSign : 0
    );
    hit.dist = best; hit.ground = false; hit.box = bestC;
    return hit;
  }

  /** Point d'accroche le plus haut au-dessus d'une position (pour l'aide à la visée). */
  highestNear(x, z, radius = 40) {
    let best = null, bestScore = -Infinity;
    for (const b of this.buildings) {
      const d = Math.hypot(b.x - x, b.z - z);
      if (d > radius) continue;
      const score = b.h - d * 0.4;
      if (score > bestScore) { bestScore = score; best = b; }
    }
    return best;
  }

  randomRoof(rng = Math.random, minH = 0) {
    const pool = this.roofs.filter((r) => r.y > minH);
    return pool[(rng() * pool.length) | 0] || this.roofs[0];
  }

  update(dt, playerPos) {
    // circulation
    const lim = CITY_RADIUS + 40;
    for (let i = 0; i < this.cars.length; i++) {
      const c = this.cars[i];
      c.t += c.speed * dt;
      if (c.t > lim) c.t = -lim; else if (c.t < -lim) c.t = lim;
      const x = c.axis === 'x' ? c.t : c.line;
      const z = c.axis === 'x' ? c.line : c.t;
      this._m4.makeRotationY(c.axis === 'x' ? (c.speed > 0 ? Math.PI / 2 : -Math.PI / 2) : (c.speed > 0 ? 0 : Math.PI));
      this._m4.setPosition(x, 0.95, z);
      this.carMesh.setMatrixAt(i, this._m4);
    }
    this.carMesh.instanceMatrix.needsUpdate = true;

    // la zone d'ombre suit le joueur
    if (this.shadows) {
      this.sun.position.set(playerPos.x - 160, playerPos.y + 210, playerPos.z + 120);
      this.sun.target.position.copy(playerPos);
      this.sun.target.updateMatrixWorld();
    }
    this.skyMesh.position.set(playerPos.x, 0, playerPos.z);
    if (this.beacon) this.beacon.material.color.setHSL(0, 0.9, 0.5 + 0.35 * Math.sin(performance.now() / 220));
  }
}

export { BLOCK, ROAD, SPAN, GRID };
