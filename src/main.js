import * as THREE from 'three';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { World } from './world.js';
import { Player } from './player.js';
import { WebSystem } from './web.js';
import { NpcManager } from './npc.js';
import { Missions } from './missions.js';
import { CameraRig } from './camera.js';
import { Hud } from './hud.js';
import { clamp, damp } from './util.js';

const $ = (id) => document.getElementById(id);

class Game {
  constructor() {
    this.canvas = $('scene');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 3200);

    this.mode = 'menu';                 // 'menu' | 'play' | 'pause'
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.shootCd = 0;
    this.topSpeed = 0;
    this.airDistance = 0;

    this.input = new Input(this.canvas);
    this.audio = new Audio();
    this.hud = new Hud();

    this._aim = new THREE.Vector3();
    this._org = new THREE.Vector3();
    this._hand = new THREE.Vector3();
    this.clock = new THREE.Clock();

    this._bindUi();
  }

  /* ------------------------------------------------------------------ */
  build(shadows) {
    this.renderer.shadowMap.enabled = shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.world = new World(this.scene, { shadows });
    this.webs = new WebSystem(this.scene, this.world, this.audio);
    this.player = new Player(this.scene, this.world, this.audio, { shadows });
    this.npcs = new NpcManager(this.scene, this.world, this.audio, this.webs, shadows);
    this.missions = new Missions(this.scene, this.world, this.npcs, this.audio);
    this.camRig = new CameraRig(this.camera, this.world);

    this.player.spawn(new THREE.Vector3(12, 66, 0));
    this.camRig.smooth.copy(this.player.pos);

    this.player.onHurt = () => { this.hud.flash(); this.camRig.addShake(0.5); this.breakCombo(); };
    this.player.onDeath = () => {
      this.hud.toast('Tu t\'es écrasé… retour sur les toits', 'bad');
      this.score = Math.max(0, this.score - 150);
      this.breakCombo();
    };
    this.player.onLand = (impact) => {
      if (impact > 0.25) this.camRig.addShake(impact * 0.8);
    };
    this.missions.onComplete = (pts, bonus) => {
      this.score += pts;
      this.hud.toast(`Mission accomplie  +${pts} (dont ${bonus} de temps)`, 'good');
    };
    this.missions.onBonus = (pts, label) => {
      this.score += pts;
      this.hud.toast(`${label}  +${pts}`, 'good');
    };
    this.missions.onFail = () => this.hud.toast('Temps écoulé !', 'bad');
    this.missions.onNew = (label) => this.hud.toast(`Nouvel objectif : ${label}`);
    this.npcs.onDefeat = (n, how) => {
      this.score += 120;
      this.missions._onDefeat(n);
      this.hud.toast(how === 'toile' ? 'Voyou emballé !' : 'Voyou mis K.-O. !', 'good');
    };

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* ------------------------------------------------------------------ */
  _bindUi() {
    $('play').addEventListener('click', () => this.start());
    $('resume').addEventListener('click', () => this.resume());
    $('restart').addEventListener('click', () => this.restart());
    $('sens').addEventListener('input', (e) => { this.input.sensitivity = parseFloat(e.target.value); });
    $('invert').addEventListener('change', (e) => { this.input.invertY = e.target.checked; });
    this.input.onLockChange = (locked) => {
      if (!locked && this.mode === 'play' && !this.input.freeLook) this.pause();
    };
    this.input.onFreeLook = () => {
      this.hud.hint('Visée libre : bouge la souris pour tourner (capture du pointeur indisponible)');
      setTimeout(() => this.hud.hint(''), 6000);
    };
  }

  start() {
    if (!this.world) {
      $('loading').classList.remove('hidden');
      const shadows = $('quality').checked;
      // laisse le navigateur peindre l'écran de chargement avant de bâtir la ville
      requestAnimationFrame(() => requestAnimationFrame(() => {
        this.build(shadows);
        $('loading').classList.add('hidden');
        this._go();
      }));
    } else this._go();
  }

  _go() {
    this.audio.init(); this.audio.resume();
    $('menu').classList.add('hidden');
    $('pause').classList.add('hidden');
    this.hud.show();
    this.mode = 'play';
    this.input.enabled = true;
    this.input.requestLock();
    this.hud.hint('Clic gauche maintenu = toile');
    setTimeout(() => this.hud.hint(''), 4000);
    if (!this.missions.current) this.missions.next(this.player);
    this.clock.getDelta();
  }

  pause() {
    if (this.mode !== 'play') return;
    this.mode = 'pause';
    this.input.enabled = false;
    $('pause-stats').innerHTML =
      `Score : <b>${Math.round(this.score).toLocaleString('fr-FR')}</b><br>` +
      `Missions accomplies : <b>${this.missions.completed}</b><br>` +
      `Vitesse maxi : <b>${Math.round(this.topSpeed * 3.6)} km/h</b><br>` +
      `Distance en vol : <b>${Math.round(this.airDistance)} m</b>`;
    $('pause').classList.remove('hidden');
  }

  resume() {
    $('pause').classList.add('hidden');
    this.mode = 'play';
    this.input.enabled = true;
    this.input.requestLock();
    this.clock.getDelta();
  }

  restart() {
    this.score = 0; this.combo = 1; this.comboTimer = 0;
    this.topSpeed = 0; this.airDistance = 0;
    this.npcs.pool.forEach((n) => n.despawn());
    this.missions.current = null;
    this.missions.completed = 0;
    this.missions.beacon.hide();
    this.missions.parcel.visible = false;
    this.webs.releaseAll();
    this.player.spawn(new THREE.Vector3(12, 66, 0));
    this.missions.next(this.player);
    this.resume();
  }

  /* ------------------------------------------------------------------ */
  bumpCombo() {
    this.combo = Math.min(8, this.combo + 1);
    this.comboTimer = 5;
  }
  breakCombo() { this.combo = 1; this.comboTimer = 0; }

  actions(dt) {
    const inp = this.input, p = this.player, webs = this.webs;
    const camPos = this.camera.position;
    const dir = this.camRig.aimDir(this._aim);
    // on tire depuis « devant » la caméra pour rester aligné avec le réticule
    const org = this._org.copy(camPos).addScaledVector(dir, this.camRig.dist * 0.9);

    // --- visée : réticule + aide à l'accroche ---
    const enemy = this.npcs.targetUnderAim(camPos, dir);
    const anchor = webs.updateAim(org, dir, p.pos);
    this.hud.reticle(
      webs.attached ? 'attached' : enemy ? 'enemy' : anchor ? 'can-web' : ''
    );

    // --- clic gauche : tisser / se balancer ---
    this.shootCd -= dt;
    if (inp.buttons[0]) {
      if (!webs.attached && this.shootCd <= 0 && p.state !== 'zip') {
        this.shootCd = 0.1;
        if (p.webFluid > 3 && webs.shoot(org, dir, p.pos, p.facing)) {
          p.webFluid -= 3;
          p.state = 'swing';
          p.swingTime = 0;
          p.stickCd = 0.35;      // on ne se recolle pas au mur qu'on vient de quitter
          if (p.grounded) { p.vel.y = Math.max(p.vel.y, 7.5); p.grounded = false; }  // on s'élance
          this.__attaches = (this.__attaches || 0) + 1;
          if (!p.grounded) this.bumpCombo();
        }
      } else if (webs.attached && p.state !== 'zip') {
        p.state = 'swing';
        // au sommet de l'arc (ancre derrière, joueur qui remonte) on lâche
        // tout seul : c'est ce qui donne son rythme au balancement.
        const vh = Math.hypot(p.vel.x, p.vel.z);
        if (vh > 7 && p.vel.y > 0.5) {
          for (const st of webs.activeAnchors()) {
            const dx = st.point.x - p.pos.x, dz = st.point.z - p.pos.z;
            const dh = Math.hypot(dx, dz) || 1;
            if ((dx * p.vel.x + dz * p.vel.z) / (dh * vh) < -0.3) webs.release(st);
          }
          if (!webs.attached) {
            p.state = 'air';
            p.vel.y += 1.8;
            this.shootCd = 0.05;
          }
        }
      }
    } else if (webs.attached && p.state === 'swing') {
      webs.releaseAll();
      p.state = 'air';
      if (p.vel.y > -2) p.vel.y += 2.6;          // relâcher au point bas = catapulte
    }

    // --- clic droit : toile-éclair ---
    if (inp.click(2) && p.webFluid > 10) {
      const t = webs.findAnchor(org, dir, p.pos, false);   // la toile-éclair accepte tout
      if (t) {
        webs.releaseAll();
        webs.startZip(t);
        p.state = 'zip';
        p.zipTimer = 1.6;
        p.webFluid -= 10;
        this.bumpCombo();
        this.camRig.addShake(0.25);
      }
    }

    // --- espace : lâcher la toile ---
    if (p.state === 'swing' && inp.once('jump')) {
      webs.releaseAll();
      p.state = 'air';
      p.vel.y += 6;
      this.audio.jump();
    }

    // --- E : coup / F : tir de toile ---
    if (inp.once('punch') && p.punchTimer <= 0) {
      p.punchTimer = 0.34;
      const hits = this.npcs.meleeAt(p.pos, 3.6);
      if (!hits) this.audio.punch();
      else this.camRig.addShake(0.3);
    }
    if (inp.once('shoot') && p.webFluid > 8) {
      if (enemy) {
        p.webFluid -= 8;
        this.npcs.webTag(enemy, this.player.rig.handWorld('R', this._hand).clone());
      } else if (anchor) {
        // sinon, simple fil décoratif tiré vers le point visé
        p.webFluid -= 4;
        this.webs.fireBolt(this.player.rig.handWorld('R', this._hand).clone(), anchor, null);
      }
    }

    // --- R : se remettre en place ---
    if (inp.once('reset')) {
      webs.releaseAll();
      const roof = this.world.randomRoof(Math.random, p.pos.y - 20);
      p.spawn(roof);
      this.hud.toast('Repositionné sur un toit');
    }

    // --- divers ---
    if (inp.keyOnce('m')) this.hud.toast(this.audio.toggleMute() ? 'Son coupé' : 'Son activé');
    if (inp.keyOnce('p')) { this.input.releaseLock(); this.pause(); }
  }

  /* ------------------------------------------------------------------ */
  /** Un pas de simulation (sans rendu) : sert aussi aux tests headless. */
  step(dt) {
    const t0 = performance.now();
    this.actions(dt);
    this.camRig.update(dt, this.player, this.input);
    this.player.update(dt, this.input, this.camera, this.webs);
    this.webs.update(dt, this.player.rig, this.player.pos);
    this.npcs.update(dt, this.player);
    this.missions.update(dt, this.player);
    this.world.update(dt, this.player.pos);

    // style : on marque des points en restant en l'air, vite
    const sp = this.player.speed;
    this.topSpeed = Math.max(this.topSpeed, sp);
    const flying = this.player.state === 'swing' || this.player.state === 'zip' ||
                   (this.player.state === 'air' && this.player.pos.y > 4);
    if (flying) {
      this.airDistance += sp * dt;
      if (sp > 14) this.score += sp * dt * 0.7 * this.combo;
    }
    this.comboTimer -= dt * (this.player.state === 'ground' || this.player.state === 'wall' ? 2.5 : 1);
    if (this.comboTimer <= 0 && this.combo > 1) this.breakCombo();

    this.audio.setWind(sp);

    this.hud.set(this.player, this.score, this.combo, this.comboTimer / 5);
    this.hud.objective(
      this.missions.label,
      this.missions.hasTarget ? this.player.pos.distanceTo(this.missions.target) : null
    );
    this.hud.waypoint(this.camera, this.missions.hasTarget ? this.missions.target : null);
    this.hud.minimap(this.world, this.player, this.camRig.yaw, this.missions, this.npcs);
    this.input.endFrame();
    this.__logicMs = (this.__logicMs || 0) * 0.9 + (performance.now() - t0) * 0.1;
  }

  frame() {
    requestAnimationFrame(() => this.frame());
    if (!this.world) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    if (this.mode === 'play') this.step(dt);
    this.renderer.render(this.scene, this.camera);
  }
}

const game = new Game();
game.frame();
$('loading').classList.add('hidden');   // modules chargés : place au menu
window.game = game;
