# AGENTS.md

## Snapshot
- Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.
- Package manager in this repo is `npm` (lockfile is `package-lock.json`).
- `README.md` is mostly boilerplate; trust `package.json` scripts and source files.

## Commands That Matter
- Install deps: `npm install`
- Dev server: `npm run dev` (serves on port 3000 by default)
- Lint: `npm run lint`
- Production check: `npm run build`
- Start built app: `npm run start`
- Generate session handoff: `npm run handoff` (writes `docs/HANDOFF.md`)

## Validation Workflow
- There is no test suite configured right now.
- For code changes, run `npm run lint` first, then `npm run build` to catch type/build regressions.
- End each meaningful session with `npm run handoff` so another machine/session can resume quickly.

## Codebase Map (Real Entrypoints)
- Main UI entrypoint: `src/app/page.tsx` (client component; entry chooser + notes flow + new sorter flow).
- App shell/metadata/fonts: `src/app/layout.tsx`.
- Global styling + theme tokens: `src/app/globals.css`.
- Legacy standalone sorter route: `src/app/sorteador-antigo/page.tsx` (renders `preview.html`).
- Sorter core: `src/components/TeamDrawer.tsx` (player pool, balancing, mobile drag-and-drop via dnd-kit).
- Notes/ranking components: `src/components/LoginModal.tsx`, `src/components/VotingCard.tsx`, `src/components/RankingList.tsx`.

## Repo-Specific Behavior To Preserve
- Notes flow calls backend API from `src/services/api.ts` (`/players`, `/login`, `/votes`) and surfaces connection errors to UI.
- Team sorter intentionally normalizes imported/loaded attributes to tens scale (`10..100`) in `TeamDrawer`.
- Team cards show live average + diff vs global team average and must update after drag-and-drop moves.
- Theme system is CSS-variable based in `globals.css`; `page.tsx` toggles light mode by setting `data-theme="light"`, and uses default `:root` values for dark mode by removing the attribute.

## Not Configured (Do Not Assume)
- No CI workflows in `.github/workflows`.
- No pre-commit hooks or task runner config.
- No monorepo/workspace layout.

<!-- AUTO:START (gerado por scripts/project-check.mjs — não edite à mão) -->
<!-- structure-hash: c71b5cac3e -->
## Snapshot automático

- **Scripts npm:** `dev`, `build`, `start`, `lint`, `handoff`, `seed`, `prepare`
- **Arquivos possivelmente não usados:** `src/core/use-cases/__tests__/CreateRoundUseCase.test.ts`, `src/core/use-cases/__tests__/SubmitVoteUseCase.test.ts`, `src/lib/__tests__/playerParser.test.ts`

```text
src/app/admin/page.tsx
src/app/admin/rodada/[id]/page.tsx
src/app/api/admin/players/[id]/route.ts
src/app/api/admin/players/route.ts
src/app/api/admin/rounds/[id]/route.ts
src/app/api/admin/rounds/route.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/api/players/route.ts
src/app/api/rounds/[id]/route.ts
src/app/api/settings/route.ts
src/app/api/vote/route.ts
src/app/favicon.ico
src/app/layout.tsx
src/app/notas/page.tsx
src/app/page.tsx
src/app/sorteador-antigo/page.tsx
src/app/sorteio/page.tsx
src/app/votar/[roundId]/layout.tsx
src/app/votar/[roundId]/page.tsx
src/components/LoginModal.tsx
src/components/RankingList.tsx
src/components/TeamDrawer.tsx
src/components/VotingCard.tsx
src/core/domain/Round.ts
src/core/domain/Settings.ts
src/core/domain/Vote.ts
src/core/infrastructure/MongoRoundRepository.ts
src/core/infrastructure/MongoSettingsRepository.ts
src/core/infrastructure/MongoVoteRepository.ts
src/core/ports/IRoundRepository.ts
src/core/ports/ISettingsRepository.ts
src/core/ports/IVoteRepository.ts
src/core/use-cases/CreateRoundUseCase.ts
src/core/use-cases/GetSettingsUseCase.ts
src/core/use-cases/SubmitVoteUseCase.ts
src/core/use-cases/UpdateSettingsUseCase.ts
src/core/use-cases/__tests__/CreateRoundUseCase.test.ts
src/core/use-cases/__tests__/SubmitVoteUseCase.test.ts
src/data/mocks.ts
src/lib/__tests__/playerParser.test.ts
src/lib/admin.ts
src/lib/auth.ts
src/lib/mongodb.ts
src/lib/playerParser.ts
src/lib/types.ts
src/services/api.ts
```
<!-- AUTO:END -->

<!-- AUTO:START (gerado por scripts/project-check.mjs — não edite à mão) -->
<!-- structure-hash: 668c34a50a -->
## Snapshot automático

- **Scripts npm:** `dev`, `build`, `start`, `lint`, `handoff`, `seed`
- **Arquivos possivelmente não usados:** `src/core/use-cases/__tests__/CreateRoundUseCase.test.ts`, `src/core/use-cases/__tests__/SubmitVoteUseCase.test.ts`, `src/lib/__tests__/playerParser.test.ts`

```text
src/app/admin/page.tsx
src/app/admin/rodada/[id]/page.tsx
src/app/api/admin/players/route.ts
src/app/api/admin/rounds/[id]/route.ts
src/app/api/admin/rounds/route.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/api/players/route.ts
src/app/api/rounds/[id]/route.ts
src/app/api/settings/route.ts
src/app/api/vote/route.ts
src/app/favicon.ico
src/app/layout.tsx
src/app/notas/page.tsx
src/app/page.tsx
src/app/sorteador-antigo/page.tsx
src/app/sorteio/page.tsx
src/app/votar/[roundId]/layout.tsx
src/app/votar/[roundId]/page.tsx
src/components/LoginModal.tsx
src/components/RankingList.tsx
src/components/TeamDrawer.tsx
src/components/VotingCard.tsx
src/core/domain/Round.ts
src/core/domain/Settings.ts
src/core/domain/Vote.ts
src/core/infrastructure/MongoRoundRepository.ts
src/core/infrastructure/MongoSettingsRepository.ts
src/core/infrastructure/MongoVoteRepository.ts
src/core/ports/IRoundRepository.ts
src/core/ports/ISettingsRepository.ts
src/core/ports/IVoteRepository.ts
src/core/use-cases/CreateRoundUseCase.ts
src/core/use-cases/GetSettingsUseCase.ts
src/core/use-cases/SubmitVoteUseCase.ts
src/core/use-cases/UpdateSettingsUseCase.ts
src/core/use-cases/__tests__/CreateRoundUseCase.test.ts
src/core/use-cases/__tests__/SubmitVoteUseCase.test.ts
src/data/mocks.ts
src/lib/__tests__/playerParser.test.ts
src/lib/admin.ts
src/lib/auth.ts
src/lib/mongodb.ts
src/lib/playerParser.ts
src/lib/types.ts
src/services/api.ts
```
<!-- AUTO:END -->

<!-- AUTO:START (gerado por scripts/project-check.mjs — não edite à mão) -->
<!-- structure-hash: 668c34a50a -->
## Snapshot automático

- **Scripts npm:** `dev`, `build`, `start`, `lint`, `handoff`, `seed`
- **Arquivos possivelmente não usados:** `src/core/use-cases/__tests__/CreateRoundUseCase.test.ts`, `src/core/use-cases/__tests__/SubmitVoteUseCase.test.ts`, `src/lib/__tests__/playerParser.test.ts`

```text
src/app/admin/page.tsx
src/app/admin/rodada/[id]/page.tsx
src/app/api/admin/players/route.ts
src/app/api/admin/rounds/[id]/route.ts
src/app/api/admin/rounds/route.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/api/players/route.ts
src/app/api/rounds/[id]/route.ts
src/app/api/settings/route.ts
src/app/api/vote/route.ts
src/app/favicon.ico
src/app/layout.tsx
src/app/notas/page.tsx
src/app/page.tsx
src/app/sorteador-antigo/page.tsx
src/app/sorteio/page.tsx
src/app/votar/[roundId]/layout.tsx
src/app/votar/[roundId]/page.tsx
src/components/LoginModal.tsx
src/components/RankingList.tsx
src/components/TeamDrawer.tsx
src/components/VotingCard.tsx
src/core/domain/Round.ts
src/core/domain/Settings.ts
src/core/domain/Vote.ts
src/core/infrastructure/MongoRoundRepository.ts
src/core/infrastructure/MongoSettingsRepository.ts
src/core/infrastructure/MongoVoteRepository.ts
src/core/ports/IRoundRepository.ts
src/core/ports/ISettingsRepository.ts
src/core/ports/IVoteRepository.ts
src/core/use-cases/CreateRoundUseCase.ts
src/core/use-cases/GetSettingsUseCase.ts
src/core/use-cases/SubmitVoteUseCase.ts
src/core/use-cases/UpdateSettingsUseCase.ts
src/core/use-cases/__tests__/CreateRoundUseCase.test.ts
src/core/use-cases/__tests__/SubmitVoteUseCase.test.ts
src/data/mocks.ts
src/lib/__tests__/playerParser.test.ts
src/lib/admin.ts
src/lib/auth.ts
src/lib/mongodb.ts
src/lib/playerParser.ts
src/lib/types.ts
src/services/api.ts
```
<!-- AUTO:END -->
