// Casa 760, Comana: model 3D simplificat, redesenat după releveu (cote în cm).
// Dimensiuni citite de pe planșa „Releveu corect”: 1460 × 460 cm, pereți ~36 cm,
// cota pardoselii +50, coronamentul pereților +335, streașina +401, coama +530.
// Mobilierul e așezat după fotografiile din releveu; pozițiile sunt aproximative.
import * as THREE from 'three';

export type Layer = string;

export interface Piece {
  obj: THREE.Object3D;
  layer: Layer;
  label: { ro: string; en: string };
  /** ordinea în animația de construire a planului */
  order: number;
  /** pentru animații: poziția de bază */
  base: THREE.Vector3;
  /** cota la care e secționată piesa în plan (cm); fără ea, piesa nu se secționează */
  cut?: number;
}

/** un model: piesele, cât se ridică fiecare strat la explozie și cadrul camerei */
export interface Model {
  root: THREE.Group;
  pieces: Piece[];
  lift: Record<string, number>;
  /** lățime/înălțime de încadrat în vederea axonometrică și în plan (cm) */
  view: { isoW: number; isoH: number; planW: number; planH: number; targetY: number };
}

const T = 36; // grosimea pereților
const L = 1460;
const D = 460;
const FL = 50; // cota pardoselii
const TOP = 335; // coronament
const EAVE = 401;
const RIDGE = 530;

export const COL = {
  wall: 0xf7f4ee,
  wallInt: 0xefe9df,
  plinth: 0xd9d2c5,
  floor: 0xe6ddcc,
  wood: 0xc9a77c,
  woodDark: 0x8a6a48,
  glass: 0xbcc9cc,
  stove: 0xb9b2a6,
  roof: 0x9c9284,
  fabric: 0xd8cbb8,
  metal: 0xe9e9e6,
  line: 0x1d1c1a,
};

export const lineMat = new THREE.LineBasicMaterial({ color: COL.line, transparent: true, opacity: 0.55 });

export function mat(color: number, extra: Partial<THREE.MeshLambertMaterialParameters> = {}) {
  return new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 1, ...extra });
}

/** cutie din colțuri (x0,y0,z0)–(x1,y1,z1), cu contur */
export function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: number, extra = {}) {
  const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0);
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat(color, extra));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), lineMat);
  m.add(e);
  return m;
}

interface Opening { a: number; b: number; sill: number; head: number; kind: 'window' | 'door' | 'double' }

/** perete de-a lungul axei X (între z0 și z1), cu goluri pe intervalul [a,b] în X */
function wallX(x0: number, x1: number, z0: number, z1: number, ops: Opening[], color: number) {
  const g = new THREE.Group();
  let cur = x0;
  for (const o of [...ops].sort((p, q) => p.a - q.a)) {
    if (o.a > cur) g.add(box(cur, FL, z0, o.a, TOP, z1, color));
    if (o.sill > FL) g.add(box(o.a, FL, z0, o.b, o.sill, z1, color));
    g.add(box(o.a, o.head, z0, o.b, TOP, z1, color));
    cur = o.b;
  }
  if (cur < x1) g.add(box(cur, FL, z0, x1, TOP, z1, color));
  return g;
}

/** perete de-a lungul axei Z (între x0 și x1), cu goluri pe intervalul [a,b] în Z */
function wallZ(z0: number, z1: number, x0: number, x1: number, ops: Opening[], color: number) {
  const g = new THREE.Group();
  let cur = z0;
  for (const o of [...ops].sort((p, q) => p.a - q.a)) {
    if (o.a > cur) g.add(box(x0, FL, cur, x1, TOP, o.a, color));
    if (o.sill > FL) g.add(box(x0, FL, o.a, x1, o.sill, o.b, color));
    g.add(box(x0, o.head, o.a, x1, TOP, o.b, color));
    cur = o.b;
  }
  if (cur < z1) g.add(box(x0, FL, cur, x1, TOP, z1, color));
  return g;
}

/** tâmplărie: fereastră (toc + sticlă + montant) sau ușă (toc + foaie deschisă + arc de deschidere) */
function openingFill(o: Opening, axis: 'x' | 'z', c0: number, c1: number) {
  const g = new THREE.Group();
  const mid = (c0 + c1) / 2;
  const put = (a0: number, y0: number, a1: number, y1: number, t0: number, t1: number, color: number, extra = {}) =>
    axis === 'x' ? box(a0, y0, t0, a1, y1, t1, color, extra) : box(t0, y0, a0, t1, y1, a1, color, extra);
  const f = 5;
  // toc
  g.add(put(o.a, o.sill, o.a + f, o.head, mid - 6, mid + 6, COL.woodDark));
  g.add(put(o.b - f, o.sill, o.b, o.head, mid - 6, mid + 6, COL.woodDark));
  g.add(put(o.a, o.head - f, o.b, o.head, mid - 6, mid + 6, COL.woodDark));
  if (o.kind === 'window') {
    g.add(put(o.a, o.sill, o.b, o.sill + f, mid - 6, mid + 6, COL.woodDark));
    g.add(put(o.a + f, o.sill + f, o.b - f, o.head - f, mid - 1, mid + 1, COL.glass, { opacity: 0.45 }));
    const m = (o.a + o.b) / 2;
    g.add(put(m - 2, o.sill, m + 2, o.head, mid - 4, mid + 4, COL.woodDark));
    const tr = o.head - (o.head - o.sill) * 0.28;
    g.add(put(o.a, tr - 2, o.b, tr + 2, mid - 4, mid + 4, COL.woodDark));
  } else {
    // foaie de ușă deschisă la ~70° și arc de deschidere pe pardoseală
    const leaves = o.kind === 'double' ? 2 : 1;
    const w = (o.b - o.a) / leaves;
    for (let i = 0; i < leaves; i++) {
      const hinge = i === 0 ? o.a + f : o.b - f;
      const dir = i === 0 ? 1 : -1;
      const r = w - f;
      const hgt = o.head - f - FL;
      const geo = axis === 'x' ? new THREE.BoxGeometry(r, hgt, 5) : new THREE.BoxGeometry(5, hgt, r);
      const leaf = new THREE.Mesh(geo, mat(COL.wood));
      leaf.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat));
      if (axis === 'x') leaf.position.set((dir * r) / 2, FL + hgt / 2, 0);
      else leaf.position.set(0, FL + hgt / 2, (dir * r) / 2);
      const piv = new THREE.Group();
      piv.add(leaf);
      if (axis === 'x') piv.position.set(hinge, 0, mid);
      else piv.position.set(mid, 0, hinge);
      piv.rotation.y = dir * 1.2;
      g.add(piv);
      // arc de deschidere (ușile exterioare se deschid spre interior)
      const s = axis === 'x' ? -1 : 1;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 24; k++) {
        const t = (k / 24) * (Math.PI / 2);
        const u = dir * r * Math.cos(t), v = s * r * Math.sin(t);
        pts.push(axis === 'x' ? new THREE.Vector3(hinge + u, FL + 1, mid + v) : new THREE.Vector3(mid + v, FL + 1, hinge + u));
      }
      const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: COL.line, dashSize: 6, gapSize: 5, transparent: true, opacity: 0.6 }));
      arc.computeLineDistances();
      g.add(arc);
    }
  }
  return g;
}

export function cylinder(x: number, z: number, r: number, y0: number, y1: number, color: number) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, 32);
  const m = new THREE.Mesh(g, mat(color));
  m.position.set(x, (y0 + y1) / 2, z);
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), lineMat));
  return m;
}

/** acoperiș în patru ape, cu streașină */
function hipRoof(x0: number, x1: number, z0: number, z1: number, yEave: number, yRidge: number) {
  const ov = 45;
  const a = x0 - ov, b = x1 + ov, c = z0 - ov, d = z1 + ov;
  const inset = (d - c) / 2;
  const r0 = a + inset, r1 = b - inset, rz = (c + d) / 2;
  const v = [
    [a, yEave, c], [b, yEave, c], [b, yEave, d], [a, yEave, d],
    [r0, yRidge, rz], [r1, yRidge, rz],
  ];
  const idx = [0, 4, 5, 0, 5, 1, 1, 5, 2, 2, 5, 4, 2, 4, 3, 3, 4, 0];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v.flat(), 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(COL.roof, { side: THREE.DoubleSide }));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat));
  // șiruri de tablă (linii pe ape)
  const pts: THREE.Vector3[] = [];
  const n = 22;
  for (let i = 1; i < n; i++) {
    const x = a + ((b - a) * i) / n;
    const xr = Math.min(Math.max(x, r0), r1);
    pts.push(new THREE.Vector3(x, yEave, c), new THREE.Vector3(xr, yRidge, rz));
    pts.push(new THREE.Vector3(x, yEave, d), new THREE.Vector3(xr, yRidge, rz));
  }
  m.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: COL.line, transparent: true, opacity: 0.18 })));
  return m;
}

export function buildHouse(): Model {
  const root = new THREE.Group();
  // centrăm casa în origine
  root.position.set(-L / 2, 0, -D / 2);
  const pieces: Piece[] = [];
  let order = 0;
  const add = (obj: THREE.Object3D, layer: Layer, ro: string, en: string, ord = order++) => {
    root.add(obj);
    pieces.push({ obj, layer, label: { ro, en }, order: ord, base: obj.position.clone(), cut: FL + 120 });
  };

  // încăperi (interior, în X): R1 36–336, R2 372–704, R3 740–1000, R4 1036–1424
  const W1 = 336, W2 = 704, W3 = 1000;
  const zs = D - T; // fața interioară a peretelui sud

  // soclu și pardoseli
  add(box(0, 0, 0, L, FL - 4, D, COL.plinth), 'soclu', 'Soclul casei, +50 cm', 'Plinth, +50 cm');
  const rooms: [number, number, string, string][] = [
    [T, W1, 'Pardoseala bucătăriei', 'Kitchen floor'],
    [W1 + T, W2, 'Pardoseala camerei de zi', 'Living room floor'],
    [W2 + T, W3, 'Pardoseala camerei de așteptare', 'Waiting room floor'],
    [W3 + T, L - T, 'Pardoseala dormitorului', 'Bedroom floor'],
  ];
  const floorOrder = order++;
  const floors = new THREE.Group();
  for (const [x0, x1] of rooms) {
    const f = box(x0, FL - 4, T, x1, FL, zs, COL.floor);
    // scândurile duşumelei
    const pts: THREE.Vector3[] = [];
    for (let x = x0 + 14; x < x1; x += 14) pts.push(new THREE.Vector3(x - (x0 + x1) / 2, 2.1, -(zs - T) / 2), new THREE.Vector3(x - (x0 + x1) / 2, 2.1, (zs - T) / 2));
    f.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: COL.line, transparent: true, opacity: 0.12 })));
    floors.add(f);
  }
  add(floors, 'soclu', 'Pardoseli de scândură în cele patru încăperi', 'Timber floors in the four rooms', floorOrder);

  // goluri
  const win = (a: number, b: number): Opening => ({ a, b, sill: FL + 95, head: FL + 245, kind: 'window' });
  const southOps: Opening[] = [
    win(80, 130),
    { a: 175, b: 240, sill: FL, head: FL + 215, kind: 'door' },
    win(275, 320),
    win(470, 600),
    { a: 810, b: 905, sill: FL, head: FL + 240, kind: 'double' },
    win(1160, 1295),
  ];
  const eastOps: Opening[] = [win(160, 295)];
  const dKz = { a: 335, b: 405, sill: FL, head: FL + 215, kind: 'door' as const };
  const dHall = { a: 200, b: 275, sill: FL, head: FL + 215, kind: 'door' as const };
  const dBed = { a: 230, b: 305, sill: FL, head: FL + 215, kind: 'door' as const };

  // pereți exteriori
  add(wallX(0, L, 0, T, [], COL.wall), 'pereti-ext', 'Peretele exterior nord', 'North exterior wall');
  add(wallZ(T, D - T, 0, T, [], COL.wall), 'pereti-ext', 'Peretele exterior vest', 'West exterior wall');
  add(wallX(0, L, D - T, D, southOps, COL.wall), 'pereti-ext', 'Peretele exterior sud, spre curte', 'South exterior wall, facing the yard');
  add(wallZ(T, D - T, L - T, L, eastOps, COL.wall), 'pereti-ext', 'Peretele exterior est', 'East exterior wall');

  // pereți interiori
  add(wallZ(T, D - T, W1, W1 + T, [dKz], COL.wallInt), 'pereti-int', 'Peretele dintre bucătărie și camera de zi', 'Wall between kitchen and living room');
  add(wallZ(T, D - T, W2, W2 + T, [dHall], COL.wallInt), 'pereti-int', 'Peretele dintre camera de zi și camera de așteptare', 'Wall between living room and waiting room');
  add(wallZ(T, D - T, W3, W3 + T, [dBed], COL.wallInt), 'pereti-int', 'Peretele dintre camera de așteptare și dormitor', 'Wall between waiting room and bedroom');

  // tâmplărie
  const sx = southOps.filter((o) => o.kind === 'window');
  sx.forEach((o, i) => add(openingFill(o, 'x', D - T, D), 'goluri', `Fereastra ${i + 1} de pe fațada sud`, `South window ${i + 1}`));
  add(openingFill(eastOps[0], 'z', L - T, L), 'goluri', 'Fereastra de pe fațada est', 'East window');
  add(openingFill(southOps[1], 'x', D - T, D), 'goluri', 'Ușa bucătăriei spre curte', 'Kitchen door to the yard');
  add(openingFill(southOps[4], 'x', D - T, D), 'goluri', 'Ușa dublă de la intrare, din prispă', 'Double entrance door from the porch');
  add(openingFill(dKz, 'z', W1, W1 + T), 'goluri', 'Ușa dintre bucătărie și camera de zi', 'Door between kitchen and living room');
  add(openingFill(dHall, 'z', W2, W2 + T), 'goluri', 'Ușa camerei de zi', 'Living room door');
  add(openingFill(dBed, 'z', W3, W3 + T), 'goluri', 'Ușa dormitorului', 'Bedroom door');

  // sobe (din plan)
  add(box(250, FL, 52, 326, FL + 85, 120, COL.stove), 'sobe', 'Plita de gătit din bucătărie', 'Kitchen cooking stove');
  const stoveT = (x0: number, z0: number) => {
    const g = new THREE.Group();
    g.add(box(x0, FL, z0, x0 + 55, FL + 40, z0 + 55, COL.stove));
    g.add(box(x0 + 3, FL + 40, z0 + 3, x0 + 52, FL + 210, z0 + 52, COL.stove));
    g.add(box(x0, FL + 210, z0, x0 + 55, FL + 222, z0 + 55, COL.stove));
    return g;
  };
  add(stoveT(645, 60), 'sobe', 'Soba de teracotă din camera de zi', 'Tiled stove in the living room');
  add(stoveT(1050, 60), 'sobe', 'Soba de teracotă din dormitor', 'Tiled stove in the bedroom');

  // mobilier (după fotografiile din releveu)
  const F = FL;
  add(box(50, F, 50, 115, F + 180, 115, COL.metal), 'mobilier', 'Frigiderul din bucătărie', 'Kitchen fridge');
  add(box(130, F, 45, 190, F + 85, 105, COL.metal), 'mobilier', 'Aragazul', 'Gas cooker');
  add(cylinder(200, 300, 48, F + 72, F + 76, COL.wood), 'mobilier', 'Masa rotundă din bucătărie', 'Round kitchen table');
  add(box(40, F, 200, 85, F + 200, 330, COL.woodDark), 'mobilier', 'Bufetul de vase', 'Kitchen dresser');
  add(box(385, F, 50, 585, F + 45, 140, COL.fabric), 'mobilier', 'Patul din camera de zi', 'Living room bed');
  add(box(520, F, 300, 620, F + 76, 360, COL.wood), 'mobilier', 'Masa din camera de zi', 'Living room table');
  add(box(390, F, 300, 435, F + 75, 400, COL.woodDark), 'mobilier', 'Comoda cu televizorul', 'Chest of drawers with the TV');
  add(box(755, F, 50, 985, F + 85, 135, COL.woodDark), 'mobilier', 'Canapeaua din camera de așteptare', 'Waiting room sofa');
  add(box(800, F, 170, 930, F + 75, 245, COL.wood), 'mobilier', 'Masa din camera de așteptare', 'Waiting room table');
  add(box(1220, F, 60, 1330, F + 85, 110, COL.woodDark), 'mobilier', 'Comoda din dormitor', 'Bedroom chest of drawers');

  // prispa
  const porch = new THREE.Group();
  porch.add(box(645, 0, D, 1125, FL - 4, D + 109, COL.plinth));
  porch.add(box(760, 0, D + 109, 960, 24, D + 140, COL.plinth));
  for (const x of [660, 1110]) porch.add(box(x - 8, FL, D + 85, x + 8, TOP + 40, D + 101, COL.wood));
  porch.add(box(645, TOP + 30, D, 1125, TOP + 40, D + 110, COL.wood));
  add(porch, 'prispa', 'Prispa de la intrare, adâncă de 109 cm', 'Entrance porch, 109 cm deep');

  // acoperiș
  add(hipRoof(0, L, 0, D, EAVE, RIDGE), 'acoperis', 'Acoperișul în patru ape, coama la +530 cm', 'Hipped roof, ridge at +530 cm');

  return { root, pieces, lift: LIFT, view: { isoW: 1900, isoH: 1050, planW: 1680, planH: 760, targetY: 260 } };
}

/** cât se ridică fiecare strat când casa e explodată */
const LIFT: Record<string, number> = {
  soclu: 0,
  sobe: 170,
  mobilier: 170,
  'pereti-int': 420,
  goluri: 640,
  'pereti-ext': 640,
  prispa: 640,
  acoperis: 1050,
};
