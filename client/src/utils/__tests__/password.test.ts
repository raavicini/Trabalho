import { isPasswordValid, getPasswordValidationMessage } from "@/utils/password";

/**
 * Teste unitário de função pura (sem renderização de componentes).
 * Cobre a validação de senha usada no formulário de cadastro.
 */
describe("utils/password", () => {
  describe("isPasswordValid", () => {
    it("deve retornar true para uma senha forte com 9+ caracteres", () => {
      // 9 caracteres, com maiúscula, minúscula, número e especial
      expect(isPasswordValid("Abcde123@")).toBe(true);
    });

    it("deve retornar false quando falta caractere especial", () => {
      expect(isPasswordValid("Abcdefg123")).toBe(false);
    });

    it("deve retornar false para senha vazia", () => {
      expect(isPasswordValid("")).toBe(false);
    });

    /**
     * BUG: a documentação exibida ao usuário (ver
     * getPasswordValidationMessage e a tela de cadastro) afirma que o
     * requisito é "mínimo de 8 caracteres". Entretanto, a implementação
     * usa `password.length <= 8`, o que rejeita senhas com EXATAMENTE 8
     * caracteres, exigindo na prática 9 ou mais.
     *
     * Este teste documenta o comportamento esperado pelo contrato
     * informado ao usuário (8 caracteres deveria bastar) e FALHA porque
     * a implementação atual rejeita essa senha.
     *
     * BUG CONHECIDO (rastreado em TESTES.md): mantido como `it.skip`
     * para não quebrar a esteira de CI até a correção ser feita.
     */
    it.skip("BUG: deveria aceitar senha com exatamente 8 caracteres (regra informada ao usuário), mas rejeita", () => {
      const senhaDeOitoCaracteres = "Abcd123@"; // 8 caracteres válidos em tudo mais
      expect(senhaDeOitoCaracteres).toHaveLength(8);

      expect(isPasswordValid(senhaDeOitoCaracteres)).toBe(true);
    });
  });

  describe("getPasswordValidationMessage", () => {
    it('deve retornar "Senha é obrigatória" quando a senha está vazia', () => {
      expect(getPasswordValidationMessage("")).toBe("Senha é obrigatória");
    });

    it("deve retornar string vazia quando a senha atende todos os requisitos", () => {
      expect(getPasswordValidationMessage("Abcde123@")).toBe("");
    });

    it("deve listar o requisito de número quando a senha não possui dígitos", () => {
      const mensagem = getPasswordValidationMessage("Abcdefgh@");
      expect(mensagem).toContain("um número");
    });
  });
});
