# Análise de Infraestrutura: Comparativo com Arquitetura "Futebol Total" (AWS Serverless)

> Análise comparativa entre o modelo de infraestrutura do *Futebol Total* (jogo online/fantasy na AWS) e as necessidades do **Perronhas Rebirth / Sorteador de Times de Pelada** (Next.js 16, App Router, MongoDB, Votação e Sorteio).

---

## 1. Contexto do Benchmark

A arquitetura de referência analisada (*Futebol Total*) opera 100% serverless na AWS (São Paulo) para suportar um jogo mobile com partidas simuladas continuamente e ~880 mil itens:
- **Borda:** CloudFront + WAF
- **Entrada:** API Gateway
- **Autenticação:** AWS Cognito (Google / E-mail)
- **Servidor:** AWS Lambda (elenco, loja, ranqueada)
- **Agendador:** EventBridge → Lambda (a cada 1 minuto)
- **Banco de Dados:** DynamoDB (Single-Table Design, ~2,2 GB)
- **Pagamentos:** Mercado Pago (Pix) + Google Play Billing
- **E-mail:** AWS SES
- **Segredos:** AWS SSM / Secrets Manager
- **CI/CD:** GitHub → AWS CodeBuild

---

## 2. O que FAZ TOTAL SENTIDO Adotar (ou Adaptar)

* **Modelo Serverless (Pay-per-use / Zero custo parado):**
  * **Motivo:** Aplicações de pelada têm tráfego em picos (quinta/sexta confirmando presença e sorteando times; fim de semana votando nas notas pós-jogo). No restante da semana, o tráfego é residual. Pagar exclusivamente pelo tempo de execução evita contas de servidores fixos 24/7.
* **Mercado Pago (Pix via Webhooks):**
  * **Motivo:** Encaixe perfeito para automatizar o pagamento da mensalidade/diária da pelada. O Mercado Pago notifica a API assim que o Pix é liquidado, permitindo atualização imediata do status sem conferência manual.
* **Armazenamento de Imagens em Storage + CDN (S3 / R2 + CloudFront / Cloudflare):**
  * **Motivo:** Para as **cartinhas do FIFA** (com até 3 versões de fotos por jogador), o upload direto para bucket de objetos com CDN na frente mantém o banco de dados leve e o carregamento das imagens instantâneo.
* **Gerenciamento de Segredos (Secrets Manager / Variáveis de Ambiente da Plataforma):**
  * **Motivo:** Indispensável para armazenar com segurança chaves do MongoDB Atlas, tokens do Mercado Pago, segredos do NextAuth e API keys de IA (Gemini).

---

## 3. O que FAZ SENTIDO, mas com Alternativas Melhores

| Recurso no Benchmark | Recomendação para o Perronhas | Motivo da Simplificação |
| :--- | :--- | :--- |
| **CloudFront + AWS WAF** | **Cloudflare (Free) ou CDN Vercel Edge** | O AWS WAF cobra taxa base mensal (~US$ 5/mês + regras). Cloudflare Free ou a CDN da Vercel entregam proteção contra DDoS, SSL e cache de borda com custo zero. |
| **API Gateway + Lambdas desacoplados** | **Next.js App Router (Fullstack Serverless)** | O Futebol Total mantém front estático (S3) e backend separado em dezenas de Lambdas. No Next.js, o front e os endpoints (`/api/...`) já sobem como Serverless Functions integradas, eliminando a manutenção manual de rotas e permissões no API Gateway. |
| **AWS Cognito** | **NextAuth (já integrado) ou Supabase Auth / Clerk** | O Cognito possui alta complexidade de configuração e customização visual. Com Next.js, o **NextAuth** com provedor Google resolve o login social de forma nativa e com menos atrito. |
| **AWS SES (E-mail)** | **Cópia / Webhooks para WhatsApp** | No contexto de futebol amador no Brasil, o canal prioritário é o WhatsApp. Links de votação, times sorteados e cobranças têm maior conversão via WhatsApp do que por e-mail transacional. |

---

## 4. O que NÃO FAZ SENTIDO (Overkill / Contraproducente)

* ❌ **DynamoDB com Single-Table Design:**
  * O Futebol Total usa DynamoDB para consultas simples de chave-valor em altíssima concorrência.
  * No Perronhas, a regra de negócio exige agregações estatísticas, médias ponderadas dos últimos 10 jogos por atributo (físico, habilidade, defesa) e relatórios históricos. NoSQL chave-valor rígido tornaria essas operações custosas e difíceis de modelar.
  * **Decisão:** Manter a modelagem já existente em **MongoDB** (`MongoRoundRepository`, `MongoPlayerRepository`, `MongoVoteRepository`) ou banco relacional (PostgreSQL).
* ❌ **EventBridge disparando Lambda a cada 1 minuto:**
  * Necessário apenas para simulação contínua e matchmaking de jogos. O app de pelada é conduzido por ações humanas (admin abre rodada, participantes votam, sorteio é acionado). Um cron minuto a minuto geraria invocações desnecessárias.
* ❌ **Google Play Billing:**
  * Exige taxas de 15% a 30% da Google Store e publicação de app nativo. O foco é Web/PWA no Brasil via Pix direto.

---

## 5. Arquitetura Alvo Recomendada (Pragmática & Custo Zero Inicial)

```
[ Usuários (PWA / Mobile / Web) ]
               │
               ▼
[ Borda: Vercel / Cloudflare ] ──── (SSL, CDN de assets, Proteção DDoS)
               │
               ▼
[ Next.js 16 (Serverless / Edge) ]
   ├── Frontend: App Router + Tailwind (Cartinhas, Drag & Drop, Votação)
   └── Backend:  /api/ (Auth, Sorteio, Votos, Webhook Pix, Leitura IA de lista)
         │              │                      │
         ▼              ▼                      ▼
[ MongoDB Atlas ]  [ Cloudflare R2 / S3 ]  [ Mercado Pago API ]
(Notas, Rodadas,   (Fotos das cartinhas    (Cobrança Pix &
 Jogadores)         sem custo de egress)    Webhooks)
```

### Vantagens Desta Abordagem:
1. **Custo zero inicial:** Totalmente viável dentro das camadas gratuitas (Vercel + MongoDB Atlas M0 + Cloudflare R2/S3).
2. **Nenhuma máquina para manter:** Mantém a premissa serverless original sem necessidade de gerenciar servidores EC2 ou containers contínuos.
3. **Aderência ao código atual:** Preserva a arquitetura hexagonal já implementada em `src/core` sem necessidade de reescrever repositórios.

