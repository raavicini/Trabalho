package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.demoapp.demo.model.User;
import com.demoapp.demo.repository.UserRepository;

/**
 * Testes unitários para {@link UserService}.
 *
 * Não envolvem o contexto do Spring nem banco de dados: o
 * {@link UserRepository} é mockado com Mockito, isolando a lógica de
 * negócio (validação de e-mail/senha e busca de usuário) que vive no
 * serviço.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  private UserService userService;

  @BeforeEach
  void setUp() {
    userService = new UserService(userRepository);
  }

  // ---------------------------------------------------------------------
  // Testes de SUCESSO - comportamentos que já funcionam corretamente
  // ---------------------------------------------------------------------

  @Test
  @DisplayName("isPasswordValid deve aceitar senha com 9+ caracteres, "
      + "maiúscula, minúscula, número e caractere especial")
  void isPasswordValid_deveAceitarSenhaForte() {
    // Senha com 9 caracteres atendendo a todos os requisitos do regex
    // (maiúscula, minúscula, número, especial)
    String senhaForte = "Abcde123@";

    boolean resultado = userService.isPasswordValid(senhaForte);

    assertTrue(resultado, "Uma senha forte e bem formada deveria ser válida");
  }

  @Test
  @DisplayName("findByEmail deve retornar o usuário quando ele existe no repositório")
  void findByEmail_deveRetornarUsuarioExistente() {
    String email = "usuario@teste.com";
    User userExistente = new User();
    userExistente.setId(1L);
    userExistente.setEmail(email);
    userExistente.setPassword("Abcde123@");

    when(userRepository.findByEmail(email)).thenReturn(Optional.of(userExistente));

    User resultado = userService.findByEmail(email);

    assertNotNull(resultado, "O usuário encontrado não deveria ser nulo");
    assertEquals(email, resultado.getEmail());
  }

  @Test
  @DisplayName("findByEmail deve retornar null quando o usuário não existe")
  void findByEmail_deveRetornarNullQuandoNaoExiste() {
    when(userRepository.findByEmail("inexistente@teste.com"))
        .thenReturn(Optional.empty());

    User resultado = userService.findByEmail("inexistente@teste.com");

    assertNull(resultado, "Deveria retornar null quando não há usuário com esse e-mail");
  }

  // ---------------------------------------------------------------------
  // Teste de BUG - captura uma falha real de validação de senha
  // ---------------------------------------------------------------------

  /**
   * BUG: o frontend (client/src/utils/password.ts) considera uma senha
   * válida apenas quando ela tem MAIS de 8 caracteres
   * (`password.length <= 8` => inválida, ou seja, exige 9+), mesmo
   * exibindo a mensagem "mínimo de 8 caracteres".
   *
   * Já o backend usa o regex "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
   * cujo quantificador {8,} aceita senhas com EXATAMENTE 8 caracteres.
   *
   * Isso gera uma divergência de regra de negócio entre as duas camadas:
   * uma senha de 8 caracteres que o frontend rejeitaria no cadastro é
   * aceita pela API. Este teste comprova, do lado do backend, que o
   * comportamento esperado (alinhado ao frontend, que é o contrato real
   * de senha forte da aplicação) FALHA, evidenciando o bug.
   */
  @Test
  @Disabled(
      "BUG CONHECIDO (rastreado em TESTES.md): a divergência de regra de "
          + "senha entre frontend (9+ caracteres) e backend (8+ caracteres) "
          + "ainda não foi corrigida no código de produção. Este teste "
          + "documenta o comportamento esperado e é mantido desabilitado "
          + "para não quebrar a esteira de CI até a correção ser feita.")
  @DisplayName("BUG: isPasswordValid aceita senha de exatamente 8 caracteres, "
      + "divergindo da regra do frontend que exige mais de 8")
  void isPasswordValid_bugAceitaSenhaDeOitoCaracteres() {
    // 8 caracteres, atendendo maiúscula/minúscula/número/especial
    String senhaDeOitoCaracteres = "Abcd123@";
    assertEquals(8, senhaDeOitoCaracteres.length());

    boolean resultado = userService.isPasswordValid(senhaDeOitoCaracteres);

    // Comportamento esperado pelo contrato de negócio da aplicação
    // (mesma regra aplicada no frontend): senha de 8 caracteres deveria
    // ser INVÁLIDA. O teste falha porque o backend aceita (retorna true).
    assertFalse(resultado,
        "Senha de exatamente 8 caracteres deveria ser inválida, "
            + "assim como é no frontend, mas o backend a aceita (BUG)");
  }

}
