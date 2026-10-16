# Aplicação da skill `clean-ddd-hexagonal` — Fase 1

- **Branch:** `refactor/clean-ddd-hexagonal`
- **Skill:** `.agents/skills/clean-ddd-hexagonal/SKILL.md` (referência usada: `references/LAYERS.md`)
- **Status:** Fase 1 executada (ver "Registro de execução" no fim)

## Por que esta skill primeiro

Das três skills instaladas (`clean-ddd-hexagonal`, `clean-code`, `refactoring-patterns`), esta é a que define
**para onde as dependências apontam**. Aplicar `clean-code`/`refactoring-patterns` antes significaria polir
código que talvez mude de camada depois. Além disso:

- o projeto **já começou** uma arquitetura hexagonal em `src/core/` (`domain/`, `ports/`, `use-cases/`,
  `infrastructure/`), mas a aplicou só pela metade;
- `src/core` é a única parte com **testes automatizados** (vitest), o que permite refatorar com rede de segurança;
- a skill pede foco em problemas concretos de fronteira, não em criar camadas por criar — e há problemas concretos.

## Diagnóstico

| # | Problema | Onde | Regra violada |
|---|----------|------|---------------|
| D1 | O use case importa de `lib/types.ts`, que importa `mongodb` | `src/core/use-cases/SubmitVoteUseCase.ts` | Domínio/aplicação não podem depender de infraestrutura |
| D2 | Regra de negócio "diarista não vota" está na rota HTTP, com acesso direto ao Mongo | `src/app/api/vote/route.ts` | Regras de negócio ficam no use case; I/O fica em adapters |
| D3 | A rota decide o status HTTP comparando o **texto** da mensagem de erro (`msg.includes("já votou")`, com acento, enquanto o use case escreve "ja votou" sem acento) | `src/app/api/vote/route.ts` | Contrato frágil entre camadas; erros de domínio devem ser tipados |
| D4 | Cálculo da média dos votos está **duplicado** (GET e PATCH) dentro da rota | `src/app/api/admin/rounds/[id]/route.ts` | Regra de domínio pura misturada com HTTP e Mongo |

## Escopo da Fase 1

**Dentro:** D1–D4, sem mudar contratos HTTP (mesmos status e mensagens).

**Fora (próximas fases, não executadas):**
- ciclo de vida da rodada (`open`/`close`/`apply`) como use cases + `IPlayerRepository.updateStats`;
- rotas de jogadores (`/api/players`, `/api/admin/players`) ainda acessam o Mongo direto;
- unificar tipos duplicados entre `src/lib/types.ts` e `src/core/domain/`;
- composition root único (hoje cada rota instancia seus repositórios).

## Passo a passo

Cada passo termina com `npx vitest run` verde antes de seguir.

### Passo 0 — Preparação
1. Criar a branch `refactor/clean-ddd-hexagonal`.
2. Rodar `npx vitest run` e registrar o baseline.

### Passo 1 — Domínio sem dependência de infraestrutura (D1)
1. Criar `src/core/domain/Rating.ts` com `VALID_NOTES`, `isValidNote` e `hasValidNotes(attrs)`.
2. Criar `src/core/domain/Player.ts` com `PlayerType`, a entidade mínima `Player` e a regra `canVoteInRounds(player)`.
3. `src/lib/types.ts` passa a **reexportar** esses símbolos do domínio (dependência de fora para dentro, permitida),
   mantendo compatibilidade com quem já importa de `@/lib/types`.
4. `SubmitVoteUseCase` passa a importar de `../domain/Rating`.

### Passo 2 — Erros de domínio tipados (D3)
1. Criar `src/core/domain/errors.ts` com `DomainError` (base), `InvalidNoteError`, `VoteRejectedError`
   e `VotingNotAllowedError`, com **as mesmas mensagens** de hoje.
2. `SubmitVoteUseCase` lança essas classes em vez de `Error` genérico.

### Passo 3 — Port + adapter de jogador (D2)
1. Criar o port `src/core/ports/IPlayerRepository.ts` com `findByEmail(email)`.
2. Criar o adapter `src/core/infrastructure/MongoPlayerRepository.ts` (mesma query da rota: `{ googleEmail }`).

### Passo 4 — Regra "diarista não vota" dentro do use case (D2 + D3)
1. `SubmitVoteUseCase` recebe `IPlayerRepository` e verifica `canVoteInRounds` **antes** de validar as notas e de registrar o voto.
2. Testes: adicionar `MockPlayerRepository` e um caso novo para o diarista.
3. `src/app/api/vote/route.ts` vira um adapter fino: autentica, valida o payload (zod), monta o use case e
   traduz o erro para HTTP com `instanceof`:
   `VotingNotAllowedError` → 403, `VoteRejectedError` → 409, `InvalidNoteError` → 400, demais → comportamento atual (400 + mensagem).

### Passo 5 — Média de votos como regra de domínio (D4)
1. Criar a função pura `computeAverages(ratingsList)` em `src/core/domain/VoteAverages.ts`.
2. Escrever testes unitários (média arredondada, jogador sem votos ausente, lista vazia).
3. Substituir os dois blocos duplicados em `src/app/api/admin/rounds/[id]/route.ts` pela função.

### Passo 6 — Validação final
1. `npx vitest run`
2. `npm run lint`
3. `npx tsc --noEmit` (e `npm run build`, se o ambiente permitir)
4. Registrar no `AGENTS.md` a regra de dependência do `src/core`.
5. `npm run handoff`.

## Mudanças de comportamento conhecidas

- **Ordem das validações em `POST /api/vote`:** antes, o diarista recebia 403 antes do payload ser validado.
  Agora o payload é validado primeiro (400) e só então a regra do diarista é aplicada (403).
  Só afeta diaristas que enviam payload inválido.
- **Mapeamento 409:** antes dependia do texto da mensagem; agora depende do tipo do erro. O resultado é o mesmo
  para os casos existentes.

## Registro de execução

Executado em 13/10/2026 na branch `refactor/clean-ddd-hexagonal`.

| Passo | Resultado |
|-------|-----------|
| 0 | Branch criada; baseline `npx vitest run`: **12/12** testes passando |
| 1 | Criados `core/domain/Rating.ts` e `core/domain/Player.ts`; `lib/types.ts` reexporta `PlayerType`, `VALID_NOTES`, `isValidNote` |
| 2 | Criado `core/domain/errors.ts` (`DomainError`, `InvalidNoteError`, `VoteRejectedError`, `VotingNotAllowedError`) |
| 3 | Criados `core/ports/IPlayerRepository.ts` e `core/infrastructure/MongoPlayerRepository.ts` |
| 4 | `SubmitVoteUseCase` recebe `IPlayerRepository` e aplica a regra do diarista; `api/vote/route.ts` sem acesso direto ao Mongo e com mapeamento de erro por tipo; +2 testes |
| 5 | `core/domain/VoteAverages.ts` + 3 testes; os dois blocos duplicados em `api/admin/rounds/[id]/route.ts` foram substituídos |
| 6 | `vitest` **17/17** ✅ · `tsc --noEmit` ✅ · `lint` 0 erros (5 warnings, todos já existentes e fora dos arquivos alterados) · `npm run build` **não executado**: o Node local é 18.19.1 e o Next 16 exige >= 20.9 |

**Verificação de fronteira:** `grep -rn "lib/\|mongodb\|next/" src/core/domain src/core/use-cases` não retorna nada.

### Teste manual pendente (requer Mongo + login Google)
1. Votar como mensalista → 200.
2. Votar de novo na mesma rodada → 409.
3. Votar como diarista → 403 com a mensagem "Jogadores diaristas não têm permissão...".
4. Admin: abrir o detalhe da rodada (médias) e aplicar notas sem `finalNotes` → mesmos valores de antes.
