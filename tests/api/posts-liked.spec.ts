import { test, expect } from "@playwright/test";

/**
 * Testes de API (caixa-preta) para o endpoint de posts curtidos
 * (GET /posts/liked).
 *
 * Pré-requisito: a API (Spring Boot) precisa estar rodando em
 * http://localhost:8080.
 */

function gerarEmailUnico(): string {
  return `posts.${Date.now()}.${Math.floor(Math.random() * 100000)}@teste.com`;
}

test.describe("GET /posts/liked", () => {
  test("deve retornar 400 quando o parâmetro obrigatório userId não é informado", async ({
    request,
  }) => {
    const response = await request.get("/posts/liked");

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toBe("userId é obrigatório");
  });

  test("deve retornar 200 com lista vazia para um usuário recém-criado que ainda não curtiu nenhum post", async ({
    request,
  }) => {
    // Cria um usuário novo, que certamente não tem posts curtidos
    const signup = await request.post("/auth/signup", {
      data: { email: gerarEmailUnico(), password: "Abcde123@" },
    });
    expect(signup.status()).toBe(200);

    const { id: userId } = await signup.json();

    const response = await request.get(`/posts/liked?userId=${userId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.posts).toEqual([]);
    expect(body.total).toBe(0);
  });
});
