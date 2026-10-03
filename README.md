# mcp-perfil

Servidor MCP (Model Context Protocol) que expõe meu perfil profissional — experiências, habilidades, projetos e repositórios do GitHub — como ferramentas consumíveis por qualquer cliente MCP (Claude Desktop, Claude Code, Claude.ai via conector remoto, etc).

## O que oferece

- `get_experiences` — histórico profissional
- `get_skills` — habilidades técnicas
- `get_projects` — projetos em destaque
- `get_summary` — resumo geral do perfil
- `get_recommendations` — recomendações recebidas
- `get_github_repos` — repositórios públicos ao vivo (via API do GitHub, cache de 10 min)
- `get_github_repo` — busca um repositório específico

## Rodando localmente (stdio)

```bash
npm install
npm start
```

Use este modo para integrar com Claude Desktop/Code via stdio.

## Rodando como servidor HTTP (deploy remoto)

```bash
npm install
npm run start:http
```

Expõe o endpoint MCP em `/mcp` (Streamable HTTP) e um health check em `/`.

## Deploy gratuito (Render)

1. Suba este repositório no GitHub.
2. Crie uma conta em [render.com](https://render.com) (login com GitHub, sem cartão).
3. **New +** → **Web Service** → selecione este repositório.
4. Configure:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm run start:http`
   - Instance Type: Free
5. Após o deploy, a URL pública (ex: `https://mcp-perfil.onrender.com/mcp`) pode ser usada em qualquer cliente MCP compatível com Streamable HTTP.

> O plano free do Render "dorme" após 15 min de inatividade — a primeira requisição após esse período pode levar ~1 min para responder.

## Estrutura

- `profile.json` — dados do perfil
- `src/create-server.js` — lógica compartilhada das tools/resources
- `src/server.js` — entrada stdio
- `src/http-server.js` — entrada HTTP
