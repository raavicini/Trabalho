# Bugs encontrados nesta atividade (testes E2E e de API)

Este documento complementa o `TESTES.md` da raiz do projeto (referente
à Atividade 4 — testes de caixa-branca), descrevendo um bug adicional
encontrado durante a criação dos testes de caixa-preta desta
atividade.

## [Backend] Exposição de senha em texto puro na resposta da API

**Arquivos:**
- `api/src/main/java/com/demoapp/demo/model/User.java`
- `api/src/main/java/com/demoapp/demo/controller/AuthController.java`

O endpoint `POST /auth/signup` (e também `POST /auth/signin`) retorna
o objeto `User` inteiro na resposta:

```java
User createdUser = service.createUser(userDTO.getEmail(), userDTO.getPassword());
return ResponseEntity.ok(createdUser);
```

Como o model `User` expõe `getPassword()` publicamente e não possui
nenhuma anotação para ocultar esse campo na serialização JSON (como
`@JsonIgnore`), a senha do usuário, em texto puro, é devolvida no
corpo da resposta HTTP. Isso é uma falha de segurança: a senha nunca
deveria estar presente em nenhuma resposta da API.

**Capturado em:**
`tests/api/auth-signup.spec.ts`
(teste `"BUG (segurança): a resposta do cadastro não deveria expor a senha em texto puro"`).

**Correção sugerida:** anotar o campo `password` do model `User` com
`@JsonIgnore` (ou usar um DTO de resposta próprio, sem o campo
`password`, em vez de devolver a entidade JPA diretamente).

---

Para a lista completa de bugs encontrados na Atividade 4 (caixa-branca,
unidade e integração), veja o arquivo `TESTES.md` na raiz do projeto.
