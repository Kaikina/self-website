import type { Translation } from "./types";

const es: Translation = {
  meta: {
    title: "Tom Girou — Senior Lead Dev",
    description:
      "Senior Lead Dev — PHP, Symfony y PrestaShop. Ayudo a las empresas a pasar de un backlog de 200+ tickets a menos de 50 — y a respirar por fin entre sprints.",
    ogImageAlt: "Tom Girou — portfolio Senior Lead Dev",
  },
  nav: {
    about: "Sobre mí",
    work: "Proyectos",
    stack: "Stack",
    experience: "Trayectoria",
    words: "Testimonios",
    faq: "FAQ",
    connect: "Conecta en LinkedIn",
    menuOpen: "Abrir menú",
    menuClose: "Cerrar menú",
  },
  hero: {
    currently: "Estado",
    available: "Disponible",
    portfolioYear: "Portfolio / 2026",
    nameSmall: "Tom Girou",
    titleLine1: "Senior",
    titleLine2: "Lead Dev",
    blurb:
      "Ayudo a las empresas a reducir su backlog de 200+ tickets a menos de 50 — y a respirar por fin entre sprints.",
    cta: "Hablemos",
    portraitAlt: "Retrato de Tom Girou",
  },
  about: {
    label: "[ 01 / Sobre mí ]",
    quote:
      "Convertir backlogs desbordados en apps listas para producción — un módulo bien diseñado a la vez.",
    headingHtml:
      "Hola, soy Tom — un <em>Senior Lead Dev</em> que trata el código limpio como el camino más corto entre un brief y una funcionalidad entregada.",
    stats: {
      years: "Años de experiencia",
      projects: "Proyectos entregados",
      clients: "Clientes atendidos",
    },
  },
  work: {
    label: "[ 02 / Selección de proyectos ]",
    titleHtml:
      'Proyectos <em style="color:var(--red);font-style:italic">recientes</em>.',
    blurb:
      "Una década de plataformas e‑commerce, sistemas de tarjetas regalo y sistemas integrados con ERP — cada uno entregado, auditado y funcionando discretamente en producción.",
    items: [
      {
        idx: "01",
        title: "Marketplace de deporte táctico",
        client: "DG-Airsoft",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.destockage-games.com/",
        caseStudySlug: "dg-airsoft",
      },
      {
        idx: "02",
        title: "E-commerce de calzado",
        client: "Les Tropéziennes",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.lestropeziennes.fr/fr/",
        caseStudySlug: "les-tropeziennes",
      },
      {
        idx: "03",
        title: "E-commerce textil",
        client: "E-habillement",
        stack: ["PrestaShop", "PHP"],
        url: "https://habillement.defense.gouv.fr/connexion",
        caseStudySlug: "e-habillement",
      },
      {
        idx: "04",
        title: "Marketplace de coleccionables",
        client: "Sylvanian Families",
        stack: ["PrestaShop", "PHP"],
        url: "https://sylvanianfamilies-boutique.fr/",
        caseStudySlug: "sylvanian-families",
      },
      {
        idx: "05",
        title: "Tienda de pasteles",
        client: "Maison Colibri",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.maison-colibri.com/fr/",
        caseStudySlug: "maison-colibri",
      },
      {
        idx: "06",
        title: "Tienda de bienestar y herboristería",
        client: "Herbiolys",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.herbiolys.fr/fr/",
        caseStudySlug: "herbiolys",
      },
      {
        idx: "07",
        title: "Suite e-commerce",
        client: "Thermcross",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.thermcross.fr/fr/",
        caseStudySlug: "thermcross",
      },
      {
        idx: "08",
        title: "Plataforma de tarjetas regalo",
        client: "Wedoogift · Pluxee",
        stack: ["Java", "Spring Boot", "Angular"],
        caseStudySlug: "wedoogift",
      },
      {
        idx: "09",
        title: "Generador de sitios WordPress",
        client: "Wedoogift · Pluxee",
        stack: ["WordPress", "PHP", "Bash"],
        caseStudySlug: "wordpress-site-generator",
      },
    ],
  },
  stack: {
    label: "[ 03 / Stack técnico ]",
    titleHtml:
      'Con qué <em style="color:var(--red);font-style:italic">construyo</em>.',
    blurb:
      "Un stack pragmático — PHP en el núcleo, JavaScript en la superficie y el pegamento adecuado en el medio. Sin buzzwords, solo herramientas que entregan.",
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
    label: "[ 04 / Trayectoria ]",
    titleHtml:
      'Donde he <em style="color:var(--red);font-style:italic">construido</em>.',
    blurb:
      "Desde startups a agencias web. Cada puesto afinó un músculo distinto — desde infra cloud y CI/CD hasta liderar integraciones de PrestaShop Core.",
    nowLabel: "2023 — Actualidad",
    rows: [
      {
        when: "2023 — Actualidad",
        isNow: true,
        role: "Desarrollador PHP · Tech Lead",
        co: "Evolutive",
        desc:
          "Liderazgo técnico y desarrollo full-stack de PrestaShop Core y módulos. Planificación de recursos, estimaciones Ágiles, integraciones API/ERP robustas y aseguramiento de calidad en CI/CD.",
      },
      {
        when: "2022 — 2023",
        role: "Desarrollador PHP",
        co: "Thermcross",
        desc:
          "Desarrollo full-stack e-commerce y back-end especializado en integración PrestaShop, aplicaciones PHP/PIM a medida y pipelines automatizados de sincronización con ERP — todo en metodología Ágil.",
      },
      {
        when: "2020 — 2022",
        role: "Ingeniero de I+D",
        co: "Emagineurs",
        desc:
          "Desarrollo full-stack, integración de APIs e ingeniería de seguridad en TYPO3, WordPress y Ruby — especializado en herramientas financieras, automatización y seguridad de aplicaciones web.",
      },
      {
        when: "2018 — 2019",
        role: "Desarrollador Web Fullstack",
        co: "Wedoogift",
        desc:
          "Full-stack y DevOps con Angular, Spring Boot y AWS — construcción de pipelines CI/CD, entregas Ágiles y redacción de la documentación que acompañó el crecimiento del equipo.",
      },
    ],
  },
  testimonials: {
    label: "[ 05 / Testimonios ]",
    titleHtml:
      'Unas <em style="color:var(--red);font-style:italic">palabras</em>.',
    blurb:
      "Unas palabras de personas con las que he trabajado, en sus propias palabras.",
    feedbackLabel: "[ feedback ]",
    subheadHtml:
      "Palabras sinceras de equipos que <em>realmente entregaron</em>.",
    items: [
      {
        q:
          "Tuve la oportunidad de gestionar a Tom durante un año. Es un perfil muy operativo, implicado tanto en la producción como en la estimación técnica o el I+D interno.\n\nMás allá de sus competencias técnicas, valoré especialmente su compromiso y su voluntad de hacer crecer a los equipos a su alrededor. Trabajamos juntos en particular en la puesta en marcha de un proceso de integración continua en un contexto complejo, proyecto que llevó con seriedad y perseverancia hasta su producción.\n\nTom tiene una franqueza que a veces puede sorprender al principio, pero es también lo que le hace transparente y honesto. A condición de una relación basada en la exigencia, la ejemplaridad y la confianza, sabe cuestionarse y sigue siendo alguien profundamente fiable.\n\nEs un perfil con el que se puede contar para avanzar, asumir responsabilidades y entregar.",
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
    prevAria: "Anterior",
    nextAria: "Siguiente",
  },
  openSource: {
    label: "[ 06 / Open Source ]",
    titleHtml:
      'Contribuyendo a <em style="color:var(--red);font-style:italic">PrestaShop</em>.',
    blurb:
      "Más allá del trabajo con clientes, devuelvo algo a la plataforma sobre la que construyo cada día — parches al core, revisiones de PR y un empujón para que PrestaShop siga avanzando en abierto.",
    cardAlt: "Resumen de contribuciones a PrestaShop de @Kaikina",
    repoLabel: "Repositorio",
    repoLinkText: "prestashop/prestashop",
  },
  certifications: {
    label: "[ 07 / Certifications ]",
    titleHtml:
      'Certificado <em style="color:var(--red);font-style:italic">PrestaShop Expert</em>.',
    blurb:
      "Dos certificaciones oficiales PrestaShop Expert — Core para el back-end y los módulos, Front para el theme y el storefront. Ambas verificables en Procertif.",
    issuedByLabel: "Emitido por",
    verifyOnLabel: "Verificar en",
    statusLabel: "Certificado",
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
      'Lo que <em style="color:var(--red);font-style:italic">construyo</em> aparte.',
    blurb:
      "Apps personales que shippeo y mantengo en producción — normalmente para rascar mi propio itch, a veces convertidas en herramientas que otros devs pueden enchufar a su propio flujo.",
    items: [
      {
        name: "RepoWrapped",
        tagline: "Un Spotify Wrapped para cualquier repo de GitHub",
        description:
          "Login con GitHub, apuntas a cualquier owner/repo público y te devuelve una página de stats compartible — commits, líneas añadidas y eliminadas, fecha del primer commit, tu actividad sobre el repo — más una card SVG live-refresh que puedes dropear en tu profile README. Un cache de dos niveles Redis + Postgres mantiene las stats frescas sin quemar la API de GitHub en cada render. La card que se ve en la sección Open Source justo arriba la genera esta app.",
        stack: ["Laravel", "PHP", "Postgres", "Redis", "Tailwind"],
        status: "Online",
        liveUrl: "https://repo-wrapped.tom-girou.dev",
        liveLabel: "Abrir la app",
        sourceUrl: "https://github.com/Kaikina/repo-wrapped",
        sourceLabel: "Código en GitHub",
      },
      {
        name: "Forgemage.com",
        tagline: "Una marketplace async para encantadores de Dofus",
        description:
          "Un fansite para la comunidad del MMORPG Dofus — tipo Malt, pero para forjamagos. Los jugadores dropean su request de encantamiento online con las stats que quieren ; los perfiles forjamagos navegan los jobs abiertos, claiman uno, y chatean en la app para planear un meet in-game. Reviews y ratings construyen la reputación después de cada job. Todo gira alrededor del async : en vez de quedarte en Astrub esperando que un forjamago competente esté conectado, dropeas tu request, montas tu build, y la persona adecuada te contacta. Los perfiles forjamagos siguen siendo descubribles en el sitio aunque estén offline en el juego.",
        stack: ["Symfony 7", "PHP 8.4", "PostgreSQL", "Mercure", "FrankenPHP", "Stimulus"],
        status: "En desarrollo",
      },
    ],
  },
  footer: {
    label: "[ 10 / Contacto ]",
    headingHtml:
      "Construyamos algo que <em>merezca la pena entregar</em>.",
    sub:
      "Abierto a roles senior y lead, briefs freelance y la ocasional misión de rescate. La vía más rápida hacia mí es LinkedIn — leo cada mensaje.",
    cta: "Escríbeme en LinkedIn",
    rights: "© 2026 · Tom Girou · Todos los derechos reservados",
    build: "v1.0 / Hecho en Francia",
    linkedinAria: "LinkedIn",
    githubAria: "GitHub",
  },
  caseStudy: {
    backToWork: "Selección de proyectos",
    visitLiveSite: "Ver el sitio en línea",
    backToAllWork: "Volver a todos los proyectos",
    outcomeLabel: "— Resultados",
    roleLabel: "Rol",
    durationLabel: "Duración",
    stackLabel: "Stack",
  },
  faq: {
    label: "[ 09 / FAQ ]",
    titleHtml:
      'Preguntas <em style="color:var(--red);font-style:italic">frecuentes</em>.',
    blurb:
      "Las preguntas que más aparecen cuando alguien se plantea trabajar conmigo — respuestas directas, en mis propias palabras.",
    items: [
      {
        q: "¿Qué hace Tom Girou?",
        a:
          "Soy Senior Lead Web Developer basado en Francia, con más de 7 años en PHP, Symfony y PrestaShop. Ayudo a empresas de e-commerce a rescatar migraciones que se han estancado, integrar ERPs, construir módulos a medida y retomar el control de backlogs desbordados. Actualmente estoy en Evolutive (Francia); las case studies de este sitio documentan mis misiones recientes.",
      },
      {
        q: "¿Cuál es tu trayectoria?",
        a:
          "Empecé como agente de helpdesk en Wedoogift (hoy Pluxee) en 2016 mientras terminaba mi formación en desarrollo, luego pasé a full-stack Java / Spring Boot / Angular allí mismo en formación dual. Tras graduarme me incorporé a Emagineurs como ingeniero de I+D (TYPO3, WordPress, Ruby, seguridad), y después a Thermcross como desarrollador PHP interno (una gran migración PrestaShop e integración ERP). Desde 2023 estoy en Evolutive como Desarrollador PHP y Tech Lead, centrado en el core y los módulos PrestaShop para clientes e-commerce.",
      },
      {
        q: "¿Estás especializado en PrestaShop?",
        a:
          "Sí — PrestaShop es donde paso la mayor parte del tiempo. Trabajo sobre el core y los módulos PrestaShop en 1.7, en 8 y sobre la versión 9 actual, en módulos a medida, adaptaciones multishop, integraciones ERP, tema, rendimiento y seguridad. Contribuyo al core de PrestaShop bajo el alias @Kaikina en GitHub. La mayoría de las case studies de este sitio son proyectos PrestaShop: airsoft, calzado, textil, coleccionables, fitoterapia, piezas HVAC.",
      },
      {
        q: "¿Puedes encargarte de una migración PrestaShop (1.5 → 1.7 → 8 → 9)?",
        a:
          "Sí. He entregado migraciones PrestaShop multietapa en varios proyectos reales — grandes migraciones multishop, upgrades de versión mayor que exigieron trabajo profundo a nivel de core, y mantenimiento concurrente de instalaciones legacy en paralelo a builds nuevos. El mismo enfoque se extiende a PrestaShop 9, la versión mayor actual. La parte dura de una migración PrestaShop rara vez es el salto de versión en sí — son los módulos, la sincronización ERP, las hipótesis del tema y los años de reglas de negocio enterradas en la base. Ahí se concentra la mayor parte del trabajo.",
      },
      {
        q: "¿Y las integraciones con ERP?",
        a:
          "La mayoría del trabajo PrestaShop que hago toca un ERP o un sistema de terceros en algún punto. He integrado tiendas con ERPs, feeds de datos de mercado y herramientas de soporte usando llamadas síncronas a webservices, batches programados por cron y pipelines asíncronos en queue. Qué forma es la correcta depende del volumen de datos y de los SLA — he entregado los tres patrones.",
      },
      {
        q: "¿Trabajas con stacks que no sean PrestaShop?",
        a:
          "Sí. Fuera de PrestaShop he entregado en producción sobre Symfony, Java con Spring Boot, AngularJS y Angular moderno, Perl (integración de datos), Slim Framework (PIM greenfield), WordPress con WP-CLI y AWS CloudFormation, TYPO3 y Ruby. La infraestructura AWS ha formado parte de varios proyectos — EC2, RDS, S3, CloudFormation, Route 53, Certificate Manager — y he configurado pipelines CI/CD sobre Jenkins, GitLab y equivalentes. Las case studies cubren el trabajo no-PrestaShop en detalle.",
      },
      {
        q: "¿Estás disponible para misiones freelance o nuevos puestos?",
        a:
          "Sí — estoy abierto a puestos senior y lead, briefs freelance y la ocasional misión de rescate sobre un proyecto PrestaShop que se ha estancado. La vía más rápida para arrancar una conversación es LinkedIn; leo cada mensaje. Puedo comprometerme en misiones cortas o largas, en remote-first, con presencial posible según el alcance. Un encargo típico empieza con una llamada de 30 minutos para entender el alcance y el estado del código existente.",
      },
      {
        q: "¿Dónde estás basado y en qué idiomas trabajas?",
        a:
          "Estoy basado en Francia, en la región del Loira (entre Lyon y Saint-Étienne). Trabajo en francés (lengua materna), inglés (con fluidez, a diario para comunicación técnica y de negocio), y español (nivel profesional, cómodo para contenido escrito). Remote-first en Francia, la UE y zonas horarias remote-friendly. El presencial solo es posible en torno a Lyon / Saint-Étienne.",
      },
      {
        q: "¿Cuál es la vía más rápida para contactarte?",
        a:
          "LinkedIn — linkedin.com/in/tgirou — es la vía más rápida. Leo cada mensaje y respondo en unos días laborables. Si LinkedIn no es tu canal, mi GitHub es github.com/Kaikina, y mi sitio personal (tom-girou.dev) recoge las últimas case studies. Para temas sensibles, pide una dirección de email por LinkedIn y movemos la conversación desde ahí.",
      },
      {
        q: "¿Contribuyes a PrestaShop en open source?",
        a:
          "Sí — contribuyo al core de PrestaShop bajo el alias @Kaikina en GitHub. La mayoría de mis contribuciones aterrizan donde encuentro fricción en el trabajo con clientes: fixes alrededor de la concurrencia en la numeración de facturas, problemas de caché del multi-tema en multishop, y el tipo de casos límite históricos que no merecen un ticket completo para un equipo pero que pesan para todo el que hace correr PrestaShop. El histórico de commits está en github.com/PrestaShop/PrestaShop/commits?author=Kaikina.",
      },
    ],
  },
};

export default es;
