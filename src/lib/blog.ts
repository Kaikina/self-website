import { getCollection, type CollectionEntry } from "astro:content";
import type { MarkdownHeading } from "astro";
import { getLocalizedPath, type Locale } from "../i18n/types";
import { tagSlug } from "./tags";

export { tagSlug } from "./tags";
export { INDEX_TAG_MIN_POSTS } from "./tags";

export type BlogPost = CollectionEntry<"blog">;

const WORDS_PER_MINUTE = 210;
const isProd = import.meta.env.PROD;

const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
};

/** Split a blog entry id ("<locale>/<slug>") into its parts. */
export function parsePostId(id: string): { locale: Locale; slug: string } {
  const [locale, ...rest] = id.split("/");
  return { locale: locale as Locale, slug: rest.join("/") };
}

/**
 * Locale-aware URL for a post (or the blog index when `slug` is omitted).
 * EN lives at `/blog/...`, fr/es at `/fr/blog/...` — mirrors getLocalizedPath().
 */
export function blogPath(locale: Locale, slug?: string): string {
  const base = getLocalizedPath(locale); // "/" | "/fr/" | "/es/"
  return slug ? `${base}blog/${slug}/` : `${base}blog/`;
}

/** Drafts are hidden in production builds, visible during dev. */
function visible(post: BlogPost): boolean {
  return !post.data.draft || !isProd;
}

export function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

export function readingTime(body: string): number {
  return Math.max(1, Math.round(wordCount(body) / WORDS_PER_MINUTE));
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Headings rendered into the table of contents (H2 + H3 only). */
export function buildToc(headings: MarkdownHeading[]): MarkdownHeading[] {
  return headings.filter((h) => h.depth === 2 || h.depth === 3);
}

/** All visible posts for a locale, newest first. */
export async function getPostsByLocale(locale: Locale): Promise<BlogPost[]> {
  const all = await getCollection("blog", visible);
  return all
    .filter((p) => parsePostId(p.id).locale === locale)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** The same post in every locale that has a translation, keyed by locale. */
export async function getPostTranslations(
  post: BlogPost,
): Promise<Map<Locale, BlogPost>> {
  const all = await getCollection("blog", visible);
  const map = new Map<Locale, BlogPost>();
  for (const p of all) {
    if (p.data.translationKey === post.data.translationKey) {
      map.set(parsePostId(p.id).locale, p);
    }
  }
  return map;
}

/**
 * Up to `n` related posts in the same locale, ranked by shared tags then
 * recency. Returns [] when there are no other posts (caller hides the block).
 */
export async function getRelatedPosts(
  post: BlogPost,
  n = 3,
): Promise<BlogPost[]> {
  const { locale } = parsePostId(post.id);
  const others = (await getPostsByLocale(locale)).filter((p) => p.id !== post.id);
  const tags = new Set(post.data.tags);
  return others
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime(),
    )
    .slice(0, n)
    .map((s) => s.p);
}

/** The next-older post in the same locale, or null. */
export async function getPreviousPost(post: BlogPost): Promise<BlogPost | null> {
  const { locale } = parsePostId(post.id);
  const posts = await getPostsByLocale(locale);
  const idx = posts.findIndex((p) => p.id === post.id);
  return idx >= 0 && idx + 1 < posts.length ? posts[idx + 1] : null;
}

// ───────────────────────── Tags ─────────────────────────

/** Locale-aware URL for a tag page. */
export function tagPath(locale: Locale, slug: string): string {
  return `${blogPath(locale)}tag/${slug}/`;
}

/** Unique tags used by a locale's posts, with display label, slug and count. */
export async function getTagsByLocale(
  locale: Locale,
): Promise<{ tag: string; slug: string; count: number }[]> {
  const posts = await getPostsByLocale(locale);
  const map = new Map<string, { tag: string; count: number }>();
  for (const p of posts) {
    for (const tag of p.data.tags) {
      const slug = tagSlug(tag);
      const existing = map.get(slug);
      if (existing) existing.count++;
      else map.set(slug, { tag, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, tag: v.tag, count: v.count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts in a locale carrying the given tag slug, newest first. */
export async function getPostsByTag(
  locale: Locale,
  slug: string,
): Promise<BlogPost[]> {
  const posts = await getPostsByLocale(locale);
  return posts.filter((p) => p.data.tags.some((t) => tagSlug(t) === slug));
}
