import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright para o projeto SQA Social Media.
 *
 * Este projeto de testes assume que a aplicação já está rodando
 * localmente antes de executar os testes:
 *
 *   - API (Spring Boot):     http://localhost:8080
 *   - Frontend (Next.js):    http://localhost:3000
 *
 * Veja o README.md desta pasta para instruções de como subir os dois
 * serviços antes de rodar `npx playwright test`.
 */
export default defineConfig({
  // Por padrão o Playwright já busca em ./tests, mas como definimos
  // testDir específico em cada projeto (e2e/ e api/), deixamos isto
  // como a raiz do repositório de testes.
  testDir: "./",

  // Roda os arquivos de teste em paralelo
  fullyParallel: true,

  // Falha o build se algum teste tiver `.only` deixado por engano
  forbidOnly: !!process.env.CI,

  // Tenta novamente os testes que falharem apenas em CI
  retries: process.env.CI ? 2 : 0,

  // Em CI, roda com apenas 1 worker; localmente usa o paralelismo padrão
  workers: process.env.CI ? 1 : undefined,

  // Relatório HTML, gerado em playwright-report/
  reporter: "html",

  use: {
    // URL base usada pelos testes E2E (frontend Next.js)
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    // Coleta trace apenas quando um teste falha na primeira tentativa
    trace: "on-first-retry",

    // Screenshot automático em caso de falha
    screenshot: "only-on-failure",
  },

  projects: [
    // --------------------------------------------------------------
    // Testes End-to-End (E2E): simulam um usuário real no navegador,
    // testando o frontend (Next.js) já integrado com a API.
    // --------------------------------------------------------------
    {
      name: "e2e",
      testDir: "./e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.BASE_URL || "http://localhost:3000",
      },
    },

    // --------------------------------------------------------------
    // Testes de API (caixa-preta): chamam os endpoints da API
    // (Spring Boot) diretamente via HTTP, sem usar navegador.
    // --------------------------------------------------------------
    {
      name: "api",
      testDir: "./api",
      use: {
        baseURL: process.env.API_BASE_URL || "http://localhost:8080",
      },
    },
  ],
});
