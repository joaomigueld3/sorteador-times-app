# Prompt de Bootstrap: Garantia de Qualidade, Arquitetura e Segurança para Novos Projetos

> **Instrução de uso:** Copie e cole este prompt para o assistente de IA logo ao inicializar ou assumir um novo projeto/repositório.

---

```markdown
Você está inicializando ou assumindo o setup de engenharia deste projeto. Antes de criar código de regras de negócio, seu objetivo é configurar o sistema de garantia de qualidade, esteira de verificação local e alinhamento arquitetural.

### Etapa 1: Entrevista Técnica Obrigatória
Antes de gerar arquivos de configuração ou arquitetar o projeto, você DEVE me fazer perguntas objetivas sobre as seguintes 4 áreas fundamentais:

1. **Arquitetura & Estrutura de Pastas:**
   - Qual padrão arquitetural devemos seguir? (Ex: Clean/Hexagonal Architecture, Vertical Slices, MVC clássico, Monorepo vs Modular).
   - Onde residirão entidades de domínio, regras de negócio puras e adaptadores de banco/serviços externos?

2. **Design Patterns & Convenções de Código:**
   - Quais padrões serão prioritários? (Ex: Repository Pattern, Use Cases/Services, Factory, Dependency Injection).
   - Quais são as convenções de tipagem e validação de schema em tempo de execução? (Ex: Zod, Valibot, decorators).

3. **Estratégia de Testes (Tests+):**
   - Qual runner e framework de asserção será usado? (Ex: Vitest, Jest, Playwright para E2E).
   - Qual a meta de cobertura e pirâmide de testes recomendada? (Unitários em casos de uso, integração em endpoints/banco, etc.).

4. **Linting, Formatação & Git Hooks:**
   - Quais linters e regras estritas serão aplicadas? (Ex: ESLint com regras TypeScript rigorosas, Biome, Prettier).
   - Como os Git Hooks serão acionados? (Ex: Husky, simple-git-hooks, hooks nativos via core.hooksPath).

---

### Etapa 2: Implementação dos Guard-Rails de Qualidade e Segurança
Após minhas respostas na Etapa 1, você deve implementar os seguintes artefatos:

1. **Script de Verificação Completa (`scripts/project-check.mjs` ou equivalente):**
   - **Tipos & Build:** Executar verificação de tipos (`tsc --noEmit` ou equivalente do ecossistema).
   - **Linting:** Validar linter do projeto sem permitir erros passarem batidos.
   - **Vazamento de Segredos (Conteúdo e Nomes):**
     - Impedir rastreamento de `.env`, `.pem`, `.key`, `.secret` no Git.
     - Varredura de regex por credenciais hardcoded no código (URIs de banco com usuário/senha, tokens JWT, chaves de API, secrets de OAuth, AWS keys).
   - **Auditoria de Dependências:** Rodar `npm audit` (ou pnpm/yarn audit) e alertar severidades críticas/altas.
   - **Padrões Perigosos (XSS/Injeção):** Flaggear `eval`, `dangerouslySetInnerHTML`, `document.write` ou injeções de string crua em queries/regex.
   - **Documentação Viva:** Sincronizar automaticamente um mapa de arquivos e scripts em um arquivo de contexto (`AGENTS.md`).

2. **Skill / Guia Operacional (`.agents/skills/dev-check/SKILL.md`):**
   - Documentar como rodar a verificação manual e automática.
   - Instruir a IA a nunca finalizar uma sessão sem rodar o check e corrigir eventuais regressões.

3. **Git Pre-commit Hook (`.githooks/pre-commit`):**
   - Bloquear commits caso a sincronização de contexto ou os testes rápidos/segredos falhem.

Aguarde minhas respostas antes de prosseguir com qualquer código.
```
