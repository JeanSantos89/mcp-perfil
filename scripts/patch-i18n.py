# -*- coding: utf-8 -*-
"""One-off patch: bullet translations, percentage stats, skill statements."""
import io

p = "src/i18n.js"
s = io.open(p, encoding="utf-8").read()

# --- stats: mix raw counts with percentages ---
old_stats = '''  statSpecs: [
    "specs numa arquitetura de testes em 3 camadas",
    "specs across a 3-layer test architecture",
  ],
  statRegression: [
    "ciclo de regressão, antes ~1 dia manual",
    "regression cycle, down from a full manual day",
  ],'''
new_stats = '''  statRegression: [
    "de corte no ciclo de regressão, de 1 dia manual para 10 min",
    "cut in regression cycle time, from a manual day down to 10 min",
  ],
  statCoverage: [
    "dos fluxos críticos cobertos por automação, 12 de 13",
    "of critical flows covered by automation, 12 of 13",
  ],'''
assert old_stats in s, "stats block not found"
s = s.replace(old_stats, new_stats)

# --- skill statements: intent and delivery instead of keyword walls ---
skill_copy = '''
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
'''
s = s.replace("const ROLES = {", skill_copy + "\nconst ROLES = {")

# --- bullet translations ---
bullets = {
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
}


def js_str(value):
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


lines = ["", "const BULLETS = {"]
for pt, en_text in bullets.items():
    lines.append("  " + js_str(pt) + ":")
    lines.append("    " + js_str(en_text) + ",")
lines.append("};")
s = s.replace("const ROLE_TITLES = {", "\n".join(lines) + "\n\nconst ROLE_TITLES = {")
s = s.replace(
    "const ALL = { ...ROLES, ...PROJECTS, ...RECOMMENDATIONS,",
    "const ALL = { ...ROLES, ...PROJECTS, ...RECOMMENDATIONS, ...BULLETS,",
)

io.open(p, "w", encoding="utf-8").write(s)
print("i18n patched")
