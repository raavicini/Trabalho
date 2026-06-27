import { test, expect } from "@playwright/test";

/**
 * Teste E2E: fluxo de curtir um post, com e sem autenticação.
 *
 * Simula um usuário real navegando até a página inicial (feed de
 * posts) e tentando curtir um post — primeiro sem estar logado
 * (deve ser bloqueado com um alerta), e depois logado de fato
 * (a curtida deve ser efetivada na tela).
 *
 * Pré-requisitos:
 *  - API rodando em http://localhost:8080
 *  - Frontend rodando em http://localhost:3000
 *  - Acesso à internet (a API consulta posts em https://dummyjson.com)
 */

function gerarEmailUnico(): string {
  return `e2e.like.${Date.now()}@teste.com`;
}

test.describe("Fluxo de curtir posts (com e sem autenticação)", () => {
  test("usuário não autenticado vê um alerta ao tentar curtir um post e a curtida não é efetivada", async ({
    page,
  }) => {
    await page.goto("/");

    // Espera o feed carregar e o primeiro post aparecer na tela
    const primeiroPost = page.getByRole("listitem").first();
    await expect(primeiroPost).toBeVisible();

    // Feature de likes/dislikes: o post deve exibir o número de
    // curtidas e descurtidas vindos da API
    const reacoes = primeiroPost.getByTestId("post-reactions");
    await expect(reacoes).toBeVisible();
    await expect(reacoes).toContainText("curtidas");
    await expect(reacoes).toContainText("descurtidas");

    // Captura o diálogo nativo do navegador (window.alert) disparado
    // pelo clique, e confirma a mensagem exibida
    const dialogPromise = page.waitForEvent("dialog");

    await primeiroPost.getByRole("button", { name: /curtir/i }).click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toBe(
      "Você precisa estar autenticado para curtir posts!"
    );
    await dialog.accept();

    // O botão deve continuar mostrando "Curtir" (não "Curtido"),
    // confirmando que a curtida não foi efetivada
    await expect(
      primeiroPost.getByRole("button", { name: /curtir/i })
    ).toBeVisible();
  });

  test("usuário autenticado consegue curtir um post e ver o botão mudar para 'Curtido'", async ({
    page,
  }) => {
    const email = gerarEmailUnico();
    const senha = "Abcde123@";

    // Cadastra e já fica autenticado na sessão do navegador (o fluxo
    // de cadastro loga automaticamente o usuário, ver AuthContext)
    await page.goto("/signup");
    await page.locator('input[type="email"]').fill(email);
    const camposSenha = page.locator('input[type="password"]');
    await camposSenha.nth(0).fill(senha);
    await camposSenha.nth(1).fill(senha);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

    const primeiroPost = page.getByRole("listitem").first();
    await expect(primeiroPost).toBeVisible();

    const botaoCurtir = primeiroPost.getByRole("button", { name: /curtir/i });
    await botaoCurtir.click();

    // Atualização otimista: o botão deve mudar para "Curtido"
    await expect(
      primeiroPost.getByRole("button", { name: /curtido/i })
    ).toBeVisible();
  });
});
