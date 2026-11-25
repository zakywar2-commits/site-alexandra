# Site portofoliu de arhitectură

Site static în Astro 5 pentru portofoliul de arhitectură al Alexandrei Tonciu (site administrat de Razvan). Limba principală e româna; există versiune în engleză sub /en/.

## Comenzi
- `npm install` · `npm run dev` (local, http://localhost:4321) · `npm run build` · `npm run preview`

## Unde e ce
- Proiecte (texte RO/EN, categorii, credite): `src/data/proiecte.ts`
- Imagini: `public/images/<slug>/`, WebP, latura mare 1800–2400px. Fiecare imagine e declarată în `proiecte.ts` cu lățime, înălțime și text alternativ RO/EN.
- Un proiect are: macheta (imaginea mare de sus, se micșorează la scroll), secțiuni text + imagine, desene (grilă pe alb), galerie (fundal închis), credite.
- Textele proiectului Comana sunt preluate din planșele de prezentare; la celelalte două sunt scrise după desene și trebuie confirmate.
- Texte interfață și rute: `src/i18n/ui.ts`
- Formular contact: setează `PUBLIC_FORM_ENDPOINT` (ex. Formspree) într-un fișier `.env`; fără el formularul e în mod demo.

## Echipa de agenți (.claude/agents)
project-manager → designer → developer → code-reviewer → tester; continut-seo pentru texte. Brief-ul e în docs/BRIEF.md, sarcinile în TASKS.md.

## Reguli
- Orice text vizibil există în ambele limbi.
- Nu inventa informații despre proiecte; ce nu știm rămâne „[de completat]” (pe prima pagină aceste câmpuri sunt ascunse).
- Respectă `prefers-reduced-motion` și lățimea de telefon (360px) fără scroll orizontal.
- Comunicarea cu Razvan se face în română.
