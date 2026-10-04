# mcp-perfil

Currículo + portfólio vivo: um servidor MCP (Model Context Protocol) que expõe seu
perfil profissional como ferramentas consumíveis por agentes de IA (Claude Code,
Claude Desktop, Cursor, VS Code, qualquer cliente MCP), e que também serve uma
landing page bonita e um PDF de currículo bilíngue (PT/EN) — tudo gerado na hora,
direto de um único arquivo de dados (`profile.json`).

Este README é um guia de replicação: siga os passos para transformar isto no
**seu** perfil, do zero ao deploy.

## O que você ganha

- **Servidor MCP** (`get_experiences`, `get_skills`, `get_projects`, `get_summary`,
  `get_recommendations`, `get_github_repos`, `get_github_repo`) — qualquer agente de
  IA pode consultar seu histórico profissional em tempo real.
- **Landing page** bilíngue (PT/EN), com modo "view as agent" (texto puro para LLMs),
  projetos puxados ao vivo do GitHub (com cache), e uma seção "para agentes" com o
  comando de instalação do seu MCP pronto para copiar.
- **Currículo em PDF**, gerado na hora a partir dos mesmos dados, nos dois idiomas,
  disponível em `/resume` e `/resume?lang=en`.
- **Testes automatizados** (`npm test`) que travam a integridade dos dados: se você
  adicionar uma experiência/projeto sem a tradução em inglês correspondente, a
  suíte falha antes de você publicar.
- **CI no GitHub Actions**, rodando os testes a cada push/PR.

## 1. Fork e instalação

```bash
git clone https://github.com/<seu-usuario>/mcp-perfil.git
cd mcp-perfil
npm install
```

## 2. Edite `profile.json` com os seus dados

Esse arquivo é a única fonte de verdade — landing page, PDF e ferramentas MCP leem
dele. Campos principais:

| Campo | O que é |
|---|---|
| `nome`, `nome_exibicao` | Nome completo e nome curto exibido no site |
| `titulo`, `localizacao`, `resumo_curto`, `resumo` | Headline, cidade, resumo curto (hero/currículo) e resumo longo |
| `contato.linkedin` / `.github` / `.site` | Links do rodapé e do currículo |
| `habilidades` | Objeto de categorias → lista de skills (vira os chips na página e as seções do PDF) |
| `idiomas` | `[{ "idioma": "...", "nivel": "..." }]` |
| `experiencias` | `[{ cargo, empresa, inicio, fim, descricao, tecnologias[] }]` — bullets de `descricao` começam com `"- "` |
| `formacao` | `[{ curso, instituicao, local, inicio, fim }]` |
| `certificacoes` | `[{ nome, instituicao, emissao, credencial }]` |
| `projetos` | `[{ nome, descricao, link, tecnologias[], categoria, status }]` — `nome` deve bater com o nome do repositório no GitHub para puxar estrelas/linguagem ao vivo |
| `recomendacoes_recebidas` | `[{ autor, cargo_autor, relacao, data, texto }]` |
| `github_usuario` | Seu usuário do GitHub, usado para listar repositórios públicos |

Troque também os assets em `public/`:

- `public/favicon.jpg` — ícone do site
- `public/portrait.mp4` — vídeo curto do seu rosto, usado no efeito de pontos do hero
  (mudo, alguns segundos, de preferência fundo neutro — o efeito faz a extração de
  silhueta automaticamente)

E o e-mail de contato: procure por `jeansaantos89@gmail.com` em
`src/landing-page.js` e `src/resume.js` e troque pelo seu.

## 3. Traduza para inglês (`src/i18n.js`)

A página e o PDF renderizam em inglês por padrão e trocam para português no
clique do botão EN/PT. As traduções vivem em dicionários PT→EN dentro de
`src/i18n.js` (`ROLES`, `BULLETS`, `PROJECTS`, `TITLES`, `TERMS`, etc.) e são
aplicadas pela função `en()`.

Depois de editar `profile.json`, rode os testes — eles apontam exatamente o que
ainda falta traduzir:

```bash
npm test
```

Se aparecer `missing EN translation for ...`, adicione a entrada correspondente
no dicionário certo em `i18n.js` (o próprio erro já mostra o texto que falta).

## 4. Rode localmente

```bash
npm run start:http
```

Abre em `http://localhost:3000`. Edite `profile.json` e dê refresh para ver as
mudanças — não há build, tudo é renderizado a cada request.

Para usar via stdio (Claude Desktop/Code local, sem subir servidor HTTP):

```bash
npm start
```

## 5. Deploy gratuito (Render)

1. Suba o fork no GitHub.
2. Crie uma conta em [render.com](https://render.com) (login com GitHub, sem cartão).
3. **New +** → **Web Service** → selecione o repositório.
4. Configure:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm run start:http`
   - Instance Type: Free
5. Depois do deploy, a URL pública (ex: `https://seu-app.onrender.com/mcp`) já pode
   ser usada em qualquer cliente MCP compatível com Streamable HTTP.

> O plano free do Render "dorme" após 15 min de inatividade — a primeira
> requisição após esse período pode levar ~1 min para responder. Para evitar
> isso, configure um cronjob externo (ex: [cron-job.org](https://cron-job.org),
> grátis) batendo a cada 10 min em `https://seu-app.onrender.com/health` —
> essa rota responde um "ok" mínimo, pensada exatamente para pingers de
> keep-alive (a página completa é grande demais para a maioria desses serviços).
> Mantendo um único serviço free sempre ativo você fica dentro da cota de 750h
> de instância gratuita por mês do Render; se tiver outro serviço free na
> mesma conta, as horas somam e podem estourar o limite.

## 6. Conecte num cliente MCP

Com o servidor rodando (local ou no Render), a própria landing page mostra o
comando de instalação pronto na seção "for agents", para Claude Code, Cursor,
VS Code e `curl`. Exemplo (Claude Code):

```bash
claude mcp add --transport http perfil https://seu-app.onrender.com/mcp
```

## Estrutura

```
profile.json          — todos os dados do perfil (a única fonte de verdade)
public/                — favicon e vídeo do retrato
src/
  create-server.js     — tools/resources do MCP, leitura do profile.json e da API do GitHub
  server.js            — entrada stdio (uso local em clientes MCP)
  http-server.js        — entrada HTTP: landing page, PDF do currículo, /health, e /mcp (Streamable HTTP)
  landing-page.js       — renderiza a landing page (HTML+CSS+JS inline, sem build step)
  resume.js             — gera o PDF do currículo (pdfkit), bilíngue
  i18n.js               — dicionários de tradução PT→EN e textos de UI
tests/                 — node --test: integridade de tradução, estrutura da página, PDF, rotas HTTP
.github/workflows/      — CI rodando os testes a cada push/PR
```

## Rodando os testes

```bash
npm test
```

Cobre: toda experiência/projeto/formação tem tradução em inglês registrada,
a página renderiza um card/entrada por item do `profile.json` (sem hardcode de
conteúdo), o PDF do currículo é gerado com sucesso nos dois idiomas, e as rotas
HTTP respondem como esperado — incluindo um teste de regressão para a proteção
contra path traversal na rota de arquivos estáticos.

## Licença

[MIT](LICENSE) — use, copie, modifique e redistribua à vontade, inclusive
comercialmente, só mantendo o aviso de copyright.
