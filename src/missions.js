import * as THREE from 'three';
import { makeGlow } from './textures.js';
import { mulberry32, rand } from './util.js';

/** Colonne de lumière + icône flottante qui marque l'objectif. */
class Beacon {
  constructor(scene) {
    const g = new THREE.Group();
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 90, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xff4d63, transparent: true, opacity: 0.11,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      })
    );
    col.position.y = 45;
    g.add(col);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 3.1, 28),
      new THREE.MeshBasicMaterial({ color: 0xff8090, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.25;
    g.add(ring);
    this.ring = ring;
    this.col = col;
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow('#ffd9a0'), transparent: true, depthWrite: false, opacity: 0.9, fog: false,
    }));
    this.sprite.scale.set(4, 4, 1);
    this.sprite.position.y = 3.2;
    g.add(this.sprite);
    g.visible = false;
    scene.add(g);
    this.group = g;
  }
  setColor(hex) {
    this.col.material.color.setHex(hex);
    this.ring.material.color.setHex(hex);
  }
  show(pos) { this.group.position.copy(pos); this.group.visible = true; }
  hide() { this.group.visible = false; }
  update(dt, playerPos) {
    this.ring.rotation.z += dt * 0.9;
    // la colonne s'efface quand on arrive dessus : elle masquerait la vue
    if (playerPos) {
      const d = this.group.position.distanceTo(playerPos);
      this.col.material.opacity = Math.max(0.02, Math.min(0.11, d / 420));
    }
    const k = 1 + 0.1 * Math.sin(performance.now() / 300);
    this.ring.scale.set(k, k, 1);
    this.sprite.position.y = 3.2 + Math.sin(performance.now() / 500) * 0.4;
  }
}

/** Le colis à livrer. */
function makeParcel(scene) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.9 })
  );
  box.castShadow = true;
  g.add(box);
  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.16, 0.84),
    new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.7 })
  );
  g.add(tape);
  g.visible = false;
  scene.add(g);
  return g;
}

const TYPES = ['colis', 'voyous', 'civil'];

export class Missions {
  constructor(scene, world, npcs, audio) {
    this.scene = scene;
    this.world = world;
    this.npcs = npcs;
    this.audio = audio;
    this.rng = mulberry32(9182);
    this.beacon = new Beacon(scene);
    this.parcel = makeParcel(scene);
    this.current = null;
    this.completed = 0;
    this.timeLeft = 0;
    this.target = new THREE.Vector3();
    this.hasTarget = false;
    this.label = '';
    this.sub = '';
    this._v = new THREE.Vector3();
    npcs.onDefeat = (n) => this._onDefeat(n);
  }

  _roofNear(from, min = 90, max = 320) {
    let best = null, bestScore = Infinity;
    for (let i = 0; i < 60; i++) {
      const r = this.world.roofs[(this.rng() * this.world.roofs.length) | 0];
      const d = Math.hypot(r.x - from.x, r.z - from.z);
      const score = Math.abs(d - (min + max) / 2);
      if (d >= min * 0.5 && score < bestScore) { bestScore = score; best = r; }
    }
    return (best || this.world.roofs[0]).clone();
  }

  next(player) {
    const type = TYPES[(this.rng() * TYPES.length) | 0];
    this.parcel.visible = false;
    if (type === 'colis') {
      const p = this._roofNear(player.pos);
      this.current = { type, stage: 'pickup', drop: null };
      this.timeLeft = 95;
      this._setTarget(p, 'Récupère le colis', 0xffb347);
      this.parcel.position.copy(p).add(new THREE.Vector3(0, 0.9, 0));
      this.parcel.visible = true;
    } else if (type === 'voyous') {
      const p = this._roofNear(player.pos, 70, 240);
      this.current = { type, remaining: 3, spawned: [] };
      this.timeLeft = 110;
      for (let i = 0; i < 3; i++) {
        const off = new THREE.Vector3(rand(this.rng, -7, 7), 0.1, rand(this.rng, -7, 7));
        const n = this.npcs.spawn('voyou', this._v.copy(p).add(off).clone());
        if (n) this.current.spawned.push(n);
      }
      this.current.remaining = this.current.spawned.length;
      this._setTarget(p, `Neutralise les voyous (${this.current.remaining})`, 0xff4d63);
    } else {
      const p = this._roofNear(player.pos, 80, 260);
      const n = this.npcs.spawn('civil', p.clone().add(new THREE.Vector3(0, 0.1, 0)));
      this.current = { type, npc: n };
      this.timeLeft = 90;
      this._setTarget(p, 'Sauve le civil', 0x53d6ff);
    }
    this.onNew?.(this.label);
  }

  _setTarget(pos, label, color) {
    this.target.copy(pos);
    this.hasTarget = true;
    this.label = label;
    this.beacon.setColor(color);
    this.beacon.show(pos);
  }

  _onDefeat(n) {
    if (this.current?.type === 'voyous' && this.current.spawned.includes(n)) {
      this.current.remaining--;
      this.label = `Neutralise les voyous (${this.current.remaining})`;
      if (this.current.remaining <= 0) this._complete(700);
    }
  }

  _complete(base) {
    const bonus = Math.max(0, Math.round(this.timeLeft * 6));
    this.completed++;
    this.audio.success();
    this.beacon.hide();
    this.parcel.visible = false;
    this.hasTarget = false;
    this.label = 'Mission accomplie !';
    this.current = null;
    this.onComplete?.(base + bonus, bonus);
    this.cooldown = 2.2;
  }

  update(dt, player) {
    this.beacon.update(dt, player.pos);
    if (this.parcel.visible) {
      this.parcel.rotation.y += dt * 1.4;
      this.parcel.position.y += Math.sin(performance.now() / 420) * dt * 0.6;
    }
    if (this.cooldown > 0) {
      this.cooldown -= dt;
      if (this.cooldown <= 0) this.next(player);
      return;
    }
    if (!this.current) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.audio.hurt();
      this.onFail?.();
      this.beacon.hide();
      this.parcel.visible = false;
      this.current = null;
      this.hasTarget = false;
      this.label = 'Temps écoulé…';
      this.cooldown = 2.2;
      return;
    }

    const c = this.current;
    const d = player.pos.distanceTo(this.target);

    if (c.type === 'colis') {
      if (c.stage === 'pickup' && d < 3.4) {
        c.stage = 'deliver';
        this.audio.pickup();
        this.parcel.visible = false;
        this.timeLeft += 35;
        const dest = this._roofNear(player.pos, 120, 380);
        this._setTarget(dest, 'Livre le colis', 0x53ff9d);
        this.onBonus?.(150, 'Colis récupéré');
      } else if (c.stage === 'deliver' && d < 4.2) {
        this._complete(600);
      }
    } else if (c.type === 'civil') {
      if (d < 3.6) {
        c.npc?.despawn();
        this._complete(500);
      }
    } else if (c.type === 'voyous') {
      // la balise suit le voyou restant le plus proche
      let nearest = null, nd = Infinity;
      for (const n of c.spawned) {
        if (!n.alive || n.state === 'cocon') continue;
        const dd = n.pos.distanceTo(player.pos);
        if (dd < nd) { nd = dd; nearest = n; }
      }
      if (nearest) { this.target.copy(nearest.pos); this.beacon.show(nearest.pos); }
    }
  }
}
