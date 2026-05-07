# Especificacoes Tecnicas: Sorteador de Times Pro

## Objetivo
Migrar e melhorar a aplicacao atual (Vanilla JS + HTML + Tailwind) para uma stack moderna com React/Next.js.

## 1) Visao geral
O **Sorteador de Times Pro** e uma SPA para peladas/rachas que permite:
- cadastrar jogadores com atributos (Fisico, Habilidade, Defesa)
- definir pesos para os atributos
- aplicar aleatoriedade controlada
- gerar times balanceados
- ajustar manualmente via drag-and-drop
- exportar resultado para WhatsApp

## 2) Estrutura de dados principal (estado)

```ts
type Role = "atk" | "def";

interface PlayerAttributes {
  fisico: number;     // 0 a 10
  habilidade: number; // 0 a 10
  defesa: number;     // 0 a 10
}

interface Player {
  id: string; // UUID
  name: string;
  attributes: PlayerAttributes;
  roles: Role[]; // [], ["atk"], ["def"], ["atk", "def"]
}

interface Settings {
  weights: {
    fis: number; // ex: 40
    hab: number; // ex: 35
    def: number; // ex: 25
  };
  randomFactor: number; // 0 a 100
  drawMode: "teams" | "players";
  drawValue: number;
  theme: "light" | "dark";
}
```

Persistencia local: `localStorage`.

## 3) Logica de negocio

### 3.1 Nota geral (overall)
Nao e media simples; e media ponderada por pesos configuraveis.

```txt
Overall = (Fisico * PesoFis) + (Habilidade * PesoHab) + (Defesa * PesoDef)
```

Exemplo com pesos 40/35/25:

```txt
Overall = (8 * 0.40) + (9 * 0.35) + (7 * 0.25) = 8.1
```

### 3.2 Algoritmo de sorteio (balanceamento)
Abordagem gulosa com ruido para aleatoriedade:

1. Filtrar jogadores selecionados.
2. Validar volume minimo para modo escolhido.
3. Calcular `SortValue`:

```txt
SortValue = Overall + (Math.random() * (RandomFactor / 10))
```

4. Agrupar por funcao:
   - **Attackers**: `atk` sem `def`
   - **Defenders**: `def` sem `atk`
   - **Versatile**: restantes
5. Distribuir nessa ordem: Attackers -> Defenders -> Versatile.
6. Para cada jogador, alocar no time que mais precisa:
   - prioridade 1: menos jogadores
   - prioridade 2: menor soma de `SortValue`

## 4) Requisitos funcionais

### 4.1 Painel de controle
- pesos (Fis/Hab/Def), padrao `40/35/25`
- slider de aleatoriedade `0-100`, padrao `10`
- modo de sorteio (`Quantidade de Times` ou `Jogadores por Time`) com input dinamico
- cadastro individual (nome, F/H/D, ATA/ZAG)
- cadastro em lote:
  - curto: `Nome, Nota, ATA`
  - completo: `Nome, F, H, D, ZAG`

### 4.2 Lista de jogadores
- cards com nome, nota e atributos
- ordenacao por **alfabetica** ou **nota do jogador**
- selecionar individualmente
- `selecionar todos`
- remover jogador
- contador de jogadores

### 4.3 Sorteio
- botao `Gerar Times`
- validacoes de limite minimo e consistencia com modo de sorteio
- visualizacao dos times com media e jogadores

### 4.4 Pos-sorteio
- ajuste manual por drag-and-drop entre times
- atualizar medias em tempo real
- opcao de novo sorteio

### 4.5 Exportacao
- gerar texto pronto para WhatsApp no formato:

```txt
⚽ *SORTEIO DE TIMES PRO* ⚽

🔵 *TIME 1* (Media: 8.5)
▫️ NEYMAR [ATA] (9.0) [F:8 H:10 D:4]

🔴 *TIME 2* (Media: 8.4)
▫️ RAMOS [ZAG] (8.8) [F:9 H:7 D:10]

_Gerado via Sorteador Pro_
```

## 5) Requisitos nao funcionais (UX/UI)
- visual off-white (light) e slate escuro (dark)
- fonte minima 12px
- dark mode com alternancia nativa
- responsivo: painel adaptavel mobile/desktop
- scroll interno por painel (sem rolagem global excessiva)

## 6) Sugestoes de stack (referencia)
- Next.js (App Router)
- Zustand (estado + persistencia)
- Tailwind CSS + shadcn/ui
- dnd-kit ou @hello-pangea/dnd
