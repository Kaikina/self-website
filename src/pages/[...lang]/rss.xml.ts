import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getTranslation, type Locale } from "../../i18n";
import { blogPath, getPostsByLocale, parsePostId } from "../../lib/blog";

export function getStaticPaths() {
  return [
    { params: { lang: undefined }, props: { locale: "en" as const } },
    { params: { lang: "fr" }, props: { locale: "fr" as const } },
    { params: { lang: "es" }, props: { locale: "es" as const } },
  ];
}

export async function GET(context: APIContext) {
  const { locale } = context.props as { locale: Locale };
  const t = getTranslation(locale);
  const posts = await getPostsByLocale(locale);

  return rss({
    title: t.blog.metaTitle,
    description: t.blog.metaDescription,
    site: context.site ?? "https://tom-girou.dev",
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: blogPath(locale, parsePostId(p.id).slug),
      categories: p.data.tags,
    })),
    customData: `<language>${locale}</language>`,
  });
}
