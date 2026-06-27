import { test, expect } from "@playwright/test";

/**
 * Teste de API (caixa-preta) para a nova feature de likes/dislikes
 * (Atividade 6): GET /posts deve devolver, para cada post, o campo
 * `reactions` com os números de curtidas e descurtidas vindos da
 * DummyJSON Posts API.
 *
 * Pré-requisito: a API (Spring Boot) precisa estar rodando em
 * http://localhost:8080, com acesso à internet (consulta
 * https://dummyjson.com).
 */

test.describe("GET /posts - feature de likes/dislikes", () => {
  test("cada post retornado deve conter reactions.likes e reactions.dislikes numéricos", async ({
    request,
  }) => {
    const response = await request.get("/posts?limit=5&skip=0");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.posts)).toBe(true);
    expect(body.posts.length).toBeGreaterThan(0);

    for (const post of body.posts) {
      expect(post).toHaveProperty("reactions");
      expect(typeof post.reactions.likes).toBe("number");
      expect(typeof post.reactions.dislikes).toBe("number");
      expect(post.reactions.likes).toBeGreaterThanOrEqual(0);
      expect(post.reactions.dislikes).toBeGreaterThanOrEqual(0);
    }
  });
});
