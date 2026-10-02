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

## Documentacao

- **CONTEXT.md** - Visao completa do projeto (leia primeiro)
- **AGENTS.md** - Mapa do codigo para agentes IA
- **docs/BACKLOG.md** - Backlog priorizado de features
- **docs/spec-sorter.md** - Especificacao tecnica do sorteador

## Licenca

MIT
