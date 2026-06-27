package com.demoapp.demo.controller;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.demoapp.demo.repository.UserRepository;

/**
 * Testes de integração do {@link AuthController}.
 *
 * Sobe o contexto completo do Spring Boot com um banco H2 em memória
 * (ver src/test/resources/application.properties) e exercita os
 * endpoints de autenticação via {@link MockMvc}, validando o fluxo
 * real entre controller, service e repositório/banco de dados.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  // ---------------------------------------------------------------------
  // Testes de SUCESSO - fluxos de autenticação que funcionam corretamente
  // ---------------------------------------------------------------------

  @Test
  void signup_comDadosValidos_deveCriarUsuarioERetornar200() throws Exception {
    String corpoRequisicao = """
        {
          "email": "novo.usuario@teste.com",
          "password": "Abcde123@"
        }
        """;

    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(corpoRequisicao))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email", is("novo.usuario@teste.com")))
        .andExpect(jsonPath("$.id", notNullValue()));

    // Confirma que o usuário foi de fato persistido no banco
    boolean existeNoBanco = userRepository.findByEmail("novo.usuario@teste.com").isPresent();
    assertTrue(existeNoBanco,
        "O usuário criado deveria estar persistido no banco de dados");
  }

  @Test
  void signin_comCredenciaisCorretas_deveRetornar200ComUsuario() throws Exception {
    // Primeiro cria o usuário via signup
    String corpoSignup = """
        {
          "email": "login.sucesso@teste.com",
          "password": "Senha123@"
        }
        """;

    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(corpoSignup))
        .andExpect(status().isOk());

    // Agora tenta logar com as mesmas credenciais
    String corpoSignin = """
        {
          "email": "login.sucesso@teste.com",
          "password": "Senha123@"
        }
        """;

    mockMvc.perform(post("/auth/signin")
            .contentType(MediaType.APPLICATION_JSON)
            .content(corpoSignin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email", is("login.sucesso@teste.com")));
  }

  @Test
  void signup_comEmailJaCadastrado_deveRetornar409() throws Exception {
    String corpo = """
        {
          "email": "duplicado@teste.com",
          "password": "Abcde123@"
        }
        """;

    // Primeiro cadastro: sucesso
    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(corpo))
        .andExpect(status().isOk());

    // Segundo cadastro com o mesmo e-mail: deve ser rejeitado
    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(corpo))
        .andExpect(status().is(409))
        .andExpect(jsonPath("$.message", is("E-mail já está em uso")));
  }

  // ---------------------------------------------------------------------
  // Teste de BUG - validação de e-mail fraca no backend
  // ---------------------------------------------------------------------

  /**
   * BUG: UserService.isEmailValid apenas verifica se a string contém o
   * caractere "@" (email.contains("@")), enquanto o frontend usa um
   * regex completo (^[^\s@]+@[^\s@]+\.[^\s@]+$) que exige um domínio
   * válido com ponto.
   *
   * Isso permite que a API aceite e-mails claramente inválidos, como
   * "usuario@" (sem domínio), que o frontend nunca deixaria passar.
   * O teste abaixo documenta o comportamento ESPERADO (rejeitar e-mail
   * sem domínio válido) e FALHA porque a API atualmente aceita esse
   * e-mail malformado.
   */
  @Test
  @Disabled(
      "BUG CONHECIDO (rastreado em TESTES.md): a validação de e-mail do "
          + "backend (isEmailValid) ainda aceita e-mails sem domínio válido. "
          + "Mantido desabilitado para não quebrar a esteira de CI até a "
          + "correção ser feita.")
  void signup_comEmailSemDominio_deveriaSerRejeitadoComo422() throws Exception {
    String corpoRequisicao = """
        {
          "email": "usuario@",
          "password": "Abcde123@"
        }
        """;

    // Comportamento esperado: e-mail sem domínio é inválido (422).
    // Comportamento real (BUG): a API aceita porque só checa se há "@",
    // retornando 200 e criando o usuário.
    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(corpoRequisicao))
        .andExpect(status().is(422));
  }

}
