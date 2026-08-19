// Gestion clavier / souris / trackpad.
// On lit event.key (et pas event.code) pour respecter la disposition AZERTY :
// Z = avancer, S = reculer, Q = gauche, D = droite.

const ACTIONS = {
  forward: ['z', 'w', 'arrowup'],
  back:    ['s', 'arrowdown'],
  left:    ['q', 'a', 'arrowleft'],
  right:   ['d', 'arrowright'],
  jump:    [' ', 'spacebar'],
  sprint:  ['shift'],
  punch:   ['e'],
  shoot:   ['f'],
  reset:   ['r'],
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();          // touches consommées une seule fois (edge)
    this.mouse = { dx: 0, dy: 0, wheel: 0 };
    this.buttons = [false, false, false];
    this.clicked = [false, false, false];
    this.locked = false;
    this.freeLook = false;      // repli quand la capture du pointeur est refusée
    this.sensitivity = 1;
    this.invertY = false;
    this.enabled = false;

    this._onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
      if (k === ' ' || k.startsWith('arrow') || k === 'tab') e.preventDefault();
    };
    this._onKeyUp = (e) => this.keys.delete(e.key.toLowerCase());
    this._onBlur = () => { this.keys.clear(); this.buttons = [false, false, false]; };

    this._onMove = (e) => {
      if ((!this.locked && !this.freeLook) || !this.enabled) return;
      // movementX/Y : identique souris et trackpad une fois le pointeur verrouillé
      this.mouse.dx += e.movementX * 0.0022 * this.sensitivity;
      this.mouse.dy += e.movementY * 0.0022 * this.sensitivity * (this.invertY ? -1 : 1);
    };
    this._onDown = (e) => {
      if (!this.enabled) return;
      if (!this.locked && !this.freeLook) { this.requestLock(); return; }
      if (e.button < 3) { this.buttons[e.button] = true; this.clicked[e.button] = true; }
      e.preventDefault();
    };
    this._onUp = (e) => { if (e.button < 3) this.buttons[e.button] = false; };
    this._onWheel = (e) => {
      if (!this.enabled) return;
      this.mouse.wheel += Math.sign(e.deltaY) * Math.min(1, Math.abs(e.deltaY) / 50);
      e.preventDefault();
    };
    this._onLockChange = () => {
      this.locked = document.pointerLockElement === this.canvas;
      if (!this.locked) this.buttons = [false, false, false];
      this.onLockChange?.(this.locked);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    document.addEventListener('mousemove', this._onMove);
    canvas.addEventListener('mousedown', this._onDown);
    window.addEventListener('mouseup', this._onUp);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', this._onLockChange);
  }

  requestLock() {
    if (this.locked || this.freeLook) return;
    try {
      const p = this.canvas.requestPointerLock?.();
      if (p && p.catch) p.catch(() => {});
    } catch { /* ignoré : on bascule en visée libre juste après */ }
    // certains contextes (iframe restreinte) refusent la capture : on joue
    // alors en « visée libre », la souris orientant la caméra sans être captée.
    clearTimeout(this._lockTimer);
    this._lockTimer = setTimeout(() => {
      if (!this.locked) { this.freeLook = true; this.onFreeLook?.(); }
    }, 500);
  }
  releaseLock() { if (this.locked) document.exitPointerLock(); }

  is(action) { return ACTIONS[action].some((k) => this.keys.has(k)); }
  once(action) {
    const hit = ACTIONS[action].some((k) => this.pressed.has(k));
    if (hit) ACTIONS[action].forEach((k) => this.pressed.delete(k));
    return hit;
  }
  keyOnce(k) { const hit = this.pressed.has(k); this.pressed.delete(k); return hit; }
  click(btn) { const c = this.clicked[btn]; this.clicked[btn] = false; return c; }

  /** Vecteur de déplacement brut (x = droite, y = avant), normalisé. */
  moveVector(out) {
    let x = 0, y = 0;
    if (this.is('forward')) y += 1;
    if (this.is('back')) y -= 1;
    if (this.is('right')) x += 1;
    if (this.is('left')) x -= 1;
    const l = Math.hypot(x, y);
    if (l > 0) { x /= l; y /= l; }
    out.set(x, y);
    return out;
  }

  /** À appeler en fin de frame : consomme les deltas. */
  endFrame() {
    this.mouse.dx = 0; this.mouse.dy = 0; this.mouse.wheel = 0;
    this.pressed.clear();
    this.clicked = [false, false, false];
  }
}
