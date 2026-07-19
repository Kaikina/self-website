// Pure tag helpers with no `astro:content` dependency, so they can be imported
// both from the content-collection code (blog.ts) and from astro.config.mjs
// (which runs outside the Astro runtime).

/** URL-safe slug for a tag ("CI/CD" -> "ci-cd", "Code Review" -> "code-review"). */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Minimum posts a tag needs before its archive page is worth indexing.
 * Below this, the page is thin content (just <h1>#tag</h1> + one card): it's
 * rendered `noindex,follow` and kept out of the sitemap to avoid index bloat.
 */
export const INDEX_TAG_MIN_POSTS = 2;
