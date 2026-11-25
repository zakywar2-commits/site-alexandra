// Columbariu: model 3D simplificat, redesenat după plan, fațade, secțiune și axonometrie.
// Desenele nu au cote; dimensiunile sunt estimate din proporții (galeria ~17,5 × 7 m).
import * as THREE from 'three';
import { box, mat, lineMat, type Model, type Piece } from './casa760';

const LEN = 1750; // lungimea galeriei (x)
const W = 700; // lățimea totală (z)
const CI0 = 220, CI1 = 480; // fețele interioare ale coridorului
const H = 650; // nașterea bolții
const R = 130; // raza interioară a bolții
const VT = 60; // grosimea bolții
const TX = LEN + 484, TZ = W / 2; // centrul turnului
const TR = 252, TT = 60, TH = 1000; // turnul: rază, grosime, înălțime

const C = {
  brick: 0xd8c9b4,
  brickDark: 0xbfae96,
  niche: 0x5b524a,
  plaque: 0xe7dfd2,
  paving: 0xe3dccf,
  channel: 0xa9b6b8,
  ground: 0xe9e4da,
};

function withEdges(geo: THREE.BufferGeometry, color: number, angle = 20) {
  const m = new THREE.Mesh(geo, mat(color));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle), lineMat));
  return m;
}

/** zid cu fața exterioară înclinată: secțiune trapezoidală extrudată pe lungime */
function battered(zIn: number, zOutBase: number, zOutTop: number) {
  const s = new THREE.Shape();
  s.moveTo(zIn, 0);
  s.lineTo(zOutBase, 0);
  s.lineTo(zOutTop, H);
  s.lineTo(zIn, H);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: LEN, bevelEnabled: false });
  // forma e în planul (z,y), extrudată pe „adâncime” → o rotim ca extrudarea să meargă pe x
  geo.rotateY(-Math.PI / 2); // adâncimea extrudării devine axa x (negativă), forma rămâne în (z,y)
  geo.translate(LEN, 0, 0);
  return withEdges(geo, C.brick);
}

/** nișele de pe fața interioară a unui zid: 4 registre */
function niches(zFace: number, dir: 1 | -1) {
  const g = new THREE.Group();
  const rows = [90, 240, 390, 540];
  for (const y of rows) {
    for (let x = 70; x < LEN - 40; x += 92) {
      const big = (x > 560 && x < 660 && y === 240) || (x > 1180 && x < 1280 && y === 390);
      if (big) continue;
      g.add(box(x - 14, y, zFace, x + 14, y + 42, zFace + dir * 3, C.niche));
    }
  }
  // două nișe mari, boltite
  for (const [x, y] of [[610, 210], [1230, 360]] as const) g.add(box(x - 32, y, zFace, x + 32, y + 120, zFace + dir * 3, C.niche));
  return g;
}

function vault() {
  const s = new THREE.Shape();
  s.absarc(0, 0, R + VT, 0, Math.PI, false);
  s.lineTo(-R, 0);
  s.absarc(0, 0, R, Math.PI, 0, true);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: LEN, bevelEnabled: false, curveSegments: 28 });
  geo.rotateY(-Math.PI / 2);
  geo.translate(LEN, H, (CI0 + CI1) / 2);
  return withEdges(geo, C.brickDark, 30);
}

function tower() {
  // jumătate de cilindru, deschisă spre est (departe de galerie)
  const s = new THREE.Shape();
  s.absarc(0, 0, TR, Math.PI / 2, (3 * Math.PI) / 2, false);
  s.absarc(0, 0, TR - TT, (3 * Math.PI) / 2, Math.PI / 2, true);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: TH, bevelEnabled: false, curveSegments: 40 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(TX, 0, TZ);
  return withEdges(geo, C.brick, 30);
}

function towerHood() {
  // streașina curbă din vârful turnului
  const s = new THREE.Shape();
  s.absarc(0, 0, TR + 10, Math.PI / 2, (3 * Math.PI) / 2, false);
  s.lineTo(70, -TR - 10);
  s.absarc(70, 0, TR + 10, (3 * Math.PI) / 2, Math.PI / 2, false);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 40, bevelEnabled: false, curveSegments: 40 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(TX, TH, TZ);
  return withEdges(geo, C.brickDark, 30);
}

export function buildColumbariu(): Model {
  const root = new THREE.Group();
  root.position.set(-(LEN + 300) / 2 - 120, 0, -W / 2);
  const pieces: Piece[] = [];
  let order = 0;
  const add = (obj: THREE.Object3D, layer: string, ro: string, en: string, cut: number | undefined = 120) => {
    root.add(obj);
    pieces.push({ obj, layer, label: { ro, en }, order: order++, base: obj.position.clone(), cut });
  };

  add(box(-60, -24, -60, LEN + 60, -2, W + 60, C.ground), 'teren', 'Platforma galeriei', 'Gallery platform');
  const pav = new THREE.Group();
  pav.add(box(CI0, 0, CI0, LEN, 3, CI1, C.paving));
  pav.add(box(0, 3, (CI0 + CI1) / 2 - 8, LEN, 4, (CI0 + CI1) / 2 + 8, C.channel));
  add(pav, 'teren', 'Pavajul coridorului, cu rigola de pe mijloc', 'Corridor paving with the central channel');
  add(box(0, -12, W + 70, LEN, -2, W + 190, C.paving), 'teren', 'Aleea de acces, paralelă cu galeria', 'Access path alongside the gallery', undefined);
  add(box(TX - TR - 40, -12, TZ - TR - 40, TX + TR + 40, -2, TZ + TR + 40, C.ground), 'teren', 'Platforma turnului', 'Tower platform');

  add(battered(CI0, 0, 100), 'ziduri', 'Zidul de nord, cu fața exterioară înclinată', 'North wall, with its battered outer face');
  add(niches(CI0, 1), 'nise', 'Nișele pentru urne din zidul de nord, pe patru registre', 'Urn niches in the north wall, in four registers');
  add(battered(CI1, W, W - 100), 'ziduri', 'Zidul de sud', 'South wall');
  add(niches(CI1, -1), 'nise', 'Nișele pentru urne din zidul de sud', 'Urn niches in the south wall');
  add(vault(), 'bolta', 'Bolta în semicerc peste coridor', 'Semicircular vault over the corridor', undefined);

  add(tower(), 'turn', 'Turnul semicircular, deschis spre est', 'Semicircular tower, open to the east');
  add(towerHood(), 'bolta', 'Streașina curbă din vârful turnului', 'Curved hood at the top of the tower', undefined);

  return {
    root,
    pieces,
    lift: { teren: 0, nise: 260, ziduri: 520, turn: 520, bolta: 1000 },
    view: { isoW: 2900, isoH: 1900, planW: 2700, planH: 1000, targetY: 500 },
  };
}
