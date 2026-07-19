// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, fontProviders } from 'astro/config';

import sitemap from "@astrojs/sitemap";
import { INDEX_TAG_MIN_POSTS, tagSlug } from "./src/lib/tags.ts";

const SITE = "https://tom-girou.dev";
const LOCALES = ["en", "fr", "es"];

/**
 * Full URLs of sparse tag archives (< INDEX_TAG_MIN_POSTS posts) to keep out of
 * the sitemap — they render `noindex,follow` (see blog/tag/[tag].astro), so
 * listing them would just feed crawlers thin content.
 *
 * Read from raw frontmatter rather than the content collection because this runs
 * outside the Astro runtime (no `astro:content`). Assumes the repo convention of
 * a single-line `tags: [...]` array; drafts (`draft: true`) are excluded to match
 * the production build.
 */
function thinTagUrls() {
  const urls = new Set();
  for (const locale of LOCALES) {
    const dir = fileURLToPath(new URL(`./src/content/blog/${locale}/`, import.meta.url));
    let files;
    try {
      files = readdirSync(dir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    const counts = new Map();
    for (const file of files) {
      const raw = readFileSync(`${dir}${file}`, "utf8");
      if (/^draft:\s*true\b/m.test(raw)) continue;
      const m = raw.match(/^tags:\s*\[(.*)\]/m);
      if (!m) continue;
      const tags = m[1]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      for (const tag of tags) {
        const slug = tagSlug(tag);
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
    const prefix = locale === "en" ? "" : `${locale}/`;
    for (const [slug, count] of counts) {
      if (count < INDEX_TAG_MIN_POSTS) urls.add(`${SITE}/${prefix}blog/tag/${slug}/`);
    }
  }
  return urls;
}

const THIN_TAG_URLS = thinTagUrls();

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
    filter: (page) => !THIN_TAG_URLS.has(page),
    i18n: {
      defaultLocale: "en",
      locales: { en: "en", fr: "fr", es: "es" },
    },
  })],
});