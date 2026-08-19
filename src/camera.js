import * as THREE from 'three';
import { clamp, damp } from './util.js';

/**
 * Caméra 3e personne : orbite autour du joueur, évite les murs,
 * et « respire » avec la vitesse (FOV + secousses).
 */
export class CameraRig {
  constructor(camera, world) {
    this.cam = camera;
    this.world = world;
    this.yaw = 0;
    this.pitch = -0.12;
    this.dist = 6.4;
    this.wantDist = 6.4;
    this.target = new THREE.Vector3();
    this.smooth = new THREE.Vector3(0, 40, 0);
    this.shake = 0;
    this.baseFov = 68;
    this._v = new THREE.Vector3();
    this._d = new THREE.Vector3();
    this._hit = {};
  }

  addShake(v) { this.shake = Math.min(1.2, this.shake + v); }

  update(dt, player, input) {
    this.yaw -= input.mouse.dx;
    this.pitch = clamp(this.pitch - input.mouse.dy, -1.25, 1.15);
    this.wantDist = clamp(this.wantDist + input.mouse.wheel * 0.9, 3.2, 13);

    // cible : un peu au-dessus du joueur, décalée dans le sens de la vitesse
    this.target.copy(player.pos);
    this.target.y += player.state === 'swing' ? 0.2 : 0.55;
    const lead = player.state === 'swing' || player.state === 'zip' ? 0.09 : 0.04;
    this.target.addScaledVector(player.vel, lead);

    const k = player.state === 'swing' ? 9 : 13;
    this.smooth.x = damp(this.smooth.x, this.target.x, k, dt);
    this.smooth.y = damp(this.smooth.y, this.target.y, k * 0.8, dt);
    this.smooth.z = damp(this.smooth.z, this.target.z, k, dt);

    // recul supplémentaire à grande vitesse
    const sp = player.speed;
    const want = this.wantDist + clamp(sp * 0.055, 0, 2.6);
    this._d.set(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      -Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    // collision : on rapproche la caméra si un immeuble s'interpose
    let d = want;
    const hit = this.world.raycast(this.smooth, this._d, want + 0.6, this._hit);
    if (hit) d = Math.max(1.6, hit.dist - 0.5);
    this.dist = damp(this.dist, d, hit ? 24 : 6, dt);

    this.cam.position.copy(this.smooth).addScaledVector(this._d, this.dist);
    if (this.cam.position.y < 1.2) this.cam.position.y = 1.2;
    this.cam.lookAt(this.smooth);

    // secousses
    if (this.shake > 0.001) {
      const s = this.shake * 0.35;
      this.cam.position.x += (Math.random() - 0.5) * s;
      this.cam.position.y += (Math.random() - 0.5) * s;
      this.cam.position.z += (Math.random() - 0.5) * s;
      this.shake = damp(this.shake, 0, 6, dt);
    }

    // champ de vision qui s'ouvre avec la vitesse
    const fov = this.baseFov + clamp((sp - 12) * 0.55, 0, 22);
    this.cam.fov = damp(this.cam.fov, fov, 5, dt);
    this.cam.updateProjectionMatrix();
  }

  /** Direction de visée (depuis la caméra). */
  aimDir(out) { return this.cam.getWorldDirection(out); }
}
