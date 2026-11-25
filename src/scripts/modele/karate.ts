// Casa karatistului: model 3D simplificat, redesenat după secțiunea longitudinală și planuri.
// Scara e estimată după silueta umană și după tatami (90 × 180 cm) din plan.
// x urcă pe pantă, y e cota, z e adâncimea casei.
import * as THREE from 'three';
import { box, mat, lineMat, COL, type Model, type Piece } from './casa760';

const D = 650; // adâncimea volumelor (z)
const SL = 22; // grosimea plăcilor

const C = {
  concrete: 0xe4e0d8,
  concreteDark: 0xcfc9bf,
  slab: 0xd9d3c8,
  glass: 0xbcc9cc,
  frame: 0x4a4540,
  tatami: 0xd9cc9a,
  tatamiEdge: 0x6d6a50,
  ground: 0xe7e1d4,
  wood: 0xc9a77c,
  white: 0xf3f2ee,
};

interface Level {
  name: { ro: string; en: string };
  x0: number;
  x1: number;
  y: number; // cota pardoselii
  h: number; // înălțimea liberă
  roof: [number, number]; // întinderea plăcii de acoperiș pe x (console)
}

const LV: Level[] = [
  { name: { ro: 'nivelul de jos', en: 'lower level' }, x0: 0, x1: 490, y: 0, h: 390, roof: [-85, 380] },
  { name: { ro: 'nivelul din mijloc', en: 'middle level' }, x0: 360, x1: 810, y: 195, h: 345, roof: [240, 910] },
  { name: { ro: 'nivelul de sus', en: 'upper level' }, x0: 670, x1: 1235, y: 578, h: 255, roof: [600, 1240] },
];

/** fațada vitrată: rame verticale și orizontale, sticlă */
function glazing(x: number, y0: number, y1: number, z0: number, z1: number, step = 110) {
  const g = new THREE.Group();
  g.add(box(x - 1, y0, z0, x + 1, y1, z1, C.glass, { opacity: 0.4 }));
  for (let z = z0; z <= z1 + 1; z += step) g.add(box(x - 4, y0, Math.min(z, z1) - 4, x + 4, y1, Math.min(z, z1) + 4, C.frame));
  g.add(box(x - 4, y0, z0, x + 4, y0 + 8, z1, C.frame));
  g.add(box(x - 4, y1 - 8, z0, x + 4, y1, z1, C.frame));
  return g;
}

function terrain() {
  // profilul versantului, în trepte sub cele trei niveluri
  const pts: [number, number][] = [
    [-500, -40], [-500, -10], [0, 0], [490, 0], [490, 195], [810, 195], [810, 578], [1300, 578], [1300, 700], [1900, 980], [1900, -40],
  ];
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: D + 500, bevelEnabled: false });
  geo.translate(0, -SL, -250);
  const m = new THREE.Mesh(geo, mat(C.ground));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat));
  return m;
}

function stair(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, n: number, color: number) {
  const g = new THREE.Group();
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  for (let i = 0; i < n; i++) g.add(box(x0 + i * dx, y0 + i * dy, z0, x0 + (i + 1) * dx, y0 + (i + 1) * dy, z1, color));
  return g;
}

function tatami(x0: number, z0: number) {
  // camera de 4,5 tatami: patru rogojini în jurul uneia pe jumătate
  const g = new THREE.Group();
  const y = LV[1].y;
  const mats: [number, number, number, number][] = [
    [0, 0, 180, 90], [180, 0, 90, 180], [90, 180, 180, 90], [0, 90, 90, 180], [90, 90, 90, 90],
  ];
  for (const [a, b, w, d] of mats) {
    const m = box(x0 + a + 1, y, z0 + b + 1, x0 + a + w - 1, y + 6, z0 + b + d - 1, C.tatami);
    g.add(m);
  }
  return g;
}

export function buildKarate(): Model {
  const root = new THREE.Group();
  root.position.set(-600, 0, -D / 2);
  const pieces: Piece[] = [];
  let order = 0;
  const add = (obj: THREE.Object3D, layer: string, ro: string, en: string, cut: number | undefined) => {
    root.add(obj);
    pieces.push({ obj, layer, label: { ro, en }, order: order++, base: obj.position.clone(), cut });
  };

  add(terrain(), 'teren', 'Versantul, în trepte sub casă', 'The slope, stepped beneath the house', undefined);

  LV.forEach((l, i) => {
    const cut = l.y + 120;
    const top = l.y + l.h;
    add(box(l.x0, l.y - SL, 0, l.x1, l.y, D, C.slab), 'placi', `Placa de pardoseală, ${l.name.ro}`, `Floor slab, ${l.name.en}`, cut);
    // peretele dinspre deal (plin) și pereții laterali
    const back = new THREE.Group();
    back.add(box(l.x1 - 25, l.y, 0, l.x1, top, D, C.concrete));
    add(back, 'pereti', `Peretele dinspre deal, ${l.name.ro}`, `Uphill wall, ${l.name.en}`, cut);
    const sides = new THREE.Group();
    sides.add(box(l.x0, l.y, 0, l.x1 - 25, top, 25, C.concrete));
    sides.add(box(l.x0 + (i === 0 ? 0 : 140), l.y, D - 25, l.x1 - 25, top, D, C.concrete));
    add(sides, 'pereti', `Pereții laterali, ${l.name.ro}`, `Side walls, ${l.name.en}`, cut);
    add(glazing(l.x0 + 4, l.y, top, 25, D - 25), 'vitraje', `Fațada vitrată spre vale, ${l.name.ro}`, `Glazed façade facing the valley, ${l.name.en}`, cut);
  });

  // interioare
  add(tatami(470, 120), 'mobilier', 'Camera de 4,5 tatami pentru antrenament', 'Four-and-a-half-tatami training room', LV[1].y + 120);
  const bath = new THREE.Group();
  const y2 = LV[1].y;
  bath.add(box(700, y2, 30, 785, y2 + 140, 260, C.concreteDark));
  bath.add(box(712, y2, 40, 780, y2 + 55, 190, C.white));
  bath.add(box(712, y2, 205, 760, y2 + 40, 250, C.white));
  add(bath, 'mobilier', 'Baia, cu cada și vasul de toaletă', 'Bathroom with bathtub and toilet', y2 + 120);
  add(box(560, y2, 520, 760, y2 + 90, 585, C.wood), 'mobilier', 'Blatul de bucătărie', 'Kitchen counter', y2 + 120);
  add(stair(380, 520, 0, 195, 470, 560, 10, C.wood), 'scari', 'Scara interioară dintre nivelul de jos și cel din mijloc', 'Interior stair from the lower to the middle level', 120);
  add(box(120, 0, 220, 300, 6, 430, C.tatami), 'mobilier', 'Rogojina de la nivelul de jos', 'Floor mat on the lower level', 120);
  add(box(860, LV[2].y, 240, 980, LV[2].y + 35, 360, C.wood), 'mobilier', 'Măsuța joasă de la nivelul de sus', 'Low table on the upper level', LV[2].y + 120);
  add(box(1040, LV[2].y, 80, 1220, LV[2].y + 20, 300, C.white), 'mobilier', 'Salteaua futon', 'Futon mattress', LV[2].y + 120);

  // scara exterioară și zidul de sprijin
  add(stair(900, 1080, LV[1].y + 345 - 150, LV[2].y, D - 120, D, 7, C.concreteDark), 'scari', 'Scara exterioară spre nivelul de sus', 'Exterior stair to the upper level', undefined);
  add(box(1235, 0, -40, 1300, LV[2].y + LV[2].h + 30, D + 40, C.concreteDark), 'pereti', 'Zidul de sprijin din spatele casei', 'Retaining wall behind the house', LV[2].y + 120);

  // plăcile de acoperiș în consolă
  LV.forEach((l) => {
    const top = l.y + l.h;
    add(box(l.roof[0], top, -30, l.roof[1], top + 30, D + 30, C.slab), 'acoperis', `Placa de acoperiș în consolă, ${l.name.ro}`, `Cantilevered roof slab, ${l.name.en}`, undefined);
  });

  return {
    root,
    pieces,
    lift: { teren: 0, placi: 0, mobilier: 220, scari: 220, pereti: 480, vitraje: 480, acoperis: 900 },
    view: { isoW: 2500, isoH: 1500, planW: 1900, planH: 900, targetY: 420 },
  };
}

export { COL };
