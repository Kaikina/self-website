export const locales = ["en", "fr", "es"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  es: "es",
};

export const localeOgLocale: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
};

export type WorkItem = {
  idx: string;
  title: string;
  client: string;
  stack: string[];
  url?: string;
  caseStudySlug?: string;
};

export type TimelineRow = {
  when: string;
  isNow?: boolean;
  role: string;
  co: string;
  desc: string;
};

export type Certification = {
  name: string;
  issuer: string;
  via: string;
  url: string;
};

export type Testimonial = {
  q: string;
  n: string;
  r: string;
  attributable?: {
    jobTitle?: string;
    sameAs?: string[];
    datePublished?: string;
  };
};

export type Translation = {
  meta: {
    title: string;
    description: string;
    ogImageAlt: string;
  };
  nav: {
    about: string;
    work: string;
    stack: string;
    experience: string;
    words: string;
    faq: string;
    connect: string;
    menuOpen: string;
    menuClose: string;
  };
  hero: {
    currently: string;
    available: string;
    portfolioYear: string;
    nameSmall: string;
    titleLine1: string;
    titleLine2: string;
    blurb: string;
    cta: string;
    portraitAlt: string;
  };
  about: {
    label: string;
    quote: string;
    headingHtml: string;
    stats: { years: string; projects: string; clients: string };
  };
  work: {
    label: string;
    titleHtml: string;
    blurb: string;
    items: WorkItem[];
  };
  stack: {
    label: string;
    titleHtml: string;
    blurb: string;
    items: { glyph: string; name: string }[];
  };
  experience: {
    label: string;
    titleHtml: string;
    blurb: string;
    nowLabel: string;
    rows: TimelineRow[];
  };
  testimonials: {
    label: string;
    titleHtml: string;
    blurb: string;
    subheadHtml: string;
    feedbackLabel: string;
    items: Testimonial[];
    prevAria: string;
    nextAria: string;
  };
  openSource: {
    label: string;
    titleHtml: string;
    blurb: string;
    cardAlt: string;
    repoLabel: string;
    repoLinkText: string;
  };
  certifications: {
    label: string;
    titleHtml: string;
    blurb: string;
    issuedByLabel: string;
    verifyOnLabel: string;
    statusLabel: string;
    items: Certification[];
  };
  sideProjects: {
    label: string;
    titleHtml: string;
    blurb: string;
    items: {
      name: string;
      tagline: string;
      description: string;
      stack: string[];
      status?: string;
      liveUrl?: string;
      liveLabel?: string;
      sourceUrl?: string;
      sourceLabel?: string;
      previewImage?: string;
      previewAlt?: string;
    }[];
  };
  footer: {
    label: string;
    headingHtml: string;
    sub: string;
    cta: string;
    rights: string;
    build: string;
    linkedinAria: string;
    githubAria: string;
  };
  caseStudy: {
    backToWork: string;
    visitLiveSite: string;
    backToAllWork: string;
    outcomeLabel: string;
    roleLabel: string;
    durationLabel: string;
    stackLabel: string;
  };
  faq: {
    label: string;
    titleHtml: string;
    blurb: string;
    items: { q: string; a: string }[];
  };
};

export function getLocalizedPath(locale: Locale, hash = ""): string {
  const base = locale === defaultLocale ? "/" : `/${locale}/`;
  return hash ? `${base}${hash.startsWith("#") ? hash : `#${hash}`}` : base;
}
