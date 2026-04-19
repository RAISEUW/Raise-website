// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://raise.uw.edu',
  integrations: [
    mdx(),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});