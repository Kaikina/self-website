import type { APIRoute } from "astro";
import en from "../i18n/en";
import { blogPath, getPostsByLocale, parsePostId } from "../lib/blog";

const SITE = "https://tom-girou.dev";

export const GET: APIRoute = async () => {
  const t = en;
  const lines: string[] = [];
  const posts = await getPostsByLocale("en");

  lines.push("# Tom Girou");
  lines.push("");
  lines.push(`> ${t.meta.description}`);
  lines.push("");

  lines.push("## About");
  lines.push("");
  lines.push(
    "Tom Girou is a Senior Lead Web Developer based in France. PHP, Symfony, and PrestaShop core & module specialist with 7+ years across e-commerce platforms, gift-card systems, ERP integrations, and CI/CD pipelines.",
  );
  lines.push("");
  lines.push(`- Site: ${SITE}/`);
  lines.push("- LinkedIn: https://www.linkedin.com/in/tgirou");
  lines.push("- GitHub: https://github.com/Kaikina");
  lines.push("- Location: France (Loire region)");
  lines.push("- Languages: English, French, Spanish");
  lines.push("");

  lines.push("## Stack");
  lines.push("");
  lines.push(
    "PHP · Symfony · PrestaShop · MySQL · PostgreSQL · JavaScript · TypeScript · SCSS · Java · Spring Boot · Angular · AWS · Docker · CI/CD · REST APIs · ERP integration · WordPress · WP-CLI · TYPO3 · Ruby · Perl",
  );
  lines.push("");

  lines.push("## Selected Work");
  lines.push("");
  for (const it of t.work.items) {
    const stack = it.stack.join(", ");
    const label = `${it.title} — ${it.client}`;
    if (it.url) {
      lines.push(`- [${label}](${it.url}): ${stack}.`);
    } else {
      lines.push(`- ${label}: ${stack}.`);
    }
  }
  lines.push("");

  lines.push("## Experience");
  lines.push("");
  for (const row of t.experience.rows) {
    lines.push(`- **${row.when} — ${row.role}, ${row.co}.** ${row.desc}`);
  }
  lines.push("");

  lines.push("## Open Source");
  lines.push("");
  lines.push(
    "- PrestaShop core contributor as @Kaikina: https://github.com/PrestaShop/PrestaShop/commits?author=Kaikina",
  );
  lines.push("");

  if (posts.length > 0) {
    lines.push("## Blog");
    lines.push("");
    lines.push(t.blog.metaDescription);
    lines.push("");
    for (const p of posts) {
      const url = `${SITE}${blogPath("en", parsePostId(p.id).slug)}`;
      const date = p.data.pubDate.toISOString().slice(0, 10);
      lines.push(`- [${p.data.title}](${url}) (${date}): ${p.data.description}`);
    }
    lines.push("");
    lines.push(`Feed: ${SITE}/rss.xml`);
    lines.push("");
  }

  lines.push("## Certifications");
  lines.push("");
  for (const cert of t.certifications.items) {
    lines.push(`- [${cert.name}](${cert.url}): issued by ${cert.issuer}, verifiable on ${cert.via}.`);
  }
  lines.push("");

  lines.push("## FAQ");
  lines.push("");
  lines.push(
    `Frequently asked questions are answered in full at ${SITE}/#faq (translations at ${SITE}/fr/#faq and ${SITE}/es/#faq). Topics covered:`,
  );
  lines.push("");
  for (const item of t.faq.items) {
    lines.push(`- ${item.q}`);
  }
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  lines.push(
    "Preferred channel: LinkedIn — https://www.linkedin.com/in/tgirou",
  );
  lines.push("");

  lines.push("## Optional");
  lines.push("");
  lines.push(`- [Full content (llms-full.txt)](${SITE}/llms-full.txt)`);
  lines.push(`- [Sitemap](${SITE}/sitemap-index.xml)`);
  lines.push(`- [French translation](${SITE}/fr/)`);
  lines.push(`- [Spanish translation](${SITE}/es/)`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
