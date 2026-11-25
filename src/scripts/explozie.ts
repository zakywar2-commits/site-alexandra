// Animațiile casei explodate: (1) la scroll, (2) construirea planului la click.
import * as THREE from 'three';
import { buildHouse, type Model, type Piece } from './modele/casa760';
import { buildColumbariu } from './modele/columbariu';
import { buildKarate } from './modele/karate';

export const MODELS: Record<string, () => Model> = {
  comana: buildHouse,
  columbariu: buildColumbariu,
  'casa-karatistului': buildKarate,
};

/** straturile care devin poché (închise la culoare) când sunt secționate în plan */
const POCHE_LAYERS = new Set(['pereti-ext', 'pereti-int', 'ziduri', 'turn', 'pereti']);

type Lang = 'ro' | 'en';
const BG = 0xf4f1ec;
const POCHE = new THREE.Color(0x3a3733);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

interface Prepared extends Piece {
  mats: { m: THREE.Material & { opacity: number; color?: THREE.Color }; o: number; c?: THREE.Color }[];
}

/** fiecare piesă primește materiale proprii, ca să poată fi estompată și secționată separat */
function prepare(pieces: Piece[], planes: Map<number, THREE.Plane>): Prepared[] {
  return pieces.map((p) => {
    const mats: Prepared['mats'] = [];
    let plane: THREE.Plane | undefined;
    if (p.cut !== undefined) {
      if (!planes.has(p.cut)) planes.set(p.cut, new THREE.Plane(new THREE.Vector3(0, -1, 0), 100000));
      plane = planes.get(p.cut);
    }
    p.obj.traverse((o) => {
      const any = o as THREE.Mesh;
      if (!any.material) return;
      const m = (any.material as THREE.Material).clone() as Prepared['mats'][number]['m'];
      m.transparent = m.opacity < 0.999;
      if ('side' in m && o instanceof THREE.Mesh) (m as THREE.MeshLambertMaterial).side = THREE.DoubleSide;
      if (plane) m.clippingPlanes = [plane];
      any.material = m;
      mats.push({ m, o: m.opacity, c: m.color ? m.color.clone() : undefined });
    });
    return { ...p, mats };
  });
}

function setOpacity(p: Prepared, k: number) {
  for (const { m, o } of p.mats) {
    m.opacity = o * k;
    m.transparent = m.opacity < 0.999;
    m.visible = k > 0.002;
  }
}

function setup(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(BG, 1);
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-600, 1400, 900);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(800, 400, -700);
  scene.add(fill);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10000, 10000);
  return { renderer, scene, camera };
}

/** plasează camera ortografică pe o sferă și potrivește cadrul */
function placeCamera(cam: THREE.OrthographicCamera, aspect: number, elev: number, azim: number, fitW: number, fitH: number, target: THREE.Vector3) {
  const r = 3000;
  cam.position.set(
    target.x + r * Math.cos(elev) * Math.sin(azim),
    target.y + r * Math.sin(elev),
    target.z + r * Math.cos(elev) * Math.cos(azim),
  );
  cam.up.set(0, 1, 0);
  if (elev > 1.55) cam.up.set(-Math.sin(azim), 0, -Math.cos(azim));
  cam.lookAt(target);
  const halfH = Math.max(fitH / 2, fitW / 2 / aspect);
  cam.left = -halfH * aspect;
  cam.right = halfH * aspect;
  cam.top = halfH;
  cam.bottom = -halfH;
  cam.updateProjectionMatrix();
}

function resize(renderer: THREE.WebGLRenderer, el: HTMLElement) {
  const w = el.clientWidth, h = el.clientHeight;
  renderer.setSize(w, h, false);
  return w / Math.max(h, 1);
}

/* ---------------- 1. casa care se desface la scroll ---------------- */

export function mountScroll(section: HTMLElement, lang: Lang, model: string) {
  const canvas = section.querySelector<HTMLCanvasElement>('canvas')!;
  const captions = [...section.querySelectorAll<HTMLElement>('[data-phase]')];
  const { renderer, scene, camera } = setup(canvas);
  const { root, pieces, lift: LIFT, view: V } = MODELS[model]();
  const planes = new Map<number, THREE.Plane>();
  const P = prepare(pieces, planes);
  scene.add(root);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let aspect = resize(renderer, canvas);
  let p = 0;

  const render = () => {
    // faze: 0–.12 casa întreagă · .12–.5 explozie · .55–.8 se strânge și devine plan
    const e = smooth(0.12, 0.48, p) * (1 - smooth(0.56, 0.78, p));
    const toPlan = smooth(0.58, 0.86, p);
    const roofGone = smooth(0.5, 0.7, p);
    for (const q of P) {
      const lift = (LIFT[q.layer] ?? 0) * e + (q.layer === 'acoperis' || q.layer === 'bolta' ? 900 * roofGone : 0);
      q.obj.position.set(q.base.x, q.base.y + lift, q.base.z + (q.layer === 'prispa' ? 160 * e : 0));
      setOpacity(q, q.layer === 'acoperis' || q.layer === 'bolta' ? 1 - roofGone : 1);
      // pereții secționați devin poché în plan
      if (POCHE_LAYERS.has(q.layer)) {
        for (const { m, c } of q.mats) if (c && m.color && m.type !== 'LineBasicMaterial') m.color.copy(c).lerp(POCHE, toPlan * 0.92);
      }
    }
    for (const [h, pl] of planes) pl.constant = THREE.MathUtils.lerp(100000, h, toPlan);
    const elev = THREE.MathUtils.lerp(0.55, Math.PI / 2 - 0.0001, toPlan);
    const portrait = aspect < 0.8;
    const azim = THREE.MathUtils.lerp(-0.62 + p * 0.5, portrait ? Math.PI / 2 : 0, toPlan);
    const fitW = THREE.MathUtils.lerp(V.isoW, portrait ? V.planH : V.planW, toPlan);
    const fitH = THREE.MathUtils.lerp(V.isoH + 900 * e, portrait ? V.planW * 1.37 : V.planH, toPlan);
    const target = new THREE.Vector3(portrait ? V.planW * 0.155 * toPlan : 0, THREE.MathUtils.lerp(V.targetY + 420 * e, 0, toPlan), THREE.MathUtils.lerp(0, 50, toPlan));
    placeCamera(camera, aspect, elev, azim, fitW, fitH, target);
    renderer.render(scene, camera);
    const idx = p < 0.12 ? 0 : p < 0.52 ? 1 : p < 0.8 ? 2 : 3;
    captions.forEach((c, i) => c.classList.toggle('on', i === idx));
  };

  const onScroll = () => {
    const r = section.getBoundingClientRect();
    const range = section.offsetHeight - innerHeight;
    p = reduce ? 0.3 : clamp(-r.top / (range || 1));
    requestAnimationFrame(render);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { aspect = resize(renderer, canvas); onScroll(); });
  onScroll();
}

/* ---------------- 2. planul construit bucată cu bucată ---------------- */

export function mountBuild(dialog: HTMLDialogElement, lang: Lang, model: string) {
  const canvas = dialog.querySelector<HTMLCanvasElement>('canvas')!;
  const caption = dialog.querySelector<HTMLElement>('[data-caption]')!;
  const counter = dialog.querySelector<HTMLElement>('[data-counter]')!;
  const replay = dialog.querySelector<HTMLButtonElement>('[data-replay]')!;
  const { renderer, scene, camera } = setup(canvas);
  const { root, pieces, view: V } = MODELS[model]();
  const planes = new Map<number, THREE.Plane>();
  const all = prepare(pieces, planes);
  const skip = (q: Piece) => q.layer === 'acoperis' || q.layer === 'bolta';
  all.filter(skip).forEach((q) => root.remove(q.obj));
  const P = all.filter((q) => !skip(q)).sort((a, b) => a.order - b.order);
  scene.add(root);
  // planul: fiecare nivel secționat la 1,20 m deasupra pardoselii lui, pereții închiși la culoare
  for (const [h, pl] of planes) pl.constant = h;
  for (const q of P) {
    if (!POCHE_LAYERS.has(q.layer)) continue;
    for (const { m, c } of q.mats) if (c && m.color && m.type === 'MeshLambertMaterial') { m.color.copy(c).lerp(POCHE, 0.92); c.copy(m.color); }
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let aspect = 1;
  let start = 0;
  let raf = 0;
  const STEP = 280; // ms între piese
  const DUR = 480; // ms durata căderii unei piese

  const frame = (now: number) => {
    const t = reduce ? 1e9 : now - start;
    let current = -1;
    P.forEach((q, i) => {
      const k = easeOut((t - i * STEP) / DUR);
      if (t >= i * STEP) current = i;
      q.obj.position.set(q.base.x, q.base.y + (1 - k) * 520, q.base.z);
      setOpacity(q, k);
    });
    const total = P.length * STEP + DUR;
    const k = Math.min(t / total, 1);
    const portrait = aspect < 0.8;
    const az = -0.45 + k * 0.45 + (portrait ? Math.PI / 2 : 0);
    const elev = THREE.MathUtils.lerp(0.85, 1.25, k);
    placeCamera(camera, aspect, elev, az, portrait ? V.planH * 1.3 : V.planW * 1.05, portrait ? V.planW * 1.05 : V.planH * 1.3, new THREE.Vector3(0, V.targetY * 0.4, 40));
    renderer.render(scene, camera);
    if (current >= 0) {
      caption.textContent = P[current].label[lang];
      counter.textContent = `${current + 1} / ${P.length}`;
    }
    if (t < P.length * STEP + DUR) raf = requestAnimationFrame(frame);
  };

  const play = () => {
    cancelAnimationFrame(raf);
    aspect = resize(renderer, canvas);
    start = performance.now();
    raf = requestAnimationFrame(frame);
  };
  replay.addEventListener('click', play);
  addEventListener('resize', () => { if (dialog.open) { aspect = resize(renderer, canvas); renderer.render(scene, camera); } });
  dialog.addEventListener('close', () => cancelAnimationFrame(raf));
  return play;
}
