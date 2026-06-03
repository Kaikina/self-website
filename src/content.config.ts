import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/work",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    idx: z.string(),
    title: z.string(),
    client: z.string(),
    summary: z.string(),
    liveUrl: z.string().url().optional(),
    role: z.string(),
    year: z.string().optional(),
    duration: z.string().optional(),
    industry: z.string().optional(),
    stack: z.array(z.string()),
    metrics: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
