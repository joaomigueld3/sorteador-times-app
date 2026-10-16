---
name: gitflow
description: Padrão oficial de branching, commits semânticos, ciclo de desenvolvimento e abertura de Pull Requests (Squash and Merge) para o projeto Perronhas Rebirth. Use ao criar novas branches, commitar alterações, preparar PRs, sincronizar com develop2 ou resolver conflitos de merge.
---

# GitFlow — Perronhas Rebirth

Padrão de governança de branches, versionamento e ciclo de vida de código adotado no projeto Perronhas Rebirth para manter o histórico limpo, rastreável e protegido contra regressões.

---

## 1. Modelo de Branches

```
master (Produção estável / Releases vX.Y.Z)
  ▲
  │ (Release PR / Hotfix PR)
develop2 (Linha principal de desenvolvimento ativo)
  ▲                  ▲                  ▲
  │                  │                  │
feat/*             fix/*             refactor/*
```

| Branch | Origem | Destino (Merge) | Propósito | Convenção de Nomenclatura |
|---|---|---|---|---|
| **`master`** | — | — | Código estável em produção. Só recebe merge via PR com tag (`v1.0.0`). | `master` |
| **`develop2`** | `master` | `master` | Linha principal de desenvolvimento diário. Todas as branches de trabalho partem daqui e retornam para cá. | `develop2` |
| **`feat/*`** | `develop2` | `develop2` | Novas funcionalidades para o app. | `feat/nome-curto-da-feature` |
| **`fix/*`** | `develop2` | `develop2` | Correções de bugs identificados durante o desenvolvimento ou homologação. | `fix/descricao-do-bug` |
| **`refactor/*`** | `develop2` | `develop2` | Refatorações arquiteturais estruturais (Clean Architecture, DDD, desacoplamento). | `refactor/area-refatorada` |
| **`hotfix/*`** | `master` | `master` e `develop2` | Correções críticas emergenciais em produção. | `hotfix/vX.Y.Z-descricao` |
| **`release/*`** | `develop2` | `master` e `develop2` | Preparação de corte de versão para produção. | `release/vX.Y.Z` |

---

## 2. Padrão de Commits Semânticos (Conventional Commits)

Formato obrigatório:
```text
tipo(escopo): descrição curta e imperativa no presente
```

### Tipos Permitidos:
- **`feat`**: Nova funcionalidade para o usuário ou API.
- **`fix`**: Correção de bug.
- **`refactor`**: Mudança de código que não altera comportamento nem adiciona feature.
- **`test`**: Adição ou correção de testes unitários ou de integração.
- **`docs`**: Mudanças apenas na documentação (`README.md`, `AGENTS.md`, `docs/`).
- **`chore`**: Atualização de scripts, dependências, configs de build ou git.
- **`ci`**: Mudanças em arquivos de integração contínua (`.github/workflows/ci.yml`).
- **`perf`**: Alteração focada em desempenho.

### Exemplos Contextualizados no Projeto:
```text
feat(sorter): add balanced team distribution algorithm
feat(voting): implement rating pre-fill for fast voting
fix(auth): fix session expiration redirect
refactor(core): decouple player rating entity into domain
test(round): add unit tests for CreateRoundUseCase
docs(readme): update commands table and architecture map
ci: configure github actions workflow for push and PR
```

---

## 3. Estratégia de Merge: **Squash and Merge**

Todo Pull Request integrado na **`develop2`** ou **`master`** deve utilizar a estratégia **Squash and Merge** no GitHub:

1. **Por que Squash?**
   - Condensa commits intermediários (como `"fix typo"`, `"wip"`, `"adjust test"`) em **um único commit limpo e significativo** no histórico da branch principal.
   - Mantém o `git log` linear, facilitando `git bisect` e auditoria de releases.
2. **Formato do Commit de Squash no GitHub:**
   ```text
   tipo(escopo): título descritivo (#numero-da-pr)
   ```
   *Exemplo:* `feat(sorter): add balanced team distribution algorithm (#12)`

---

## 4. Ciclo de Vida de uma Tarefa (Passo a Passo)

### Passo 1: Atualizar a Base
Antes de criar qualquer branch, garanta que a sua `develop2` local está sincronizada com a remota:
```bash
git checkout develop2
git pull origin develop2
```
*(Ou use o alias configurado: `npm run git:pull`)*

### Passo 2: Criar a Branch de Trabalho
```bash
git checkout -b feat/minha-feature develop2
```

### Passo 3: Implementar e Testar Localmente
Desenvolva o código acompanhado de testes unitários:
```bash
# Rodar testes
npm test

# Validação completa de tipos, linter e segredos
npm run check
```

### Passo 4: Criar Commits Atômicos
Faça commits pequenos e autossuficientes com mensagens semânticas:
```bash
git add src/core/... src/app/...
git commit -m "feat(modulo): implementacao inicial da regra"
```

### Passo 5: Sincronizar com Upstream antes do PR
Se a `develop2` recebeu novos commits enquanto você trabalhava, rebaseie para manter histórico linear:
```bash
git fetch origin
git rebase origin/develop2
```
*Se houver conflitos, resolva-os com cuidado, rode `npm test` para certificar que tudo continua verde e prossiga com `git rebase --continue`.*

### Passo 6: Gerar Handoff de Sessão
Atualize o registro de contexto antes de encerrar o trabalho:
```bash
npm run handoff
git add docs/HANDOFF.md
git commit -m "docs: update session handoff"
```

### Passo 7: Enviar para o GitHub e Abrir o PR
```bash
git push -u origin feat/minha-feature
```
Abra o Pull Request no GitHub apontando:
- **Base:** `develop2`
- **Compare:** `feat/minha-feature`
- Aguarde o **GitHub Actions CI** rodar (todos os checks verdes ✅).
- Realize o merge selecionando **Squash and Merge**.

### Passo 8: Limpeza Pós-Merge
```bash
git checkout develop2
git pull origin develop2
git branch -d feat/minha-feature
```

---

## 5. Regras Inegociáveis de Segurança

1. **PROIBIDO Force Push em Branches Compartilhadas:**
   - NUNCA utilize `git push --force` ou `git push -f` em `master` ou `develop2`.
   - Em branches pessoais de feature após um rebase, utilize estritamente `git push --force-with-lease`.
2. **Segredos Nunca no Git:**
   - Credenciais de banco (`MONGO_URI`), senhas e segredos de autenticação (`NEXTAUTH_SECRET`) devem residir estritamente no `.env` local (ignorado pelo `.gitignore`).
3. **Não Faça Merge com CI Quebrado:**
   - Nenhum Pull Request deve ser aprovado ou integrado se os testes ou a auditoria da especificação (`npm run spec:audit`) estiverem falhando no GitHub Actions.
