import type { Translation } from "./types";

const pt: Translation = {
  meta: {
    title: "Tom Girou · Especialista PrestaShop certificado & Lead Dev",
    description:
      "Especialista PrestaShop certificado e tech lead na França. Módulos sob medida, migrações para o PrestaShop 9 e integrações com ERP para lojistas e agências.",
    ogImageAlt: "Tom Girou · portfólio Lead Dev PrestaShop",
  },
  nav: {
    about: "Sobre",
    work: "Projetos",
    stack: "Stack",
    experience: "Experiência",
    words: "Depoimentos",
    faq: "FAQ",
    blog: "Blog",
    connect: "Conecte-se no LinkedIn",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
  },
  hero: {
    portfolioYear: "Portfólio / 2026",
    nameSmall: "Tom Girou",
    titleLine1: "PrestaShop",
    titleLine2: "Lead Dev",
    blurb:
      "Especialista PrestaShop certificado. Desenvolvo, migro e resgato lojas PrestaShop, e de quebra deixo o backlog abaixo de 50 tickets.",
    cta: "Vamos conversar",
    portraitAlt: "Retrato de Tom Girou",
  },
  about: {
    label: "[ 01 / Sobre ]",
    quote:
      "O Claude escreve o código. Eu decido o que é bom.",
    headingHtml:
      "Oi, eu sou o Tom. Nos últimos quatro anos, trabalhei principalmente dentro do <em>PrestaShop</em>: core, módulos, migrações e a sincronização com o ERP que ninguém quer encostar.",
    stats: {
      years: "Anos de experiência",
      projects: "Projetos entregues",
      clients: "Clientes atendidos",
    },
  },
  work: {
    label: "[ 02 / Projetos selecionados ]",
    titleHtml:
      'Projetos <em style="color:var(--red);font-style:italic">recentes</em>.',
    blurb:
      "Uma década de plataformas de e‑commerce, sistemas de gift card e sistemas integrados a ERP — cada um entregue, auditado e rodando tranquilo em produção.",
    items: [
      {
        idx: "01",
        title: "Marketplace de esportes táticos",
        client: "DG-Airsoft",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.destockage-games.com/",
        caseStudySlug: "dg-airsoft",
      },
      {
        idx: "02",
        title: "E-commerce de calçados",
        client: "Les Tropéziennes",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.lestropeziennes.fr/fr/",
        caseStudySlug: "les-tropeziennes",
      },
      {
        idx: "03",
        title: "Marketplace de colecionáveis",
        client: "Sylvanian Families",
        stack: ["PrestaShop", "PHP"],
        url: "https://sylvanianfamilies-boutique.fr/",
        caseStudySlug: "sylvanian-families",
      },
      {
        idx: "04",
        title: "Loja de bolos",
        client: "Maison Colibri",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.maison-colibri.com/fr/",
        caseStudySlug: "maison-colibri",
      },
      {
        idx: "05",
        title: "Loja de bem-estar e fitoterapia",
        client: "Herbiolys",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.herbiolys.fr/fr/",
        caseStudySlug: "herbiolys",
      },
      {
        idx: "06",
        title: "Suíte de e-commerce",
        client: "Thermcross",
        stack: ["PrestaShop", "PHP"],
        url: "https://www.thermcross.fr/fr/",
        caseStudySlug: "thermcross",
      },
      {
        idx: "07",
        title: "Plataforma de gift cards",
        client: "Wedoogift · Pluxee",
        stack: ["Java", "Spring Boot", "Angular"],
        caseStudySlug: "wedoogift",
      },
      {
        idx: "08",
        title: "Gerador de sites WordPress",
        client: "Wedoogift · Pluxee",
        stack: ["WordPress", "PHP", "Bash"],
        caseStudySlug: "wordpress-site-generator",
      },
    ],
  },
  stack: {
    label: "[ 03 / Stack principal ]",
    titleHtml:
      'Com o que eu <em style="color:var(--red);font-style:italic">construo</em>.',
    blurb:
      "PrestaShop em cima, PHP e Symfony embaixo. Hoje em dia, é o Claude que digita a maior parte do código.",
    items: [
      { glyph: "Ps", name: "PrestaShop" },
      { glyph: "P", name: "PHP" },
      { glyph: "My", name: "MySQL" },
      { glyph: "Pg", name: "Postgres" },
      { glyph: "Sf", name: "Symfony" },
      { glyph: "Js", name: "JavaScript" },
    ],
  },
  experience: {
    label: "[ 04 / Experiência ]",
    titleHtml:
      'Onde eu <em style="color:var(--red);font-style:italic">construí</em>.',
    blurb:
      "Uma startup, agências web, um cargo in-house e PrestaShop em tempo integral desde 2022. Os primeiros anos me ensinaram infra cloud e CI/CD. Os últimos quatro foram core e módulos do PrestaShop.",
    nowLabel: "2023 — Hoje",
    rows: [
      {
        when: "2023 — Hoje",
        isNow: true,
        role: "Desenvolvedor PHP · Tech Lead",
        co: "Evolutive",
        desc:
          "Liderança técnica e desenvolvimento full-stack do core e de módulos PrestaShop. Planejamento de recursos, estimativas Ágeis, integrações robustas de API/ERP e garantia de qualidade via CI/CD.",
      },
      {
        when: "2022 — 2023",
        role: "Desenvolvedor PHP",
        co: "Thermcross",
        desc:
          "Desenvolvimento full-stack de e-commerce e back-end com foco em integração PrestaShop, aplicações PHP/PIM sob medida e pipelines automatizados de sincronização com ERP — tudo em Ágil.",
      },
      {
        when: "2020 — 2022",
        role: "Engenheiro de P&D",
        co: "Emagineurs",
        desc:
          "Desenvolvimento full-stack, integração de APIs e engenharia de segurança em TYPO3, WordPress e Ruby — com foco em ferramentas financeiras, automação e segurança de aplicações web.",
      },
      {
        when: "2018 — 2019",
        role: "Desenvolvedor Web Fullstack",
        co: "Wedoogift",
        desc:
          "Full-stack e DevOps com Angular, Spring Boot e AWS — montei pipelines de CI/CD, entreguei em Ágil e escrevi a documentação que acompanhou o crescimento do time.",
      },
    ],
  },
  testimonials: {
    label: "[ 05 / Depoimentos ]",
    titleHtml:
      'Palavras <em style="color:var(--red);font-style:italic">gentis</em>.',
    blurb:
      "Palavras de pessoas com quem trabalhei, com a voz delas.",
    feedbackLabel: "[ feedback ]",
    subheadHtml:
      "Palavras sinceras de times que <em>realmente entregaram</em>.",
    items: [
      {
        q:
          "Tive a oportunidade de gerenciar o Tom durante um ano. É um perfil muito operacional, envolvido tanto na produção quanto na estimativa técnica e no P&D interno.\n\nAlém das competências técnicas, valorizei especialmente o comprometimento dele e a vontade de fazer os times ao redor crescerem. Trabalhamos juntos, em particular, na implantação de um processo de integração contínua num contexto complexo, projeto que ele levou até a produção com seriedade e persistência.\n\nO Tom tem uma franqueza que pode surpreender no começo, mas é justamente isso que o torna transparente e honesto. Desde que a relação seja baseada em rigor, exemplo e confiança, ele sabe se questionar e continua sendo alguém profundamente confiável.\n\nÉ o tipo de perfil com quem se pode contar para fazer as coisas andarem, assumir responsabilidades e entregar.",
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
    nextAria: "Próximo",
  },
  openSource: {
    label: "[ 06 / Open Source ]",
    titleHtml:
      'Contribuindo com o <em style="color:var(--red);font-style:italic">PrestaShop</em>.',
    blurb:
      "Além do trabalho com clientes, eu retribuo à plataforma em que construo todo dia — patches no core, review de PRs e uma ajuda para o PrestaShop seguir evoluindo em aberto.",
    cardAlt: "Resumo das contribuições de @Kaikina ao PrestaShop",
    repoLabel: "Repositório",
    repoLinkText: "prestashop/prestashop",
  },
  certifications: {
    label: "[ 07 / Certificações ]",
    titleHtml:
      'Certificado <em style="color:var(--red);font-style:italic">PrestaShop Expert</em>.',
    blurb:
      "Duas certificações oficiais PrestaShop Expert — Core para o back-end e os módulos, Front para o tema e o storefront. Ambas verificáveis na Procertif.",
    issuedByLabel: "Emitido por",
    verifyOnLabel: "Verificar na",
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
      'O que eu <em style="color:var(--red);font-style:italic">construo</em> por fora.',
    blurb:
      "Apps pessoais que eu coloco e mantenho em produção — geralmente para resolver um problema meu, às vezes virando ferramentas que outros devs também podem plugar no próprio fluxo.",
    items: [
      {
        name: "RepoWrapped",
        tagline: "Stats estilo Spotify Wrapped para qualquer repo do GitHub",
        description:
          "Faça login com o GitHub, aponte para qualquer owner/repo público e receba uma página de stats compartilhável — commits, linhas adicionadas e removidas, data do primeiro commit, sua atividade no repo — mais um card SVG com refresh automático que você pode colocar no README do seu perfil. Um cache em dois níveis, Redis + Postgres, mantém as stats atualizadas sem queimar a API do GitHub a cada render. O card que aparece na seção Open Source logo acima é gerado por este app.",
        stack: ["Laravel", "PHP", "Postgres", "Redis", "Tailwind"],
        status: "Online",
        liveUrl: "https://repo-wrapped.tom-girou.dev",
        liveLabel: "Abrir o app",
        sourceUrl: "https://github.com/Kaikina/repo-wrapped",
        sourceLabel: "Código no GitHub",
      },
      {
        name: "Forgemage.net",
        tagline: "Um marketplace assíncrono para forjamagos de Dofus",
        description:
          "Um fansite para a comunidade do MMORPG Dofus — tipo um Malt, só que para forjamagos. Os jogadores postam online um pedido de encantamento com os stats que querem; forjamagos experientes navegam pelos jobs abertos, pegam um e conversam pelo chat do app para combinar um encontro in-game. Reviews e avaliações constroem a reputação depois de cada job. A graça é ser assíncrono: em vez de ficar parado nos pontos de troca torcendo para alguém competente estar online, você registra o pedido, monta seu equipamento e deixa a pessoa certa te encontrar. Os perfis de forjamago continuam visíveis no site mesmo quando estão offline no jogo.",
        stack: ["Symfony 7", "PHP 8.4", "PostgreSQL", "Mercure", "FrankenPHP", "Stimulus"],
        status: "Online",
        liveUrl: "https://forgemage.net",
        liveLabel: "Abrir o app",
      },
    ],
  },
  footer: {
    label: "[ 10 / Contato ]",
    headingHtml: "Vamos construir algo que <em>valha a pena entregar</em>.",
    sub:
      "Lojistas, agências procurando um lead de PrestaShop ou um projeto travado: o LinkedIn é o caminho mais rápido até mim. Leio todas as mensagens.",
    cta: "Fale comigo no LinkedIn",
    rights: "© 2026 · Tom Girou · Todos os direitos reservados",
    build: "v1.0 / Feito na França",
    linkedinAria: "LinkedIn",
    githubAria: "GitHub",
  },
  caseStudy: {
    backToWork: "Projetos selecionados",
    visitLiveSite: "Ver o site no ar",
    backToAllWork: "Voltar para todos os projetos",
    outcomeLabel: "— Resultados",
    roleLabel: "Papel",
    durationLabel: "Duração",
    stackLabel: "Stack",
  },
  faq: {
    label: "[ 09 / FAQ ]",
    titleHtml:
      'Perguntas <em style="color:var(--red);font-style:italic">frequentes</em>.',
    blurb:
      "As perguntas que mais aparecem quando alguém pensa em trabalhar comigo — respondidas sem rodeios, com a minha voz.",
    items: [
      {
        q: "O que o Tom Girou faz?",
        a:
          "Sou desenvolvedor PrestaShop e tech lead na França, Especialista PrestaShop certificado (Core e Front). A maior parte da minha semana vai para o PrestaShop 1.7, 8 e 9: módulos sob medida, migrações de versão, integrações com ERP e lojas que precisam ser resgatadas. Trabalho na Evolutive, uma agência de e-commerce francesa, e estou aberto a projetos freelancer. Sou desenvolvedor desde 2018, e o PrestaShop é meu trabalho principal desde 2022.",
      },
      {
        q: "Qual é a sua trajetória?",
        a:
          "Comecei como agente de helpdesk na Wedoogift (hoje Pluxee) em 2016, enquanto terminava minha formação em desenvolvimento, e depois passei para full-stack Java / Spring Boot / Angular lá mesmo, como desenvolvedor em regime de alternância. Depois de formado, entrei na Emagineurs como engenheiro de P&D (TYPO3, WordPress, Ruby, segurança) e em seguida na Thermcross como desenvolvedor PHP interno, numa migração PrestaShop de grande porte com integração de ERP. Desde 2023 estou na Evolutive como Desenvolvedor PHP e Tech Lead, focado no core e em módulos PrestaShop para clientes de e-commerce.",
      },
      {
        q: "Você é especialista em PrestaShop?",
        a:
          "Sim — PrestaShop é onde passo a maior parte do tempo, e é a stack que eu apontaria primeiro se você está decidindo se sou o perfil certo. Trabalho no nível do core e dos módulos nas versões 1.7, 8 e na atual 9: módulos sob medida, setups multishop, integrações com ERP e sistemas de terceiros, trabalho de tema, e as rodadas de performance e segurança que uma loja vai acumulando conforme cresce. Também contribuo com o próprio core do PrestaShop como @Kaikina no GitHub, principalmente corrigindo os atritos que encontro no trabalho com clientes, mais do que correndo atrás de tickets de feature. Essa visão dos dois lados — construir em cima do PrestaShop o dia todo e, de vez em quando, corrigir a peça que fica por baixo — é o que costuma fazer a diferença nos problemas mais cabeludos. A maioria dos projetos listados neste site são builds PrestaShop: airsoft, calçados, vestuário, colecionáveis, fitoterapia, peças de climatização. Se o seu projeto é PrestaShop, é exatamente o que eu faço.",
      },
      {
        q: "Você faz migrações PrestaShop (1.5 → 1.7 → 8 → 9)?",
        a:
          "Sim — é um dos trabalhos que mais me pedem. Já entreguei migrações PrestaShop em várias etapas em diversos projetos reais: grandes migrações multishop, upgrades de versão major que exigiram trabalho profundo no core, e períodos em que uma instalação legada precisava continuar rodando em produção enquanto a substituta era construída ao lado. A mesma abordagem vale para o PrestaShop 9, a versão major atual. O salto de versão em si raramente é a parte difícil. O que come o tempo é tudo o que está pendurado na loja — módulos de terceiros e sob medida que dependem das APIs antigas, uma sincronização com o ERP que precisa continuar batendo pedidos e estoque do começo ao fim, overrides de tema escritos contra internals que mudaram de lugar, e anos de regras de negócio enterradas no banco que ninguém documentou. Por isso planejo a migração em torno desses riscos primeiro e trato o upgrade do core como a parte que sai conforme o planejado, porque normalmente sai, e eles normalmente não.",
      },
      {
        q: "E integrações com ERP?",
        a:
          "A maior parte do trabalho PrestaShop que faço acaba encostando num ERP ou em algum sistema de terceiros mais cedo ou mais tarde, então integração é parte central do trabalho, não uma missão secundária. Já conectei lojas a ERPs, feeds de dados de mercado e ferramentas de suporte, e na prática a integração assume uma de três formas: chamadas síncronas a webservices quando a resposta precisa ser em tempo real, batches agendados via cron quando uma reconciliação noturna basta, e pipelines assíncronos em queue quando o volume é alto ou o terceiro é lento e o cliente não pode ficar esperando. Escolher a forma errada é onde esses projetos costumam doer — uma chamada síncrona que amarra o checkout a um ERP instável, ou um batch que sai de sincronia silenciosamente entre uma execução e outra. Então o trabalho de verdade não é escrever o conector; é casar o padrão com o volume de dados, os SLAs e o quanto de defasagem o negócio realmente tolera. Já entreguei os três.",
      },
      {
        q: "Você trabalha com stacks além do PrestaShop?",
        a:
          "Sim. Fora do PrestaShop já entreguei em produção com Symfony, Java com Spring Boot, AngularJS e Angular moderno, Perl (integração de dados), Slim Framework (PIM greenfield), WordPress com WP-CLI e AWS CloudFormation, TYPO3 e Ruby. Infraestrutura AWS fez parte de vários projetos — EC2, RDS, S3, CloudFormation, Route 53, Certificate Manager — e já configurei pipelines de CI/CD em Jenkins, GitLab e similares.",
      },
      {
        q: "Você está disponível para projetos freelancer ou novas posições?",
        a:
          "Sim — estou aberto a cargos senior e lead, projetos freelancer e uma ou outra missão de resgate em um projeto PrestaShop travado. O jeito mais rápido de começar a conversa é pelo LinkedIn; leio todas as mensagens. Posso atuar em missões curtas ou longas, remote-first, com presencial possível se o escopo justificar. Um engajamento típico começa com uma call de 30 minutos para entender o escopo e o estado atual da codebase.",
      },
      {
        q: "Onde você mora e em quais idiomas trabalha?",
        a:
          "Moro na França, na região do Loire (entre Lyon e Saint-Étienne). Trabalho em francês (nativo), inglês (fluente, no dia a dia para comunicação técnica e de negócio) e espanhol (nível profissional, confortável para conteúdo escrito). Remote-first na França, na UE e em fusos horários remote-friendly. Presencial só é possível na região de Lyon / Saint-Étienne.",
      },
      {
        q: "Qual é o jeito mais rápido de falar com você?",
        a:
          "LinkedIn — linkedin.com/in/tgirou — é o caminho mais rápido. Leio todas as mensagens e respondo em alguns dias úteis. Se o LinkedIn não é o seu canal, meu GitHub é github.com/Kaikina, e meu site pessoal (tom-girou.dev) tem as novidades sobre o meu trabalho. Para assuntos sensíveis, peça um endereço de e-mail pelo LinkedIn e seguimos a partir daí.",
      },
      {
        q: "Você contribui com o PrestaShop open source?",
        a:
          "Sim — contribuo com o core do PrestaShop como @Kaikina no GitHub. A maioria das minhas contribuições cai onde encontro atrito no trabalho com clientes: correções de bugs de concorrência na numeração de faturas, problemas de cache de tema em multishop, e aquele tipo de edge case antigo que não vale um ticket inteiro para um time só, mas que importa para todo mundo que roda PrestaShop. O histórico de commits está em github.com/PrestaShop/PrestaShop/commits?author=Kaikina.",
      },
      {
        q: "Você ainda escreve o código?",
        a:
          "Sinceramente, pouco. Hoje é o Claude que escreve a maior parte. Meu trabalho é garantir que o que ele escreve atenda aos meus padrões. Documento as convenções do projeto e os padrões do PrestaShop para cada versão. Monto passadas de review de segurança e de conformidade com o core, e testes que ele precisa passar antes de eu sequer ler o diff. Tudo isso vem de oito anos vendo quanto custa código ruim seis meses depois. Também ajudei a construir o toolkit de IA que o time PrestaShop da minha agência usa. Uma ferramenta deixa quem a usa ainda mais do que já é. Dê um formão de primeira para quem não conhece madeira e você ganha erros, mais rápido. Dê para quem conhece e o trabalho melhora. Vi isso quando a agência liberou o Claude para o time inteiro: os ganhos foram bem desiguais e acompanharam a experiência mais do que qualquer outra coisa. Para o cliente, nada muda: um módulo que respeita as regras do PrestaShop e que não vai precisar ser reescrito no ano que vem. Só chega mais cedo.",
      },
    ],
  },
  blog: {
    metaTitle: "Blog — Tom Girou",
    metaDescription:
      "Notas das trincheiras sobre PHP, Symfony, PrestaShop, CI/CD e colocar software em produção — por Tom Girou, Lead Dev PrestaShop.",
    label: "[ Blog ]",
    titleHtml:
      'Notas das <em style="color:var(--red);font-style:italic">trincheiras</em>.',
    blurb:
      "Notas de campo sobre PHP, Symfony, PrestaShop, CI/CD e a engenharia nada glamourosa que mantém a produção tranquila. Sem enrolação — só o que realmente funcionou, e por quê.",
    authorRole: "Lead Dev PrestaShop",
    authorCredential: "Especialista PrestaShop certificado. Quatro anos de módulos, migrações e integrações com ERP no PrestaShop em produção.",
    writtenBy: "Escrito por",
    backToBlog: "Voltar para o blog",
    allPosts: "Todos os artigos",
    tableOfContents: "Nesta página",
    minRead: "min de leitura",
    publishedLabel: "Publicado em",
    updatedLabel: "Atualizado em",
    tagsLabel: "Temas",
    taggedLabel: "Artigos com a tag",
    relatedPosts: "Artigos relacionados",
    previousPost: "Artigo anterior",
    readMore: "Ler artigo",
    rssLabel: "RSS",
    kofiHeading: "Achou útil?",
    kofiBlurb: "Se este artigo te poupou algum tempo, você pode me pagar um café. É isso que mantém a escrita andando.",
    kofiButton: "Me apoie no Ko-fi",
    empty: "Ainda não há artigos — o primeiro está a caminho.",
  },
};

export default pt;
