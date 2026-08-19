import * as THREE from 'three';
import { clamp } from './util.js';

const $ = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.el = {
      hud: $('hud'), health: $('bar-health'), web: $('bar-web'),
      score: $('score-val'), combo: $('combo'), comboVal: $('combo-val'), fuse: $('combo-fuse'),
      speed: $('speed-val'), objTitle: $('obj-title'), objText: $('obj-text'), objDist: $('obj-dist'),
      reticle: $('reticle'), toasts: $('toasts'), flash: $('damage-flash'),
      waypoint: $('waypoint'), wpDist: $('waypoint').querySelector('.wp-dist'),
      wpArrow: $('waypoint').querySelector('.wp-arrow'),
      minimap: $('minimap'), hint: $('hint'),
    };
    this.mm = this.el.minimap.getContext('2d');
    this.shownScore = 0;
    this._v = new THREE.Vector3();
  }

  show() { this.el.hud.classList.remove('hidden'); }
  hide() { this.el.hud.classList.add('hidden'); }
  hint(text) {
    this.el.hint.textContent = text || '';
    this.el.hint.style.opacity = text ? '0.75' : '0';
  }

  set(player, score, combo, comboFuse) {
    this.el.health.style.width = `${clamp(player.health, 0, 100)}%`;
    this.el.web.style.width = `${clamp(player.webFluid, 0, 100)}%`;
    this.shownScore += (score - this.shownScore) * 0.2;
    this.el.score.textContent = Math.round(this.shownScore).toLocaleString('fr-FR');
    this.el.speed.textContent = Math.round(player.speed * 3.6);
    if (combo > 1) {
      this.el.combo.classList.remove('hidden');
      this.el.comboVal.textContent = combo;
      this.el.fuse.style.width = `${clamp(comboFuse * 100, 0, 100)}%`;
    } else this.el.combo.classList.add('hidden');
  }

  objective(label, dist) {
    this.el.objText.textContent = label || '—';
    this.el.objDist.textContent = dist == null ? '' : `${Math.round(dist)} m`;
  }

  reticle(mode) {
    const r = this.el.reticle;
    r.className = '';
    if (mode) r.classList.add(mode);
  }

  toast(text, kind = '') {
    const d = document.createElement('div');
    d.className = `toast ${kind}`;
    d.textContent = text;
    this.el.toasts.appendChild(d);
    setTimeout(() => d.classList.add('fade'), 1500);
    setTimeout(() => d.remove(), 2000);
    while (this.el.toasts.children.length > 4) this.el.toasts.firstChild.remove();
  }

  flash() {
    this.el.flash.classList.add('on');
    setTimeout(() => this.el.flash.classList.remove('on'), 90);
  }

  /** Flèche de guidage : dans l'écran si visible, collée au bord sinon. */
  waypoint(camera, target) {
    const w = this.el.waypoint;
    if (!target) { w.style.display = 'none'; return; }
    w.style.display = 'block';
    const v = this._v.copy(target).project(camera);
    const W = window.innerWidth, H = window.innerHeight;
    const behind = v.z > 1;
    let x = (v.x * 0.5 + 0.5) * W;
    let y = (-v.y * 0.5 + 0.5) * H;
    if (behind) { x = W - x; y = H - y; }
    const cx = W / 2, cy = H / 2;
    const margin = 70;
    const onScreen = !behind && x > margin && x < W - margin && y > margin && y < H - margin;
    let angle = 0;
    if (!onScreen) {
      const dx = x - cx, dy = y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const sx = (W / 2 - margin) / Math.abs(dx || 1e-3);
      const sy = (H / 2 - margin) / Math.abs(dy || 1e-3);
      const s = Math.min(sx, sy);
      x = cx + dx * s; y = cy + dy * s;
      angle = Math.atan2(dy, dx) + Math.PI / 2;
    }
    w.style.left = `${x}px`;
    w.style.top = `${y}px`;
    w.style.transform = `translate(-50%,-50%) rotate(${angle}rad)`;
    w.style.opacity = onScreen ? '0.55' : '1';
  }

  /** Minimap orientée selon la caméra. */
  minimap(world, player, camYaw, missions, npcs) {
    const g = this.mm, S = this.el.minimap.width, R = S / 2;
    const scale = R / 190;                          // ~190 m de rayon
    g.clearRect(0, 0, S, S);
    g.save();
    g.beginPath(); g.arc(R, R, R - 1, 0, 7); g.clip();
    g.fillStyle = 'rgba(8,12,26,.72)'; g.fillRect(0, 0, S, S);
    g.translate(R, R);
    g.rotate(camYaw + Math.PI);

    const px = player.pos.x, pz = player.pos.z;
    g.fillStyle = 'rgba(150,165,200,.55)';
    for (const b of world.buildings) {
      const dx = b.x - px, dz = b.z - pz;
      if (Math.abs(dx) > 200 || Math.abs(dz) > 200) continue;
      const h = clamp(b.h / 130, 0.15, 1);
      g.fillStyle = `rgba(${120 + h * 120},${140 + h * 90},${190 + h * 60},${0.3 + h * 0.5})`;
      g.fillRect(dx * scale - (b.w * scale) / 2, dz * scale - (b.d * scale) / 2, b.w * scale, b.d * scale);
    }
    // voyous
    for (const n of npcs.pool) {
      if (!n.alive || n.state === 'cocon') continue;
      const dx = (n.pos.x - px) * scale, dz = (n.pos.z - pz) * scale;
      if (Math.hypot(dx, dz) > R) continue;
      g.fillStyle = n.kind === 'voyou' ? '#ff5a6e' : '#53d6ff';
      g.beginPath(); g.arc(dx, dz, 3, 0, 7); g.fill();
    }
    // objectif
    if (missions.hasTarget) {
      let dx = (missions.target.x - px) * scale, dz = (missions.target.z - pz) * scale;
      const d = Math.hypot(dx, dz);
      if (d > R - 8) { dx *= (R - 8) / d; dz *= (R - 8) / d; }
      g.fillStyle = '#ffd166';
      g.beginPath(); g.arc(dx, dz, 5, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,209,102,.5)'; g.lineWidth = 2;
      g.beginPath(); g.arc(dx, dz, 9, 0, 7); g.stroke();
    }
    g.restore();

    // joueur (toujours au centre, pointe vers le haut)
    g.save();
    g.translate(R, R);
    g.rotate(-(player.facing - camYaw) + Math.PI);
    g.fillStyle = '#ff4d63';
    g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 6); g.lineTo(0, 3); g.lineTo(-5, 6); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2;
    g.beginPath(); g.arc(R, R, R - 1, 0, 7); g.stroke();
  }
}
