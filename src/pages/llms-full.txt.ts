import type { APIRoute } from "astro";
import en from "../i18n/en";

const SITE = "https://tom-girou.dev";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

export const GET: APIRoute = () => {
  const t = en;
  const lines: string[] = [];

  lines.push("# Tom Girou — Senior Lead Web Developer");
  lines.push("");
  lines.push(`> ${t.meta.description}`);
  lines.push("");
  lines.push(`Canonical URL: ${SITE}/`);
  lines.push("Last updated: portfolio 2026");
  lines.push("");

  lines.push("## Identity");
  lines.push("");
  lines.push("- Full name: Tom Girou");
  lines.push("- Role: Senior Lead Web Developer");
  lines.push("- Current employer: Evolutive (https://www.evolutive.com/)");
  lines.push("- Based in: France (Loire region — 45.4159939° N, 4.5159721° E)");
  lines.push("- Working languages: English, French, Spanish");
  lines.push("- LinkedIn: https://www.linkedin.com/in/tgirou");
  lines.push("- GitHub: https://github.com/Kaikina");
  lines.push("- Personal site: https://tom-girou.dev/");
  lines.push("- Availability: open to senior & lead roles, freelance briefs, and rescue missions");
  lines.push("");

  lines.push("## Positioning");
  lines.push("");
  lines.push(t.about.quote);
  lines.push("");
  lines.push(stripHtml(t.about.headingHtml));
  lines.push("");
  lines.push("Stats:");
  lines.push(`- 7+ ${t.about.stats.years.toLowerCase()}`);
  lines.push(`- 10+ ${t.about.stats.projects.toLowerCase()}`);
  lines.push(`- 8+ ${t.about.stats.clients.toLowerCase()}`);
  lines.push("");

  lines.push("## Core Stack");
  lines.push("");
  lines.push(t.stack.blurb);
  lines.push("");
  lines.push("Primary tools:");
  for (const item of t.stack.items) {
    lines.push(`- ${item.name}`);
  }
  lines.push("");
  lines.push(
    "Extended toolbelt: Java, Spring Boot, Angular, AWS, Docker, CI/CD, REST API design, ERP integration, WordPress, WP-CLI, TYPO3, Ruby, Perl, Git, Agile estimation, backlog triage, code review, web application security.",
  );
  lines.push("");

  lines.push("## Selected Work");
  lines.push("");
  lines.push(t.work.blurb);
  lines.push("");
  for (const it of t.work.items) {
    const stack = it.stack.join(", ");
    lines.push(`### ${it.idx}. ${it.title} — ${it.client}`);
    if (it.url) lines.push(`Live site: ${it.url}`);
    lines.push(`Stack: ${stack}`);
    lines.push("");
  }

  lines.push("## Experience");
  lines.push("");
  lines.push(t.experience.blurb);
  lines.push("");
  for (const row of t.experience.rows) {
    lines.push(`### ${row.when} — ${row.role} at ${row.co}`);
    lines.push(row.desc);
    lines.push("");
  }

  lines.push("## Open Source");
  lines.push("");
  lines.push(t.openSource.blurb);
  lines.push("");
  lines.push(
    "- PrestaShop core contributor as @Kaikina: https://github.com/PrestaShop/PrestaShop/commits?author=Kaikina",
  );
  lines.push("- Project repository: https://github.com/PrestaShop/PrestaShop");
  lines.push("");

  lines.push("## Certifications");
  lines.push("");
  lines.push(t.certifications.blurb);
  lines.push("");
  for (const cert of t.certifications.items) {
    lines.push(`- ${cert.name} — issued by ${cert.issuer}, verify on ${cert.via}: ${cert.url}`);
  }
  lines.push("");

  lines.push("## FAQ");
  lines.push("");
  lines.push(t.faq.blurb);
  lines.push("");
  lines.push(
    `Translations available at ${SITE}/fr/#faq (French) and ${SITE}/es/#faq (Spanish).`,
  );
  lines.push("");
  for (const item of t.faq.items) {
    lines.push(`### ${item.q}`);
    lines.push("");
    lines.push(item.a);
    lines.push("");
  }

  lines.push("## Contact");
  lines.push("");
  lines.push(t.footer.sub);
  lines.push("");
  lines.push("- LinkedIn (preferred): https://www.linkedin.com/in/tgirou");
  lines.push("- GitHub: https://github.com/Kaikina");
  lines.push("");

  lines.push("## Site Map");
  lines.push("");
  lines.push(`- English (default): ${SITE}/`);
  lines.push(`- French: ${SITE}/fr/`);
  lines.push(`- Spanish: ${SITE}/es/`);
  lines.push(`- Sitemap index: ${SITE}/sitemap-index.xml`);
  lines.push(`- LLM index: ${SITE}/llms.txt`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
