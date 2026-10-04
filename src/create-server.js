import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILE_PATH = join(__dirname, "..", "profile.json");

export async function loadProfile() {
  const raw = await readFile(PROFILE_PATH, "utf-8");
  return JSON.parse(raw);
}

const GITHUB_API = "https://api.github.com";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const githubCache = new Map(); // path -> { data, expiresAt }

async function githubFetch(path) {
  const cached = githubCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "mcp-perfil",
    },
  });
  if (!res.ok) {
    if (cached) return cached.data; // serve stale em caso de erro/rate limit
    throw new Error(`GitHub API ${path} -> ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  githubCache.set(path, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export async function listGithubRepos(usuario) {
  const repos = await githubFetch(
    `/users/${usuario}/repos?per_page=100&sort=updated`
  );
  return repos
    .filter((r) => !r.fork)
    .map((r) => ({
      nome: r.name,
      descricao: r.description,
      url: r.html_url,
      linguagem_principal: r.language,
      estrelas: r.stargazers_count,
      forks: r.forks_count,
      topicos: r.topics,
      atualizado_em: r.updated_at,
      arquivado: r.archived,
    }));
}

export function createMcpServer() {
  const server = new Server(
    { name: "mcp-perfil", version: "1.0.0" },
    { capabilities: { resources: {}, tools: {} } }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "profile://completo",
        name: "Perfil completo",
        description: "Currículo completo em JSON",
        mimeType: "application/json",
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === "profile://completo") {
      const profile = await loadProfile();
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    }
    throw new Error(`Resource não encontrado: ${request.params.uri}`);
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "buscar_experiencias",
        description:
          "Busca experiências profissionais por empresa, cargo ou tecnologia",
        inputSchema: {
          type: "object",
          properties: {
            termo: {
              type: "string",
              description: "Termo de busca (empresa, cargo ou tecnologia)",
            },
          },
          required: ["termo"],
        },
      },
      {
        name: "listar_habilidades",
        description: "Lista todas as habilidades/skills do perfil",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "buscar_projetos",
        description: "Busca projetos por nome ou tecnologia",
        inputSchema: {
          type: "object",
          properties: {
            termo: {
              type: "string",
              description: "Termo de busca (nome do projeto ou tecnologia)",
            },
          },
          required: ["termo"],
        },
      },
      {
        name: "resumo_perfil",
        description:
          "Retorna um resumo com nome, título, contato e resumo profissional",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "listar_recomendacoes",
        description: "Lista as recomendações profissionais recebidas no perfil",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "listar_repositorios_github",
        description:
          "Lista os repositórios públicos do GitHub do perfil (exclui forks), com descrição, linguagem, estrelas e tópicos",
        inputSchema: {
          type: "object",
          properties: {
            usuario: {
              type: "string",
              description:
                "Usuário do GitHub (opcional, usa o do perfil por padrão)",
            },
          },
        },
      },
      {
        name: "buscar_repositorio_github",
        description:
          "Busca detalhes de um repositório específico do GitHub por nome, incluindo README",
        inputSchema: {
          type: "object",
          properties: {
            repositorio: {
              type: "string",
              description: "Nome do repositório",
            },
            usuario: {
              type: "string",
              description:
                "Usuário do GitHub (opcional, usa o do perfil por padrão)",
            },
          },
          required: ["repositorio"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const profile = await loadProfile();
    const { name, arguments: args } = request.params;

    const toText = (data) => ({
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    });

    switch (name) {
      case "buscar_experiencias": {
        const termo = (args?.termo || "").toLowerCase();
        const resultados = profile.experiencias.filter((exp) =>
          [exp.empresa, exp.cargo, exp.descricao, ...(exp.tecnologias || [])]
            .join(" ")
            .toLowerCase()
            .includes(termo)
        );
        return toText(resultados);
      }

      case "listar_habilidades":
        return toText(profile.habilidades);

      case "buscar_projetos": {
        const termo = (args?.termo || "").toLowerCase();
        const resultados = profile.projetos.filter((proj) =>
          [proj.nome, proj.descricao, ...(proj.tecnologias || [])]
            .join(" ")
            .toLowerCase()
            .includes(termo)
        );
        return toText(resultados);
      }

      case "resumo_perfil":
        return toText({
          nome: profile.nome,
          titulo: profile.titulo,
          resumo: profile.resumo,
          contato: profile.contato,
          localizacao: profile.localizacao,
        });

      case "listar_recomendacoes":
        return toText(profile.recomendacoes_recebidas);

      case "listar_repositorios_github": {
        const usuario = args?.usuario || profile.github_usuario;
        const repos = await listGithubRepos(usuario);
        return toText(repos);
      }

      case "buscar_repositorio_github": {
        const usuario = args?.usuario || profile.github_usuario;
        const repo = await githubFetch(`/repos/${usuario}/${args.repositorio}`);
        let readme = null;
        try {
          const readmeData = await githubFetch(
            `/repos/${usuario}/${args.repositorio}/readme`
          );
          readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
        } catch {
          readme = null;
        }
        return toText({
          nome: repo.name,
          descricao: repo.description,
          url: repo.html_url,
          linguagem_principal: repo.language,
          estrelas: repo.stargazers_count,
          topicos: repo.topics,
          criado_em: repo.created_at,
          atualizado_em: repo.updated_at,
          readme,
        });
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  });

  return server;
}
