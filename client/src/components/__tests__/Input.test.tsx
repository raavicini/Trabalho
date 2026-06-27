import { render, screen, fireEvent } from "@testing-library/react";
import Input from "@/components/Input";

/**
 * Teste unitário de componente React isolado, usando React Testing
 * Library.
 */
describe("Input", () => {
  it("deve renderizar o label quando fornecido", () => {
    render(<Input label="Email" />);

    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("deve exibir a mensagem de erro quando a prop error é fornecida", () => {
    render(<Input label="Senha" error="Senha é obrigatória" />);

    expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
  });

  it("não deve exibir nenhuma mensagem de erro quando error não é fornecido", () => {
    render(<Input label="Senha" />);

    expect(screen.queryByText(/obrigat/i)).not.toBeInTheDocument();
  });

  it("deve chamar onChange ao digitar no campo", () => {
    const handleChange = jest.fn();
    render(
      <Input label="Email" placeholder="seu@email.com" onChange={handleChange} />
    );

    const campo = screen.getByPlaceholderText("seu@email.com");
    fireEvent.change(campo, { target: { value: "teste@teste.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
