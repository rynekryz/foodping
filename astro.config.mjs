import { defineConfig } from 'astro/config';
const site = process.env.SITE ?? 'https://rynekryz.github.io';
const base = process.env.BASE_PATH ?? '/foodping';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'always',
  },
});
