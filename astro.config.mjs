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

/**
 * Map of sitemap URL → `lastmod` ISO date, built from blog post frontmatter so
 * the sitemap carries recrawl-prioritization hints (@astrojs/sitemap emits no
 * `lastmod` on its own). Uses `updatedDate` when present, else `pubDate`.
 *
 * Runs outside the Astro runtime (no `astro:content`), so it parses frontmatter
 * dates from the raw files — same convention as `thinTagUrls()`. Each post's URL
 * follows the `getStaticPaths` shape in blog/[slug].astro (EN unprefixed, fr/es
 * prefixed, trailing slash). The blog index per locale gets the newest post date.
 */
function postLastmods() {
  const map = new Map();
  const newestByLocale = new Map();
  for (const locale of LOCALES) {
    const dir = fileURLToPath(new URL(`./src/content/blog/${locale}/`, import.meta.url));
    let files;
    try {
      files = readdirSync(dir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    const prefix = locale === "en" ? "" : `${locale}/`;
    for (const file of files) {
      const raw = readFileSync(`${dir}${file}`, "utf8");
      if (/^draft:\s*true\b/m.test(raw)) continue;
      const pub = raw.match(/^pubDate:\s*(.+)$/m)?.[1].trim();
      const upd = raw.match(/^updatedDate:\s*(.+)$/m)?.[1].trim();
      const stamp = upd || pub;
      if (!stamp) continue;
      const date = new Date(stamp.replace(/^["']|["']$/g, ""));
      if (Number.isNaN(date.getTime())) continue;
      const iso = date.toISOString();
      const slug = file.replace(/\.md$/, "");
      map.set(`${SITE}/${prefix}blog/${slug}/`, iso);
      const prev = newestByLocale.get(locale);
      if (!prev || iso > prev) newestByLocale.set(locale, iso);
    }
  }
  for (const [locale, iso] of newestByLocale) {
    const prefix = locale === "en" ? "" : `${locale}/`;
    map.set(`${SITE}/${prefix}blog/`, iso);
  }
  return map;
}

const POST_LASTMODS = postLastmods();

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
    serialize(item) {
      const lastmod = POST_LASTMODS.get(item.url);
      if (lastmod) item.lastmod = lastmod;
      return item;
    },
    i18n: {
      defaultLocale: "en",
      locales: { en: "en", fr: "fr", es: "es" },
    },
  })],
});