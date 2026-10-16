---
name: dev-check
description: Verificação completa do projeto (tipos, lint, vulnerabilidades, código sensível) e sincronização do AGENTS.md
---

## 1. Checagem automática

Rode `node scripts/project-check.mjs --full` (ou `npm run check` se tiver configurado). 
Ele executa:
- `tsc --noEmit` para verificar tipos
- `npm run lint` para verificação estática
- `npm audit` para checar vulnerabilidades
- Checagem do `.gitignore` e arquivos sensíveis versionados
- Varredura de padrões de XSS/injeção perigosos (ex: `dangerouslySetInnerHTML`) em `src/`
- Detecção de arquivos possivelmente não usados e regeneração do bloco AUTO do `AGENTS.md`.

## 2. Análise manual necessária

O script automatiza grande parte, mas você ainda deve observar:
- Uso de tags <a> com `target="_blank"` sem `rel="noopener noreferrer"`.
- Interpolação insegura de input de usuário ou dados brutos em telas.
- Lógica de autenticação e rotas protegidas em `/admin`.

## 3. AGENTS.md

Compare as seções narrativas do `AGENTS.md` (Arquitetura, Componentes, Fluxos) com o código atual. Se houver divergências estruturais (novas rotas, novos arquivos importantes em `src/app`), atualize a documentação. Remova dívidas já pagas e anote as novas. **Não edite o bloco `AUTO:START`** manualmente.

## 4. Finalização

Se o projeto apresentar falhas durante a sua execução, não termine o trabalho sem corrigir (o hook de `Stop` deve inclusive bloquear o término automático se o lint/tsc falharem em arquivos modificados). Sugira o nome para o commit com base no padrão _Conventional Commits_.
