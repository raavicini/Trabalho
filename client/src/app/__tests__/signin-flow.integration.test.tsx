import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignIn from "@/app/signin/page";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { authService } from "@/service/auth/auth";


const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));



jest.mock("../../service/auth/auth", () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
  },
}));


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

    
    unmount();

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>
    );

    
    await waitFor(() =>
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "logado:usuario@teste.com"
      )
    );
  });
});
