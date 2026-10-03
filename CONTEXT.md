# CONTEXT.md - Perronhas Rebirth

> **Leia este arquivo primeiro.** Ele contem todo o contexto necessario para entender e contribuir com o projeto.

## O que e

**Perronhas Rebirth** e um app web para organizar peladas (rachas) de futebol. Ele resolve dois problemas:

1. **Avaliar jogadores de forma justa** - Cada jogador vota nos atributos dos colegas a cada rodada. A nota final e uma media ponderada que da mais peso aos jogos recentes.
2. **Sortear times equilibrados** - Com base nas notas, o app gera times balanceados automaticamente, permitindo ajuste manual via drag-and-drop e exportacao para WhatsApp.

O app e usado por um grupo real de ~25-40 jogadores.

---

## Stack Tecnica

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16 |
| UI | React | 19 |
| Linguagem | TypeScript | 5 |
| Estilizacao | Tailwind CSS | v4 |
| Drag-and-Drop | dnd-kit | core 6 + sortable 10 |
| Banco de Dados | MongoDB Atlas | driver 7 |
| Package Manager | npm | lockfile: package-lock.json |
| Icones | lucide-react | - |

---

## Arquitetura de Rotas e Componentes

- src/app/page.tsx - Home: Tela de selecao (Notas ou Sorteio)
- src/app/layout.tsx - Shell do app (fontes, metadata)
- src/app/globals.css - Sistema de temas CSS (variaveis)
- src/app/notas/page.tsx - Fluxo de Notas: Login, Votacao, Ranking
- src/app/sorteio/page.tsx - Fluxo de Sorteio: Pool, Balanceamento, Export
- src/app/sorteador-antigo/ - [LEGADO] Rota do sorteador original (preview.html)
- src/components/TeamDrawer.tsx - Componente principal do sorteio (46KB - maior arquivo)
- src/components/VotingCard.tsx - Card de votacao por jogador (sliders F/H/D)
- src/components/LoginModal.tsx - Modal de login com PIN
- src/components/RankingList.tsx - Lista de ranking por nota
- src/services/api.ts - Cliente HTTP para backend (localhost:4000)
- src/data/mocks.ts - Dados mock dos 25 jogadores (fallback offline)

---

## Fluxos Principais

### Fluxo 1: Notas (/notas)
1. Jogador abre a pagina e ve LoginModal
2. Seleciona seu nome na lista e digita PIN (1234 no mock)
3. Apos login, ve lista de todos os jogadores como VotingCard
4. Cada card tem sliders para Fisico, Habilidade e Defesa (0-100)
5. Notas vem pre-preenchidas com a nota atual (para nao ser enfadonho)
6. Pode alternar para aba RANKING para ver classificacao geral
7. Botao CONFIRMAR envia votos via api.submitVote()

### Fluxo 2: Sorteio (/sorteio)
1. Admin abre a pagina e ve TeamDrawer com pool de jogadores
2. Seleciona os jogadores presentes na rodada
3. Configura: numero de times, pesos (F/H/D), fator de aleatoriedade
4. Clica Gerar Times - algoritmo guloso com ruido distribui jogadores
5. Ajusta manualmente via drag-and-drop entre times
6. Medias atualizam em tempo real apos cada movimento
7. Exporta: Copiar com Notas ou Copiar sem Notas (formato WhatsApp)

---

## Regras de Negocio

### Calculo de Nota (Overall)

Overall = (Fisico x 0.40) + (Habilidade x 0.35) + (Defesa x 0.25)

- Escala: 0-100 para cada atributo
- Pesos padrao: F=40%%, H=35%%, D=25%% (configuraveis no sorteio)

### Algoritmo de Sorteio
1. Calcula SortValue = Overall + (random x RandomFactor/10)
2. Agrupa por posicao: Atacantes, Zagueiros, Versateis
3. Distribui em snake-draft: jogador vai pro time com menos jogadores, ou menor soma

### Posicoes
- ATA = Atacante
- ZAG = Zagueiro
- ATA+ZAG = Versatil (joga em qualquer posicao)

### Votacao (planejado, nao 100%% implementado)
- Cada jogador vota em todos a cada rodada
- A nota final sera media ponderada dos ultimos 10 jogos
- Jogos mais recentes tem peso maior

---

## Sistema de Temas

Dois temas controlados por CSS variables em globals.css:

| Tema | Ativacao | Paleta |
|------|----------|--------|
| Dark (padrao) | :root | Verde cyber (green-950, emerald, lime neon) |
| Light | data-theme=light | Azul/Branco/Amarelo (Esportes da Sorte) |

---

## Conexao com Backend

O frontend chama http://localhost:4000 via src/services/api.ts:

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| /players | GET | Lista todos os jogadores |
| /login | POST | Autentica jogador (playerId + pin) |
| /votes | POST | Envia votos de uma rodada |

**IMPORTANTE:** O backend NAO esta neste repositorio. Se o backend estiver fora do ar, o app usa MOCK_PLAYERS como fallback silencioso.

### Banco de Dados
- MongoDB Atlas: perronhas-rebirth2 (cluster: cluster0.n1m9q.mongodb.net)
- Collection: players
- Seed: npm run seed (usa scripts/seed.ts)
- Variavel de ambiente: MONGO_URI no .env

---

## Comandos e Pipeline de Qualidade

| Comando | O que faz |
|---------|-----------|
| npm run dev | Servidor de desenvolvimento (porta 3000) |
| npm run build | Build de producao |
| npm run lint | Linting (ESLint) |
| npm run seed | Popula o MongoDB com jogadores |
| npm test | Roda testes unitarios com Vitest |
| npm run handoff | Gera docs/HANDOFF.md para handoff de sessao |
| node scripts/project-check.mjs --full | Varredura de tipos, lint, credenciais/segredos e vulnerabilidades |
| node scripts/project-check.mjs --sync | Sincroniza o mapa automatico de arquivos no AGENTS.md |

---

## O que NAO esta configurado

- CI/CD em nuvem (sem GitHub Actions configurado ainda)
- Deploy automatico (Vercel/Render)

---

## Convencoes do Codigo

1. Todos os componentes sao Client Components (use client)
2. Tipos estao em src/data/mocks.ts (Player, PlayerAttributes, Position)
3. Atributos normalizam para escala 0-100 (tens scale) no TeamDrawer
4. Erros de API sao surfados na UI como banner vermelho
5. Sem estado global - cada pagina gerencia seu proprio state com useState
6. Sem biblioteca de estado (Zustand mencionado na spec mas nao usado)

---

## Referencia de Arquivos de Dados

| Arquivo | Conteudo |
|---------|----------|
| docs/notas-jogadores-2.txt | Lista atualizada de jogadores com notas (Nome, F, H, D, Posicao) |
| docs/notas-jogadores.json | Dados de jogadores em JSON |
| docs/notas-planilha.txt | Notas vindas de planilha (escala 0-100) |
| docs/notas-jogadores.txt | Versao anterior das notas (escala 0-10) |
| src/data/mocks.ts | Mock data usado no front quando backend esta offline |

---

## Backlog e Proximas Features

Ver docs/BACKLOG.md para o backlog priorizado completo.
