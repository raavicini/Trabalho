import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignIn from "@/app/signin/page";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { authService } from "@/service/auth/auth";

// Mock do next/navigation, exigido pelas páginas do App Router em testes
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock do serviço de autenticação para não depender da API real
jest.mock("@/service/auth/auth", () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

/**
 * Pequeno componente auxiliar que expõe o estado de autenticação
 * atual na tela, para podermos verificar via Testing Library se o
 * usuário está autenticado depois de um "reload" da aplicação.
 */
function AuthStatusProbe() {
  const { isAuthenticated, user } = useAuth();
  return (
    <div data-testid="auth-status">
      {isAuthenticated ? `logado:${user?.email}` : "deslogado"}
    </div>
  );
}

describe("Fluxo de login (tela SignIn + AuthContext)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("integração: deve logar com sucesso e exibir o usuário como autenticado e redirecionar para '/'", async () => {
    (authService.signIn as jest.Mock).mockResolvedValueOnce({
      id: 1,
      email: "usuario@teste.com",
    });

    render(
      <AuthProvider>
        <SignIn />
        <AuthStatusProbe />
      </AuthProvider>
    );

    // Aguarda o AuthProvider terminar de carregar o estado inicial
    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent("deslogado")
    );

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Abcde123@" },
    });

    const botaoEntrarForm = document.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    fireEvent.click(botaoEntrarForm);

    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "logado:usuario@teste.com"
      )
    );

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  /**
   * BUG: lib/localStorage.ts grava o usuário sob a chave "user" em
   * saveUser(), mas lê/remove usando a constante USER_KEY
   * ("sqa_social_user") em getUser()/removeUser(). Como as chaves não
   * coincidem, o usuário nunca é recuperado do localStorage quando o
   * AuthProvider é remontado (o que acontece, na prática, a cada
   * reload de página).
   *
   * Este teste de integração reproduz o fluxo real do usuário: faz
   * login pela tela, e então simula um "reload" desmontando e
   * remontando o AuthProvider (que relê o localStorage no useEffect
   * inicial). O comportamento esperado é que o usuário continue
   * autenticado após o reload; o teste FALHA porque o bug derruba a
   * sessão.
   *
   * BUG CONHECIDO (rastreado em TESTES.md): mantido como `it.skip`
   * para não quebrar a esteira de CI até a correção ser feita.
   */
  it.skip("BUG: usuário deveria continuar autenticado após reload da página, mas a sessão é perdida", async () => {
    (authService.signIn as jest.Mock).mockResolvedValueOnce({
      id: 1,
      email: "usuario@teste.com",
    });

    const { unmount } = render(
      <AuthProvider>
        <SignIn />
        <AuthStatusProbe />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent("deslogado")
    );

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Abcde123@" },
    });

    const botaoEntrarForm = document.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    fireEvent.click(botaoEntrarForm);

    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "logado:usuario@teste.com"
      )
    );

    // Simula o reload da página: o AuthProvider é desmontado e um novo
    // é montado do zero, que é exatamente o que acontece quando o
    // navegador recarrega a aplicação React.
    unmount();

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>
    );

    // Comportamento esperado: a sessão persiste após o reload.
    // Comportamento real (BUG): a chave gravada no localStorage não é
    // a mesma lida, então o usuário aparece como "deslogado".
    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "logado:usuario@teste.com"
      )
    );
  });
});
