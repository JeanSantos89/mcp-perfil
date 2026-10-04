// Translation layer. The profile data is authored in Portuguese, so every
// string that reaches the page goes through here to get its English pair.

export const UI = {
  navTrajectory: ["Trajetória", "Trajectory"],
  navProjects: ["Projetos", "Projects"],
  navAgents: ["Para agentes", "For agents"],
  idxIndex: ["01 · Index", "01 · Index"],
  idxNumbers: ["02 · Em números", "02 · In numbers"],
  idxProducts: ["03 · Construído por mim", "03 · Built by me"],
  productsHeadline: ["Ferramentas que eu mantenho", "Tools I build and maintain"],
  idxSkills: ["04 · Habilidades", "04 · Skills"],
  idxTrajectory: ["05 · Trajetória", "05 · Trajectory"],
  idxProjects: ["06 · Projetos", "06 · Projects"],
  idxRecs: ["07 · Recomendações", "07 · Recommendations"],
  idxAgents: ["08 · Para agentes", "08 · For agents"],
  heroLabelA: [
    "Arquitetura de Qualidade & SDET · Projeto os sistemas que mantêm entrega rápida sob controle · Hoje na",
    "Quality Architecture & SDET · I design the systems that keep fast delivery under control · Currently at",
  ],
  heroAbout: [
    "Aprendi precisão num laboratório e clareza numa sala de aula. Hoje projeto sistemas de qualidade: frameworks de automação, observabilidade em produção e uma base de conhecimento que deixa o time entregar rápido sem voar às cegas.",
    "I learned precision in a chemistry lab and clarity in a classroom. Now I design quality systems: automation frameworks, production observability and a knowledge base that lets a team ship fast without flying blind.",
  ],
  copy: ["Copiar", "Copy"],
  copied: ["Copiado", "Copied"],
  agentsBody: [
    "Este site é servido por um servidor MCP (Model Context Protocol) que expõe estes mesmos dados como ferramentas estruturadas: experiências, habilidades, projetos e repositórios ao vivo do GitHub.",
    "This site is served by an MCP (Model Context Protocol) server exposing this same data as structured tools: experience, skills, projects and live GitHub repositories.",
  ],
  statRules: [
    "regras de negócio modeladas numa camada de conhecimento consultável",
    "business rules modelled into a queryable knowledge layer",
  ],
  statRegression: [
    "de corte no ciclo de regressão, de 1 dia manual para 10 min",
    "cut in regression cycle time, from a manual day down to 10 min",
  ],
  statCoverage: [
    "dos fluxos críticos cobertos por automação, 12 de 13",
    "of critical flows covered by automation, 12 of 13",
  ],
  statHeartbeat: [
    "min entre health checks de produção, 24/7 com anti-flap",
    "min between production health checks, 24/7 with anti-flap",
  ],
  projectsHeadline: ["Entregues e em andamento", "Shipped and in progress"],
  filterAll: ["Todos", "All"],
  statusReady: ["pronto", "Ready"],
  statusProgress: ["em andamento", "In progress"],
  agentsHeadline: [
    "Conecte seu agente a este site",
    "Connect your agent to this site",
  ],
  agentsLead: [
    "O mesmo conteúdo que você está lendo sai daqui como ferramentas estruturadas: experiências, habilidades, projetos e repositórios do GitHub ao vivo.",
    "The same content you are reading ships from here as structured tools: experience, skills, projects and live GitHub repositories.",
  ],
  toolsLabel: ["tools expostas:", "exposed tools:"],
  agentToggle: ["ver como agente", "view as agent"],
};

export const SKILL_LABELS = {
  ia_aplicada_qa: ["Arquitetura de qualidade com IA", "AI quality architecture"],
  automacao_de_testes: ["Frameworks de automação", "Automation frameworks"],
  linguagens: ["Linguagens", "Languages"],
  backend_apis: ["Backend & APIs", "Backend & APIs"],
  cicd_observabilidade: ["CI/CD & Observabilidade", "CI/CD & Observability"],
  outras: ["Outras", "Other"],
};


/** Capability statements. The chip lists live on in the agent view; the
 *  human view gets intent and outcome instead of a wall of keywords. */
export const SKILL_COPY = {
  ia_aplicada_qa: [
    "Construo a camada de conhecimento que os agentes consultam antes de testar: MCP Servers, RAG e suites auto-healing, com DeepEval e LLM evals mantendo os proprios agentes honestos.",
    "I build the knowledge layer agents consult before they test: MCP servers, RAG retrieval and self-healing suites, with DeepEval and LLM evals keeping the agents themselves honest.",
  ],
  automacao_de_testes: [
    "Suites em camadas, feitas para sobreviver a um produto que muda toda semana: Playwright e Cypress na web, Appium e Maestro no mobile, com BDD em Gherkin servindo de documentacao viva das regras.",
    "Layered suites designed to survive a product that changes every week: Playwright and Cypress on web, Appium and Maestro on mobile, with BDD in Gherkin acting as living documentation of the rules.",
  ],
  linguagens: [
    "TypeScript e Python carregam a maior parte do que construo; Java, JUnit, Mockito e Jest entram quando o codebase pede.",
    "TypeScript and Python carry most of what I build; Java, JUnit, Mockito and Jest come in when the codebase calls for them.",
  ],
  backend_apis: [
    "Testes de contrato entre microsservicos com Postman e Swagger, e trabalho direto em PostgreSQL, MongoDB e SQL quando o bug esta no dado, nao na tela.",
    "Contract testing across microservices with Postman and Swagger, plus direct work in PostgreSQL, MongoDB and SQL for when the bug sits in the data, not the screen.",
  ],
  cicd_observabilidade: [
    "Pipelines em GitHub Actions e GitLab CI que falham alto em vez de em silencio, ligados a dashboards no Grafana, Crashlytics e alertas no Slack, para producao avisar antes do usuario.",
    "Pipelines in GitHub Actions and GitLab CI that fail loudly rather than quietly, wired into Grafana dashboards, Crashlytics and Slack alerts so production tells us before users do.",
  ],
  outras: [
    "Capacidade de processo e gestao de riscos vindos dos anos de laboratorio, conformidade com LGPD, e docencia, que continua sendo o jeito mais rapido de descobrir se eu realmente entendi algo.",
    "Process capability and risk management carried over from the lab years, LGPD compliance, and teaching, still the fastest way to find out whether I actually understand something.",
  ],
};

const ROLES = {
  "Analista de QA": "QA Analyst",
  "Quality Assurance Tester (Freelance)": "Quality Assurance Tester (Freelance)",
  "Técnico de laboratório": "Laboratory Technician",
  "Professor de informática": "IT Instructor",
};

const MONTHS = {
  "jan.": "Jan", "fev.": "Feb", "mar.": "Mar", "abr.": "Apr",
  "mai.": "May", "jun.": "Jun", "jul.": "Jul", "ago.": "Aug",
  "set.": "Sep", "out.": "Oct", "nov.": "Nov", "dez.": "Dec",
};

const PROJECTS = {
  "Servidor MCP (Model Context Protocol) production-grade que atua como camada semântica de conhecimento para times de QA e agentes autônomos de desenvolvimento. Armazena e serve contexto persistente de produto: regras de negócio, fluxos críticos e incidentes históricos.":
    "Production-grade MCP (Model Context Protocol) server acting as a semantic knowledge layer for QA teams and autonomous development agents. Stores and serves persistent product context: business rules, critical flows and historical incidents.",
  "Projeto de automação E2E com Playwright e TypeScript implementando o padrão Page Object Model (POM). Valida regras de negócio e edge cases de e-commerce (montagem de produtos multi-atributo, gestão de carrinho, validação de limites de input) no ecossistema nopCommerce.":
    "E2E automation project in Playwright and TypeScript implementing the Page Object Model. Validates e-commerce business rules and edge cases (multi-attribute product configuration, cart management, input boundary validation) on the nopCommerce stack.",
  "Projeto de automação E2E com Playwright e TypeScript utilizando POM avançado com locators desacoplados. Valida uma aplicação de e-commerce dinâmica em React, com foco em fluxos stateful, filtros web, contadores de carrinho e asserções financeiras/matemáticas precisas.":
    "E2E automation project in Playwright and TypeScript using an advanced POM with decoupled locators. Validates a dynamic React e-commerce app, focused on stateful flows, web filters, cart counters and precise financial assertions.",
  "Framework de automação E2E enterprise de alta escalabilidade, construído com Playwright e TypeScript para o ecossistema TMDB. Demonstra padrões arquiteturais avançados, gestão robusta de estado e CI/CD, simulando jornadas reais como autenticação multi-estado, paginação assíncrona e operações CRUD stateful.":
    "Highly scalable enterprise E2E automation framework built with Playwright and TypeScript for the TMDB ecosystem. Demonstrates advanced architectural patterns, robust state management and CI/CD, simulating real journeys such as multi-state authentication, async pagination and stateful CRUD operations.",
  "Repositório de automação QA shift-left com Python, Pytest e Playwright para fluxos de e-commerce (SauceDemo). Conecta gestão de testes e execução contínua, validando transações core (Auth, Carrinho) com especificações Gherkin, templates padronizados de bug e GitHub Actions automatizado.":
    "Shift-left QA automation repository with Python, Pytest and Playwright for e-commerce flows (SauceDemo). Connects test management and continuous execution, validating core transactions (auth, cart) with Gherkin specs, standardised bug templates and automated GitHub Actions.",
  "Repositório de automação de testes mobile usando Robot Framework e Appium v2. Demonstra testes funcionais end-to-end em aplicações Android reais e simuladas, com estrutura de keywords customizadas, locators de UI (UIAutomator2), geração de logs e verificação de fluxos/tarefas mobile.":
    "Mobile test automation repository using Robot Framework and Appium v2. Demonstrates end-to-end functional testing on real and emulated Android apps, with custom keyword structure, UI locators (UIAutomator2), log generation and mobile flow verification.",
};

const QA_MEMORY_PT = "Base de conhecimento de QA em markdown versionado, lida pelo assistente de IA. Sem servidor, sem banco e sem chave de LLM: cada comportamento do produto vira um arquivo com suas regras, ligado por wikilinks a áreas e incidentes. O conhecimento acumula em vez de evaporar na rotatividade, e os dados sensíveis nunca saem da máquina.";
const QA_MEMORY_EN = "A QA knowledge base in version-controlled markdown, read by the AI assistant. No server, no database, no LLM key: each product behaviour becomes a file holding its rules, wikilinked to areas and incidents. Knowledge accumulates instead of evaporating with turnover, and sensitive data never leaves the machine.";

const RECOMMENDATIONS = {
  "Jean é um profissional em constante evolução. Sempre muito prestativo e com uma vontade grande de inovar, sempre traz insights para os times no qual trabalha. Recomendo-o muito, cabe em qualquer time e equipe que queiram alçar voos de qualidade altos em seus projetos.":
    "Jean is a constantly evolving professional. Always helpful and with a strong drive to innovate, he consistently brings insights to the teams he works with. I highly recommend him: he fits any team aiming for high quality standards in their projects.",
  "Tive a oportunidade de trabalhar com Jeanderson e posso afirmar que ele é um profissional de QA extremamente dedicado e detalhista. Durante o período em que colaboramos, ele demonstrou grande capacidade de identificar problemas antes mesmo de chegarem aos usuários finais, contribuindo diretamente para a melhoria da qualidade dos produtos entregues. Além do forte conhecimento em testes funcionais e análise de requisitos, Jeanderson também se destacou pela comunicação clara com desenvolvedores, product managers e demais membros do time, facilitando a resolução rápida de bugs e o aprimoramento contínuo dos processos de qualidade. Seu pensamento crítico, organização e comprometimento com boas práticas de testes fazem dele um grande diferencial em qualquer equipe de desenvolvimento. Recomendo sem sombra de dúvidas o Jeanderson para qualquer equipe que valorize qualidade, responsabilidade e colaboração.":
    "I had the opportunity to work with Jeanderson and I can say he is an extremely dedicated and detail-oriented QA professional. While we collaborated, he showed a great ability to catch problems before they ever reached end users, contributing directly to the quality of what we shipped. Beyond his strong grasp of functional testing and requirements analysis, Jeanderson stood out for his clear communication with developers, product managers and the rest of the team, making bug resolution faster and quality processes continuously better. His critical thinking, organisation and commitment to good testing practices make him a real differentiator on any development team. I recommend Jeanderson without hesitation to any team that values quality, accountability and collaboration.",
};


const BULLETS = {
  "Automação E2E do zero em 4 meses: 61 specs em Playwright + TypeScript em 3 camadas (E2E funcional, regressão pré-deploy e smoke de contrato de API), com arquitetura Page Object, fixtures e camada de serviços reutilizável.":
    "E2E automation from scratch in 4 months: 61 specs in Playwright and TypeScript across 3 layers (functional E2E, pre-deploy regression and API contract smoke), on a Page Object architecture with fixtures and a reusable service layer.",
  "Monitoramento de produção 24/7 (Heartbeat): workflow próprio em GitHub Actions validando o esqueleto crítico do OnMaps a cada 30 min, com lógica anti-flap que elimina falsos positivos e alarme ao time de SRE via Slack com evidências (screenshot e log) na thread.":
    "24/7 production monitoring (Heartbeat): a custom GitHub Actions workflow validating the critical skeleton of OnMaps every 30 min, with anti-flap logic that removes false positives and SRE alerting over Slack carrying evidence (screenshot and log) in the thread.",
  "Arquitetura de Qualidade com IA (Agentic QE): ecossistema de memória técnica (qa-memory) com MCP Server, RAG e comportamento auto-healing, codificando 116 comportamentos e 409 regras de negócio (99,5% de alta confiança, 69 P0/P1) para validação preditiva de regressões.":
    "Quality architecture with AI (Agentic QE): a technical memory ecosystem (qa-memory) built on MCP Server, RAG and self-healing behaviour, encoding 116 behaviours and 409 business rules (99.5% high confidence, 69 P0/P1) for predictive regression validation.",
  "Shift-Left com IA preditiva: detecção de logic gaps antes do desenvolvimento e root-cause em nível de código (front e back), antecipando riscos e critérios de aceite no refinamento.":
    "Shift-left with predictive AI: logic-gap detection before development starts and code-level root cause across front and back, surfacing risks and acceptance criteria during refinement.",
  "Testes de API e microsserviços: validação funcional e de contrato de endpoints críticos como gate de sanidade pós-deploy.":
    "API and microservice testing: functional and contract validation of critical endpoints, acting as a post-deploy sanity gate.",
  "Ciclo de vida e defeitos: 26 bugs e 13 issues críticas reportados e priorizados com Produto/Engenharia, com rastreabilidade em sprint e acompanhamento até produção.":
    "Defect lifecycle: 26 bugs and 13 critical issues reported and prioritised with Product and Engineering, traceable across the sprint and followed through to production.",
  "Automação E2E do zero: ~170 cenários em 9 meses, sendo 130 Web (Playwright + TypeScript, BDD Cucumber/Gherkin) e 40 Android (Appium), cobrindo 12 dos 13 fluxos críticos, com Gherkin como documentação viva das regras de negócio.":
    "E2E automation from scratch: ~170 scenarios in 9 months, 130 on Web (Playwright and TypeScript, BDD Cucumber/Gherkin) and 40 on Android (Appium), covering 12 of the 13 critical flows, with Gherkin as living documentation of the business rules.",
  "Regressão contínua em CI: pipeline em GitHub Actions a cada merge para staging, reduzindo um ciclo de regressão de ~1 dia manual para ~10 min (Web) e ~13 min (Android).":
    "Continuous regression in CI: a GitHub Actions pipeline on every merge to staging, cutting a regression cycle from roughly one manual day to ~10 min on Web and ~13 min on Android.",
  "Microsserviços e APIs: testes funcionais e de contrato com Postman e Swagger entre mobile, web e backend.":
    "Microservices and APIs: functional and contract tests with Postman and Swagger across mobile, web and backend.",
  "QA data-driven em fluxos críticos: validação de assinaturas, tickets e integrações via manipulação direta de banco de dados, garantindo integridade da lógica de negócio.":
    "Data-driven QA on critical flows: validating subscriptions, tickets and integrations through direct database manipulation, guaranteeing the integrity of the business logic.",
  "Integração de monetização (GAM): validação da entrega de anúncios pelo link correto, com apresentação correta na UI e sem interferência no áudio.":
    "Monetisation integration (GAM): validating ad delivery through the correct link, rendering properly in the UI and without interfering with the audio.",
  "Loop de qualidade com produção: monitoramento via Firebase Crashlytics e Performance, bugs do suporte e avaliações nas lojas, convertendo achados em novos testes.":
    "Production feedback loop: monitoring through Firebase Crashlytics and Performance, support tickets and store reviews, turning findings into new tests.",
  "Ciclo de vida e defeitos: refinamento com Produto e UX, priorização de bugs e rastreabilidade nas sprints, com acompanhamento até produção (iOS via TestFlight).":
    "Defect lifecycle: refinement with Product and UX, bug prioritisation and sprint traceability, followed through to production (iOS via TestFlight).",
  "Projeto white label (Watch): validação de ~120 microsserviços e do funcionamento completo da versão Web de plataforma de streaming (TV, mobile e web) sob marca de outra empresa, incluindo Smart TV.":
    "White-label project (Watch): validating ~120 microservices and the complete Web experience of a streaming platform across TV, mobile and web under another company brand, including Smart TV.",
  "Mapeamento de Falhas: execução de testes exploratórios e funcionais em aplicações de alta escala para identificação e isolamento de bugs críticos de sistema.":
    "Failure mapping: exploratory and functional testing on high-scale applications to identify and isolate critical system bugs.",
  "Reporte Técnico: documentação detalhada de defeitos (com passos de reprodução, logs e evidências) em inglês, garantindo a rastreabilidade para o time de engenharia.":
    "Technical reporting: detailed defect documentation with repro steps, logs and evidence in English, keeping traceability for the engineering team.",
  "Automação de fluxos de trabalho com redução de tempo de até 93,75%, via Excel, Power Automate e VBA.":
    "Workflow automation cutting process time by up to 93.75%, through Excel, Power Automate and VBA.",
  "Padronização e conformidade de documentação técnica seguindo ISO/IEC 17025 e NBR ISO 17043.":
    "Standardisation and compliance of technical documentation under ISO/IEC 17025 and NBR ISO 17043.",
  "Identificação e documentação de falhas (bug hunting) e execução de casos de teste, apoiando a validação funcional das soluções.":
    "Failure identification and documentation (bug hunting) plus test case execution, supporting functional validation of the solutions.",
  "Aulas práticas de Excel, VBA, Power BI e ferramentas de hardware/software, com adaptação de conteúdo por nível técnico.":
    "Hands-on classes in Excel, VBA, Power BI and hardware/software tooling, adapting the content to each technical level.",
  "Preparo de alunos para o mercado de trabalho, com foco em aplicabilidade prática.":
    "Preparing students for the job market, focused on practical applicability.",
};

const ROLE_TITLES = {
  "Technical Lead | Solution Architect | Software Engineer":
    "Technical Lead | Solution Architect | Software Engineer",
  "Technology Manager | Engineering Manager | IT Manager | Technical Solutions | Software Engineering | Cloud & DevOps | IT Governance":
    "Technology Manager | Engineering Manager | IT Manager | Technical Solutions | Software Engineering | Cloud & DevOps | IT Governance",
};

const CATEGORIES = {
  "IA & agentes": "AI & agents",
  "Automação de testes": "Test automation",
  "CI & confiabilidade": "CI & reliability",
  "Testes mobile": "Mobile testing",
  "Outros": "Other",
  "pronto": "Ready",
  "em andamento": "In progress",
};


const PRODUCTS_COPY = {
  "Conhecimento de produto em markdown versionado, consultado pelo assistente durante o trabalho real. Sem servidor, sem banco, sem chave de LLM.":
    "Product knowledge in version-controlled markdown, consulted by the assistant during real work. No server, no database, no LLM key.",
  "regras de negócio codificadas":
    "business rules encoded",
  "116 comportamentos mapeados, 69 deles P0/P1":
    "116 behaviours mapped, 69 of them P0/P1",
  "Um fluxo de engenharia de qualidade escrito inteiramente como configuração de agente, que leva um ticket dos links até a revisão de produto.":
    "A quality engineering workflow written entirely as agent configuration, carrying a ticket from the links to product review.",
  "subagentes em produção":
    "subagents in production",
  "4 skills, 1 slash command e 3 paradas obrigatórias para decisão humana":
    "4 skills, 1 slash command and 3 mandatory stops for human decisions",
  "Ferramentas pequenas e independentes para o mesmo problema: teste e pipeline que passam sem provar nada.":
    "Small, independent tools for one recurring problem: tests and pipelines that pass without proving anything.",
  "ferramentas autônomas publicadas":
    "standalone tools published",
  "7 em ci-reliability-toolkit, 4 em playwright-test-kit":
    "7 in ci-reliability-toolkit, 4 in playwright-test-kit",
  "Toolkits de confiabilidade":
    "Reliability toolkits",
};

const LOCATIONS = {
  "Ponta Grossa, Paraná, Brasil": "Ponta Grossa, Paraná, Brazil",
};

const TITLES = {
  "QA / SDET com foco em automação inteligente e engenharia de avaliação de LLMs":
    "QA / SDET focused on intelligent automation and LLM evaluation engineering",
};

PROJECTS[QA_MEMORY_PT] = QA_MEMORY_EN;

const ALL = { ...ROLES, ...PRODUCTS_COPY, ...CATEGORIES, ...PROJECTS, ...RECOMMENDATIONS, ...BULLETS, ...ROLE_TITLES, ...LOCATIONS, ...TITLES };

/** English pair for a Portuguese string, falling back to the original. */
export function en(pt) {
  if (pt == null) return "";
  if (ALL[pt]) return ALL[pt];
  const date = /^(\w+\.)\s+de\s+(\d{4})$/.exec(pt);
  if (date && MONTHS[date[1]]) return `${MONTHS[date[1]]} ${date[2]}`;
  if (pt === "o momento") return "present";
  return pt;
}
