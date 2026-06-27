import { isEmailValid, getEmailValidationMessage } from "@/utils/email";

/**
 * Teste unitário de função pura (sem renderização de componentes).
 * Cobre a validação de e-mail usada nos formulários de signin/signup/
 * reset-password.
 */
describe("utils/email", () => {
  describe("isEmailValid", () => {
    it("deve retornar true para um e-mail bem formado", () => {
      expect(isEmailValid("usuario@teste.com")).toBe(true);
    });

    it("deve retornar false para uma string vazia", () => {
      expect(isEmailValid("")).toBe(false);
    });

    it("deve retornar false para e-mail sem domínio (sem ponto após o @)", () => {
      expect(isEmailValid("usuario@dominio")).toBe(false);
    });

    it("deve retornar false para e-mail sem o caractere @", () => {
      expect(isEmailValid("usuario.teste.com")).toBe(false);
    });

    it("deve aceitar e-mail com espaços nas extremidades (trim antes de validar)", () => {
      expect(isEmailValid("  usuario@teste.com  ")).toBe(true);
    });
  });

  describe("getEmailValidationMessage", () => {
    it('deve retornar "Email é obrigatório" quando o e-mail está vazio', () => {
      expect(getEmailValidationMessage("")).toBe("Email é obrigatório");
    });

    it('deve retornar "Email inválido" para um e-mail malformado', () => {
      expect(getEmailValidationMessage("invalido@")).toBe("Email inválido");
    });

    it("deve retornar string vazia quando o e-mail é válido", () => {
      expect(getEmailValidationMessage("usuario@teste.com")).toBe("");
    });
  });
});
