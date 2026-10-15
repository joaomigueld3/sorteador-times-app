# Perronhas Rebirth

App web para organizar peladas de futebol com sistema de notas e sorteio de times equilibrados.

## Funcionalidades

### Notas e Ranking (/notas)
- Login por jogador (PIN)
- Votacao nos atributos dos colegas: Fisico, Habilidade, Defesa
- Notas pre-preenchidas para agilizar votacao
- Ranking geral por nota overall

### Sorteador de Times (/sorteio)
- Selecao de jogadores presentes na rodada
- Sorteio balanceado por media ponderada (F=40%%, H=35%%, D=25%%)
- Ajuste manual via drag-and-drop
- Exportacao para WhatsApp (com ou sem notas)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** para estilizacao
- **dnd-kit** para drag-and-drop
- **MongoDB Atlas** como banco de dados
- **lucide-react** para icones

## Rodando localmente

1. Instale as dependencias:
   npm install

2. Configure o .env com a connection string do MongoDB:
   MONGO_URI=mongodb+srv://...

3. Popule o banco (opcional):
   npm run seed

4. Inicie o servidor de desenvolvimento:
   npm run dev

5. Acesse http://localhost:3000

## Comandos

| Comando | Descricao |
|---------|-----------|
| npm run dev | Servidor de desenvolvimento |
| npm run build | Build de producao |
| npm run lint | Linting |
| npm test | Executar testes unitarios com Vitest |
| npm run check | Verificacao completa de tipos, linter, segredos e vulnerabilidades |
| npm run git:pull | Sincronizar branch develop2 local com o GitHub |
| npm run git:sync | Buscar e puxar alteracoes do remote (git fetch + pull) |
| npm run git:handoff | Atualizar snapshot de sessao em docs/HANDOFF.md |
| npm run seed | Popular MongoDB |
| npm run handoff | Gerar snapshot de sessao |
| node scripts/project-check.mjs --sync | Sincronizar mapa de arquivos no AGENTS.md |

## Pipeline de Desenvolvimento, GitFlow e Qualidade

O ciclo de desenvolvimento segue o padrao oficial de **GitFlow** (documentado em `.agents/skills/gitflow/SKILL.md`):

1. **Branching:** Novas funcionalidades partem de `develop2` (`feat/nome-da-feature`) e retornam a ela via Pull Request.
2. **Validacao de Qualidade Local:**
   - Testes unitarios: `npm test`
   - Checagem completa de tipos e linter: `npm run check`
3. **Commits Semanticos:**
   - Mensagens claras no padrao Conventional Commits: `feat(modulo): ...`, `fix(modulo): ...`, `refactor(modulo): ...`.
4. **Pull Requests & Merge:**
   - CI automatizado no GitHub Actions (`.github/workflows/ci.yml`) validando lint, tipos e testes a cada push e PR.
   - Integracao final na `develop2` via **Squash and Merge** (1 commit atomico por PR).
5. **Fechamento e Handoff:**
   - `npm run handoff` para atualizar `docs/HANDOFF.md`.

## Documentacao

- **CONTEXT.md** - Visao completa do projeto (leia primeiro)
- **AGENTS.md** - Mapa do codigo para agentes IA
- **.agents/skills/gitflow/SKILL.md** - Guia oficial de GitFlow, branching e commits
- **docs/BACKLOG.md** - Backlog priorizado de features
- **docs/spec-sorter.md** - Especificacao tecnica do sorteador
- **docs/PROMPT_NOVO_PROJETO.md** - Guia de bootstrap e garantia de qualidade para novos projetos

## Licenca

MIT
