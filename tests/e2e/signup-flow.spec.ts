import { test, expect } from "@playwright/test";

/**
 * Teste E2E: fluxo completo de cadastro (signup).
 *
 * Simula um usuário real abrindo o navegador, preenchendo o
 * formulário de cadastro na tela "/signup" e verificando que, após o
 * envio, ele é redirecionado para a página inicial e passa a ser
 * reconhecido como autenticado pela interface.
 *
 * Pré-requisitos: a API precisa estar rodando em http://localhost:8080
 * e o frontend em http://localhost:3000 (ver README.md desta pasta).
 */

function gerarEmailUnico(): string {
  return `e2e.signup.${Date.now()}@teste.com`;
}

test.describe("Fluxo de cadastro de usuário", () => {
  test("usuário consegue se cadastrar com dados válidos e é redirecionado para a página inicial autenticado", async ({
    page,
  }) => {
    const email = gerarEmailUnico();
    const senha = "Abcde123@";

    await page.goto("/signup");

    // Confirma que estamos na tela certa
    await expect(page.getByRole("heading", { name: "Criar Conta" })).toBeVisible();

    // Preenche o e-mail (único campo do tipo email na tela)
    await page.locator('input[type="email"]').fill(email);

    // Preenche senha e confirmação de senha (primeiro e segundo
    // campos do tipo password, respectivamente, na ordem do form)
    const camposSenha = page.locator('input[type="password"]');
    await camposSenha.nth(0).fill(senha);
    await camposSenha.nth(1).fill(senha);

    // Clica no botão de envio do formulário (type="submit"), e não no
    // botão "Criar Conta" do cabeçalho, que tem o mesmo texto
    await page.locator('button[type="submit"]').click();

    // Após o cadastro, o usuário deve ser redirecionado para "/"
    await expect(page).toHaveURL("/");

    // E o cabeçalho deve refletir que o usuário está autenticado,
    // mostrando as opções "Posts Curtidos" e "Sair" (que só aparecem
    // quando há um usuário autenticado)
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Posts Curtidos" })
    ).toBeVisible();
  });

  test("usuário recebe mensagem de erro ao tentar se cadastrar com e-mail já existente", async ({
    page,
    request,
  }) => {
    const email = gerarEmailUnico();
    const senha = "Abcde123@";

    // Garante que o e-mail já existe, cadastrando-o direto via API
    // antes do teste de UI (mais rápido e confiável do que repetir o
    // fluxo de cadastro duas vezes pela tela)
    const signup = await request.post("http://localhost:8080/auth/signup", {
      data: { email, password: senha },
    });
    expect(signup.status()).toBe(200);

    await page.goto("/signup");

    await page.locator('input[type="email"]').fill(email);
    const camposSenha = page.locator('input[type="password"]');
    await camposSenha.nth(0).fill(senha);
    await camposSenha.nth(1).fill(senha);

    await page.locator('button[type="submit"]').click();

    // O usuário deve permanecer na tela de cadastro, vendo a mensagem
    // de erro vinda da API
    await expect(page).toHaveURL("/signup");
    await expect(page.getByText("E-mail já está em uso")).toBeVisible();
  });
});
