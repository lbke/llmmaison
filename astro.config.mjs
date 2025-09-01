// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel/static';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://llmmaison.agencellm.fr',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 8,
  }),
});