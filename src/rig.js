import * as THREE from 'three';
import { makeSuit, makeEmblem } from './textures.js';
import { damp, clamp, lerp } from './util.js';

const RED = 0xcf1a2e, BLUE = 0x14307d, BLACK = 0x0d0e14, WHITE = 0xf2f6ff;

/** Petit utilitaire : un membre suspendu à un pivot. */
function limb(parent, len, radius, mat, cast = true) {
  const pivot = new THREE.Object3D();
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len - radius * 2, 4, 8), mat);
  mesh.position.y = -len / 2;
  mesh.castShadow = cast;
  pivot.add(mesh);
  parent.add(pivot);
  return pivot;
}

/**
 * Le corps de Spider Neuille : construit à partir de primitives et animé
 * de façon procédurale (aucun fichier d'animation).
 */
export class SpiderRig {
  constructor(scene, castShadow = true) {
    const suit = makeSuit();
    this.matRed = new THREE.MeshStandardMaterial({ map: suit, color: 0xffffff, roughness: 0.55 });
    this.matBlue = new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.6 });
    this.matBlack = new THREE.MeshStandardMaterial({ color: BLACK, roughness: 0.5 });
    this.matWhite = new THREE.MeshStandardMaterial({
      color: WHITE, roughness: 0.25, emissive: 0x223355, emissiveIntensity: 0.35,
    });

    const root = new THREE.Group();
    this.root = root;
    const body = new THREE.Group();          // tout ce qui s'incline / tourne
    root.add(body);
    this.body = body;

    // ---- tronc ----
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.18, 0.20), this.matBlue);
    hips.position.y = 0.92; hips.castShadow = castShadow; body.add(hips);

    const spine = new THREE.Object3D();
    spine.position.y = 0.99; body.add(spine);
    this.spine = spine;

    const abdo = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.14, 4, 10), this.matRed);
    abdo.position.y = 0.11; abdo.scale.set(1, 1, 0.72); abdo.castShadow = castShadow; spine.add(abdo);

    const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.175, 0.16, 4, 10), this.matRed);
    chest.position.y = 0.33; chest.scale.set(1.05, 1, 0.74); chest.castShadow = castShadow; spine.add(chest);

    // emblème araignée
    const emblem = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      new THREE.MeshBasicMaterial({ map: makeEmblem(), transparent: true, depthWrite: false })
    );
    emblem.position.set(0, 0.33, 0.135); spine.add(emblem);

    // ---- tête ----
    const neck = new THREE.Object3D();
    neck.position.y = 0.47; spine.add(neck);
    this.neck = neck;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 14), this.matRed);
    head.scale.set(0.95, 1.08, 1);
    head.position.y = 0.11; head.castShadow = castShadow; neck.add(head);
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), this.matWhite);
      eye.scale.set(1.15, 0.78, 0.5);
      eye.position.set(s * 0.062, 0.125, 0.108);
      eye.rotation.z = s * -0.22;
      neck.add(eye);
      const rim = new THREE.Mesh(new THREE.SphereGeometry(0.069, 12, 10), this.matBlack);
      rim.scale.set(1.15, 0.78, 0.44);
      rim.position.set(s * 0.062, 0.125, 0.1);
      rim.rotation.z = s * -0.22;
      neck.add(rim);
    }

    // ---- bras ----
    this.arms = {};
    for (const side of ['L', 'R']) {
      const s = side === 'L' ? 1 : -1;
      const shoulder = new THREE.Object3D();
      shoulder.position.set(s * 0.185, 0.40, 0);
      spine.add(shoulder);
      const upper = limb(shoulder, 0.30, 0.058, this.matRed, castShadow);
      const elbow = new THREE.Object3D(); elbow.position.y = -0.30; upper.add(elbow);
      const fore = limb(elbow, 0.27, 0.05, this.matRed, castShadow);
      const hand = new THREE.Object3D(); hand.position.y = -0.27; fore.add(hand);
      const glove = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), this.matBlue);
      glove.scale.set(0.85, 1.1, 0.75); glove.position.y = -0.03; hand.add(glove);
      // lance-toile au poignet
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.05, 10), this.matBlack);
      band.position.y = 0.02; hand.add(band);
      this.arms[side] = { shoulder, upper, elbow, fore, hand };
    }

    // ---- jambes ----
    this.legs = {};
    for (const side of ['L', 'R']) {
      const s = side === 'L' ? 1 : -1;
      const hip = new THREE.Object3D();
      hip.position.set(s * 0.095, 0.88, 0);
      body.add(hip);
      const thigh = limb(hip, 0.45, 0.078, this.matBlue, castShadow);
      const knee = new THREE.Object3D(); knee.position.y = -0.45; thigh.add(knee);
      const shin = limb(knee, 0.42, 0.062, this.matBlue, castShadow);
      const ankle = new THREE.Object3D(); ankle.position.y = -0.42; shin.add(ankle);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.06, 0.23), this.matRed);
      foot.position.set(0, -0.03, 0.045); foot.castShadow = castShadow; ankle.add(foot);
      this.legs[side] = { hip, thigh, knee, shin, ankle };
    }

    scene.add(root);

    this.phase = 0;
    this._q = new THREE.Quaternion();
    this._v = new THREE.Vector3();
    this._down = new THREE.Vector3(0, -1, 0);
    this._tmp = new THREE.Object3D();
    this._e = new THREE.Euler();
  }

  /** Oriente une épaule pour que le bras pointe vers une cible (monde). */
  aimArm(side, targetWorld) {
    const a = this.arms[side];
    a.shoulder.getWorldPosition(this._v);
    const dir = this._tmp.position.copy(targetWorld).sub(this._v).normalize();
    // conversion monde -> local de l'épaule
    const parentQ = a.shoulder.parent.getWorldQuaternion(this._q).invert();
    dir.applyQuaternion(parentQ);
    a.shoulder.quaternion.setFromUnitVectors(this._down, dir);
    a.elbow.rotation.x = damp(a.elbow.rotation.x, -0.12, 14, 0.016);
  }

  /**
   * Pose procédurale.
   * @param {object} p { state, speed, dt, lean, anchors:{L,R}, wallNormal, crouch }
   */
  update(p) {
    const dt = Math.min(p.dt, 0.05);
    const { state, speed } = p;
    const L = this.legs.L, R = this.legs.R, AL = this.arms.L, AR = this.arms.R;
    const set = (o, x, z = 0, k = 12) => {
      o.rotation.x = damp(o.rotation.x, x, k, dt);
      o.rotation.z = damp(o.rotation.z, z, k, dt);
    };

    if (state === 'ground') {
      const run = clamp(speed / 9, 0, 1.4);
      this.phase += dt * (4.5 + speed * 1.15);
      const s = Math.sin(this.phase), c = Math.cos(this.phase);
      const amp = 0.28 + run * 0.62;
      set(L.thigh, s * amp, 0, 18);
      set(R.thigh, -s * amp, 0, 18);
      set(L.knee, -Math.max(0, -s) * amp * 1.9 - 0.08, 0, 18);
      set(R.knee, -Math.max(0, s) * amp * 1.9 - 0.08, 0, 18);
      set(L.ankle, c * 0.2, 0, 14);
      set(R.ankle, -c * 0.2, 0, 14);
      AL.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(-s * amp * 0.9, 0, 0.12)), 1 - Math.exp(-16 * dt));
      AR.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(s * amp * 0.9, 0, -0.12)), 1 - Math.exp(-16 * dt));
      set(AL.elbow, -0.35 - run * 0.5, 0, 14);
      set(AR.elbow, -0.35 - run * 0.5, 0, 14);
      this.spine.rotation.x = damp(this.spine.rotation.x, -run * 0.42 - (p.crouch ? 0.5 : 0), 10, dt);
      this.neck.rotation.x = damp(this.neck.rotation.x, run * 0.3, 10, dt);
      this.spine.rotation.z = damp(this.spine.rotation.z, Math.sin(this.phase) * 0.05, 10, dt);
      this.body.position.y = damp(this.body.position.y, Math.abs(s) * 0.035 * run - (p.crouch ? 0.3 : 0), 12, dt);
      this.body.rotation.z = damp(this.body.rotation.z, 0, 10, dt);
    }

    else if (state === 'swing' || state === 'zip') {
      // corps tendu vers l'arrière, jambes qui traînent
      const anchors = p.anchors || {};
      if (anchors.L) this.aimArm('L', anchors.L); else set(AL.shoulder, -2.3, 0.5, 10);
      if (anchors.R) this.aimArm('R', anchors.R); else set(AR.shoulder, -2.3, -0.5, 10);
      this.phase += dt * 3;
      const s = Math.sin(this.phase) * 0.12;
      set(L.thigh, -0.55 + s, 0.12, 8);
      set(R.thigh, -0.15 - s, -0.18, 8);
      set(L.knee, -0.95 - s, 0, 8);
      set(R.knee, -1.55 + s, 0, 8);
      set(L.ankle, 0.4); set(R.ankle, 0.5);
      this.spine.rotation.x = damp(this.spine.rotation.x, 0.30, 8, dt);
      this.neck.rotation.x = damp(this.neck.rotation.x, -0.35, 8, dt);
      this.body.position.y = damp(this.body.position.y, 0, 10, dt);
    }

    else if (state === 'wall') {
      // araignée plaquée : membres écartés, cycle de reptation
      this.phase += dt * (2 + speed * 2.2);
      const s = Math.sin(this.phase), c = Math.cos(this.phase);
      set(L.thigh, -0.5 + s * 0.35, 0.55, 12);
      set(R.thigh, -0.5 - s * 0.35, -0.55, 12);
      set(L.knee, -1.15 - Math.max(0, s) * 0.4, 0, 12);
      set(R.knee, -1.15 - Math.max(0, -s) * 0.4, 0, 12);
      set(L.ankle, 0.5); set(R.ankle, 0.5);
      AL.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(-2.5 - c * 0.4, 0, 0.95)), 1 - Math.exp(-12 * dt));
      AR.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(-2.5 + c * 0.4, 0, -0.95)), 1 - Math.exp(-12 * dt));
      set(AL.elbow, -0.8, 0, 12); set(AR.elbow, -0.8, 0, 12);
      this.spine.rotation.x = damp(this.spine.rotation.x, 0.15, 10, dt);
      this.neck.rotation.x = damp(this.neck.rotation.x, -0.55, 10, dt);
      this.body.position.y = damp(this.body.position.y, 0, 10, dt);
    }

    else if (state === 'punch') {
      set(L.thigh, 0.45, 0.15, 16); set(R.thigh, -0.5, -0.12, 16);
      set(L.knee, -0.5); set(R.knee, -0.35);
      AR.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(-1.75, 0, -0.15)), 1 - Math.exp(-30 * dt));
      AL.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(0.9, 0, 0.4)), 1 - Math.exp(-24 * dt));
      set(AR.elbow, -0.15, 0, 26); set(AL.elbow, -1.5, 0, 20);
      this.spine.rotation.x = damp(this.spine.rotation.x, -0.25, 16, dt);
      this.spine.rotation.y = damp(this.spine.rotation.y, -0.45, 18, dt);
    }

    else { // 'air' : chute, piqué, saut
      const dive = p.dive ? 1 : 0;
      this.phase += dt * 2;
      set(L.thigh, -0.25 + dive * -0.6 + Math.sin(this.phase) * 0.1, 0.2, 8);
      set(R.thigh, -0.55 - dive * 0.3 - Math.sin(this.phase) * 0.1, -0.25, 8);
      set(L.knee, -0.7 + dive * 0.6, 0, 8);
      set(R.knee, -1.35 + dive * 1.1, 0, 8);
      set(L.ankle, 0.35); set(R.ankle, 0.35);
      const ax = dive ? -2.9 : -1.5;
      AL.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(ax, 0, 0.75 - dive * 0.4)), 1 - Math.exp(-9 * dt));
      AR.shoulder.quaternion.slerp(this._q.setFromEuler(this._e.set(ax, 0, -0.75 + dive * 0.4)), 1 - Math.exp(-9 * dt));
      set(AL.elbow, -0.55 + dive * 0.5, 0, 9);
      set(AR.elbow, -0.55 + dive * 0.5, 0, 9);
      this.spine.rotation.x = damp(this.spine.rotation.x, dive ? 0.5 : -0.1, 8, dt);
      this.neck.rotation.x = damp(this.neck.rotation.x, dive ? -0.6 : 0.1, 8, dt);
      this.body.position.y = damp(this.body.position.y, 0, 10, dt);
    }

    if (state !== 'punch') this.spine.rotation.y = damp(this.spine.rotation.y, 0, 10, dt);
    // inclinaison globale du corps (roulis dans les virages)
    this.body.rotation.z = damp(this.body.rotation.z, p.lean || 0, 6, dt);
  }

  /** Position monde d'une main (départ des toiles). */
  handWorld(side, out) { return this.arms[side].hand.getWorldPosition(out); }
}
