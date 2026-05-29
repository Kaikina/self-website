import type { Locale, Translation } from "../i18n/types";
import { localeHtmlLang, locales, getLocalizedPath } from "../i18n/types";

export const SITE = "https://tom-girou.dev";
export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;
const TECH_STACK_ID = `${SITE}/#tech-stack`;

export function projectIdFromIdx(idx: string): string {
  return `${SITE}/#project-${idx}`;
}

type Employer = {
  slug: string;
  name: string;
  current?: boolean;
  url?: string;
  sameAs?: string[];
  schemaType?: string;
};

const EMPLOYERS: Employer[] = [
  {
    slug: "evolutive",
    name: "Evolutive",
    current: true,
    url: "https://www.evolutive.com/",
    sameAs: ["https://www.linkedin.com/company/evolutive-group/"],
    schemaType: "ProfessionalService",
  },
  {
    slug: "thermcross",
    name: "Thermcross",
    url: "https://www.thermcross.fr/",
    schemaType: "Corporation",
  },
  {
    slug: "emagineurs",
    name: "Emagineurs",
    url: "https://www.emagineurs.com/",
    schemaType: "ProfessionalService",
  },
  {
    slug: "wedoogift",
    name: "Wedoogift",
    sameAs: ["https://www.linkedin.com/company/pluxee/"],
    schemaType: "Corporation",
  },
];

const SKILLS: string[] = [
  "PHP",
  "Symfony",
  "PrestaShop",
  "MySQL",
  "PostgreSQL",
  "JavaScript",
  "TypeScript",
  "SCSS",
  "Java",
  "Spring Boot",
  "Angular",
  "AWS",
  "Docker",
  "CI/CD",
  "Git",
  "REST API design",
  "ERP integration",
  "WordPress",
  "WP-CLI",
  "TYPO3",
  "Ruby",
  "Perl",
  "Technical leadership",
  "Agile estimation",
  "Backlog triage",
  "Code review",
  "Web application security",
];

function orgId(slug: string): string {
  return `${SITE}/#org-${slug}`;
}

function findEmployer(co: string): Employer | undefined {
  const lower = co.toLowerCase();
  return EMPLOYERS.find((e) => lower.includes(e.name.toLowerCase()));
}

function parseStartYear(when: string): string | undefined {
  const m = when.match(/(\d{4})/);
  return m?.[1];
}

function parseEndYear(when: string): string | undefined {
  const all = when.match(/\d{4}/g);
  return all && all.length >= 2 ? all[1] : undefined;
}

const SITE_LAUNCH_DATE = "2026-05-21";

export function buildSchemaGraph(
  locale: Locale,
  t: Translation,
  canonical: string,
  ogImage: string,
  buildDate: string = new Date().toISOString(),
): Record<string, unknown> {
  const lang = localeHtmlLang[locale];
  const webpageId = `${canonical}#webpage`;
  const breadcrumbId = `${canonical}#breadcrumb`;

  const employerOrgs = EMPLOYERS.map((e) => {
    const node: Record<string, unknown> = {
      "@type": e.schemaType ?? "Organization",
      "@id": orgId(e.slug),
      name: e.name,
    };
    if (e.url) node.url = e.url;
    if (e.sameAs) node.sameAs = e.sameAs;
    return node;
  });

  const experienceItems = t.experience.rows.map((row, i) => {
    const employer = findEmployer(row.co);
    const startYear = parseStartYear(row.when);
    const endYear = row.isNow ? undefined : parseEndYear(row.when);
    const role: Record<string, unknown> = {
      "@type": "EmployeeRole",
      roleName: row.role,
      description: row.desc,
    };
    if (startYear) role.startDate = startYear;
    if (endYear) role.endDate = endYear;
    role.memberOf = employer
      ? { "@id": orgId(employer.slug) }
      : { "@type": "Organization", name: row.co };
    return {
      "@type": "ListItem",
      position: i + 1,
      item: role,
    };
  });

  const workItems = t.work.items.map((it, i) => {
    const item: Record<string, unknown> = {
      "@type": "CreativeWork",
      "@id": `${SITE}/#project-${it.idx}`,
      name: it.title,
      about: it.client,
      keywords: it.stack.join(", "),
      contributor: { "@id": PERSON_ID },
      inLanguage: lang,
    };
    if (it.url) item.url = it.url;
    return {
      "@type": "ListItem",
      position: i + 1,
      item,
    };
  });

  const stackItems = t.stack.items.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "DefinedTerm",
      name: s.name,
      inDefinedTermSet: { "@id": TECH_STACK_ID },
    },
  }));

  const alternateUrls = locales.map((l) => `${SITE}${getLocalizedPath(l)}`);

  const certifications = t.certifications?.items ?? [];
  const credentialNodes = certifications.map((cert, i) => ({
    "@type": "EducationalOccupationalCredential",
    "@id": `${SITE}/#credential-${i + 1}`,
    name: cert.name,
    credentialCategory: "Professional certification",
    url: cert.url,
    recognizedBy: {
      "@type": "Organization",
      name: cert.issuer,
      url: "https://www.prestashop.com",
    },
    about: { "@id": `${SITE}/#org-prestashop` },
    inLanguage: lang,
  }));

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Tom Girou",
    givenName: "Tom",
    familyName: "Girou",
    url: `${SITE}/`,
    mainEntityOfPage: { "@id": webpageId },
    image: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
    jobTitle: "Senior Lead Web Developer",
    description: t.meta.description,
    knowsLanguage: ["en", "fr", "es"],
    knowsAbout: SKILLS,
    sameAs: [
      "https://www.linkedin.com/in/tgirou",
      "https://github.com/Kaikina",
    ],
    nationality: { "@type": "Country", name: "France" },
    address: { "@type": "PostalAddress", addressCountry: "FR" },
    homeLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "FR" },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 45.4159939,
        longitude: 4.5159721,
      },
    },
    worksFor: { "@id": orgId("evolutive") },
    hasCredential: credentialNodes.map((c) => ({ "@id": c["@id"] as string })),
    alumniOf: EMPLOYERS.filter((e) => !e.current).map((e) => ({
      "@id": orgId(e.slug),
    })),
    hasOccupation: {
      "@type": "Occupation",
      name: "Senior Lead Web Developer",
      occupationLocation: { "@type": "Country", name: "France" },
      skills: SKILLS.join(", "),
      responsibilities:
        "Technical leadership, PrestaShop core & module development, API and ERP integrations, CI/CD pipelines, backlog triage, sprint planning.",
      qualifications: "7+ years of professional web development experience.",
      experienceRequirements: "Senior / Lead level",
    },
  };

  const prestashopOrg: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#org-prestashop`,
    name: "PrestaShop",
    url: "https://www.prestashop.com",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "E-commerce platform",
    operatingSystem: "Web",
    sameAs: ["https://github.com/PrestaShop/PrestaShop"],
    contributor: { "@id": PERSON_ID },
  };

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE}/`,
    name: "Tom Girou — Senior Lead Dev",
    description: t.meta.description,
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    copyrightHolder: { "@id": PERSON_ID },
    copyrightYear: 2026,
    inLanguage: ["en", "fr", "es"],
  };

  const profilePage: Record<string, unknown> = {
    "@type": "ProfilePage",
    "@id": webpageId,
    url: canonical,
    name: t.meta.title,
    description: t.meta.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
    inLanguage: lang,
    primaryImageOfPage: { "@type": "ImageObject", url: ogImage },
    breadcrumb: { "@id": breadcrumbId },
    datePublished: SITE_LAUNCH_DATE,
    dateModified: buildDate,
    significantLink: [
      "https://www.linkedin.com/in/tgirou",
      "https://github.com/Kaikina",
    ],
    alternateName: alternateUrls,
  };

  const breadcrumb: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: canonical,
      },
    ],
  };

  const workList: Record<string, unknown> = {
    "@type": "ItemList",
    "@id": `${canonical}#work-list`,
    name: "Selected Work",
    description: t.work.blurb,
    numberOfItems: workItems.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: workItems,
  };

  const experienceList: Record<string, unknown> = {
    "@type": "ItemList",
    "@id": `${canonical}#experience-list`,
    name: "Professional Experience",
    description: t.experience.blurb,
    numberOfItems: experienceItems.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: experienceItems,
  };

  const stackTermSet: Record<string, unknown> = {
    "@type": "DefinedTermSet",
    "@id": TECH_STACK_ID,
    name: "Core Tech Stack",
    description: t.stack.blurb,
  };

  const stackList: Record<string, unknown> = {
    "@type": "ItemList",
    "@id": `${canonical}#stack-list`,
    name: "Core Tech Stack",
    numberOfItems: stackItems.length,
    itemListElement: stackItems,
  };

  const sideProjectApps = (t.sideProjects?.items ?? []).map((it) => {
    const appId = `${SITE}/#app-${it.name.toLowerCase().replace(/\s+/g, "-")}`;
    const node: Record<string, unknown> = {
      "@type": "SoftwareApplication",
      "@id": appId,
      name: it.name,
      description: it.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      keywords: it.stack.join(", "),
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    };
    if (it.liveUrl) node.url = it.liveUrl;
    if (it.sourceUrl) node.codeRepository = it.sourceUrl;
    if (it.status) node.creativeWorkStatus = it.status;
    return node;
  });

  const sideProjectsList: Record<string, unknown> | null =
    sideProjectApps.length > 0
      ? {
          "@type": "ItemList",
          "@id": `${canonical}#side-projects-list`,
          name: "Side Projects",
          description: t.sideProjects.blurb,
          numberOfItems: sideProjectApps.length,
          itemListElement: sideProjectApps.map((app, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@id": app["@id"] as string },
          })),
        }
      : null;

  const faqPage: Record<string, unknown> | null = t.faq && t.faq.items.length > 0
    ? {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        url: `${canonical}#faq`,
        name: "Frequently asked questions",
        inLanguage: lang,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: t.faq.items.map((it, i) => ({
          "@type": "Question",
          "@id": `${canonical}#faq-q-${i + 1}`,
          name: it.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: it.a,
            inLanguage: lang,
          },
        })),
      }
    : null;

  const siteNav: Record<string, unknown> = {
    "@type": "SiteNavigationElement",
    "@id": `${canonical}#site-nav`,
    name: [
      t.nav.about,
      t.nav.work,
      t.nav.stack,
      t.nav.experience,
      t.nav.words,
    ],
    url: [
      `${canonical}#about`,
      `${canonical}#work`,
      `${canonical}#stack`,
      `${canonical}#experience`,
      `${canonical}#testimonials`,
    ],
  };

  const contactPage: Record<string, unknown> = {
    "@type": "ContactPage",
    "@id": `${canonical}#contact`,
    url: `${canonical}#contact`,
    name: t.footer.cta,
    description: t.footer.sub,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    inLanguage: lang,
    significantLink: ["https://www.linkedin.com/in/tgirou"],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      ...employerOrgs,
      prestashopOrg,
      website,
      profilePage,
      breadcrumb,
      workList,
      experienceList,
      stackTermSet,
      stackList,
      siteNav,
      contactPage,
      ...credentialNodes,
      ...sideProjectApps,
      ...(sideProjectsList ? [sideProjectsList] : []),
      ...(faqPage ? [faqPage] : []),
    ],
  };
}
