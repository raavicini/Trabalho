import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { postsService } from "@/service/posts/posts";


jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));


jest.mock("../../service/posts/posts", () => ({
  postsService: {
    getPosts: jest.fn(),
    getLikedPosts: jest.fn(),
    toggleLikePost: jest.fn(),
  },
}));

const USER_KEY = "sqa_social_user";

describe("Fluxo de curtir posts (tela Home + PostCard)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("integração: usuário autenticado consegue curtir um post e ver o estado refletido na tela", async () => {
    
    window.localStorage.setItem(
      USER_KEY,
      JSON.stringify({ id: 1, email: "usuario@teste.com" })
    );

    (postsService.getPosts as jest.Mock).mockResolvedValueOnce({
      posts: [
        {
          id: 10,
          title: "Post de teste",
          body: "Conteúdo do post",
          liked: false,
          reactions: { likes: 42, dislikes: 3 },
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    });
    (postsService.toggleLikePost as jest.Mock).mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

   
    await waitFor(() =>
      expect(screen.getByText("Post de teste")).toBeInTheDocument()
    );

    
    expect(screen.getByText("👍 42 curtidas")).toBeInTheDocument();
    expect(screen.getByText("👎 3 descurtidas")).toBeInTheDocument();

    const botaoCurtir = screen.getByRole("button", { name: /curtir/i });
    fireEvent.click(botaoCurtir);

    
await waitFor(() =>
  expect(screen.getByText("Curtido")).toBeInTheDocument()
);

    expect(postsService.toggleLikePost).toHaveBeenCalledWith({
      postId: 10,
      userId: 1,
    });
  });

  it("usuário não autenticado deve ver alerta ao tentar curtir e o post não deve mudar de estado", async () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    (postsService.getPosts as jest.Mock).mockResolvedValueOnce({
      posts: [
        {
          id: 20,
          title: "Outro post",
          body: "Mais conteúdo",
          liked: false,
          reactions: { likes: 10, dislikes: 1 },
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    });

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByText("Outro post")).toBeInTheDocument()
    );

    const botaoCurtir = screen.getByRole("button", { name: /curtir/i });
    fireEvent.click(botaoCurtir);

    expect(alertMock).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );
    expect(postsService.toggleLikePost).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });
});
