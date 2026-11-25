// Generează imagini provizorii (SVG) până sosesc pozele reale.
// Rulare: node scripts/placeholders.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const projects = {
  comana: ['#c9c1b4', '#8d8373'],
  'casa-snagov': ['#b9c2bd', '#6f7d76'],
  'locuinte-cotroceni': ['#c4bdb8', '#7e7068'],
  'pavilion-herastrau': ['#bfc0c6', '#6e7180'],
};
const kinds = {
  cover: [1600, 1067], macheta: [1800, 1200], situatie: [1600, 1067],
  interventie: [1600, 1067], perspectiva: [2000, 1125],
  'galerie-1': [1600, 1067], 'galerie-2': [1067, 1600], 'galerie-3': [1600, 1067], 'galerie-4': [1600, 1067],
};

function drawing(kind, w, h, ink) {
  const cx = w / 2, cy = h / 2, s = Math.min(w, h);
  if (kind === 'macheta' || kind === 'cover') {
    // volum axonometric simplu
    const a = s * 0.22, b = s * 0.12, hgt = s * 0.18;
    const p = (x, y) => `${(cx + x).toFixed(1)},${(cy + y).toFixed(1)}`;
    return `<g fill="none" stroke="${ink}" stroke-width="${s * 0.003}">
      <polygon points="${p(-a, 0)} ${p(0, -b)} ${p(a, 0)} ${p(0, b)}" fill="${ink}" fill-opacity=".08"/>
      <polygon points="${p(-a, 0)} ${p(-a, -hgt)} ${p(0, -b - hgt)} ${p(a, -hgt)} ${p(a, 0)} ${p(0, b)}" />
      <line x1="${cx - a}" y1="${cy - hgt}" x2="${cx}" y2="${cy + b - hgt}"/>
      <line x1="${cx + a}" y1="${cy - hgt}" x2="${cx}" y2="${cy + b - hgt}"/>
      <line x1="${cx}" y1="${cy + b - hgt}" x2="${cx}" y2="${cy + b}"/>
    </g>`;
  }
  if (kind === 'situatie') {
    let l = '';
    for (let i = 1; i < 8; i++) l += `<line x1="0" y1="${(h / 8) * i}" x2="${w}" y2="${(h / 8) * i - h * 0.1}" />`;
    return `<g stroke="${ink}" stroke-opacity=".35" stroke-width="${s * 0.002}">${l}</g>
      <rect x="${cx - s * 0.1}" y="${cy - s * 0.07}" width="${s * 0.2}" height="${s * 0.14}" fill="${ink}" fill-opacity=".5"/>`;
  }
  // secțiune / perspectivă: linie de orizont + cadre
  return `<g fill="none" stroke="${ink}" stroke-width="${s * 0.003}">
    <line x1="0" y1="${h * 0.62}" x2="${w}" y2="${h * 0.62}"/>
    <rect x="${w * 0.28}" y="${h * 0.3}" width="${w * 0.44}" height="${h * 0.32}"/>
    <line x1="${w * 0.42}" y1="${h * 0.3}" x2="${w * 0.42}" y2="${h * 0.62}"/>
    <line x1="${w * 0.58}" y1="${h * 0.3}" x2="${w * 0.58}" y2="${h * 0.62}"/>
  </g>`;
}

for (const [slug, [bg, ink]] of Object.entries(projects)) {
  mkdirSync(`public/images/${slug}`, { recursive: true });
  for (const [kind, [w, h]] of Object.entries(kinds)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  ${drawing(kind, w, h, ink)}
  <text x="${w * 0.03}" y="${h - w * 0.03}" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(w * 0.016)}" fill="${ink}">Imagine provizorie · ${slug} / ${kind}</text>
</svg>`;
    writeFileSync(`public/images/${slug}/${kind}.svg`, svg);
  }
}
console.log('ok');
