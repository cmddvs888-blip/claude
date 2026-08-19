// Sons 100% synthétisés (WebAudio) : aucun fichier externe.

export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
    this.windGain = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    this._noiseBuffer = this._makeNoise(2);
    this._startWind();
  }

  resume() { this.ctx?.resume?.(); }
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  _makeNoise(seconds) {
    const n = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _noise(dur, { type = 'bandpass', freq = 1200, q = 1, gain = 0.3, sweep = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    src.loop = true;
    const flt = this.ctx.createBiquadFilter();
    flt.type = type; flt.frequency.value = freq; flt.Q.value = q;
    if (sweep) flt.frequency.exponentialRampToValueAtTime(Math.max(60, freq * sweep), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(flt).connect(g).connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  _tone(f0, f1, dur, { type = 'sine', gain = 0.22, delay = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  _startWind() {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer; src.loop = true;
    const flt = this.ctx.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = 480; flt.Q.value = 0.6;
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;
    src.connect(flt).connect(this.windGain).connect(this.master);
    this.windFilter = flt;
    src.start();
  }

  /** Bruit de vent proportionnel à la vitesse (m/s). */
  setWind(speed) {
    if (!this.windGain) return;
    const t = this.ctx.currentTime;
    const v = Math.min(1, Math.max(0, (speed - 8) / 42));
    this.windGain.gain.setTargetAtTime(v * 0.32, t, 0.15);
    this.windFilter.frequency.setTargetAtTime(380 + v * 900, t, 0.2);
  }

  thwip()   { this._noise(0.17, { freq: 2600, q: 1.4, gain: 0.3, sweep: 0.22 }); this._tone(1500, 380, 0.13, { type: 'sawtooth', gain: 0.07 }); }
  attach()  { this._tone(220, 90, 0.14, { type: 'square', gain: 0.12 }); this._noise(0.1, { freq: 900, gain: 0.18, sweep: 0.4 }); }
  release() { this._noise(0.14, { freq: 700, gain: 0.13, sweep: 2.2 }); }
  jump()    { this._tone(300, 620, 0.14, { type: 'triangle', gain: 0.13 }); }
  land(f)   { this._noise(0.2, { type: 'lowpass', freq: 300 + f * 500, gain: 0.1 + f * 0.3, sweep: 0.3 }); }
  zip()     { this._tone(180, 900, 0.3, { type: 'sawtooth', gain: 0.1 }); this._noise(0.3, { freq: 1800, gain: 0.18, sweep: 3 }); }
  punch()   { this._noise(0.12, { type: 'lowpass', freq: 700, gain: 0.35, sweep: 0.25 }); this._tone(140, 60, 0.12, { type: 'square', gain: 0.14 }); }
  pickup()  { this._tone(660, 990, 0.1, { type: 'triangle', gain: 0.16 }); this._tone(990, 1320, 0.12, { type: 'triangle', gain: 0.13, delay: 0.09 }); }
  success() { [523, 659, 784, 1046].forEach((f, i) => this._tone(f, f, 0.18, { type: 'triangle', gain: 0.15, delay: i * 0.085 })); }
  hurt()    { this._tone(200, 70, 0.25, { type: 'sawtooth', gain: 0.2 }); }
  alert()   { this._tone(880, 880, 0.1, { type: 'square', gain: 0.1 }); this._tone(660, 660, 0.14, { type: 'square', gain: 0.1, delay: 0.13 }); }
  webhit()  { this._noise(0.16, { freq: 1400, q: 2, gain: 0.22, sweep: 0.3 }); }
}
