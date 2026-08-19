import * as THREE from 'three';
import { mulberry32 } from './util.js';

const cv = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
};

const finish = (canvas, repeatX = 1, repeatY = 1) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

/** Une tuile de façade = FACADE_TILE mètres de côté, 2x2 fenêtres. */
export const FACADE_TILE = 5;

/**
 * Façades procédurales. Chaque style renvoie { map, emissive } où emissive
 * ne contient que les fenêtres allumées.
 */
export function makeFacade(style, seed = 1) {
  const S = 256, rng = mulberry32(seed);
  const [c, g] = cv(S, S);
  const [ce, ge] = cv(S, S);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, S, S);

  const palettes = {
    haussmann: { wall: '#cfc3a8', wall2: '#bdae90', trim: '#e6dcc4', glass: '#2b3347' },
    brick:     { wall: '#7a3b34', wall2: '#5f2d28', trim: '#c9b8a0', glass: '#232a3a' },
    concrete:  { wall: '#9aa0a8', wall2: '#848b94', trim: '#c2c7cd', glass: '#2a3445' },
    glass:     { wall: '#33506b', wall2: '#28405a', trim: '#5d7f9e', glass: '#4d7fa8' },
  };
  const p = palettes[style] || palettes.concrete;

  // mur de base + grain
  g.fillStyle = p.wall; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(0,0,0,${rng() * 0.06})`;
    g.fillRect(rng() * S, rng() * S, 2, 2);
  }
  // bandeaux horizontaux (étages)
  g.fillStyle = p.wall2;
  g.fillRect(0, S / 2 - 4, S, 6);
  g.fillRect(0, S - 4, S, 6);

  const half = S / 2;
  for (let gy = 0; gy < 2; gy++) {
    for (let gx = 0; gx < 2; gx++) {
      const ox = gx * half, oy = gy * half;
      const w = style === 'glass' ? half * 0.82 : half * 0.5;
      const h = style === 'haussmann' ? half * 0.62 : half * 0.48;
      const x = ox + (half - w) / 2, y = oy + (half - h) / 2 - 4;

      // encadrement
      g.fillStyle = p.trim;
      g.fillRect(x - 4, y - 4, w + 8, h + 8);
      // vitre + dégradé de ciel reflété
      const grd = g.createLinearGradient(x, y, x, y + h);
      grd.addColorStop(0, p.glass);
      grd.addColorStop(0.55, style === 'glass' ? '#7fb0d6' : '#3c4a63');
      grd.addColorStop(1, '#1a2130');
      g.fillStyle = grd;
      g.fillRect(x, y, w, h);
      // meneaux
      g.fillStyle = 'rgba(0,0,0,.35)';
      g.fillRect(x + w / 2 - 1, y, 2, h);
      if (style === 'haussmann') g.fillRect(x, y + h * 0.45, w, 2);
      // balcon
      if (style === 'haussmann' && gy === 0) {
        g.fillStyle = '#3a3a3a';
        for (let i = 0; i < 9; i++) g.fillRect(x - 4 + i * ((w + 8) / 9), y + h + 2, 2, 10);
        g.fillRect(x - 6, y + h + 1, w + 12, 3);
      }
      // fenêtre allumée ?
      if (rng() < 0.28) {
        const warm = rng() < 0.75 ? '#ffd9a0' : '#bfe6ff';
        ge.fillStyle = warm; ge.fillRect(x, y, w, h);
        g.fillStyle = warm; g.globalAlpha = 0.55; g.fillRect(x, y, w, h); g.globalAlpha = 1;
      }
    }
  }
  return { map: finish(c), emissive: finish(ce) };
}

/** Toiture : zinc / gravier avec joints. */
export function makeRoof(seed = 7) {
  const S = 128, rng = mulberry32(seed);
  const [c, g] = cv(S, S);
  g.fillStyle = '#4a4f57'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(255,255,255,${rng() * 0.08})`;
    g.fillRect(rng() * S, rng() * S, 2, 2);
  }
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2;
  for (let i = 0; i <= S; i += 32) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke();
  }
  return finish(c);
}

/** Bitume brut (le marquage est posé à part, aligné sur les vraies rues). */
export function makeAsphalt(seed = 3) {
  const S = 128, rng = mulberry32(seed);
  const [c, g] = cv(S, S);
  g.fillStyle = '#31343b'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(${rng() < 0.5 ? '255,255,255' : '0,0,0'},${rng() * 0.07})`;
    g.fillRect(rng() * S, rng() * S, 2, 2);
  }
  for (let i = 0; i < 12; i++) {           // réparations / rustines
    g.fillStyle = `rgba(0,0,0,${0.05 + rng() * 0.1})`;
    g.fillRect(rng() * S, rng() * S, rng() * 40 + 10, rng() * 30 + 8);
  }
  return finish(c);
}

/** Bande discontinue blanche (axe des rues). */
export function makeDash() {
  const [c, g] = cv(16, 64);
  g.clearRect(0, 0, 16, 64);
  g.fillStyle = '#e8e4d4';
  g.fillRect(4, 6, 8, 34);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Toile d'araignée du costume (rouge + lignes noires). */
export function makeSuit() {
  const S = 256;
  const [c, g] = cv(S, S);
  g.fillStyle = '#c8172c'; g.fillRect(0, 0, S, S);
  const grd = g.createRadialGradient(S / 2, S * 0.35, 10, S / 2, S / 2, S * 0.8);
  grd.addColorStop(0, '#e63a4e'); grd.addColorStop(1, '#9c1122');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(10,10,14,.85)'; g.lineWidth = 2.2;
  const cx = S / 2, cy = S / 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.beginPath(); g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * S, cy + Math.sin(a) * S); g.stroke();
  }
  for (let r = 18; r < S * 0.8; r += 20) {
    g.beginPath();
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rr = r * (0.94 + 0.06 * Math.cos(a * 6));
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  const t = finish(c, 2, 2);
  return t;
}

/** Emblème araignée (sur le torse), fond transparent. */
export function makeEmblem() {
  const S = 128;
  const [c, g] = cv(S, S);
  g.clearRect(0, 0, S, S);
  g.fillStyle = '#0b0c12';
  g.beginPath(); g.ellipse(S / 2, S / 2, 9, 15, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(S / 2, S / 2 - 17, 7, 8, 0, 0, 7); g.fill();
  g.strokeStyle = '#0b0c12'; g.lineWidth = 4; g.lineCap = 'round';
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const y = S / 2 - 10 + i * 8;
      const spread = 26 + i * 6;
      g.beginPath();
      g.moveTo(S / 2 + s * 6, y);
      g.quadraticCurveTo(S / 2 + s * spread, y - 12 + i * 5, S / 2 + s * (spread + 12), y + 12 + i * 3);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Ciel : dégradé fin de journée. Le milieu de l'image tombe pile sur
 * l'horizon de la sphère, sinon tout le doré passe sous le décor.
 */
export function makeSky() {
  const [c, g] = cv(16, 512);
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0.00, '#0e2a63');   // zénith
  grd.addColorStop(0.26, '#2a5ea8');
  grd.addColorStop(0.42, '#79a9d8');
  grd.addColorStop(0.480, '#cfe1ec');
  grd.addColorStop(0.500, '#f7d3a2');  // horizon
  grd.addColorStop(0.525, '#f0a768');
  grd.addColorStop(0.60, '#b06a5c');
  grd.addColorStop(0.78, '#4b3a45');
  grd.addColorStop(1.00, '#211d29');   // nadir
  g.fillStyle = grd; g.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Petit halo radial (particules, balises, impacts de toile). */
export function makeGlow(color = '#ffffff') {
  const S = 64;
  const [c, g] = cv(S, S);
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, color);
  grd.addColorStop(0.35, color + 'aa');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
