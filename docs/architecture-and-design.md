# Arquitetura e Padrões de Design — Perronhas Rebirth

> Documento técnico que detalha a arquitetura do sistema, os padrões de design adotados e as fronteiras entre camadas, servindo de guia para desenvolvedores e agentes de IA (Claude Code e Gemini).

---

## 1. Visão Geral da Arquitetura Hexagonal (Ports & Adapters)

O sistema adota os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **Arquitetura Hexagonal** no backend (`src/core/` e `src/app/api/`).

### A Regra Fundamental de Dependência
As dependências de código-fonte apontam estritamente **de fora para dentro**:
- **Domínio (`core/domain`)**: O coração da aplicação. Não importa nada de Next.js, MongoDB, React ou bibliotecas externas.
- **Aplicação (`core/use-cases` e `core/ports`)**: Orquestra os fluxos de negócio. Conhece apenas o Domínio.
- **Infraestrutura (`core/infrastructure`)**: Implementa as interfaces (Ports) usando MongoDB.
- **Apresentação / Adaptadores de Entrada (`src/app/api/` e `src/app/`)**: Rotas HTTP do Next.js e UI React.

```mermaid
flowchart TB
    subgraph DrivingAdapters["Adaptadores Primários / Entrada (HTTP / Next.js API)"]
        API_Vote["src/app/api/vote/route.ts"]
        API_Rounds["src/app/api/admin/rounds/route.ts"]
        API_Players["src/app/api/players/route.ts"]
    end

    subgraph ApplicationLayer["Aplicação (Use Cases & Ports)"]
        direction TB
        UC_SubmitVote["SubmitVoteUseCase"]
        UC_CreateRound["CreateRoundUseCase"]
        UC_GetSettings["GetSettingsUseCase"]
        
        subgraph Ports["Ports (Interfaces de Saída)"]
            Port_Round["IRoundRepository"]
            Port_Vote["IVoteRepository"]
            Port_Player["IPlayerRepository"]
            Port_Settings["ISettingsRepository"]
        end
    end

    subgraph DomainLayer["Domínio Puro (Entidades, Value Objects, Erros)"]
        Entity_Player["Player (Entidade)"]
        VO_Rating["Rating & Regras de Nota"]
        VO_VoteAvg["VoteAverages (Cálculo puro)"]
        Errors["DomainError & Classes Tipadas"]
    end

    subgraph DrivenAdapters["Adaptadores Secundários / Infraestrutura (MongoDB)"]
        Mongo_Round["MongoRoundRepository"]
        Mongo_Vote["MongoVoteRepository"]
        Mongo_Player["MongoPlayerRepository"]
        Mongo_Settings["MongoSettingsRepository"]
        MongoDB[("MongoDB Database")]
    end

    %% Relações de Chamada e Implementação
    DrivingAdapters -->|chama| ApplicationLayer
    UC_SubmitVote -->|usa regras de| DomainLayer
    UC_SubmitVote -->|depende do port| Ports
    UC_CreateRound -->|depende do port| Ports
    
    DrivenAdapters -.->|implementa port| Ports
    Mongo_Round --> MongoDB
    Mongo_Vote --> MongoDB
    Mongo_Player --> MongoDB
    Mongo_Settings --> MongoDB

    style DomainLayer fill:#10b981,stroke:#059669,color:#ffffff
    style ApplicationLayer fill:#3b82f6,stroke:#2563eb,color:#ffffff
    style DrivingAdapters fill:#f59e0b,stroke:#d97706,color:#ffffff
    style DrivenAdapters fill:#6366f1,stroke:#4f46e5,color:#ffffff
```

---

## 2. Padrões de Design Aplicados (Design Patterns)

### 2.1. Inversão de Dependência (Dependency Inversion Principle - DIP)
Em vez de os casos de uso instanciarem conexões de banco de dados diretamente, eles declaram o que precisam através de **Interfaces (Ports)**:

```typescript
// src/core/use-cases/SubmitVoteUseCase.ts
export class SubmitVoteUseCase {
  constructor(
    private roundRepo: IRoundRepository,   // Port
    private voteRepo: IVoteRepository,     // Port
    private playerRepo: IPlayerRepository  // Port
  ) {}
  
  async execute(data: SubmitVoteDTO): Promise<void> {
    // Orquestração sem saber que o banco é MongoDB
  }
}
```

### 2.2. Repository Pattern (Port / Adapter)
Separa a lógica de acesso a dados da lógica de negócios.
- **Port:** `src/core/ports/IPlayerRepository.ts`
- **Adapter Concreto:** `src/core/infrastructure/MongoPlayerRepository.ts`

### 2.3. Typed Domain Errors (Tratamento Limpo de Exceções)
Erros de negócio herdam de `DomainError`. As rotas HTTP mapeiam o status através do operador `instanceof`, eliminando o antipadrão de verificar texto de mensagem (`error.message.includes(...)`):

```mermaid
classDiagram
    class Error {
        +message: string
        +stack: string
    }
    class DomainError {
        <<abstract>>
    }
    class InvalidNoteError {
        +constructor()
    }
    class VoteRejectedError {
        +constructor()
    }
    class VotingNotAllowedError {
        +constructor()
    }

    Error <|-- DomainError
    DomainError <|-- InvalidNoteError : "HTTP 400"
    DomainError <|-- VoteRejectedError : "HTTP 409"
    DomainError <|-- VotingNotAllowedError : "HTTP 403"
```

### 2.4. Pure Domain Services / Functions
Lógicas matemáticas e de cálculo estatístico (como a média ponderada e arredondamento das notas dos votos) são funções puras em `src/core/domain/VoteAverages.ts`. Elas não realizam I/O, são imutáveis e possuem cobertura de testes de 100%.

---

## 3. Diagrama de Sequência de um Fluxo Típico (Votação)

O diagrama abaixo ilustra como uma requisição HTTP viaja pelas camadas sem violar os limites arquiteturais:

```mermaid
sequenceDiagram
    autonumber
    actor User as Votante (Navegador)
    participant Route as Next.js API (/api/vote)
    participant Auth as NextAuth (Session)
    participant UseCase as SubmitVoteUseCase
    participant Domain as Domain (Player / Rating)
    participant MongoPlayer as MongoPlayerRepository
    participant MongoRound as MongoRoundRepository
    participant MongoVote as MongoVoteRepository
    participant DB as MongoDB

    User->>Route: POST /api/vote (roundId, ratings)
    Route->>Auth: auth()
    Auth-->>Route: session (email, name)
    Route->>Route: submitVoteSchema.safeParse(body)
    
    Route->>UseCase: execute({ roundId, email, ratings })
    
    %% Validação de Jogador Diarista
    UseCase->>MongoPlayer: findByEmail(email)
    MongoPlayer->>DB: findOne({ googleEmail: email })
    DB-->>MongoPlayer: PlayerDoc
    MongoPlayer-->>UseCase: Player
    UseCase->>Domain: canVoteInRounds(player)
    alt Jogador é Diarista
        Domain-->>UseCase: false
        UseCase-->>Route: throw VotingNotAllowedError()
        Route-->>User: HTTP 403 ("Diaristas não têm permissão...")
    end

    %% Validação de Notas
    UseCase->>Domain: hasValidNotes(ratings)
    alt Nota inválida (fora de múltiplos de 10)
        Domain-->>UseCase: false
        UseCase-->>Route: throw InvalidNoteError()
        Route-->>User: HTTP 400 ("Notas devem ser múltiplos de 10...")
    end

    %% Voto Atômico
    UseCase->>MongoRound: addVoter(roundId, email, name)
    MongoRound->>DB: updateOne({ _id, status: 'open', votedEmails: { $ne: email } })
    DB-->>MongoRound: matchedCount
    alt Já votou ou rodada fechada
        MongoRound-->>UseCase: false
        UseCase-->>Route: throw VoteRejectedError()
        Route-->>User: HTTP 409 ("Você já votou...")
    end

    %% Gravação anônima do voto
    UseCase->>MongoVote: create({ roundId, ratings })
    MongoVote->>DB: insertOne(vote)
    DB-->>MongoVote: insertedId
    MongoVote-->>UseCase: ok
    UseCase-->>Route: void (sucesso)
    Route-->>User: HTTP 200 { success: true }
```

---

## 4. Padrões de Design no Frontend (React / Client Layer)

Para os componentes de UI de alta complexidade (como o sorteador `TeamDrawer.tsx`), a arquitetura adota:

1. **Custom Hooks para Lógica de Estado (Separation of Concerns):**
   - Isolação de drag-and-drop (`useTeamDragAndDrop`).
   - Isolação de cálculo de equilíbrio e médias de times (`useTeamBalance`).
2. **Compound Components & Decomposição:**
   - Em vez de um único arquivo de 1.100 linhas, a UI se divide em componentes com responsabilidade única:
     - `PlayerPool`: seleção e filtragem de jogadores.
     - `TeamCard`: visualização de um time, suas notas e lista de atletas.
     - `BalanceBar`: exibição comparativa do equilíbrio dos times.
     - `WhatsAppExportDialog`: diálogo e formatação da mensagem para o WhatsApp.
3. **Data Theme Provider via CSS Variables:**
   - Alternância de temas claro/escuro via atributo `data-theme` no HTML root, consumindo tokens em `globals.css`.

---

## 5. Mapeamento das 3 Skills no Repositório

```text
sorteador-times-app/
├── .agents/skills/
│   ├── clean-ddd-hexagonal/  ---> Regras do backend (core, domain, ports, use-cases)
│   ├── clean-code/           ---> Regras de legibilidade, SRP, nomes e testes em todo o repo
│   └── refactoring-patterns/ ---> Técnicas de divisão de arquivos grandes e redução de complexidade
```
