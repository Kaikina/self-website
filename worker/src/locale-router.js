// Locale router for tom-girou.dev/
//
// Replaces the nginx Accept-Language redirect at `location = /` so the EN
// homepage can be cached at Cloudflare's edge. fr/es visitors are 302'd to
// /fr/ or /es/ (which nginx serves directly, no Worker hop).
//
// Route binding: tom-girou.dev/  (exact, root only).

const LOCALE_PATHS = { fr: "/fr/", es: "/es/" };
const EDGE_CACHE_TTL_SECONDS = 600;

function isSameOriginReferer(request, origin) {
  const referer = request.headers.get("Referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === origin;
  } catch {
    return false;
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // The Worker route is "/" exact, but guard against misconfig.
    if (url.pathname !== "/") {
      return fetch(request);
    }

    // Auto-detect only on entry from outside the site. A same-origin Referer
    // means the visitor clicked the in-site language switcher (or otherwise
    // navigated from /fr/ or /es/ to /) and explicitly wants EN — bouncing
    // them back on Accept-Language would make the switcher unusable.
    if (!isSameOriginReferer(request, url.origin)) {
      const primary = (request.headers.get("Accept-Language") || "")
        .trim()
        .slice(0, 2)
        .toLowerCase();

      const target = LOCALE_PATHS[primary];
      if (target) {
        return Response.redirect(`${url.origin}${target}`, 302);
      }
    }

    // EN: pull from origin and let Cloudflare cache it at the edge.
    // Origin still sends Cache-Control: no-cache so browsers revalidate,
    // but `cacheEverything` overrides that for CF's own cache.
    return fetch(request, {
      cf: {
        cacheTtl: EDGE_CACHE_TTL_SECONDS,
        cacheEverything: true,
      },
    });
  },
};
