# Backlog — Perronhas Rebirth

> Backlog priorizado do projeto. Atualizado conforme novas demandas e entregas.
> Fonte original: docs/funcionalidades.txt (mantido como referência histórica).

## Legenda de Status
- FEITO — Implementado e funcionando
- EM ANDAMENTO — Em desenvolvimento ativo
- PENDENTE — No plano para execução
- IDEIA — Sugestão, sem compromisso

---

## Prioridade 1 — Core & Administração

| # | Feature | Status | Detalhes |
|---|---------|--------|----------|
| 1.1 | Backend API integrada no Next.js (App Router + MongoDB) | FEITO | Rotas `/api/players`, `/api/vote`, `/api/rounds/[id]`, `/api/admin/*`, `/api/settings`. |
| 1.2 | Dashboard do Admin (`/admin` e `/admin/rodada/[id]`) | FEITO | Criação de rodadas, controle de votações, cálculo de médias, cadastro individual e em lote com segredo ADM. |
| 1.3 | Média ponderada dos últimos 10 jogos | PENDENTE | A nota do jogador será a média das notas dadas por todos, formando a média ponderada onde jogos recentes valem mais. |
| 1.4 | Cold Start e pesos configuráveis | FEITO | Pesos F(40), H(30), D(30) configuráveis no painel ADM e persistidos via `/api/settings`. |
| 1.5 | Remoção de jogador do banco pelo ADM | PENDENTE | Botão de exclusão com confirmação em `/admin` e rota `DELETE /api/admin/players`. |
| 1.6 | Aprovação de times submetidos pelo ADM | PENDENTE | Visualização de times com data e hora formatadas, composição, médias, equilíbrio e botões Aprovar/Rejeitar. |

## Prioridade 2 — Features do Sorteio (`/sorteio`)

| # | Feature | Status | Detalhes |
|---|---------|--------|----------|
| 2.1 | Sorteio balanceado por atributos | FEITO | Algoritmo guloso com ruído, pesos configuráveis, snake-draft por posição. |
| 2.2 | Drag-and-drop entre times | FEITO | Via dnd-kit, atualiza médias em tempo real. |
| 2.3 | Exportar para WhatsApp | FEITO | Copiar com notas e Copiar sem notas. |
| 2.4 | Lista de jogadores ao lado dos times | FEITO | Pool com separação de mensalistas e diaristas (desmarcados por padrão). |
| 2.5 | Espaço para rolagem no mobile | FEITO | Scroll otimizado para telas pequenas. |
| 2.6 | Ajustes visuais de flags no banco | PENDENTE | Remover tag/flag visual de Mensalista (`MEN`), manter exclusivamente a de Diarista (`DIA`). |
| 2.7 | Botões de seleção de tipo em adição individual | PENDENTE | Substituir botão de dupla função (toggle) por 2 botões explícitos (`Mensalista` e `Diarista`). |
| 2.8 | Submeter times para confirmação do ADM | PENDENTE | Botão "Confirmar time e salvar no banco" para análise e confirmação pelo administrador. |
| 2.9 | Compartilhar times via link com estado | PENDENTE | Botão "Compartilhar time" com link direcionando para o sorteio atual para edição colaborativa. |
| 2.10 | Sorteio com histórico de repetição (4-6 semanas) | PENDENTE | Algoritmo analisa os times aprovados das últimas 4 a 6 semanas e penaliza/evita repetição de duplas e trios no mesmo time. |

## Prioridade 3 — Features de Notas, Votação e Histórico

| # | Feature | Status | Detalhes |
|---|---------|--------|----------|
| 3.1 | Votação por jogador (sliders F/H/D) | FEITO | Cada jogador vota individualmente com notas múltiplas de 10. |
| 3.2 | Notas pré-preenchidas | FEITO | Sliders vêm com nota atual como base para agilizar votação. |
| 3.3 | Autenticação Google via NextAuth | FEITO | Login com validação de permissão (apenas membros cadastrados e mensalistas votam). |
| 3.4 | Ranking geral | FEITO | Lista ordenada por nota overall. |
| 3.5 | Registro de notas mensais e progresso do jogador | PENDENTE | Backend registra evolução mês a mês e interface permite acompanhar o progresso das notas. |
| 3.6 | Votação de equilíbrio dos times | PENDENTE | Após a rodada, jogadores votam se os times foram equilibrados. |

## Prioridade 4 — UX / Visual

| # | Feature | Status | Detalhes |
|---|---------|--------|----------|
| 4.1 | Dark/Light mode | FEITO | Cyber Green (dark) + Esportes da Sorte (light). |
| 4.2 | Responsivo mobile | FEITO | Layout adaptável, menu hambúrguer, touch-friendly. |
| 4.3 | Fallback offline | FEITO | Se backend cair, usa MOCK_PLAYERS com aviso. |
| 4.4 | Cartinha do FIFA | PENDENTE | Card estilo FIFA com animação básica para cada jogador. |
| 4.5 | Upload de foto do jogador | PENDENTE | Cada jogador sobe a própria foto em 3 versões. |

## Prioridade 5 — Infraestrutura & Qualidade

| # | Feature | Status | Detalhes |
|---|---------|--------|----------|
| 5.1 | Testes automatizados | FEITO | Vitest configurado com testes de use-cases e parser. |
| 5.2 | Verificação e scripts de checagem | FEITO | Scripts de projeto, verificação de linter e types sem erros. |
| 5.3 | Lista de presentes com IA | IDEIA | Usar Gemini para processar lista de presentes no WhatsApp. |
| 5.4 | CI/CD | IDEIA | GitHub Actions: lint, build, deploy. |
| 5.5 | Deploy | IDEIA | Vercel (front) + Railway/Atlas (backend). |

---

## Notas Técnicas

- MongoDB Atlas integrado com coleções `players`, `rounds`, `votes`, `settings` e novas coleções planejadas: `saved_draws` e `shares`.
- Parser compartilhado em `src/lib/playerParser.ts` para adições individuais e em lote.
- Histórico mensal será gravado em cada aplicação de rodada no MongoDB.
