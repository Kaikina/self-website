# tom-girou.dev

Source for my personal portfolio at [tom-girou.dev](https://tom-girou.dev) — a static, trilingual (EN / FR / ES) single-page site with per-project case studies, built with [Astro](https://astro.build/).

## Stack

- Astro 6 (static output, no client framework)
- TypeScript (`astro/tsconfigs/strict`)
- Markdown content collections for case studies, with a zod-validated frontmatter schema
- JSON-LD (schema.org Person + CreativeWork graph) and an `llms.txt` family generated at build time
- nginx + Cloudflare Tunnel for production hosting (Docker Compose)

## Local development

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output to dist/
npm run preview    # serve the built dist/ locally
npm run astro check
```

Node 20+ recommended.

## Project layout

```
src/
  pages/
    [...lang]/
      index.astro              # the home page (one file, all sections)
      work/[slug].astro        # case-study route
    llms.txt.ts                # /llms.txt — generated from i18n/en.ts
    llms-full.txt.ts           # /llms-full.txt
  content/
    work/{en,fr,es}/<slug>.md  # case studies, one file per locale
  i18n/
    {en,fr,es}.ts              # UI strings (typed by types.ts)
    types.ts                   # Translation type + locale helpers
  layouts/WorkLayout.astro
  lib/
    schema.ts                  # JSON-LD graph builder
    format.ts                  # tiny HTML helpers
  assets/, env.d.ts
public/                        # favicon, og-image, robots, humans, site.js
astro.config.mjs               # i18n + sitemap + Google Fonts
nginx.conf, docker-compose.yml # production runtime
```

### i18n

`astro.config.mjs` uses `prefixDefaultLocale: false`, so English lives at `/` and the other locales at `/fr/` and `/es/`. The `Accept-Language` redirect on `/` is performed by nginx, not Astro — the static root must stay reachable for the default locale.

UI strings live in `src/i18n/{en,fr,es}.ts` and conform to the `Translation` type in `src/i18n/types.ts`. Adding a field means updating the type and all three locale files; `astro check` catches the diff.

### Adding a case study

1. Drop `src/content/work/en/<slug>.md` (plus `fr/` and `es/` siblings) — frontmatter is validated by `src/content.config.ts`.
2. Keep the `idx` frontmatter field unique and stable: it backs the JSON-LD `@id` (`#project-<idx>`).
3. Locales without a translation simply won't appear in the case-study language switcher — the `getStaticPaths` in `src/pages/[...lang]/work/[slug].astro` derives `availableLocales` from what actually exists on disk.

## Production

```sh
npm run build
docker compose up -d
```

`docker-compose.yml` runs two containers: `nginx:1.27-alpine` (serves `./dist` read-only, bound live) and `cloudflare/cloudflared` (publishes the site through a Cloudflare Tunnel using `CLOUDFLARE_TUNNEL_TOKEN` from `.env`). A subsequent `npm run build` updates the served site without restarting containers.

`nginx.conf` ships content-hashed `/_astro/*` assets as `immutable`, every other static asset as `must-revalidate`, and sets the page-level CSP.

## License

All rights reserved — code published for transparency; copy, content, and design are not licensed for reuse.
