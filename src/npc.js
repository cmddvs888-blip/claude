import * as THREE from 'three';
import { clamp, damp, rand, mulberry32 } from './util.js';

/* Personnage secondaire minimaliste, animé procéduralement. */
function makePerson({ coat, pants, skin, hat }, shadows) {
  const g = new THREE.Group();
  const M = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.34, 4, 8), M(coat));
  torso.position.y = 1.15; torso.castShadow = shadows; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), M(skin, 0.6));
  head.position.y = 1.56; head.castShadow = shadows; g.add(head);
  if (hat) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.15, 0.13, 10), M(hat));
    cap.position.y = 1.65; g.add(cap);
  }
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Object3D();
    leg.position.set(s * 0.09, 0.88, 0); g.add(leg);
    const lm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.6, 4, 6), M(pants));
    lm.position.y = -0.38; lm.castShadow = shadows; leg.add(lm);
    legs.push(leg);
    const arm = new THREE.Object3D();
    arm.position.set(s * 0.245, 1.38, 0); g.add(arm);
    const am = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.42, 4, 6), M(coat));
    am.position.y = -0.28; am.castShadow = shadows; arm.add(am);
    arms.push(arm);
  }
  return { group: g, legs, arms, torso, head };
}

const THUG_COLORS = [
  { coat: 0x2a2f3a, pants: 0x1a1d24, skin: 0xc99a6e, hat: 0x8a1f2c },
  { coat: 0x3d2a20, pants: 0x22262e, skin: 0xe0b48a, hat: 0x1f2a3a },
  { coat: 0x223b2a, pants: 0x1b1e25, skin: 0x8c6144, hat: 0x2f2f2f },
];
const CIVIL_COLORS = [
  { coat: 0x2f6fbf, pants: 0x35404f, skin: 0xe6b48c, hat: null },
  { coat: 0xc9557a, pants: 0x3b3f4a, skin: 0xa9765a, hat: null },
  { coat: 0xd8b23a, pants: 0x2e3742, skin: 0xf0cba4, hat: null },
];

class Npc {
  constructor(scene, world, kind, palette, shadows) {
    this.world = world;
    this.kind = kind;                   // 'voyou' | 'civil'
    const p = makePerson(palette, shadows);
    this.parts = p;
    this.group = p.group;
    this.group.visible = false;
    scene.add(this.group);
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.alive = false;
    this.state = 'idle';
    this.phase = Math.random() * 6;
    this.cooldown = 0;
    this.ttl = 0;
    this.yaw = 0;

    // cocon de toile
    this.cocoon = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.34, 1.1, 4, 10),
      new THREE.MeshStandardMaterial({ color: 0xf0f4ff, roughness: 0.8, emissive: 0x445566, emissiveIntensity: 0.25 })
    );
    this.cocoon.position.y = 0.9;
    this.cocoon.visible = false;
    this.group.add(this.cocoon);
  }

  spawn(pos, home) {
    this.pos.copy(pos);
    this.vel.set(0, 0, 0);
    this.home = home ? home.clone() : pos.clone();
    this.alive = true;
    this.state = 'idle';
    this.group.visible = true;
    this.cocoon.visible = false;
    this.parts.torso.visible = true;
    this.parts.head.visible = true;
    this.parts.legs.forEach((l) => (l.visible = true));
    this.parts.arms.forEach((a) => (a.visible = true));
    this.ttl = 0;
    this.grounded = false;
  }

  despawn() { this.alive = false; this.group.visible = false; }

  cocoonize() {
    this.state = 'cocon';
    this.cocoon.visible = true;
    this.parts.torso.visible = false;
    this.parts.head.visible = false;
    this.parts.legs.forEach((l) => (l.visible = false));
    this.parts.arms.forEach((a) => (a.visible = false));
    this.ttl = 7;
  }
}

export class NpcManager {
  constructor(scene, world, audio, webs, shadows) {
    this.world = world;
    this.audio = audio;
    this.webs = webs;
    this.rng = mulberry32(4242);
    this.pool = [];
    for (let i = 0; i < 14; i++) {
      const kind = i < 10 ? 'voyou' : 'civil';
      const pal = kind === 'voyou'
        ? THUG_COLORS[i % THUG_COLORS.length]
        : CIVIL_COLORS[i % CIVIL_COLORS.length];
      this.pool.push(new Npc(scene, world, kind, pal, shadows));
    }
    // projectiles lancés par les voyous
    this.shots = [];
    const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const mat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.9 });
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(geo, mat);
      m.visible = false; scene.add(m);
      this.shots.push({ mesh: m, alive: false, vel: new THREE.Vector3(), life: 0 });
    }
    this._v = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
  }

  spawn(kind, pos) {
    const n = this.pool.find((x) => !x.alive && x.kind === kind);
    if (!n) return null;
    n.spawn(pos);
    return n;
  }

  get active() { return this.pool.filter((n) => n.alive); }

  /** Voyou visé par le réticule (le plus proche de l'axe de visée). */
  targetUnderAim(camPos, camDir, maxDist = 45) {
    let best = null, bestDot = 0.93;
    for (const n of this.pool) {
      if (!n.alive || n.kind !== 'voyou' || n.state === 'cocon') continue;
      this._v.copy(n.pos).setY(n.pos.y + 1.1).sub(camPos);
      const d = this._v.length();
      if (d > maxDist) continue;
      this._v.multiplyScalar(1 / d);
      const dot = this._v.dot(camDir);
      if (dot > bestDot) { bestDot = dot; best = n; }
    }
    return best;
  }

  /** Toile tirée sur un voyou : il finit en cocon. */
  webTag(n, from) {
    if (!n || n.state === 'cocon') return false;
    this.webs.fireBolt(from, this._v.copy(n.pos).setY(n.pos.y + 1).clone(), () => {
      n.cocoonize();
      this.audio.webhit();
      this.onDefeat?.(n, 'toile');
    });
    return true;
  }

  /** Attaque au corps à corps dans un rayon donné. */
  meleeAt(pos, radius = 3.2) {
    let hit = 0;
    for (const n of this.pool) {
      if (!n.alive || n.kind !== 'voyou' || n.state === 'cocon') continue;
      if (n.pos.distanceTo(pos) < radius) {
        n.cocoonize();
        this.audio.punch();
        this.onDefeat?.(n, 'coup');
        hit++;
      }
    }
    return hit;
  }

  update(dt, player) {
    const pp = player.pos;
    for (const n of this.pool) {
      if (!n.alive) continue;

      if (n.state === 'cocon') {
        n.ttl -= dt;
        n.cocoon.rotation.y += dt * 0.6;
        // le cocon tombe au sol
        n.vel.y -= 24 * dt;
        n.pos.addScaledVector(n.vel, dt);
        const g = this._groundY(n.pos);
        if (n.pos.y <= g) { n.pos.y = g; n.vel.set(0, 0, 0); }
        n.group.position.copy(n.pos);
        if (n.ttl <= 0) n.despawn();
        continue;
      }

      const dist = n.pos.distanceTo(pp);

      if (n.kind === 'voyou') {
        const canSee = dist < 42 && Math.abs(pp.y - n.pos.y) < 22;
        if (canSee) {
          n.state = 'chase';
          // se rapproche mais garde ses distances
          const want = 12;
          this._v.copy(pp).sub(n.pos); this._v.y = 0;
          const d = this._v.length() || 1;
          this._v.multiplyScalar(1 / d);
          const move = d > want ? 1 : d < want * 0.6 ? -0.7 : 0;
          n.vel.x = this._v.x * 3.4 * move;
          n.vel.z = this._v.z * 3.4 * move;
          n.yaw = Math.atan2(this._v.x, this._v.z);
          n.cooldown -= dt;
          if (n.cooldown <= 0 && dist < 34) {
            n.cooldown = rand(this.rng, 1.6, 3.2);
            this._throw(n, pp);
          }
        } else {
          n.state = 'idle';
          // patrouille autour du point d'apparition
          n.phase += dt * 0.5;
          const tx = n.home.x + Math.cos(n.phase) * 5;
          const tz = n.home.z + Math.sin(n.phase * 0.8) * 5;
          this._v.set(tx - n.pos.x, 0, tz - n.pos.z);
          const d = this._v.length();
          if (d > 0.4) { this._v.multiplyScalar(2 / d); n.vel.x = this._v.x; n.vel.z = this._v.z; n.yaw = Math.atan2(this._v.x, this._v.z); }
          else { n.vel.x = n.vel.z = 0; }
        }
      } else {
        // civil : agite les bras, ne bouge pas
        n.vel.x = n.vel.z = 0;
        n.yaw = Math.atan2(pp.x - n.pos.x, pp.z - n.pos.z);
      }

      // gravité + sol
      n.vel.y -= 24 * dt;
      n.pos.addScaledVector(n.vel, dt);
      const gy = this._groundY(n.pos);
      if (n.pos.y <= gy) { n.pos.y = gy; n.vel.y = 0; n.grounded = true; }
      else n.grounded = false;

      // animation
      const sp = Math.hypot(n.vel.x, n.vel.z);
      n.phase += dt * (2 + sp * 2.4);
      const s = Math.sin(n.phase) * clamp(sp / 3, 0.15, 1);
      n.parts.legs[0].rotation.x = s * 0.7;
      n.parts.legs[1].rotation.x = -s * 0.7;
      if (n.kind === 'civil') {
        n.parts.arms[0].rotation.z = 2.4 + Math.sin(n.phase * 3) * 0.35;
        n.parts.arms[1].rotation.z = -2.4 - Math.sin(n.phase * 3 + 1) * 0.35;
      } else {
        n.parts.arms[0].rotation.x = -s * 0.6;
        n.parts.arms[1].rotation.x = s * 0.6;
      }
      n.group.position.copy(n.pos);
      n.group.rotation.y = damp(n.group.rotation.y, n.yaw, 8, dt);
    }

    // projectiles
    for (const s of this.shots) {
      if (!s.alive) continue;
      s.vel.y -= 18 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.mesh.rotation.x += dt * 9; s.mesh.rotation.y += dt * 7;
      s.life -= dt;
      if (s.mesh.position.distanceTo(pp) < 1.1) {
        player.hurt(8);
        s.alive = false; s.mesh.visible = false;
      } else if (s.life <= 0 || s.mesh.position.y < -5) {
        s.alive = false; s.mesh.visible = false;
      }
    }
  }

  _throw(n, target) {
    const s = this.shots.find((x) => !x.alive);
    if (!s) return;
    s.alive = true; s.life = 4; s.mesh.visible = true;
    s.mesh.position.copy(n.pos).setY(n.pos.y + 1.4);
    // tir balistique simple vers la position anticipée
    this._v.copy(target).sub(s.mesh.position);
    const t = clamp(this._v.length() / 26, 0.3, 1.6);
    s.vel.copy(this._v).multiplyScalar(1 / t);
    s.vel.y += 0.5 * 18 * t;
    this.audio.alert();
  }

  _groundY(p) {
    const list = this.world.near(p.x, p.z, 2, []);
    let best = 0;
    for (const b of list) {
      if (p.x > b.minX - 0.3 && p.x < b.maxX + 0.3 && p.z > b.minZ - 0.3 && p.z < b.maxZ + 0.3) {
        if (b.maxY <= p.y + 1.2 && b.maxY > best) best = b.maxY;
      }
    }
    return best;
  }
}
