import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/Button";

/**
 * Teste unitário de componente React isolado (sem outros componentes
 * envolvidos), usando React Testing Library.
 */
describe("Button", () => {
  it("deve renderizar o texto recebido via children", () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("deve chamar onClick quando clicado e não estiver desabilitado", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Salvar</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("deve exibir 'Carregando...' e ficar desabilitado quando isLoading é true", () => {
    render(<Button isLoading>Salvar</Button>);

    const botao = screen.getByRole("button", { name: "Carregando..." });
    expect(botao).toBeInTheDocument();
    expect(botao).toBeDisabled();
  });

  it("não deve chamar onClick quando o botão está desabilitado", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Indisponível
      </Button>
    );

    fireEvent.click(screen.getByRole("button", { name: "Indisponível" }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
