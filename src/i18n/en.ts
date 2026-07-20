import type { Translation } from "./types";

const en: Translation = {
  meta: {
    title: "Tom Girou — Senior Lead Dev",
    description:
      "Senior Lead Dev — PHP, Symfony & PrestaShop. I help companies cut backlogs from 200+ tickets to under 50 and finally breathe between sprints.",
    ogImageAlt: "Tom Girou — Senior Lead Dev portfolio",
  },
  nav: {
    about: "About",
    work: "Work",
    stack: "Stack",
    experience: "Experience",
    words: "Words",
    faq: "FAQ",
    blog: "Blog",
    connect: "Connect on LinkedIn",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  hero: {
    currently: "Currently",
    available: "Available",
    portfolioYear: "Portfolio / 2026",
    nameSmall: "Tom Girou",
    titleLine1: "Senior",
    titleLine2: "Lead Dev",
    blurb:
      "I help companies cut their backlog from 200+ tickets to under 50 — and finally breathe between sprints.",
    cta: "Let's Talk",
    portraitAlt: "Portrait of Tom Girou",
  },
  about: {
    label: "[ 01 / About ]",
    quote:
      "Turning sprawling backlogs into shippable apps — one cleanly factored module at a time.",
    headingHtml:
      "Hi, I'm Tom — a <em>Senior Lead Dev</em> who treats clean code as the shortest path between a brief and a shipped feature.",
    stats: {
      years: "Years of Experience",
      projects: "Shipped Projects",
      clients: "Clients Served",
    },
  },
  work: {
    label: "[ 02 / Selected Work ]",
    titleHtml: 'Recent <em style="color:var(--red);font-style:italic">work</em>.',
    blurb:
      "A decade of e‑commerce platforms, gift-card systems, and ERP-bound systems — each one shipped, audited, and quietly humming in production.",
    items: [
      {
        idx: "01",
        title: "Tactical Sports Marketplace",
        client: "DG-Airsoft",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.destockage-games.com/",
        caseStudySlug: "dg-airsoft",
      },
      {
        idx: "02",
        title: "Footwear E-commerce",
        client: "Les Tropéziennes",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.lestropeziennes.fr/fr/",
        caseStudySlug: "les-tropeziennes",
      },
      {
        idx: "03",
        title: "Collectibles Marketplace",
        client: "Sylvanian Families",
        stack: ["PrestaShop", "PHP"],
        url: "https://sylvanianfamilies-boutique.fr/",
        caseStudySlug: "sylvanian-families",
      },
      {
        idx: "04",
        title: "Cakes Storefront",
        client: "Maison Colibri",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.maison-colibri.com/fr/",
        caseStudySlug: "maison-colibri",
      },
      {
        idx: "05",
        title: "Wellness & Herbalism Shop",
        client: "Herbiolys",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.herbiolys.fr/fr/",
        caseStudySlug: "herbiolys",
      },
      {
        idx: "06",
        title: "E-commerce Suite",
        client: "Thermcross",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.thermcross.fr/fr/",
        caseStudySlug: "thermcross",
      },
      {
        idx: "07",
        title: "Gift Card Platform",
        client: "Wedoogift · Pluxee",
        stack: ["Java", "Spring Boot", "Angular"],
        caseStudySlug: "wedoogift",
      },
      {
        idx: "08",
        title: "WordPress Site Generator",
        client: "Wedoogift · Pluxee",
        stack: ["WordPress", "PHP", "Bash"],
        caseStudySlug: "wordpress-site-generator",
      },
    ],
  },
  stack: {
    label: "[ 03 / Core Stack ]",
    titleHtml:
      'What I <em style="color:var(--red);font-style:italic">build</em> with.',
    blurb:
      "A pragmatic stack — PHP at the core, JavaScript at the surface, and the right glue in between. No buzzwords, just tools that ship.",
    items: [
      { glyph: "P", name: "PHP" },
      { glyph: "My", name: "MySQL" },
      { glyph: "Pg", name: "Postgres" },
      { glyph: "Sf", name: "Symfony" },
      { glyph: "Js", name: "JavaScript" },
      { glyph: "Sc", name: "SCSS" },
    ],
  },
  experience: {
    label: "[ 04 / Experience ]",
    titleHtml:
      "Where I've <em style=\"color:var(--red);font-style:italic\">built</em>.",
    blurb:
      "From startup to web agencies. Each role sharpened a different muscle — from cloud infra and CI/CD to leading PrestaShop core integrations.",
    nowLabel: "2023 — Now",
    rows: [
      {
        when: "2023 — Now",
        isNow: true,
        role: "PHP Developer · Tech Lead",
        co: "Evolutive",
        desc:
          "Technical leadership and full-stack PrestaShop core & module development. Resource planning, Agile estimations, robust API/ERP integrations, and CI/CD quality assurance.",
      },
      {
        when: "2022 — 2023",
        role: "PHP Developer",
        co: "Thermcross",
        desc:
          "Full-stack e-commerce and backend development specializing in PrestaShop integration, custom PHP/PIM applications, and automated ERP data-sync pipelines — all under Agile.",
      },
      {
        when: "2020 — 2022",
        role: "R&D Engineer",
        co: "Emagineurs",
        desc:
          "Full-stack development, API integration and security engineering across TYPO3, WordPress, and Ruby — specializing in financial tools, automation, and web application security.",
      },
      {
        when: "2018 — 2019",
        role: "Fullstack Web Developer",
        co: "Wedoogift",
        desc:
          "Full-stack & DevOps using Angular, Spring Boot, and AWS — built CI/CD pipelines, shipped under Agile, and authored the documentation that scaled with the team.",
      },
    ],
  },
  testimonials: {
    label: "[ 05 / Words ]",
    titleHtml:
      'Kind <em style="color:var(--red);font-style:italic">words</em>.',
    blurb:
      "Words from people I've worked with, in their own voice.",
    feedbackLabel: "[ feedback ]",
    subheadHtml:
      "Genuine words from teams who <em>actually shipped</em>.",
    items: [
      {
        q:
          "I had the chance to manage Tom for a year. His is a very operational profile, involved as much in production work as in technical estimation and internal R&D.\n\nBeyond his technical skills, I particularly valued his commitment and his drive to grow the teams around him. We notably worked together on rolling out a continuous-integration process in a complex setting — a project he carried through to production with seriousness and persistence.\n\nTom has a frankness that can be surprising at first, but it's also what makes him transparent and honest. As long as the relationship is grounded in rigor, leading by example, and trust, he knows how to question himself and remains someone deeply reliable.\n\nHe's the kind of profile you can count on to move things forward, take responsibility, and deliver.",
        n: "Noël Peix Boisdon",
        r: "IT Manager · Moufly",
        attributable: {
          jobTitle: "IT Manager",
          sameAs: [
            "https://www.linkedin.com/in/no%C3%ABl-peix-boisdon-05183a80/",
            "https://www.moufly.io/",
          ],
          datePublished: "2026-05-24",
        },
      },
    ],
    prevAria: "Previous",
    nextAria: "Next",
  },
  openSource: {
    label: "[ 06 / Open Source ]",
    titleHtml:
      'Contributing to <em style="color:var(--red);font-style:italic">PrestaShop</em>.',
    blurb:
      "Beyond client work, I give back to the platform I build on every day — patching core, reviewing PRs, and helping move PrestaShop forward in the open.",
    cardAlt: "PrestaShop contribution summary for @Kaikina",
    repoLabel: "Repository",
    repoLinkText: "prestashop/prestashop",
  },
  certifications: {
    label: "[ 07 / Certifications ]",
    titleHtml:
      'Certified <em style="color:var(--red);font-style:italic">PrestaShop Expert</em>.',
    blurb:
      "Two official PrestaShop Expert certifications — Core for backend and module work, Front for theme and storefront work. Both verifiable on Procertif.",
    issuedByLabel: "Issued by",
    verifyOnLabel: "Verify on",
    statusLabel: "Certified",
    items: [
      {
        name: "PrestaShop Expert — Core Skills",
        issuer: "PrestaShop",
        via: "Procertif",
        url: "https://app.procertif.com/parchment/2511TOMGIR400/check",
      },
      {
        name: "PrestaShop Expert — Front Skills",
        issuer: "PrestaShop",
        via: "Procertif",
        url: "https://app.procertif.com/parchment/2602TOMGIR716/check",
      },
    ],
  },
  sideProjects: {
    label: "[ 08 / Side Projects ]",
    titleHtml:
      'Things I <em style="color:var(--red);font-style:italic">build</em> on the side.',
    blurb:
      "Personal apps I ship and run in production — usually to scratch my own itch, sometimes turning into tools other developers can plug into too.",
    items: [
      {
        name: "RepoWrapped",
        tagline: "Spotify-Wrapped-style stats for any GitHub repo",
        description:
          "Sign in with GitHub, point at any public owner/repo, and get a shareable stats page — commits, lines added & removed, first commit date, your activity on the repo — plus a live-refreshing SVG card you can drop into your profile README. A two-tier Redis + Postgres cache keeps stats fresh without burning the GitHub API on every render. The card embedded in the Open Source section above is generated by this app.",
        stack: ["Laravel", "PHP", "Postgres", "Redis", "Tailwind"],
        status: "Live",
        liveUrl: "https://repo-wrapped.tom-girou.dev",
        liveLabel: "Open the app",
        sourceUrl: "https://github.com/Kaikina/repo-wrapped",
        sourceLabel: "Source on GitHub",
      },
      {
        name: "Forgemage.net",
        tagline: "An async marketplace for Dofus item enchanters",
        description:
          "A fansite for the Dofus MMORPG community — think Malt, but for smithmaguses. Players drop an enchant request online with the stats they want; experienced smithmagus profiles browse open jobs, claim one, and chat in-app to plan a meet in-game. Reviews and ratings build reputation after every job. The whole point is async: instead of standing around trade hubs hoping someone competent is logged in, you file the request, build your gear, and let the right person find you. Smithmagus profiles keep being discoverable even while they're offline in the game.",
        stack: ["Symfony 7", "PHP 8.4", "PostgreSQL", "Mercure", "FrankenPHP", "Stimulus"],
        status: "Live",
        liveUrl: "https://forgemage.net",
        liveLabel: "Open the app",
      },
    ],
  },
  footer: {
    label: "[ 10 / Get in touch ]",
    headingHtml: "Let's build something <em>worth shipping</em>.",
    sub:
      "Open to senior & lead roles, freelance briefs, and the occasional rescue mission. The fastest way to me is LinkedIn — I read every message.",
    cta: "Reach out on LinkedIn",
    rights: "© 2026 · Tom Girou · All rights reserved",
    build: "v1.0 / Built in France",
    linkedinAria: "LinkedIn",
    githubAria: "GitHub",
  },
  caseStudy: {
    backToWork: "Selected Work",
    visitLiveSite: "Visit live site",
    backToAllWork: "Back to all work",
    outcomeLabel: "— Outcome",
    roleLabel: "Role",
    durationLabel: "Duration",
    stackLabel: "Stack",
  },
  faq: {
    label: "[ 09 / FAQ ]",
    titleHtml:
      'Frequently asked <em style="color:var(--red);font-style:italic">questions</em>.',
    blurb:
      "The questions that come up most often when someone is considering working with me — answered straight, in my own voice.",
    items: [
      {
        q: "What does Tom Girou do?",
        a:
          "I'm a Senior Lead Web Developer based in France, with 7+ years across PHP, Symfony, and PrestaShop. I help e-commerce companies rescue stalled migrations, integrate ERPs, build custom modules, and bring sprawling backlogs back under control. I'm currently at Evolutive in France; recent client work is listed on this site.",
      },
      {
        q: "What's your background?",
        a:
          "I started as a helpdesk agent at Wedoogift (now Pluxee) in 2016 while finishing my development degree, then moved into full-stack Java / Spring Boot / Angular work there as a work-study developer. After graduating I joined Emagineurs as R&D engineer (TYPO3, WordPress, Ruby, security), then Thermcross as in-house PHP developer on a large-scale PrestaShop migration and ERP integration. Since 2023 I've been at Evolutive as PHP Developer and Tech Lead, focused on PrestaShop core and module work for e-commerce clients.",
      },
      {
        q: "Do you specialize in PrestaShop?",
        a:
          "Yes — PrestaShop is where I spend most of my time, and it's the stack I'd point to first if you're deciding whether I'm the right fit. I work at the core and module level across 1.7, 8, and the current 9 release: custom modules, multishop setups, ERP and third-party integrations, theme work, and the performance and security passes a store accumulates as it grows. I also contribute to PrestaShop core itself under @Kaikina on GitHub, mostly fixing the friction I hit in client work rather than chasing feature tickets. That two-way view — building on top of PrestaShop all day and occasionally patching the thing underneath — is what tends to make the difference on the awkward problems. Most of the projects listed on this site are PrestaShop builds: airsoft, footwear, apparel, collectibles, herbal medicine, HVAC parts. If your project is PrestaShop, it's squarely what I do.",
      },
      {
        q: "Can you handle PrestaShop migrations (1.5 → 1.7 → 8 → 9)?",
        a:
          "Yes — it's some of the work I'm asked for most. I've shipped multi-step PrestaShop migrations across several real projects: large multi-shop migrations, major-version upgrades that needed deep core-level work, and stretches where a legacy install had to keep running in production while its replacement was built alongside it. The same approach carries into PrestaShop 9, the current major release. The version bump itself is rarely the hard part. What eats the time is everything hanging off the shop — third-party and custom modules that assume the old APIs, an ERP sync that has to keep matching orders and stock the whole way through, theme overrides written against internals that moved, and years of business rules buried in the database that nobody documented. So I plan a migration around those risks first and treat the core upgrade as the part that goes to plan, because it usually does and they usually don't.",
      },
      {
        q: "What about ERP integrations?",
        a:
          "Most of the PrestaShop work I do touches an ERP or some third-party system sooner or later, so integration is a core part of the job rather than a side quest. I've connected storefronts to ERPs, market-data feeds, and support tooling, and in practice the integration takes one of three shapes: synchronous webservice calls when the answer has to be live, scheduled cron-driven batches when a nightly reconcile is enough, and queued asynchronous pipelines when the volume is high or the third party is slow and a customer can't be left waiting on it. Picking the wrong shape is where these projects usually hurt — a synchronous call that ties checkout to a flaky ERP, or a batch that quietly drifts out of sync between runs. So the real work isn't writing the connector; it's matching the pattern to the data volume, the SLAs, and how much staleness the business can actually tolerate. I've shipped all three.",
      },
      {
        q: "Do you work with non-PrestaShop stacks?",
        a:
          "Yes. Outside PrestaShop I've shipped production work in Symfony, Java with Spring Boot, AngularJS and modern Angular, Perl (data integration), Slim Framework (greenfield PIM), WordPress with WP-CLI and AWS CloudFormation, TYPO3, and Ruby. AWS infrastructure has been part of several projects — EC2, RDS, S3, CloudFormation, Route 53, Certificate Manager — and I've configured CI/CD pipelines on Jenkins, GitLab, and similar.",
      },
      {
        q: "Are you available for freelance briefs or new roles?",
        a:
          "Yes — I'm open to senior and lead roles, freelance briefs, and the occasional rescue mission on a stalled PrestaShop project. The fastest way to start a conversation is LinkedIn; I read every message. I can engage on short or long missions, remote-first, with on-site possible for the right scope. A typical engagement starts with a 30-minute call to understand the scope and the existing state of the codebase.",
      },
      {
        q: "Where are you based and what languages do you work in?",
        a:
          "I'm based in France, in the Loire region (between Lyon and Saint-Étienne). I work in French (native), English (fluent, daily for technical and business communication), and Spanish (working professional, comfortable for written content). Remote-first across France, the EU, and remote-friendly time zones. On-site is possible only around the Lyon / Saint-Étienne area.",
      },
      {
        q: "What's the fastest way to reach you?",
        a:
          "LinkedIn — linkedin.com/in/tgirou — is the fastest path. I read every message and reply within a few working days. If LinkedIn isn't your channel, my GitHub is github.com/Kaikina, and my personal site (tom-girou.dev) has the latest on my work. For sensitive matters, ask for an email address through LinkedIn and we'll move from there.",
      },
      {
        q: "Do you contribute to PrestaShop open source?",
        a:
          "Yes — I contribute to PrestaShop core under @Kaikina on GitHub. Most of my contributions land where I find friction in client work: bug fixes around invoice numbering concurrency, theme cache issues in multishop, and the kind of long-standing edge cases that aren't worth a full ticket for one team but matter for everyone running PrestaShop. The commit history lives at github.com/PrestaShop/PrestaShop/commits?author=Kaikina.",
      },
    ],
  },
  blog: {
    metaTitle: "Blog — Tom Girou",
    metaDescription:
      "Notes from the trenches on PHP, Symfony, PrestaShop, CI/CD, and shipping production software — by Tom Girou, Senior Lead Dev.",
    label: "[ Blog ]",
    titleHtml:
      'Notes from the <em style="color:var(--red);font-style:italic">trenches</em>.',
    blurb:
      "Field notes on PHP, Symfony, PrestaShop, CI/CD, and the unglamorous engineering that keeps production quiet. No fluff — just what actually worked, and why.",
    authorRole: "Senior Lead Dev",
    authorCredential: "A decade shipping PHP, Symfony & PrestaShop platforms to production.",
    writtenBy: "Written by",
    backToBlog: "Back to the blog",
    allPosts: "All posts",
    tableOfContents: "On this page",
    minRead: "min read",
    publishedLabel: "Published",
    updatedLabel: "Updated",
    tagsLabel: "Topics",
    taggedLabel: "Posts tagged",
    relatedPosts: "Related posts",
    previousPost: "Previous post",
    readMore: "Read article",
    rssLabel: "RSS",
    kofiHeading: "Found this useful?",
    kofiBlurb: "If this article saved you some time, you can buy me a coffee. It keeps the writing coming.",
    kofiButton: "Support me on Ko-fi",
    empty: "No posts yet — the first one is on its way.",
  },
};

export default en;
