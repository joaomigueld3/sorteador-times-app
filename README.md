# Perronhas Rebirth

App web para organizar peladas de futebol com sistema de notas, ranking e sorteio de times equilibrados.

## Funcionalidades

### Notas e Ranking (`/notas`)
- Login de jogador por PIN ou credenciais
- Votação nos atributos dos colegas: Físico, Habilidade e Defesa
- Notas pré-preenchidas com os valores atuais para votação ágil
- Ranking geral e ordenações por nota overall e atributos específicos

### Sorteador de Times (`/sorteio`)
- Seleção visual de jogadores presentes na rodada
- Sorteio balanceado por média ponderada configurável (padrão: F=40%, H=35%, D=25%)
- Ajuste manual em tempo real via drag-and-drop com recálculo imediato de médias
- Exportação formatada para WhatsApp (com ou sem notas)

### Painel Administrativo (`/admin` e `/admin/rodada/[id]`)
- Gestão completa de jogadores: cadastro, edição de posições/notas e exclusão
- Gestão do ciclo de vida das rodadas: criação, ativação e encerramento
- Configuração de pesos de sorteio e parâmetros do sistema

### Votação por Rodada (`/votar/[roundId]`)
- Fluxo de votação dedicado para os participantes de uma rodada específica

---

## Stack e Arquitetura

- **Frontend & Fullstack:** [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização & Temas:** [Tailwind CSS v4](https://tailwindcss.com/) com suporte a tema escuro (*Cyber Green*) e claro (*Esportes da Sorte*)
- **Interatividade:** [@dnd-kit](https://dndkit.com/) para drag-and-drop fluido em desktop e mobile
- **Banco de Dados:** [MongoDB Atlas](https://www.mongodb.com/atlas) com driver nativo
- **Testes Unitários:** [Vitest](https://vitest.dev/)
- **Metodologia:** Spec-Driven Development via [ONP Spec](https://github.com/onovoprogramador/onp-spec) (ancoragem mecânica com testes executáveis)
- **Backend Hexagonal (`src/core/`):**
  - `src/core/domain`: Entidades puras e regras de negócio (`Player`, `Rating`, `Round`, `Settings`, `Vote`, `VoteAverages`)
  - `src/core/ports`: Interfaces e contratos de repositórios (`IPlayerRepository`, `IRoundRepository`, etc.)
  - `src/core/use-cases`: Casos de uso desacoplados do framework HTTP/Next.js
  - `src/core/infrastructure`: Adaptadores concretos para persistência no MongoDB

---

## Rodando Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o `.env` com a connection string do MongoDB:**
   ```bash
   cp .env.example .env
   # Preencha MONGO_URI com sua string de conexão
   ```

3. **Popule o banco com dados iniciais (opcional):**
   ```bash
   npm run seed
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   [http://localhost:3000](http://localhost:3000)

---

## Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 |
| `npm run build` | Compilação de produção com Turbopack |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Validação estática de código via ESLint |
| `npm test` | Executa a suíte de testes unitários com Vitest |
| `npm run seed` | Popula o banco MongoDB com jogadores e dados de exemplo |
| `npm run handoff` | Gera o snapshot atualizado de sessão em `docs/HANDOFF.md` |
| `npm run spec:status` | Visualiza o status de features, histórias e critérios de aceite |
| `npm run spec:verify` | Executa testes e registra a prova executável de cada critério |
| `npm run spec:audit` | Auditoria mecânica da especificação contra o código e constituição |
| `node scripts/project-check.mjs --full` | Verificação completa de tipos, linter, segredos e consistência |

---

## Pipeline de Desenvolvimento e Qualidade

O ciclo de desenvolvimento segue guard-rails rigorosos:

1. **Especificação & Planejamento:**
   - Novas features são especificadas via `npx @onovoprogramador/onp-spec new <feature>` gerando histórias (`US-xxx`) e critérios (`AC-xxx`).
   - Cada critério vira um teste anotado (`@spec:AC-xxx`) executado pelo Vitest.
2. **Desenvolvimento e Refatoração:**
   - Regras de domínio e casos de uso isolados em `src/core/` (sem acoplamento com Next.js ou MongoDB).
   - Componentes React seguindo padrões de composição limpos.
3. **Validação de Qualidade Automatizada:**
   - `npm test` para testes unitários com Vitest.
   - `npm run spec:audit` para garantir conformidade entre código, testes e constituição.
   - `node scripts/project-check.mjs --full` para checar tipos, segredos e vulnerabilidades.
4. **Git Hooks & Handoff:**
   - Pre-commit hook configurado em `.githooks/pre-commit` protegendo a branch contra regressões.
   - `npm run handoff` para atualizar o contexto em `docs/HANDOFF.md`.

---

## Documentação do Projeto

- **[CONTEXT.md](CONTEXT.md)** — Visão completa do projeto, decisões de produto e design
- **[AGENTS.md](AGENTS.md)** — Mapa do código e regras para agentes de IA
- **[docs/BACKLOG.md](docs/BACKLOG.md)** — Backlog priorizado de funcionalidades (v1 e v2)
- **[docs/skills/01-clean-ddd-hexagonal.md](docs/skills/01-clean-ddd-hexagonal.md)** — Registro e plano de migração para Clean Architecture / DDD
- **[.spec/constituicao.md](.spec/constituicao.md)** — Princípios inegociáveis de engenharia e segurança

---

## Licença

[MIT](LICENSE)
