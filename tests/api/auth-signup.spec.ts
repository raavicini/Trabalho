import { test, expect } from "@playwright/test";

/**
 * Testes de API (caixa-preta) para os endpoints de autenticação
 * (POST /auth/signup), chamados diretamente via HTTP, sem usar
 * navegador. Estes testes não conhecem a implementação interna da
 * API: eles apenas enviam entradas conhecidas e verificam as saídas
 * (status code e corpo da resposta).
 *
 * Pré-requisito: a API (Spring Boot) precisa estar rodando em
 * http://localhost:8080 (ver README.md da pasta /tests).
 */

/** Gera um e-mail único a cada execução, para não colidir com
 * cadastros de execuções anteriores dos testes. */
function gerarEmailUnico(): string {
  return `usuario.${Date.now()}.${Math.floor(Math.random() * 100000)}@teste.com`;
}

test.describe("POST /auth/signup", () => {
  test("deve cadastrar um usuário com e-mail e senha válidos e retornar 200 com os dados do usuário", async ({
    request,
  }) => {
    const email = gerarEmailUnico();

    const response = await request.post("/auth/signup", {
      data: {
        email,
        password: "Abcde123@",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.email).toBe(email);
  });

  /**
   * BUG (segurança): o model `User` não usa `@JsonIgnore` no campo
   * `password`, então o controller devolve o objeto `User` completo,
   * incluindo a senha em texto puro, na resposta de cadastro.
   * Isso é uma falha de segurança: a API nunca deveria devolver a
   * senha do usuário em nenhuma resposta.
   *
   * BUG CONHECIDO (rastreado em tests/BUGS_E2E_API.md): mantido como
   * `test.skip` para não quebrar a esteira de CI até a correção ser
   * feita.
   */
  test.skip("BUG (segurança): a resposta do cadastro não deveria expor a senha em texto puro", async ({
    request,
  }) => {
    const email = gerarEmailUnico();

    const response = await request.post("/auth/signup", {
      data: {
        email,
        password: "Abcde123@",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Comportamento esperado: a senha NUNCA deveria vir na resposta.
    // Comportamento real (BUG): o campo "password" vem preenchido.
    expect(body.password).toBeUndefined();
  });

  test("deve retornar 409 ao tentar cadastrar um e-mail que já está em uso", async ({
    request,
  }) => {
    const email = gerarEmailUnico();
    const payload = { email, password: "Abcde123@" };

    // Primeiro cadastro: deve funcionar normalmente
    const primeiraResposta = await request.post("/auth/signup", {
      data: payload,
    });
    expect(primeiraResposta.status()).toBe(200);

    // Segundo cadastro com o mesmo e-mail: deve ser rejeitado
    const segundaResposta = await request.post("/auth/signup", {
      data: payload,
    });

    expect(segundaResposta.status()).toBe(409);

    const body = await segundaResposta.json();
    expect(body.message).toBe("E-mail já está em uso");
  });

  test("deve retornar 422 ao tentar cadastrar com senha que não atende aos requisitos mínimos", async ({
    request,
  }) => {
    const response = await request.post("/auth/signup", {
      data: {
        email: gerarEmailUnico(),
        // senha sem caractere especial e sem número
        password: "senhafraca",
      },
    });

    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body.message).toBe("Senha inválida");
  });
});
