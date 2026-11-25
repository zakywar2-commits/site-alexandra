// Datele proiectelor. TEXTELE SUNT PROVIZORII: înlocuiește-le cu descrierile reale.
// Imaginile stau în public/images/<slug>/ (acum sunt SVG-uri provizorii).
import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

export type Categorie = 'locuinte' | 'public' | 'restaurare';
export const categorii: Record<Categorie, L> = {
  locuinte: { ro: 'Locuințe', en: 'Housing' },
  public: { ro: 'Spații publice', en: 'Public space' },
  restaurare: { ro: 'Restaurare', en: 'Restoration' },
};

export interface Proiect {
  slug: string;
  titlu: L;
  loc: L;
  an: string;
  stadiu: L;
  suprafata?: string;
  categorie: Categorie;
  rezumat: L;
  situatie: L;
  interventie: L;
  perspectiva: L;
  credite: { rol: L; nume: string }[];
  ext: 'svg' | 'jpg' | 'webp';
  galerie: number;
}

const img = (p: Proiect, nume: string) => `/images/${p.slug}/${nume}.${p.ext}`;
export const imagini = (p: Proiect) => ({
  cover: img(p, 'cover'),
  macheta: img(p, 'macheta'),
  situatie: img(p, 'situatie'),
  interventie: img(p, 'interventie'),
  perspectiva: img(p, 'perspectiva'),
  galerie: Array.from({ length: p.galerie }, (_, i) => img(p, `galerie-${i + 1}`)),
});

const crediteStandard = [
  { rol: { ro: 'Arhitectură', en: 'Architecture' }, nume: 'Razvan [nume complet]' },
  { rol: { ro: 'Fotografie', en: 'Photography' }, nume: '[de completat]' },
];

export const proiecte: Proiect[] = [
  {
    slug: 'comana',
    titlu: { ro: 'Comana', en: 'Comana' },
    loc: { ro: 'Comana, Giurgiu', en: 'Comana, Giurgiu' },
    an: '2024',
    stadiu: { ro: 'Proiect', en: 'Design' },
    categorie: 'public',
    rezumat: {
      ro: 'Text provizoriu: o intervenție discretă la marginea parcului natural, gândită ca o prelungire a peisajului.',
      en: 'Placeholder text: a quiet intervention at the edge of the nature park, conceived as an extension of the landscape.',
    },
    situatie: {
      ro: 'Text provizoriu despre amplasament: relația cu lunca Neajlovului, accesul, orientarea și vecinătățile.',
      en: 'Placeholder text about the site: its relation to the Neajlov floodplain, access, orientation and surroundings.',
    },
    interventie: {
      ro: 'Text provizoriu despre intervenție: conceptul, volumetria, materialele și felul în care clădirea se așază în teren.',
      en: 'Placeholder text about the intervention: concept, massing, materials and how the building sits in the land.',
    },
    perspectiva: {
      ro: 'Text provizoriu: cum este perceput proiectul la nivelul ochiului, dinspre drumul de acces.',
      en: 'Placeholder text: how the project is perceived at eye level, approaching from the access road.',
    },
    credite: crediteStandard,
    ext: 'svg',
    galerie: 4,
  },
  {
    slug: 'casa-snagov',
    titlu: { ro: 'Casă la Snagov', en: 'House in Snagov' },
    loc: { ro: 'Snagov, Ilfov', en: 'Snagov, Ilfov' },
    an: '2023',
    stadiu: { ro: 'Realizat', en: 'Built' },
    categorie: 'locuinte',
    rezumat: { ro: 'Proiect exemplu, de înlocuit.', en: 'Sample project, to be replaced.' },
    situatie: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    interventie: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    perspectiva: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    credite: crediteStandard,
    ext: 'svg',
    galerie: 4,
  },
  {
    slug: 'locuinte-cotroceni',
    titlu: { ro: 'Locuințe Cotroceni', en: 'Cotroceni Housing' },
    loc: { ro: 'București', en: 'Bucharest' },
    an: '2022',
    stadiu: { ro: 'Concurs', en: 'Competition' },
    categorie: 'restaurare',
    rezumat: { ro: 'Proiect exemplu, de înlocuit.', en: 'Sample project, to be replaced.' },
    situatie: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    interventie: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    perspectiva: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    credite: crediteStandard,
    ext: 'svg',
    galerie: 4,
  },
  {
    slug: 'pavilion-herastrau',
    titlu: { ro: 'Pavilion în parc', en: 'Park pavilion' },
    loc: { ro: 'București', en: 'Bucharest' },
    an: '2021',
    stadiu: { ro: 'Proiect', en: 'Design' },
    categorie: 'public',
    rezumat: { ro: 'Proiect exemplu, de înlocuit.', en: 'Sample project, to be replaced.' },
    situatie: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    interventie: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    perspectiva: { ro: 'Text provizoriu.', en: 'Placeholder text.' },
    credite: crediteStandard,
    ext: 'svg',
    galerie: 4,
  },
];
