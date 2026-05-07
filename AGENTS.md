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
