import { defineConfig } from 'astro/config';

// Pe GitHub Pages site-ul stă la https://zakywar2-commits.github.io/site-alexandra/.
// Când se leagă un domeniu propriu: schimbă `site` și scoate `base`.
export default defineConfig({
  site: 'https://zakywar2-commits.github.io',
  base: '/site-alexandra',
  trailingSlash: 'always',
});
