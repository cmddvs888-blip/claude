import * as THREE from 'three';
import { SpiderRig } from './rig.js';
import { clamp, damp } from './util.js';

const G = 26;                 // gravité (m/s²)
const G_SWING = 21;
const RUN = 8.6, SPRINT = 14.5;
const ACCEL = 68, AIR_ACCEL = 16;
const JUMP = 11.5, WALL_JUMP = 12;
const CLIMB = 6.2;
const TERMINAL = 78;
const RADIUS = 0.38, HEIGHT = 1.8;

export class Player {
  constructor(scene, world, audio, { shadows = true } = {}) {
    this.world = world;
    this.audio = audio;
    this.rig = new SpiderRig(scene, shadows);

    this.pos = new THREE.Vector3(0, 40, 0);
    this.vel = new THREE.Vector3();
    this.state = 'air';
    this.grounded = false;
    this.wallNormal = new THREE.Vector3();
    this.onWall = false;
    this.facing = 0;             // lacet du personnage
    this.lean = 0;
    this.dive = false;

    this.health = 100;
    this.webFluid = 100;
    this.punchTimer = 0;
    this.hurtTimer = 0;
    this.coyote = 0;
    this.stickCd = 0;
    this.slowSwing = 0;
    this.airTime = 0;
    this.lastLandImpact = 0;
    this.deaths = 0;

    this._near = [];
    this._v = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._dir = new THREE.Vector3();
    this.spawn(world.randomRoof(Math.random, 30));
  }

  spawn(p) {
    this.pos.copy(p);
    this.pos.y += 1.2;
    this.vel.set(0, 0, 0);
    this.state = 'air';
    this.health = 100;
  }

  get feetY() { return this.pos.y - HEIGHT / 2; }
  get speed() { return this.vel.length(); }

  hurt(n) {
    if (this.hurtTimer > 0) return;
    this.health = Math.max(0, this.health - n);
    this.hurtTimer = 0.6;
    this.audio.hurt();
    this.onHurt?.(n);
    if (this.health <= 0) this.die();
  }

  die() {
    this.deaths++;
    this.onDeath?.();
    const roof = this.world.randomRoof(Math.random, 20);
    this.spawn(roof);
  }

  /* ---------------------------------------------------------------- */
  /* Collisions : le joueur est une boîte alignée sur les axes,        */
  /* la ville aussi -> résolution par plus petite pénétration.         */
  /* ---------------------------------------------------------------- */
  _collide(dt) {
    const r = RADIUS, hh = HEIGHT / 2;
    this.onWall = false;
    let hitGround = false;
    const list = this.world.near(this.pos.x, this.pos.z, 6, this._near);

    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const b of list) {
        const ox = Math.min(this.pos.x + r, b.maxX) - Math.max(this.pos.x - r, b.minX);
        if (ox <= 0) continue;
        const oy = Math.min(this.pos.y + hh, b.maxY) - Math.max(this.pos.y - hh, b.minY);
        if (oy <= 0) continue;
        const oz = Math.min(this.pos.z + r, b.maxZ) - Math.max(this.pos.z - r, b.minZ);
        if (oz <= 0) continue;

        if (oy <= ox && oy <= oz) {
          const up = this.pos.y > (b.minY + b.maxY) / 2;
          this.pos.y += up ? oy : -oy;
          if (up) { hitGround = true; if (this.vel.y < 0) this.vel.y = 0; }
          else if (this.vel.y > 0) this.vel.y = 0;
        } else if (ox <= oz) {
          const right = this.pos.x > (b.minX + b.maxX) / 2;
          this.pos.x += right ? ox : -ox;
          this.wallNormal.set(right ? 1 : -1, 0, 0);
          this.onWall = true; this.wallBox = b;
          if ((right && this.vel.x < 0) || (!right && this.vel.x > 0)) this.vel.x = 0;
        } else {
          const front = this.pos.z > (b.minZ + b.maxZ) / 2;
          this.pos.z += front ? oz : -oz;
          this.wallNormal.set(0, 0, front ? 1 : -1);
          this.onWall = true; this.wallBox = b;
          if ((front && this.vel.z < 0) || (!front && this.vel.z > 0)) this.vel.z = 0;
        }
        moved = true;
      }
      if (!moved) break;
    }

    if (this.feetY < 0) { this.pos.y = HEIGHT / 2; if (this.vel.y < 0) this.vel.y = 0; hitGround = true; }

    // contact sol « souple » : évite de perdre l'état au sol entre deux frames
    if (!hitGround && this.vel.y <= 0.01) {
      const fy = this.feetY;
      if (fy < 0.12) hitGround = true;
      else for (const b of list) {
        if (this.pos.x + r > b.minX && this.pos.x - r < b.maxX &&
            this.pos.z + r > b.minZ && this.pos.z - r < b.maxZ &&
            fy - b.maxY < 0.14 && fy - b.maxY > -0.3) { hitGround = true; break; }
      }
    }
    return hitGround;
  }

  /* ---------------------------------------------------------------- */
  update(dt, input, cam, webs) {
    const wasGrounded = this.grounded;
    const mv = input.moveVector(this._v2);
    // base caméra projetée au sol
    cam.getWorldDirection(this._dir);
    const fx = this._dir.x, fz = this._dir.z;
    const fl = Math.hypot(fx, fz) || 1;
    const fwdX = fx / fl, fwdZ = fz / fl;
    const rightX = -fwdZ, rightZ = fwdX;
    const wishX = fwdX * mv.y + rightX * mv.x;
    const wishZ = fwdZ * mv.y + rightZ * mv.x;
    const wishLen = Math.hypot(wishX, wishZ);
    const sprint = input.is('sprint');
    this.dive = false;

    if (this.punchTimer > 0) { this.punchTimer -= dt; }
    if (this.stickCd > 0) this.stickCd -= dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    /* ---------------- balancement ---------------- */
    if (this.state === 'swing') {
      this.swingTime = (this.swingTime || 0) + dt;
      this.vel.y -= G_SWING * dt;
      const anchors = webs.activeAnchors();

      if (wishLen > 0) {
        // « Pomper » : la poussée doit être TANGENTE à la corde, sinon on tire
        // vers l'ancrage et le pendule perd toute son énergie.
        this._v.set(wishX, 0, wishZ);
        if (anchors.length) {
          this._v2.copy(this.pos).sub(anchors[0].point).normalize();
          this._v.addScaledVector(this._v2, -this._v.dot(this._v2));
        }
        this.vel.addScaledVector(this._v, 17 * dt);
      }
      // relance dans le sens du déplacement : le balancement ne s'éteint jamais.
      // Plafonnée : c'est une aide à l'entretien de l'élan, pas un réacteur.
      const hs = Math.hypot(this.vel.x, this.vel.z);
      if (mv.y > 0.2 && hs > 0.6 && hs < 30) {
        this.vel.x += (this.vel.x / hs) * 7 * dt;
        this.vel.z += (this.vel.z / hs) * 7 * dt;
      }

      for (const a of anchors) {
        const d = this._v.copy(this.pos).sub(a.point);
        const dist = d.length();
        if (dist > a.length) {
          d.multiplyScalar(1 / dist);
          this.pos.copy(a.point).addScaledVector(d, a.length);
          const radial = this.vel.dot(d);
          if (radial > 0) {
            // Une corde parfaitement rigide couperait net l'élan à l'accroche.
            // On récupère une partie de la vitesse radiale en vitesse tangentielle :
            // c'est ce qui fait qu'on « part » dans l'arc au lieu de piler.
            const tang = this._v2.copy(this.vel).addScaledVector(d, -radial);
            const tl = tang.length();
            this.vel.addScaledVector(d, -radial);
            if (tl > 0.5) this.vel.addScaledVector(tang.multiplyScalar(1 / tl), radial * 0.5);
          }
        }
        // enrouler / dérouler la toile (Z et S)
        if (mv.y > 0.2 || sprint) a.length = Math.max(11, a.length - (sprint ? 14 : 7) * dt);
        if (mv.y < -0.2) a.length = Math.min(60, a.length + 9 * dt);
        a.length = Math.min(a.length, Math.max(11, this.pos.distanceTo(a.point)));
      }
      this.vel.multiplyScalar(1 - 0.16 * dt);
      const sw = this.vel.length();
      if (sw > 62) this.vel.multiplyScalar(62 / sw);       // vitesse de balancement plafonnée

      // pendu sur place : on lâche plutôt que de rester ballant.
      // (anchors est vide tant que la toile se déploie : on ne compte que
      //  les toiles réellement tendues, sinon on annule chaque tir.)
      this.slowSwing = anchors.length && this.speed < 5 ? this.slowSwing + dt : 0;
      if (!webs.attached) { this.state = 'air'; this.slowSwing = 0; this.swingTime = 0; }
      else if (this.slowSwing > 0.9) {
        webs.releaseAll();
        this.slowSwing = 0;
        this.state = 'air';
      }
    }

    /* ---------------- toile-éclair ---------------- */
    else if (this.state === 'zip') {
      const t = webs.zipTarget;
      if (!t) this.state = 'air';
      else {
        const d = this._v.copy(t).sub(this.pos);
        const dist = d.length();
        d.multiplyScalar(1 / (dist || 1));
        const sp = clamp(28 + dist * 0.75, 30, 62);
        this.vel.copy(d).multiplyScalar(sp);
        this.vel.y += 2.5;                     // léger arc, plus lisible
        this.zipTimer -= dt;
        if (dist < 3.4 || this.zipTimer <= 0) {
          webs.endZip();
          this.state = 'air';
          this.vel.multiplyScalar(0.55);
          this.vel.y = Math.max(this.vel.y, 4);
        }
      }
    }

    /* ---------------- mur ---------------- */
    else if (this.state === 'wall') {
      const n = this.wallNormal;
      const rX = -n.z, rZ = n.x;                        // tangente horizontale
      const camUp = mv.y, camSide = mv.x;
      // « avant » sur le mur = vers le haut si la caméra regarde vers le haut
      const climbUp = camUp;
      this.vel.set(
        (rX * camSide) * CLIMB, climbUp * CLIMB, (rZ * camSide) * CLIMB
      );
      // collé au mur
      this.vel.addScaledVector(n, -2.2);
      this.webFluid = Math.min(100, this.webFluid + 6 * dt);

      // décrochage : plus de mur devant, ou bord franchi
      const probe = this.world.raycast(this.pos, this._v.copy(n).negate(), 1.3);
      if (!probe || probe.dist > RADIUS + 0.5) {
        // rebord atteint -> on se hisse sur le toit
        if (this.wallBox && this.pos.y - HEIGHT / 2 > this.wallBox.maxY - 0.4 && climbUp > 0) {
          this.pos.addScaledVector(n, -0.9);
          this.pos.y = this.wallBox.maxY + HEIGHT / 2 + 0.05;
          this.vel.set(0, 0, 0);
          this.state = 'ground';
        } else this.state = 'air';
      }
      if (input.once('jump')) {
        this.state = 'air';
        this.stickCd = 0.4;
        this.vel.copy(n).multiplyScalar(WALL_JUMP * 0.75);
        this.vel.y = WALL_JUMP;
        this.audio.jump();
      }
      if (input.is('sprint')) { this.state = 'air'; this.stickCd = 0.3; }   // se laisser tomber
    }

    /* ---------------- sol / air ---------------- */
    else {
      const onGround = this.state === 'ground';
      if (onGround) {
        const target = sprint ? SPRINT : RUN;
        const ax = wishX * target, az = wishZ * target;
        this.vel.x = damp(this.vel.x, ax, wishLen > 0 ? ACCEL / target : 14, dt);
        this.vel.z = damp(this.vel.z, az, wishLen > 0 ? ACCEL / target : 14, dt);
        this.vel.y -= G * dt * 0.2;
        if (input.once('jump')) {
          this.vel.y = JUMP; this.state = 'air'; this.coyote = 0; this.audio.jump();
        }
      } else {
        this.vel.y -= G * dt;
        this.vel.x += wishX * AIR_ACCEL * dt;
        this.vel.z += wishZ * AIR_ACCEL * dt;
        if (sprint) {                       // piqué : on plonge pour prendre de la vitesse
          this.dive = true;
          this.vel.x += fwdX * 26 * dt;
          this.vel.z += fwdZ * 26 * dt;
          this.vel.y -= 16 * dt;
        }
        const hs = Math.hypot(this.vel.x, this.vel.z);
        const capH = 46;
        if (hs > capH) { this.vel.x *= capH / hs; this.vel.z *= capH / hs; }
        if (this.coyote > 0 && input.once('jump')) {
          this.vel.y = JUMP; this.coyote = 0; this.audio.jump();
        }
      }
    }

    if (this.vel.y < -TERMINAL) this.vel.y = -TERMINAL;

    /* ---------------- intégration + collisions ---------------- */
    const sub = Math.max(1, Math.ceil((this.speed * dt) / 0.45));   // évite le tunneling
    const sdt = dt / sub;
    let grounded = false;
    for (let i = 0; i < sub; i++) {
      this.pos.addScaledVector(this.vel, sdt);
      grounded = this._collide(sdt) || grounded;
    }
    this.grounded = grounded;

    /* ---------------- transitions d'état ---------------- */
    if (this.state !== 'swing' && this.state !== 'zip') {
      if (grounded) {
        if (this.state !== 'ground') {
          const impact = Math.min(1, Math.abs(this.lastVy || 0) / 55);
          this.audio.land(impact);
          this.lastLandImpact = impact;
          this.onLand?.(impact, this.airTime);
          if (Math.abs(this.lastVy || 0) > 62) this.hurt(18);
          this.airTime = 0;
        }
        this.state = 'ground';
        this.coyote = 0.12;
      } else {
        if (this.state === 'ground') this.coyote = 0.12;
        this.coyote -= dt;
        this.airTime += dt;
        if (this.state !== 'wall') this.state = 'air';
        // accroche automatique aux murs (comportement d'araignée)
        if (this.onWall && this.state === 'air' && this.vel.y < 6 && this.stickCd <= 0) {
          this.state = 'wall';
          this.vel.multiplyScalar(0.1);
          this.audio.webhit();
        }
      }
    } else if (this.state === 'swing' && grounded && this.vel.y <= 0.5 && this.swingTime > 0.35) {
      webs.releaseAll();
      this.state = 'ground';
      this.slowSwing = 0;
      this.swingTime = 0;
    } else if (this.onWall && this.state === 'swing' && this.speed < 26) {
      webs.releaseAll();
      this.state = 'wall';
      this.vel.multiplyScalar(0.15);
    }
    this.lastVy = this.vel.y;

    /* ---------------- ressources ---------------- */
    // le fluide ne se consomme qu'au tir (voir main.js) et se régénère en continu
    this.webFluid = Math.min(100, this.webFluid + (this.state === 'ground' ? 22 : 14) * dt);
    if (this.state === 'ground' || this.state === 'wall') this.health = Math.min(100, this.health + 2.2 * dt);

    /* ---------------- orientation + animation ---------------- */
    let targetYaw = this.facing;
    if (this.state === 'wall') {
      targetYaw = Math.atan2(-this.wallNormal.x, -this.wallNormal.z);
    } else if (this.state === 'swing' || this.state === 'zip' || (this.state === 'air' && this.speed > 6)) {
      targetYaw = Math.atan2(this.vel.x, this.vel.z);
    } else if (wishLen > 0.1) {
      targetYaw = Math.atan2(wishX, wishZ);
    }
    let dy = ((targetYaw - this.facing + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    this.facing += dy * (1 - Math.exp(-11 * dt));

    // roulis dans les virages
    const turn = clamp(dy * 1.4, -1.1, 1.1);
    this.lean = damp(this.lean, this.state === 'swing' ? -turn * 0.8 : -turn * 0.35, 5, dt);

    this.rig.root.position.copy(this.pos);
    this.rig.root.position.y -= HEIGHT / 2;
    this.rig.root.rotation.y = this.facing;

    // le corps s'incline en piqué / balancement
    const pitchTarget =
      this.state === 'swing' ? clamp(-this.vel.y * 0.014, -0.5, 0.6)
      : this.state === 'zip' ? -0.7
      : this.state === 'air' && this.dive ? 1.15
      : this.state === 'wall' ? -Math.PI / 2 + 0.12
      : 0;
    this.rig.body.rotation.x = damp(this.rig.body.rotation.x, pitchTarget, 7, dt);
    if (this.state === 'wall') this.rig.body.position.y = damp(this.rig.body.position.y, -0.55, 8, dt);

    const animState = this.punchTimer > 0 ? 'punch' : this.state;
    this.rig.update({
      state: animState, speed: this.speed, dt, lean: this.lean, dive: this.dive,
      anchors: webs.handAnchors(), crouch: false,
    });

    // filet de sécurité
    if (this.pos.y < -40) this.die();
  }
}

export { RADIUS, HEIGHT };
