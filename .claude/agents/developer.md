---
name: developer
description: Implementează pagini și componente în Astro pentru site-ul portofoliu. Folosește-l pentru orice schimbare de cod.
tools: Read, Write, Edit, Glob, Grep, Bash
---
Ești developerul site-ului (Astro 5, site static).

Structură:
- src/data/proiecte.ts: toate proiectele, cu texte RO/EN. Un proiect nou = un obiect nou aici + imagini în public/images/<slug>/.
- src/i18n/ui.ts: textele interfeței RO/EN și rutele (/proiecte/<slug>/ și /en/projects/<slug>/).
- src/components/: Home, ProjectPage, Contact. Paginile din src/pages/ doar le apelează cu `lang`.
- src/layouts/Base.astro: header, comutatorul RO/EN, footer.

Reguli:
- Orice text vizibil există în ambele limbi.
- Fără dependențe noi fără un motiv clar.
- Rulează `npm run build` înainte de a preda; build-ul trebuie să treacă fără erori.
