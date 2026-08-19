import * as THREE from 'three';
import { makeGlow } from './textures.js';
import { clamp } from './util.js';

const WEB_RADIUS = 0.035;
const MAX_LEN = 130;

/** Une toile = un point d'ancrage + le fil qui va de la main à ce point. */
class Strand {
  constructor(scene, mat) {
    this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 6, 1, true), mat);
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.point = new THREE.Vector3();
    this.length = 20;
    this.active = false;
    this.grow = 0;
    this.side = 'R';
  }
}

export class WebSystem {
  constructor(scene, world, audio) {
    this.scene = scene;
    this.world = world;
    this.audio = audio;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.35, emissive: 0x8899bb, emissiveIntensity: 0.5,
    });
    this.strands = [new Strand(scene, mat), new Strand(scene, mat)];
    this.strands[0].side = 'L';
    this.strands[1].side = 'R';

    // impacts de toile
    const glowTex = makeGlow('#eaf0ff');
    this.splats = [];
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, transparent: true, depthWrite: false, opacity: 0.85,
      }));
      s.scale.set(1.6, 1.6, 1);
      s.visible = false;
      scene.add(s);
      this.splats.push(s);
    }

    // projectiles de toile (contre les voyous)
    this.bolts = [];
    const boltGeo = new THREE.SphereGeometry(0.16, 8, 6);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xf4f8ff });
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(boltGeo, boltMat);
      m.visible = false;
      scene.add(m);
      this.bolts.push({ mesh: m, alive: false, t: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), cb: null });
    }

    this.zipTarget = null;
    this.zipStrand = null;
    this._v = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._q = new THREE.Quaternion();
    this._up = new THREE.Vector3(0, 1, 0);
    this._hit = {};
    this.aimPoint = new THREE.Vector3();
    this.aimValid = false;
  }

  /* ------------------------------------------------------------------ */
  /* Recherche d'un point d'accroche : tir direct puis aide à la visée.  */
  /* ------------------------------------------------------------------ */
  /**
   * Un ancrage n'est bon pour se balancer que s'il est assez loin ET plus haut
   * que le joueur : sinon la toile est molle et on s'écrase sur la façade.
   */
  goodForSwing(point, playerPos) {
    return point.distanceTo(playerPos) >= 9 && point.y > playerPos.y - 22;
  }

  findAnchor(camPos, camDir, playerPos, forSwing = true) {
    const hit = this.world.raycast(camPos, camDir, MAX_LEN, this._hit);
    if (hit && !hit.ground) {
      const p = this._v.copy(hit.point).addScaledVector(hit.normal, 0.12).clone();
      if (!forSwing) return p;
      // touché en pleine façade : on fait remonter l'ancrage jusqu'à l'arête du
      // toit, sinon la corde est trop basse et le balancement finit dans la rue
      if (hit.box && Math.abs(hit.normal.y) < 0.5) {
        p.y = clamp(hit.box.maxY + 0.2, p.y, playerPos.y + 42);
      }
      if (this.goodForSwing(p, playerPos)) return p;
    }

    // aide à la visée : meilleure arête de toit dans un cône devant la caméra
    let best = null, bestScore = Infinity;
    const cands = [];
    for (const b of this.world.buildings) {
      const dx = b.x - playerPos.x, dz = b.z - playerPos.z;
      if (dx * dx + dz * dz > 130 * 130) continue;
      if (b.h < playerPos.y - 45) continue;
      const hw = b.w / 2 - 0.5, hd = b.d / 2 - 0.5;
      // uniquement les arêtes du toit : on veut passer AUTOUR des immeubles
      cands.length = 0;
      cands.push([b.x - hw, b.z - hd], [b.x + hw, b.z - hd], [b.x - hw, b.z + hd], [b.x + hw, b.z + hd],
                 [b.x, b.z - hd], [b.x, b.z + hd], [b.x - hw, b.z], [b.x + hw, b.z]);
      for (const c of cands) {
        this._v2.set(c[0] - camPos.x, b.h + 0.2 - camPos.y, c[1] - camPos.z);
        const dist = this._v2.length();
        if (dist < 6 || dist > MAX_LEN) continue;
        this._v2.multiplyScalar(1 / dist);
        const dot = this._v2.dot(camDir);
        if (dot < 0.5) continue;                        // 60° : l'aide doit rattraper
                                                        // une visée approximative
        if (forSwing && (b.h + 0.2 < playerPos.y - 22 ||
            Math.hypot(c[0] - playerPos.x, b.h - playerPos.y, c[1] - playerPos.z) < 9)) continue;
        // à cône égal on préfère l'ancrage le plus haut : ça garde
        // le joueur au-dessus des rues au lieu de le faire raser le bitume
        const score = (1 - dot) * 26 + dist * 0.004 - (b.h - playerPos.y) * 0.02;
        if (score < bestScore) { bestScore = score; best = [c[0], b.h + 0.2, c[1]]; }
      }
    }
    if (best) return new THREE.Vector3(best[0], best[1], best[2]);
    return null;
  }

  /** Met à jour le point visé (pour le réticule). */
  updateAim(camPos, camDir, playerPos) {
    const p = this.findAnchor(camPos, camDir, playerPos, true);
    this.aimValid = !!p;
    if (p) this.aimPoint.copy(p);
    return p;
  }

  free(side) {
    let s = this.strands.find((x) => !x.active && x.side === side);
    if (!s) s = this.strands.find((x) => !x.active);
    return s;
  }

  /** Tire une toile vers le point visé. Renvoie true si accrochée. */
  shoot(camPos, camDir, playerPos, playerFacing) {
    const point = this.findAnchor(camPos, camDir, playerPos);
    if (!point) return false;
    // main la plus « naturelle » selon le côté de l'ancrage
    const rel = this._v.copy(point).sub(playerPos);
    const side = (rel.x * Math.cos(playerFacing) - rel.z * Math.sin(playerFacing)) > 0 ? 'R' : 'L';
    const s = this.free(side);
    if (!s) return false;
    s.point.copy(point);
    s.length = clamp(playerPos.distanceTo(point) * 0.98, 9, 60);
    s.active = true;
    s.grow = 0;
    this.audio.thwip();
    return true;
  }

  release(strand) {
    strand.active = false;
    strand.mesh.visible = false;
  }

  releaseAll() {
    let any = false;
    for (const s of this.strands) if (s.active) { this.release(s); any = true; }
    if (any) this.audio.release();
    return any;
  }

  get attached() { return this.strands.some((s) => s.active); }

  activeAnchors() {
    const out = [];
    for (const s of this.strands) if (s.active && s.grow >= 1) out.push(s);
    return out;
  }

  /** Cibles à viser pour les bras du rig. */
  handAnchors() {
    const a = { L: null, R: null };
    for (const s of this.strands) if (s.active) a[s.side] = s.point;
    if (this.zipTarget) a.R = this.zipTarget;
    return a;
  }

  /* -------------------- toile-éclair -------------------- */
  startZip(point) {
    this.zipTarget = point.clone();
    const s = this.free('R');
    if (s) { s.point.copy(point); s.active = true; s.grow = 0; s.length = 999; this.zipStrand = s; }
    this.audio.zip();
  }
  endZip() {
    this.zipTarget = null;
    if (this.zipStrand) { this.release(this.zipStrand); this.zipStrand = null; }
  }

  /* -------------------- projectiles -------------------- */
  fireBolt(from, to, cb) {
    const b = this.bolts.find((x) => !x.alive);
    if (!b) return false;
    b.alive = true; b.t = 0; b.cb = cb;
    b.from.copy(from); b.to.copy(to);
    b.mesh.visible = true;
    this.audio.thwip();
    return true;
  }

  /* -------------------- rendu -------------------- */
  update(dt, rig, playerPos) {
    let si = 0;
    for (const s of this.strands) {
      if (!s.active) { s.mesh.visible = false; continue; }
      s.grow = Math.min(1, s.grow + dt * 14);
      const hand = rig.handWorld(s.side, this._v);
      const end = this._v2.copy(s.point).sub(hand).multiplyScalar(s.grow).add(hand);
      const dir = end.clone().sub(hand);
      const len = dir.length() || 0.001;
      dir.multiplyScalar(1 / len);
      s.mesh.position.copy(hand).addScaledVector(dir, len / 2);
      s.mesh.quaternion.setFromUnitVectors(this._up, dir);
      s.mesh.scale.set(WEB_RADIUS, len, WEB_RADIUS);
      s.mesh.visible = true;
      if (s.grow >= 1 && !s.hitPlayed) { s.hitPlayed = true; this.audio.attach(); }
      if (s.grow < 1) s.hitPlayed = false;

      const sp = this.splats[si++];
      if (sp) {
        sp.visible = s.grow >= 1;
        sp.position.copy(s.point);
        const k = 1.1 + 0.25 * Math.sin(performance.now() / 120);
        sp.scale.set(k, k, 1);
      }
    }
    for (; si < this.splats.length; si++) this.splats[si].visible = false;

    for (const b of this.bolts) {
      if (!b.alive) continue;
      b.t += dt * 3.4;
      b.mesh.position.lerpVectors(b.from, b.to, Math.min(1, b.t));
      if (b.t >= 1) {
        b.alive = false; b.mesh.visible = false;
        b.cb?.();
      }
    }
  }
}
