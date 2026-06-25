import type { Translation } from "./types";

const fr: Translation = {
  meta: {
    title: "Tom Girou — Senior Lead Dev",
    description:
      "Senior Lead Dev — PHP, Symfony & PrestaShop. J'aide les entreprises à passer d'un backlog de 200+ tickets à moins de 50 — et à enfin respirer entre deux sprints.",
    ogImageAlt: "Tom Girou — portfolio Senior Lead Dev",
  },
  nav: {
    about: "À propos",
    work: "Projets",
    stack: "Stack",
    experience: "Parcours",
    words: "Témoignages",
    faq: "FAQ",
    blog: "Blog",
    connect: "Me contacter sur LinkedIn",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
  },
  hero: {
    currently: "Statut",
    available: "Disponible",
    portfolioYear: "Portfolio / 2026",
    nameSmall: "Tom Girou",
    titleLine1: "Senior",
    titleLine2: "Lead Dev",
    blurb:
      "J'aide les entreprises à réduire leur backlog de 200+ tickets à moins de 50 — et à enfin respirer entre deux sprints.",
    cta: "Discutons",
    portraitAlt: "Portrait de Tom Girou",
  },
  about: {
    label: "[ 01 / À propos ]",
    quote:
      "Transformer des backlogs tentaculaires en livrables — un module proprement architecturé à la fois.",
    headingHtml:
      "Bonjour, je suis Tom — un <em>Senior Lead Dev</em> qui considère le code propre comme le chemin le plus court entre un brief et une fonctionnalité livrée.",
    stats: {
      years: "Années d'expérience",
      projects: "Projets livrés",
      clients: "Clients accompagnés",
    },
  },
  work: {
    label: "[ 02 / Sélection de projets ]",
    titleHtml:
      'Projets <em style="color:var(--red);font-style:italic">récents</em>.',
    blurb:
      "Une décennie de plateformes e‑commerce, de systèmes de cartes cadeaux et de systèmes liés aux ERP — chacun livré, audité, et discrètement en production.",
    items: [
      {
        idx: "01",
        title: "Marketplace sport tactique",
        client: "DG-Airsoft",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.destockage-games.com/",
        caseStudySlug: "dg-airsoft",
      },
      {
        idx: "02",
        title: "E-commerce chaussures",
        client: "Les Tropéziennes",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.lestropeziennes.fr/fr/",
        caseStudySlug: "les-tropeziennes",
      },
      {
        idx: "03",
        title: "Marketplace de collection",
        client: "Sylvanian Families",
        stack: ["PrestaShop", "PHP"],
        url: "https://sylvanianfamilies-boutique.fr/",
        caseStudySlug: "sylvanian-families",
      },
      {
        idx: "04",
        title: "Boutique de madeleines",
        client: "Maison Colibri",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.maison-colibri.com/fr/",
        caseStudySlug: "maison-colibri",
      },
      {
        idx: "05",
        title: "Boutique bien-être & herboristerie",
        client: "Herbiolys",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.herbiolys.fr/fr/",
        caseStudySlug: "herbiolys",
      },
      {
        idx: "06",
        title: "Suite e-commerce",
        client: "Thermcross",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.thermcross.fr/fr/",
        caseStudySlug: "thermcross",
      },
      {
        idx: "07",
        title: "Plateforme de cartes cadeaux",
        client: "Wedoogift · Pluxee",
        stack: ["Java", "Spring Boot", "Angular"],
        caseStudySlug: "wedoogift",
      },
      {
        idx: "08",
        title: "Générateur de sites WordPress",
        client: "Wedoogift · Pluxee",
        stack: ["WordPress", "PHP", "Bash"],
        caseStudySlug: "wordpress-site-generator",
      },
    ],
  },
  stack: {
    label: "[ 03 / Stack technique ]",
    titleHtml:
      'Ce avec quoi je <em style="color:var(--red);font-style:italic">construis</em>.',
    blurb:
      "Une stack pragmatique — PHP au cœur, JavaScript en surface, et la bonne colle entre les deux. Pas de buzzwords, juste des outils qui livrent.",
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
    label: "[ 04 / Parcours ]",
    titleHtml:
      "Là où j'ai <em style=\"color:var(--red);font-style:italic\">construit</em>.",
    blurb:
      "De la startup aux agences web. Chaque poste a aiguisé un muscle différent — de l'infra cloud et du CI/CD jusqu'au pilotage d'intégrations PrestaShop Core.",
    nowLabel: "2023 — Aujourd'hui",
    rows: [
      {
        when: "2023 — Aujourd'hui",
        isNow: true,
        role: "Développeur PHP · Tech Lead",
        co: "Evolutive",
        desc:
          "Leadership technique et développement full-stack PrestaShop Core & modules. Planification des ressources, estimations Agile, intégrations API/ERP robustes et assurance qualité CI/CD.",
      },
      {
        when: "2022 — 2023",
        role: "Développeur PHP",
        co: "Thermcross",
        desc:
          "Développement full-stack e-commerce et back-end spécialisé : intégration PrestaShop, applications PHP/PIM sur mesure et pipelines de synchronisation ERP automatisés — le tout en Agile.",
      },
      {
        when: "2020 — 2022",
        role: "Ingénieur R&D",
        co: "Emagineurs",
        desc:
          "Développement full-stack, intégration d'API et ingénierie sécurité sur TYPO3, WordPress et Ruby — spécialisé dans les outils financiers, l'automatisation et la sécurité des applications web.",
      },
      {
        when: "2018 — 2019",
        role: "Développeur Web Fullstack",
        co: "Wedoogift",
        desc:
          "Full-stack & DevOps avec Angular, Spring Boot et AWS — construction des pipelines CI/CD, livraisons en Agile, et rédaction de la documentation qui a accompagné la croissance de l'équipe.",
      },
    ],
  },
  testimonials: {
    label: "[ 05 / Témoignages ]",
    titleHtml:
      'Quelques <em style="color:var(--red);font-style:italic">mots</em>.',
    blurb:
      "Quelques mots de personnes avec qui j'ai travaillé, dans leurs propres mots.",
    feedbackLabel: "[ retours ]",
    subheadHtml:
      "Des mots sincères, d'équipes qui ont <em>vraiment livré</em>.",
    items: [
      {
        q:
          "J'ai eu l'occasion de manager Tom pendant un an. C'est un profil très opérationnel, impliqué aussi bien sur la production que sur des sujets d'estimation technique ou de R&D interne.\n\nAu-delà de ses compétences techniques, j'ai particulièrement apprécié son engagement et sa volonté de faire progresser les équipes autour de lui. Nous avons notamment travaillé ensemble sur la mise en place d'un process d'intégration continue dans un contexte complexe, projet qu'il a porté avec sérieux et persévérance jusqu'à sa mise en production.\n\nTom a un franc-parler qui peut parfois surprendre au premier abord, mais c'est aussi ce qui fait sa transparence et son honnêteté. À condition d'avoir une relation basée sur l'exigence, l'exemplarité et la confiance, il sait se remettre en question et reste quelqu'un de profondément fiable.\n\nC'est un profil sur lequel on peut compter pour avancer, prendre ses responsabilités et délivrer.",
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
    prevAria: "Précédent",
    nextAria: "Suivant",
  },
  openSource: {
    label: "[ 06 / Open Source ]",
    titleHtml:
      'Contributions à <em style="color:var(--red);font-style:italic">PrestaShop</em>.',
    blurb:
      "Au-delà des missions clients, je contribue à la plateforme sur laquelle je travaille au quotidien — patchs du core, revues de PR, et coups de main pour faire avancer PrestaShop en open source.",
    cardAlt: "Résumé des contributions PrestaShop de @Kaikina",
    repoLabel: "Dépôt",
    repoLinkText: "prestashop/prestashop",
  },
  certifications: {
    label: "[ 07 / Certifications ]",
    titleHtml:
      'Certifié <em style="color:var(--red);font-style:italic">PrestaShop Expert</em>.',
    blurb:
      "Deux certifications officielles PrestaShop Expert — Core pour le back-end et les modules, Front pour le thème et le storefront. Les deux vérifiables sur Procertif.",
    issuedByLabel: "Délivré par",
    verifyOnLabel: "Vérifier sur",
    statusLabel: "Certifié",
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
      'Ce que je <em style="color:var(--red);font-style:italic">build</em> en perso.',
    blurb:
      "Des apps perso que je shippe et que je fais tourner en prod — souvent pour scratcher mon propre besoin, parfois pour en faire des outils que d'autres devs peuvent brancher chez eux.",
    items: [
      {
        name: "RepoWrapped",
        tagline: "Un Spotify Wrapped pour n'importe quel repo GitHub",
        description:
          "Login GitHub, tu pointes vers n'importe quel owner/repo public, et tu récupères une page de stats partageable — commits, lignes ajoutées et supprimées, date du premier commit, ton activité sur le repo — plus un card SVG live-refresh que tu peux dropper dans ton profile README. Un cache à deux étages Redis + Postgres garde les stats fraîches sans cramer l'API GitHub à chaque render. Le card affiché dans la section Open Source juste au-dessus est généré par cette app.",
        stack: ["Laravel", "PHP", "Postgres", "Redis", "Tailwind"],
        status: "En ligne",
        liveUrl: "https://repo-wrapped.tom-girou.dev",
        liveLabel: "Ouvrir l'app",
        sourceUrl: "https://github.com/Kaikina/repo-wrapped",
        sourceLabel: "Sources sur GitHub",
      },
      {
        name: "Forgemage.com",
        tagline: "Une marketplace async pour les forgemages de Dofus",
        description:
          "Un fansite pour la communauté du MMORPG Dofus — version Malt, mais pour les forgemages. Les joueurs déposent en ligne leur demande de forgemagie avec les stats visées ; les profils forgemages parcourent les jobs ouverts, en claim un, et chattent dans l'app pour planifier un RDV in-game. Reviews et ratings construisent la réputation après chaque job. L'idée, c'est tout l'async : plutôt que de squatter Astrub à espérer qu'un forgemage compétent soit connecté, tu drop ta requête, tu prépares ton stuff, et la bonne personne te contacte. Les profils forgemages restent trouvables sur le site même quand ils sont offline en jeu.",
        stack: ["Symfony 7", "PHP 8.4", "PostgreSQL", "Mercure", "FrankenPHP", "Stimulus"],
        status: "En cours de dev",
      },
    ],
  },
  footer: {
    label: "[ 10 / Contact ]",
    headingHtml:
      "Construisons ensemble quelque chose qui <em>mérite d'être livré</em>.",
    sub:
      "Ouvert aux postes senior & lead, aux missions freelance et aux missions de sauvetage occasionnelles. Le moyen le plus rapide pour me joindre, c'est LinkedIn — je lis chaque message.",
    cta: "Me contacter sur LinkedIn",
    rights: "© 2026 · Tom Girou · Tous droits réservés",
    build: "v1.0 / Conçu en France",
    linkedinAria: "LinkedIn",
    githubAria: "GitHub",
  },
  caseStudy: {
    backToWork: "Sélection de projets",
    visitLiveSite: "Voir le site en ligne",
    backToAllWork: "Retour à tous les projets",
    outcomeLabel: "— Résultats",
    roleLabel: "Rôle",
    durationLabel: "Durée",
    stackLabel: "Stack",
  },
  faq: {
    label: "[ 09 / FAQ ]",
    titleHtml:
      'Questions <em style="color:var(--red);font-style:italic">fréquentes</em>.',
    blurb:
      "Les questions qui reviennent le plus souvent quand quelqu'un envisage de travailler avec moi — réponses directes, dans mes propres mots.",
    items: [
      {
        q: "Que fait Tom Girou ?",
        a:
          "Je suis Senior Lead Web Developer basé en France, avec plus de 7 ans d'expérience en PHP, Symfony et PrestaShop. J'aide les entreprises e-commerce à reprendre des migrations qui s'enlisent, à intégrer des ERP, à développer des modules sur mesure et à reprendre la main sur des backlogs qui ont débordé. Je suis actuellement chez Evolutive en France ; les projets listés sur ce site documentent mes missions récentes.",
      },
      {
        q: "Quel est ton parcours ?",
        a:
          "J'ai commencé comme agent helpdesk chez Wedoogift (aujourd'hui Pluxee) en 2016 pendant que je finissais ma formation en développement, puis je suis passé full-stack Java / Spring Boot / Angular là-bas en alternance. Après mes études, j'ai rejoint Emagineurs comme ingénieur R&D (TYPO3, WordPress, Ruby, sécurité), puis Thermcross comme développeur PHP interne (une grande migration PrestaShop et de l'intégration ERP). Depuis 2023, je suis chez Evolutive en tant que Développeur PHP et Tech Lead, focalisé sur le core et les modules PrestaShop pour des clients e-commerce.",
      },
      {
        q: "Es-tu spécialisé en PrestaShop ?",
        a:
          "Oui — PrestaShop, c'est là où passe la majorité de mon temps. Je travaille sur le core et les modules PrestaShop en 1.7, en 8 et sur la version 9 actuelle, sur des modules sur mesure, des adaptations multishop, des intégrations ERP, du thème, de la performance et de la sécurité. Je contribue au core PrestaShop sous le pseudo @Kaikina sur GitHub. La majorité des projets listés sur ce site sont des projets PrestaShop : airsoft, chaussures, textile, collection, phytothérapie, pièces CVC.",
      },
      {
        q: "Peux-tu prendre en charge une migration PrestaShop (1.5 → 1.7 → 8 → 9) ?",
        a:
          "Oui. J'ai livré des migrations PrestaShop multi-étapes sur plusieurs projets concrets : de grandes migrations multishop, des montées de version majeure qui ont nécessité un travail poussé au niveau du core, et la maintenance concurrente d'installs legacy en parallèle de builds neufs. La même approche se prolonge sur PrestaShop 9, la version majeure actuelle. La partie dure d'une migration PrestaShop, c'est rarement le saut de version lui-même — ce sont les modules, la synchro ERP, les hypothèses du thème et les années de règles métier enfouies dans la base. C'est là que se concentre l'essentiel du travail.",
      },
      {
        q: "Et les intégrations ERP ?",
        a:
          "La plupart des projets PrestaShop sur lesquels je travaille touchent un ERP ou un système tiers à un moment. J'ai intégré des boutiques avec des ERP, des flux de données de marché et des outils de support, en utilisant des appels webservice synchrones, des batchs planifiés en cron et des pipelines asynchrones en queue. La forme juste dépend du volume de données et des SLA — j'ai livré les trois patterns.",
      },
      {
        q: "Travailles-tu avec d'autres stacks que PrestaShop ?",
        a:
          "Oui. En dehors de PrestaShop, j'ai livré en production sur Symfony, Java + Spring Boot, AngularJS et Angular moderne, Perl (intégration de données), Slim Framework (PIM greenfield), WordPress avec WP-CLI et AWS CloudFormation, TYPO3 et Ruby. L'infrastructure AWS a fait partie de plusieurs projets — EC2, RDS, S3, CloudFormation, Route 53, Certificate Manager — et j'ai configuré des pipelines CI/CD sur Jenkins, GitLab et équivalents.",
      },
      {
        q: "Es-tu disponible pour des missions freelance ou de nouveaux postes ?",
        a:
          "Oui — je suis ouvert aux postes senior et lead, aux missions freelance et aux missions de sauvetage occasionnelles sur des projets PrestaShop qui patinent. Le moyen le plus rapide pour démarrer une conversation, c'est LinkedIn ; je lis chaque message. Je peux m'engager sur des missions courtes ou longues, en remote-first, avec du présentiel possible selon le périmètre. Un engagement type démarre par un call de 30 minutes pour comprendre le scope et l'état du code en place.",
      },
      {
        q: "Où es-tu basé et dans quelles langues travailles-tu ?",
        a:
          "Je suis basé en France, dans la région de la Loire (entre Lyon et Saint-Étienne). Je travaille en français (langue maternelle), en anglais (couramment, au quotidien pour la communication technique et business), et en espagnol (niveau professionnel, à l'aise pour l'écrit). Remote-first en France, dans l'UE et sur les fuseaux remote-friendly. Le présentiel n'est possible qu'autour de Lyon / Saint-Étienne.",
      },
      {
        q: "Quel est le moyen le plus rapide pour me joindre ?",
        a:
          "LinkedIn — linkedin.com/in/tgirou — c'est le canal le plus rapide. Je lis chaque message et je réponds sous quelques jours ouvrés. Si LinkedIn n'est pas ton canal, mon GitHub est github.com/Kaikina, et mon site perso (tom-girou.dev) regroupe mes derniers projets. Pour les sujets sensibles, demande une adresse email via LinkedIn et on bascule depuis là.",
      },
      {
        q: "Contribues-tu à PrestaShop en open source ?",
        a:
          "Oui — je contribue au core PrestaShop sous le pseudo @Kaikina sur GitHub. La majorité de mes contributions tombent là où je rencontre des frictions dans le travail client : fixes autour de la concurrence sur la numérotation des factures, soucis de cache du multi-thème en multishop, et le genre de cas limites historiques qui ne valent pas un ticket plein pour une équipe mais qui pèsent pour tous ceux qui font tourner PrestaShop. L'historique des commits est sur github.com/PrestaShop/PrestaShop/commits?author=Kaikina.",
      },
    ],
  },
  blog: {
    metaTitle: "Blog — Tom Girou",
    metaDescription:
      "Retours de terrain sur PHP, Symfony, PrestaShop, la CI/CD et le fait de livrer du code en production — par Tom Girou, Senior Lead Dev.",
    label: "[ Blog ]",
    titleHtml:
      'Retours du <em style="color:var(--red);font-style:italic">terrain</em>.',
    blurb:
      "Des notes de terrain sur PHP, Symfony, PrestaShop, la CI/CD et l'ingénierie peu glamour qui garde la prod silencieuse. Pas de blabla — juste ce qui a vraiment marché, et pourquoi.",
    authorRole: "Senior Lead Dev",
    writtenBy: "Écrit par",
    backToBlog: "Retour au blog",
    allPosts: "Tous les articles",
    tableOfContents: "Sur cette page",
    minRead: "min de lecture",
    publishedLabel: "Publié",
    updatedLabel: "Mis à jour",
    tagsLabel: "Sujets",
    taggedLabel: "Articles taggés",
    relatedPosts: "Articles liés",
    previousPost: "Article précédent",
    readMore: "Lire l'article",
    rssLabel: "RSS",
    kofiHeading: "Cet article vous a été utile ?",
    kofiBlurb: "S'il vous a fait gagner du temps, vous pouvez m'offrir un café. Ça encourage les suivants.",
    kofiButton: "Soutenez-moi sur Ko-fi",
    empty: "Pas encore d'article — le premier arrive bientôt.",
  },
};

export default fr;
