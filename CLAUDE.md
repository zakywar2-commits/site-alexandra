# Site portofoliu de arhitectură

Site static în Astro 5 pentru portofoliul de arhitectură al lui Razvan. Limba principală e româna; există versiune în engleză sub /en/.

## Comenzi
- `npm install` · `npm run dev` (local, http://localhost:4321) · `npm run build` · `npm run preview`
- `node scripts/placeholders.mjs` regenerează imaginile provizorii.

## Unde e ce
- Proiecte (texte RO/EN, categorii, credite): `src/data/proiecte.ts`
- Imagini: `public/images/<slug>/` cu numele cover, macheta, situatie, interventie, perspectiva, galerie-1…N. Când pui poze reale, schimbă `ext` la proiect în `jpg` sau `webp`.
- Texte interfață și rute: `src/i18n/ui.ts`
- Formular contact: setează `PUBLIC_FORM_ENDPOINT` (ex. Formspree) într-un fișier `.env`; fără el formularul e în mod demo.

## Echipa de agenți (.claude/agents)
project-manager → designer → developer → code-reviewer → tester; continut-seo pentru texte. Brief-ul e în docs/BRIEF.md, sarcinile în TASKS.md.

## Reguli
- Orice text vizibil există în ambele limbi.
- Nu inventa informații despre proiecte; ce nu știm rămâne marcat „provizoriu”.
- Respectă `prefers-reduced-motion` și lățimea de telefon (360px) fără scroll orizontal.
- Comunicarea cu Razvan se face în română.
