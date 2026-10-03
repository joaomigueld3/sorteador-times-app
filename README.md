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
| npm run seed | Popular MongoDB |
| npm run handoff | Gerar snapshot de sessao |
| npm test | Executar testes unitarios com Vitest |
| node scripts/project-check.mjs --full | Verificacao completa de tipos, linter, segredos e vulnerabilidades |
| node scripts/project-check.mjs --sync | Sincronizar mapa de arquivos no AGENTS.md |

## Pipeline de Desenvolvimento e Qualidade

O ciclo de desenvolvimento segue 4 etapas estruturadas:

1. **Desenvolvimento:** `npm run dev` para iterar localmente nas rotas e componentes.
2. **Validacao de Qualidade:**
   - Testes unitarios: `npx vitest run`
   - Checagem completa de tipos, linter, vulnerabilidades e varredura de credenciais: `node scripts/project-check.mjs --full`
3. **Git Commit com Guard-rails:**
   - Pre-commit hook ativo em `.githooks/pre-commit` (validando tipos, linting, segredos e AGENTS.md).
   - Padrao de mensagens semanticas com escopo claro: `feat(backend): ...`, `feat(frontend): ...`, `chore(infra): ...`, `docs: ...`.
4. **Fechamento e Handoff:**
   - `npm run handoff` para atualizar `docs/HANDOFF.md` antes de push ou abertura de PR.

## Documentacao

- **CONTEXT.md** - Visao completa do projeto (leia primeiro)
- **AGENTS.md** - Mapa do codigo para agentes IA
- **docs/BACKLOG.md** - Backlog priorizado de features
- **docs/spec-sorter.md** - Especificacao tecnica do sorteador
- **docs/PROMPT_NOVO_PROJETO.md** - Guia de bootstrap e garantia de qualidade para novos projetos

## Licenca

MIT
