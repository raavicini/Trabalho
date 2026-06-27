import { test, expect } from "@playwright/test";

/**
 * Testes de API (caixa-preta) para o endpoint de login
 * (POST /auth/signin).
 *
 * Pré-requisito: a API (Spring Boot) precisa estar rodando em
 * http://localhost:8080.
 */

function gerarEmailUnico(): string {
  return `login.${Date.now()}.${Math.floor(Math.random() * 100000)}@teste.com`;
}

test.describe("POST /auth/signin", () => {
  test("deve autenticar com sucesso quando e-mail e senha estão corretos", async ({
    request,
  }) => {
    const email = gerarEmailUnico();
    const password = "Senha123@";

    // Cria o usuário antes de tentar logar (a API não vem com
    // usuários pré-cadastrados, então o teste cria seu próprio fixture)
    const signup = await request.post("/auth/signup", {
      data: { email, password },
    });
    expect(signup.status()).toBe(200);

    const response = await request.post("/auth/signin", {
      data: { email, password },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.email).toBe(email);
    expect(body).toHaveProperty("id");
  });

  test("deve retornar 401 quando a senha está incorreta", async ({
    request,
  }) => {
    const email = gerarEmailUnico();

    const signup = await request.post("/auth/signup", {
      data: { email, password: "SenhaCorreta123@" },
    });
    expect(signup.status()).toBe(200);

    const response = await request.post("/auth/signin", {
      data: { email, password: "SenhaErrada123@" },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.message).toBe("Credenciais inválidas");
  });

  test("deve retornar 401 quando o e-mail não está cadastrado", async ({
    request,
  }) => {
    const response = await request.post("/auth/signin", {
      data: {
        email: gerarEmailUnico(), // e-mail novo, nunca cadastrado
        password: "QualquerSenha123@",
      },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.message).toBe("Credenciais inválidas");
  });
});
