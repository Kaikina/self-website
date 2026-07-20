import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Blog posts live at src/content/blog/<locale>/<slug>.md. The id keeps the
// "<locale>/<slug>" shape, so the locale is the first path segment and the slug
// is the basename. `translationKey` groups the same post across locales for the
// language switcher and hreflang alternates.
const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // Optional social-card image (PNG/JPG/WebP). Used for OG/Twitter when the
      // on-page `cover` is an SVG, which social crawlers don't render.
      ogImage: image().optional(),
      translationKey: z.string(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
