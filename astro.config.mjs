// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://tom-girou.dev",

  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  build: {
    inlineStylesheets: "always",
  },

  // Astro 7 changed the default to "jsx", which drops spaces between inline
  // elements (e.g. "Senior Lead Dev" → "SeniorLead Dev"). Keep the v6
  // HTML-aware compression.
  compressHTML: true,

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Bricolage Grotesque",
      cssVariable: "--display",
      weights: ["400 800"],
      styles: ["normal"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--mono",
      weights: ["400 600"],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
  ],

  integrations: [sitemap({
    i18n: {
      defaultLocale: "en",
      locales: { en: "en", fr: "fr", es: "es" },
    },
  })],
});