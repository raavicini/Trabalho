# Testes E2E e de API — SQA Social Media (Playwright)

Este projeto contém os testes End-to-End (E2E) e de API (caixa-preta)
do sistema **SQA Social Media**, usando [Playwright](https://playwright.dev/).

Diferente dos testes da Atividade 4 (que ficam dentro de `/api` e
`/client` e testam o código por dentro — caixa-branca), os testes
aqui rodam contra o **sistema em execução**: o frontend Next.js de
verdade no navegador, e a API Spring Boot de verdade via HTTP.

## Estrutura

```
tests/
├── e2e/                          # Testes End-to-End (usam navegador)
│   ├── signup-flow.spec.ts       # Fluxo completo de cadastro
│   └── like-post-flow.spec.ts    # Fluxo de curtir post (com/sem login)
├── api/                          # Testes de API (caixa-preta, sem navegador)
│   ├── auth-signup.spec.ts       # POST /auth/signup
│   ├── auth-signin.spec.ts       # POST /auth/signin
│   └── posts-liked.spec.ts       # GET /posts/liked
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Pré-requisitos

Antes de rodar os testes, a aplicação completa precisa estar **rodando
localmente** (os testes não sobem a aplicação automaticamente):

**1. Subir a API (Spring Boot)** — em um terminal:
```bash
cd ../api
./mvnw spring-boot:run
```
A API precisa estar disponível em `http://localhost:8080`.

**2. Subir o frontend (Next.js)** — em outro terminal:
```bash
cd ../client
npm install
npm run dev
```
O frontend precisa estar disponível em `http://localhost:3000`.

> Os testes de E2E e alguns testes de API que envolvem posts dependem
> de acesso à internet, pois a API consulta a API pública
> [DummyJSON](https://dummyjson.com) para buscar os posts.

## Instalação do projeto de testes

Dentro da pasta `/tests` (esta pasta):

```bash
npm install
npx playwright install
```

O comando `npx playwright install` baixa os navegadores usados pelo
Playwright (Chromium, Firefox, WebKit) — só precisa ser executado uma
vez.

## Como rodar os testes

Com a API e o frontend já rodando (ver pré-requisitos acima):

```bash
# Roda todos os testes (E2E + API)
npx playwright test

# Roda apenas os testes E2E
npm run test:e2e

# Roda apenas os testes de API
npm run test:api

# Roda com o navegador visível (útil para depurar)
npm run test:headed

# Abre a interface visual do Playwright (recomendado para quem está
# começando — mostra os testes passo a passo)
npm run test:ui
```

Depois de rodar, é possível ver o relatório HTML com os resultados:

```bash
npm run report
```

## Testes implementados

### E2E (`/tests/e2e`)

| Arquivo | Testes |
|---|---|
| `signup-flow.spec.ts` | Cadastro com sucesso (redireciona e autentica); cadastro com e-mail duplicado (mostra erro) |
| `like-post-flow.spec.ts` | Curtir post sem estar autenticado (bloqueado com alerta); curtir post autenticado (efetivado na tela) |

**Total: 4 testes E2E** (mínimo exigido: 2).

### API — caixa-preta (`/tests/api`)

| Arquivo | Testes |
|---|---|
| `auth-signup.spec.ts` | Cadastro com sucesso (200); e-mail duplicado (409); senha inválida (422) |
| `auth-signin.spec.ts` | Login com sucesso (200); senha incorreta (401); e-mail não cadastrado (401) |
| `posts-liked.spec.ts` | Sem `userId` (400); usuário sem curtidas (200 com lista vazia) |

**Total: 8 testes de API** (mínimo exigido: 4).

## Observações sobre o projeto

- O projeto foi configurado do zero seguindo a documentação oficial do
  Playwright (`npm init playwright@latest`), sem reaproveitar o
  projeto de exemplo mostrado em aula.
- Cada teste gera seus próprios dados (e-mails únicos baseados em
  timestamp) para poder ser executado repetidas vezes sem conflitar
  com execuções anteriores.
- Os seletores dos testes E2E usam papéis de acessibilidade (`role`)
  e tipos de campo (`input[type="email"]`, `input[type="password"]`)
  em vez de classes CSS, já que a interface não usa `data-testid` nem
  associa `label`/`input` via `htmlFor`.
