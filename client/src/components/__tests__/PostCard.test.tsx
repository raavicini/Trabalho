import { render, screen } from "@testing-library/react";
import PostCard from "@/components/PostCard";
import { Post } from "@/service/types";

/**
 * Teste unitário de componente isolado para a feature de likes/dislikes
 * (Atividade 6): o PostCard deve exibir, junto a cada postagem, o
 * número de curtidas e descurtidas vindo do campo `reactions` da API.
 */
describe("PostCard - exibição de likes e dislikes", () => {
  function criarPost(overrides: Partial<Post> = {}): Post {
    return {
      id: 1,
      title: "Título de teste",
      body: "Corpo do post de teste",
      liked: false,
      reactions: { likes: 0, dislikes: 0 },
      ...overrides,
    };
  }

  it("deve exibir o número de curtidas e descurtidas vindos de post.reactions", () => {
    const post = criarPost({ reactions: { likes: 192, dislikes: 25 } });

    render(
      <PostCard post={post} isAuthenticated={false} onLike={jest.fn()} />
    );

    expect(screen.getByText("👍 192 curtidas")).toBeInTheDocument();
    expect(screen.getByText("👎 25 descurtidas")).toBeInTheDocument();
  });

  it("deve exibir 0 curtidas e 0 descurtidas quando reactions vier zerado", () => {
    const post = criarPost({ reactions: { likes: 0, dislikes: 0 } });

    render(
      <PostCard post={post} isAuthenticated={false} onLike={jest.fn()} />
    );

    expect(screen.getByText("👍 0 curtidas")).toBeInTheDocument();
    expect(screen.getByText("👎 0 descurtidas")).toBeInTheDocument();
  });

  it("não deve quebrar a renderização quando reactions não vier preenchido", () => {
    // Simula uma resposta de API antiga/inesperada, sem o campo
    // reactions, garantindo que o componente não trava (defensivo)
    const post = criarPost();
    // @ts-expect-error - simulando ausência do campo em runtime
    delete post.reactions;

    render(
      <PostCard post={post} isAuthenticated={false} onLike={jest.fn()} />
    );

    expect(screen.getByText("👍 0 curtidas")).toBeInTheDocument();
    expect(screen.getByText("👎 0 descurtidas")).toBeInTheDocument();
  });
});
