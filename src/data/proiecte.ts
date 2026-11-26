// Datele proiectelor. Textele marcate „de completat” așteaptă informațiile reale de la Razvan.
// Imaginile stau în public/images/<slug>/ (WebP, latura mare de maximum 2400px).
import { withBase, type Lang } from '../i18n/ui';

export type L = Record<Lang, string>;

export type Categorie = 'locuinte' | 'public' | 'restaurare' | 'memorial';
export const categorii: Record<Categorie, L> = {
  locuinte: { ro: 'Locuințe', en: 'Housing' },
  public: { ro: 'Spații publice', en: 'Public space' },
  restaurare: { ro: 'Restaurare', en: 'Restoration' },
  memorial: { ro: 'Memorial', en: 'Memorial' },
};

export interface Imagine {
  src: string;
  w: number;
  h: number;
  alt: L;
  legenda?: L;
}

export interface Sectiune {
  titlu: L;
  text: L;
  imagine: Imagine;
  /** desen pe fundal alb, afișat întreg (fără decupare) */
  desen?: boolean;
}

export interface Proiect {
  slug: string;
  titlu: L;
  loc: L;
  an: string;
  stadiu: L;
  suprafata?: string;
  categorie: Categorie;
  rezumat: L;
  cover: Imagine;
  macheta: Imagine;
  sectiuni: Sectiune[];
  desene: Imagine[];
  galerie: Imagine[];
  credite: { rol: L; nume: string }[];
  /** imagini care se succed lent pe copertă (ex. aceeași vedere în anotimpuri) */
  anotimpuri?: Imagine[];
  /** un film scurt, pus pe o pagină a broșurii */
  video?: { src: string; poster: string; w: number; h: number; alt: L };
}

const DE_COMPLETAT: L = { ro: '[de completat]', en: '[to be added]' };

const imgDin = (slug: string) => (nume: string, w: number, h: number, alt: L, legenda?: L): Imagine => ({
  src: withBase(`/images/${slug}/${nume}.webp`), w, h, alt, legenda,
});
const c = imgDin('columbariu');
const k = imgDin('casa-karatistului');
const o = imgDin('comana');
const M = (ro: string, en: string): L => ({ ro: `Macheta, ${ro}`, en: `Model, ${en}` });

export const proiecte: Proiect[] = [
  {
    slug: 'comana',
    titlu: { ro: 'Casa 760, Comana', en: 'House 760, Comana' },
    loc: { ro: 'Strada Gelu Naum, Comana, Giurgiu', en: 'Gelu Naum Street, Comana, Giurgiu' },
    an: '[de completat]',
    stadiu: { ro: 'Proiect de restaurare', en: 'Restoration project' },
    categorie: 'restaurare',
    rezumat: {
      ro: 'Restaurarea unei case tradiționale de pe strada Gelu Naum din Comana și o intervenție nouă, din module ușoare de lemn și pânză, care readuce gospodăria în viața satului.',
      en: 'The restoration of a traditional house on Gelu Naum Street in Comana, with a new intervention of light timber-and-fabric modules that brings the household back into village life.',
    },
    cover: o('macheta-mare', 1500, 883, { ro: 'Macheta ansamblului, cu casa, gardul și copacii', en: 'Model of the ensemble, with the house, fence and trees' }),
    macheta: o('macheta-mare', 1500, 883, { ro: 'Macheta ansamblului, cu casa, gardul și copacii', en: 'Model of the ensemble, with the house, fence and trees' }),
    sectiuni: [
      {
        titlu: { ro: 'Cum se poate interveni semnificativ în acest țesut construit?', en: 'How can one intervene meaningfully in this built fabric?' },
        text: {
          ro: 'Studiul nostru în Comana a început când localnicii se aflau la un moment de cotitură în legătură cu abordarea lor asupra arhitecturii locale. Case tradiționale erau modificate, satul devenea indiferent la tradiție, iar localnicii nu beneficiau din turismul local ce aborda alt tip de arhitectură.',
          en: 'Our study in Comana began when the villagers were at a turning point in how they approached local architecture. Traditional houses were being altered, the village was growing indifferent to tradition, and locals did not benefit from a tourism that favoured another kind of architecture.',
        },
        imagine: o('coperta', 2000, 1486, { ro: 'Casă tradițională din Comana, cu tâmplăria parțial înlocuită', en: 'Traditional house in Comana, with its joinery partly replaced' }),
      },
      {
        titlu: { ro: 'Alegerea parcelei 760', en: 'Choosing plot 760' },
        text: {
          ro: 'Observând că strada Gelu Naum și-a păstrat identitatea tradițională cel mai bine, aceasta încă având case tradiționale fără alterări sau modificări majore, am ales parcela cu numărul 760 de pe această stradă pentru a contribui la revalorificarea patrimoniului local.',
          en: 'Noticing that Gelu Naum Street had best preserved its traditional identity, still having traditional houses without major alterations, we chose plot 760 on this street to help revalue the local heritage.',
        },
        imagine: o('parcela', 2000, 974, { ro: 'Planul străzii cu parcela 760 marcată și fotografia casei', en: 'Street plan with plot 760 marked, and a photo of the house' }),
        desen: true,
      },
      {
        titlu: { ro: 'Înțelegerea volumetriei unui modul', en: 'Understanding the volume of a module' },
        text: {
          ro: 'Fiecare modul reflectă prin structura scheletică, dar și prin îmbinarea de materiale, lemnul și pânza, temporalitatea și versatilitatea ansamblului.',
          en: 'Through its skeletal structure and its pairing of materials, timber and fabric, each module reflects the temporary and versatile nature of the ensemble.',
        },
        imagine: o('modul', 2000, 1727, { ro: 'Modulul: axonometrie, secțiune și plan', en: 'The module: axonometric view, section and plan' }),
        desen: true,
      },
    ],
    desene: [
      o('releveu', 2000, 1302, { ro: 'Releveul casei: plan, secțiune și fațade', en: 'Survey of the house: plan, section and elevations' }, { ro: 'Releveu', en: 'Survey' }),
      o('degradari', 2000, 1108, { ro: 'Releveul degradărilor', en: 'Survey of the damage' }, { ro: 'Releveu degradări', en: 'Damage survey' }),
      o('ferestre', 2000, 904, { ro: 'Abstractizarea ferestrei tradiționale', en: 'Abstraction of the traditional window' }, { ro: 'Abstractizarea ferestrei', en: 'Abstracting the window' }),
      o('interventii', 2000, 1036, { ro: 'Analiza noilor intervenții în relație cu parcela', en: 'Analysis of the new interventions in relation to the plot' }, { ro: 'Noile intervenții și parcela', en: 'New interventions and the plot' }),
      o('axonometrie', 2000, 1278, { ro: 'Axonometria parcelei cu intervenția', en: 'Axonometric view of the plot with the intervention' }, { ro: 'Axonometrie', en: 'Axonometric view' }),
      o('plan', 2000, 1103, { ro: 'Planul parcelei', en: 'Plan of the plot' }, { ro: 'Plan', en: 'Plan' }),
      o('sectiuni', 2000, 1349, { ro: 'Secțiuni longitudinale prin parcelă', en: 'Long sections through the plot' }, { ro: 'Secțiuni longitudinale', en: 'Long sections' }),
      o('sectiune-perspectiva', 2000, 962, { ro: 'Secțiune perspectivă prin curte', en: 'Perspective section through the yard' }, { ro: 'Secțiune perspectivă', en: 'Perspective section' }),
      o('perspective', 2000, 1582, { ro: 'Succesiune de perspective prin ansamblu', en: 'Sequence of perspectives through the ensemble' }, { ro: 'Succesiune de perspective', en: 'Sequence of perspectives' }),
      o('structura', 2000, 895, { ro: 'Structura intervenției, explodată', en: 'Exploded view of the structure' }, { ro: 'Structura', en: 'Structure' }),
      o('prinderi', 2000, 1118, { ro: 'Detalii de prindere ale structurii de lemn', en: 'Timber structure joint details' }, { ro: 'Detalii de prindere', en: 'Joint details' }),
      o('fatada-nord', 2000, 1324, { ro: 'Fațada nord', en: 'North elevation' }, { ro: 'Fațada nord', en: 'North elevation' }),
      o('bucatarie', 2000, 1366, { ro: 'Planul bucătăriei de vară', en: 'Plan of the summer kitchen' }, { ro: 'Bucătăria', en: 'The kitchen' }),
      o('sera', 1466, 2000, { ro: 'Axonometria serei', en: 'Axonometric view of the greenhouse' }, { ro: 'Sera', en: 'Greenhouse' }),
    ],
    galerie: [
      o('macheta', 2000, 1271, { ro: 'Colaj de fotografii ale machetei', en: 'Collage of model photographs' }),
      o('echipa', 2000, 1984, { ro: 'Patru imagini ale ansamblului', en: 'Four views of the ensemble' }),
      o('studiu-foto', 2000, 1003, { ro: 'Studiu foto al caselor de pe stradă', en: 'Photo study of the houses on the street' }),
      o('martori', 2000, 1117, { ro: 'Fotografii ale degradărilor casei', en: 'Photographs of the damage to the house' }),
    ],
    credite: [
      { rol: { ro: 'Echipa de proiect', en: 'Project team' }, nume: 'Tonciu Alexandra, împreună cu colegii [de completat]' },
    ],
  },
  {
    slug: 'columbariu',
    titlu: { ro: 'Columbariu', en: 'Columbarium' },
    loc: DE_COMPLETAT,
    an: '[de completat]',
    stadiu: { ro: 'Proiect', en: 'Design' },
    categorie: 'memorial',
    rezumat: {
      ro: 'Un zid lung de cărămidă, străpuns de șiruri de nișe, și un turn boltit care îl însoțește. Columbariul e gândit ca un loc de trecere lentă, între lumină și umbră.',
      en: 'A long brick wall pierced by rows of niches, accompanied by a vaulted tower. The columbarium is conceived as a place of slow passage, between light and shadow.',
    },
    cover: c('cover', 2400, 2400, { ro: 'Macheta columbariului', en: 'Model of the columbarium' }),
    macheta: c('macheta', 2400, 2400, { ro: 'Macheta columbariului, vedere frontală', en: 'Model of the columbarium, front view' }),
    sectiuni: [
      {
        titlu: { ro: 'Intervenția', en: 'The intervention' },
        text: {
          ro: 'Proiectul are două elemente: zidul columbariului, cu nișele pentru urne dispuse în registre orizontale, și turnul cu boltă în semicerc. Între ele rămâne un spațiu îngust, prin care se intră.',
          en: 'The project has two elements: the columbarium wall, with urn niches set in horizontal registers, and the tower with its semicircular vault. Between them lies a narrow space through which one enters.',
        },
        imagine: c('axonometrie', 2400, 2164, { ro: 'Axonometrie: zidul cu nișe și turnul', en: 'Axonometric view: the niche wall and the tower' }),
        desen: true,
      },
      {
        titlu: { ro: 'Plan', en: 'Plan' },
        text: {
          ro: 'În plan, nișele se înșiră de-a lungul unui coridor lung și drept, care se încheie cu absida turnului.',
          en: 'In plan, the niches line a long, straight corridor that ends in the apse of the tower.',
        },
        imagine: c('plan', 883, 2400, { ro: 'Planul columbariului', en: 'Plan of the columbarium' }),
        desen: true,
      },
      {
        titlu: { ro: 'Perspectivă', en: 'Perspective' },
        text: {
          ro: 'Privit din interiorul turnului, coridorul se strânge spre un singur punct de lumină.',
          en: 'Seen from inside the tower, the corridor narrows towards a single point of light.',
        },
        imagine: c('perspectiva', 2062, 2400, { ro: 'Perspectivă interioară spre coridorul cu nișe', en: 'Interior perspective towards the niche corridor' }),
        desen: true,
      },
    ],
    desene: [
      c('fatada', 2400, 1122, { ro: 'Fațada zidului cu nișe și turnul', en: 'Elevation of the niche wall and the tower' }, { ro: 'Fațadă', en: 'Elevation' }),
      c('fatada-lunga', 1534, 854, { ro: 'A doua fațadă a zidului și turnul', en: 'Second elevation of the wall and the tower' }, { ro: 'Fațadă', en: 'Elevation' }),
      c('sectiune-transversala', 2008, 2400, { ro: 'Vedere frontală a turnului', en: 'Front view of the tower' }, { ro: 'Turnul, vedere frontală', en: 'Tower, front view' }),
      c('sectiune-turn', 2400, 1737, { ro: 'Secțiune prin turn', en: 'Section through the tower' }, { ro: 'Secțiune prin turn', en: 'Section through the tower' }),
      c('detalii-nise', 521, 2400, { ro: 'Trei studii de plăci cu nișe', en: 'Three studies of niche panels' }, { ro: 'Studii de nișe', en: 'Niche studies' }),
    ],
    galerie: [
      c('macheta-detaliu-1', 2090, 2090, { ro: 'Detaliu al machetei: textura zidului cu nișe', en: 'Model detail: texture of the niche wall' }),
      c('macheta-detaliu-2', 2400, 2400, { ro: 'Macheta, zidul văzut în unghi', en: 'Model, the wall seen at an angle' }),
      c('macheta-interior-1', 2400, 2400, { ro: 'Macheta, trecerea dintre zid și turn', en: 'Model, the passage between wall and tower' }),
      c('macheta-interior-2', 2400, 2400, { ro: 'Macheta, coridorul spre ieșirea boltită', en: 'Model, the corridor towards the vaulted opening' }),
      c('macheta-interior-3', 2400, 2400, { ro: 'Macheta, privire prin deschidere', en: 'Model, view through the opening' }),
      c('macheta-interior-4', 2400, 2400, { ro: 'Macheta, turnul și zidul în contralumină', en: 'Model, the tower and wall against the light' }),
    ],
    credite: [
      { rol: { ro: 'Arhitectură', en: 'Architecture' }, nume: 'Tonciu Alexandra' },
      { rol: { ro: 'Machetă și desene', en: 'Model and drawings' }, nume: 'Tonciu Alexandra' },
    ],
  },
  {
    slug: 'casa-karatistului',
    titlu: { ro: 'Casa karatistului', en: 'The Karateka’s House' },
    loc: DE_COMPLETAT,
    an: '[de completat]',
    stadiu: { ro: 'Proiect', en: 'Design' },
    categorie: 'locuinte',
    rezumat: {
      ro: 'O casă așezată în trepte pe un versant împădurit. Volumele se decalează unul față de altul și coboară odată cu terenul, legate de o scară care traversează casa.',
      en: 'A house set in steps on a wooded slope. The volumes shift against one another and descend with the terrain, tied together by a stair that runs through the house.',
    },
    cover: k('cover', 1800, 1800, { ro: 'Macheta casei, cu volumele în consolă', en: 'Model of the house, with its cantilevered volumes' }),
    macheta: k('macheta', 1800, 1800, { ro: 'Macheta de teren: casa în trepte pe versant', en: 'Site model: the stepped house on the slope' }),
    sectiuni: [
      {
        titlu: { ro: 'Amplasament', en: 'Site' },
        text: {
          ro: 'Casa stă pe un versant, între copaci, deasupra unui drum. Accesul se face pe o potecă ce urcă dinspre drum.',
          en: 'The house sits on a slope among trees, above a road. It is reached by a path climbing up from the road.',
        },
        imagine: k('situatie', 1800, 1265, { ro: 'Plan de situație cu casa între copaci', en: 'Site plan with the house among the trees' }),
      },
      {
        titlu: { ro: 'Concept', en: 'Concept' },
        text: {
          ro: 'Schițele de studiu caută felul în care volume simple se pot decala și suprapune ca să urmeze panta.',
          en: 'The study sketches explore how simple volumes can shift and overlap to follow the slope.',
        },
        imagine: k('concept', 1800, 1281, { ro: 'Schițe de studiu ale volumelor decalate', en: 'Study sketches of the shifted volumes' }),
      },
      {
        titlu: { ro: 'Secțiune', en: 'Section' },
        text: {
          ro: 'În secțiune, fiecare nivel ocupă o treaptă a terenului, iar scara leagă nivelurile de-a lungul pantei.',
          en: 'In section, each level occupies a step of the terrain, while the stair links the levels along the slope.',
        },
        imagine: k('sectiune', 1800, 1259, { ro: 'Secțiune longitudinală prin casă și versant', en: 'Long section through the house and the slope' }),
      },
    ],
    desene: [
      k('fatada', 1800, 1242, { ro: 'Fațada casei pe versant', en: 'Elevation of the house on the slope' }, { ro: 'Fațadă', en: 'Elevation' }),
      k('plan-1', 1800, 1270, { ro: 'Plan de nivel cu terenul', en: 'Floor plan with terrain' }, { ro: 'Plan', en: 'Plan' }),
      k('plan-2', 1800, 1285, { ro: 'Plan de nivel cu terasa', en: 'Floor plan with terrace' }, { ro: 'Plan', en: 'Plan' }),
      k('plan-3', 1800, 1271, { ro: 'Plan de nivel cu terasele', en: 'Floor plan with terraces' }, { ro: 'Plan', en: 'Plan' }),
      k('sectiune-2', 1800, 1280, { ro: 'Secțiune transversală', en: 'Cross section' }, { ro: 'Secțiune', en: 'Section' }),
      k('sectiune-3', 1800, 1263, { ro: 'Secțiune transversală', en: 'Cross section' }, { ro: 'Secțiune', en: 'Section' }),
      k('sectiune-4', 1800, 1257, { ro: 'Secțiune longitudinală', en: 'Long section' }, { ro: 'Secțiune', en: 'Section' }),
      k('detalii-1', 1800, 1265, { ro: 'Detalii', en: 'Details' }, { ro: 'Detalii', en: 'Details' }),
      k('detalii-2', 1800, 1299, { ro: 'Detalii', en: 'Details' }, { ro: 'Detalii', en: 'Details' }),
    ],
    galerie: [
      k('macheta-1', 1800, 1800, M('volumele în consolă', 'the cantilevered volumes')),
      k('macheta-10', 1800, 1800, M('vedere frontală', 'front view')),
      k('macheta-3', 1800, 1800, M('structura în trepte', 'the stepped structure')),
      k('macheta-4', 1800, 1800, M('scara între niveluri', 'the stair between levels')),
      k('macheta-5', 1800, 1800, M('în exterior', 'outdoors')),
      k('macheta-6', 1800, 1800, M('terasele suprapuse', 'the stacked terraces')),
      k('macheta-7', 1800, 1800, M('interior cu scara', 'interior with the stair')),
      k('macheta-8', 1800, 1800, M('scara în lumină', 'the stair in light')),
      k('macheta-9', 1800, 1800, M('vedere de sus', 'top view')),
      k('macheta-12', 1800, 1800, M('între plante', 'among plants')),
      k('macheta-11', 1800, 1800, M('vedere de sus, contrast puternic', 'top view, high contrast')),
      k('macheta-2', 1800, 1800, M('colaj pe teren', 'collage on the terrain')),
    ],
    credite: [
      { rol: { ro: 'Arhitectură', en: 'Architecture' }, nume: 'Tonciu Alexandra' },
    ],
  },
];

// Proiect primit doar ca randări (2026-11-26). Numele, locul și textele așteaptă confirmarea lui Razvan;
// deocamdată apare doar pe paginile de prototip.
const n = imgDin('proiect-nou');
const R = (nume: string, ro: string, en: string) => n(nume, 1920, 1080, { ro, en });
const nou: Proiect = {
  slug: 'proiect-nou',
  titlu: { ro: 'Proiect nou', en: 'New project' },
  loc: DE_COMPLETAT,
  an: '[de completat]',
  stadiu: { ro: 'Randări', en: 'Renderings' },
  categorie: 'locuinte',
  rezumat: {
    ro: 'O casă de oraș cu un volum nou, alb, alipit de clădirea veche. Randările o urmăresc din stradă de-a lungul anotimpurilor, prin grădina cu pergolă verde și în interior, de dimineața până noaptea.',
    en: 'A town house with a new white volume joined to the old building. The renderings follow it from the street through the seasons, through the garden with its green pergola, and inside, from morning until night.',
  },
  cover: R('anotimp-1', 'Casa văzută din stradă, vara', 'The house seen from the street, in summer'),
  macheta: R('strada', 'Strada, cu volumul nou și partea vitrată', 'The street, with the new volume and its glazed part'),
  anotimpuri: [
    R('anotimp-1', 'Vara', 'Summer'), R('anotimp-2', 'Sfârșitul verii', 'Late summer'), R('anotimp-3', 'Toamna', 'Autumn'),
    R('anotimp-4', 'Toamna târziu', 'Late autumn'), R('anotimp-5', 'Începutul iernii', 'Early winter'),
    R('anotimp-6', 'Iarna', 'Winter'), R('anotimp-7', 'Iarna, cu zăpadă', 'Winter, with snow'),
  ],
  video: { src: withBase('/images/proiect-nou/video.mp4'), poster: withBase('/images/proiect-nou/video-poster.webp'), w: 1280, h: 720, alt: { ro: 'Film: strada iarna, sub ninsoare', en: 'Film: the street in winter, under snowfall' } },
  sectiuni: [],
  desene: [],
  galerie: [
    R('strada-zi', 'Fațada spre stradă, în lumina după-amiezii', 'The street front in afternoon light'),
    R('strada-seara', 'Fațada spre stradă, seara', 'The street front in the evening'),
    R('gradina', 'Grădina, cu treptele spre casă', 'The garden, with the steps up to the house'),
    R('pergola-1', 'Pergola verde, dimineața', 'The green pergola in the morning'),
    R('pergola-2', 'Lumina prin pergolă', 'Light through the pergola'),
    R('pergola-3', 'Pergola, la amiază', 'The pergola at noon'),
    R('pergola-4', 'Umbrele frunzelor pe zid', 'Leaf shadows on the wall'),
    R('pergola-5', 'Pergola, după-amiaza', 'The pergola in the afternoon'),
    R('interior-1', 'Interiorul, cu masa și bucătăria', 'The interior, with the table and the kitchen'),
    R('interior-2', 'Interiorul, dimineața', 'The interior in the morning'),
    R('interior-3', 'Interiorul, lumină rece', 'The interior in cool light'),
    R('interior-4', 'Interiorul, lumină caldă', 'The interior in warm light'),
    R('interior-5', 'Interiorul, spre seară', 'The interior towards evening'),
    R('interior-6', 'Interiorul, la apus', 'The interior at sunset'),
    R('interior-noapte', 'Interiorul, noaptea', 'The interior at night'),
  ],
  credite: [{ rol: { ro: 'Arhitectură', en: 'Architecture' }, nume: 'Tonciu Alexandra' }],
};

/** proiectele de pe paginile de prototip: cele publicate plus cele încă neconfirmate */
export const proiectePrototip: Proiect[] = [...proiecte, nou];

/** variante mai mici ale imaginii (generate de tools/variante-imagini.py) */
export const srcset = (src: string) => `${src.replace(/\.webp$/, '-800.webp')} 800w, ${src.replace(/\.webp$/, '-1400.webp')} 1400w, ${src} 2000w`;
