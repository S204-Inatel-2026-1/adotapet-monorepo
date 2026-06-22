# Guia Rápido de Swagger para o Frontend (AdotaPet)

Este guia é para Lucas e Lilyan conseguirem testar a API local e integrar o Front.

## 1. Onde acessar

Com o backend rodando (`npm run start:dev`), abra:

- `http://localhost:3000/docs`

> `http://localhost:3000` mostra apenas a resposta básica da API. A documentação real está em `/docs`.

## 2. Como ler o Swagger

Cada seção (Users, Auth, Pets, Organizations, Adoptions) contém:

- Endpoint
- Payload esperado
- Campos obrigatórios/opcionais
- Exemplo de resposta

Use sempre **Try it out** para testar localmente.

## 3. Fluxo mínimo para autenticar

### Passo 1: Criar usuário adotante

- Seção `Users`
- Endpoint `POST /users`

Exemplo:

```json
{
  "fullName": "Frontend Local",
  "email": "frontend.local@adotapet.com",
  "password": "Str0ng@Pass123",
  "role": "ADOPTER"
}
```

### Passo 2: Fazer login

- Seção `Auth`
- Endpoint `POST /auth/login`

Exemplo:

```json
{
  "email": "frontend.local@adotapet.com",
  "password": "Str0ng@Pass123"
}
```

Copie o `access_token` retornado.

### Fluxo alternativo: criar conta ONG

Para testar o painel/fluxo de ONG, use:

- Seção `Organizations`
- Endpoint `POST /organizations/register`

Exemplo:

```json
{
  "fullName": "Responsavel ONG",
  "email": "ong.local@adotapet.com",
  "password": "Str0ng@Pass123",
  "phone": "11999999999",
  "legalName": "ONG Local LTDA",
  "tradeName": "ONG Local",
  "cnpj": "12345678000199",
  "description": "ONG de teste para integracao local.",
  "city": "Sao Paulo",
  "state": "SP"
}
```

Essa rota cria o usuario com papel `ONG_ADMIN`, cria a organizacao e vincula os dois por `organizationId`.

### Passo 3: Autorizar no Swagger

- Clique em **Authorize** (topo da página)
- Cole:

```text
Bearer SEU_ACCESS_TOKEN
```

- Clique em **Authorize** e depois **Close**

Pronto: o Swagger passa a enviar o token automaticamente nas rotas protegidas.

## 4. Rotas protegidas (cadeado)

Exemplos de rotas que exigem token:

- `POST /pets`
- `PATCH /pets/{id}`
- `DELETE /pets/{id}`
- `GET /organizations/me`
- `PATCH /organizations/me`
- Rotas de `Adoptions`

Se o token estiver ausente ou inválido, a API retorna `401 Unauthorized`.

### Recuperação de senha

As duas rotas são públicas:

- `POST /auth/forgot-password` com `{ "email": "usuario@adotapet.com" }` envia o link.
- `POST /auth/reset-password` com `{ "token": "...", "password": "NovaSenha@123" }` grava a nova senha.

O link aponta para `/recuperar-senha?token=...` no frontend. Tokens expirados ou já utilizados são rejeitados.

## 5. Novidades (Upload e RBAC)

- **Upload de Foto:** A rota `POST /pets/{id}/photo` usa `multipart/form-data`. O Swagger exibirá um botão **Choose File**. O backend processa e devolve a URL.
- **Papéis (Roles):** Atenção ao tipo de usuário logado. Um `ADOPTER` não pode deletar ONGs. Apenas um `ADOPTER` pode assinar o termo de adoção final. O backend barra com `403 Forbidden` se o papel estiver errado.

## 6. Regras importantes para o Front

- Não envie `registeredById` ao criar pet; o backend define pelo usuário autenticado.
- Para usuarios `ONG_ADMIN`, o backend tambem vincula automaticamente o pet a organizacao do usuario.
- Para consultar ou editar a organizacao da conta logada, prefira `GET /organizations/me` e `PATCH /organizations/me`.
- Recursos com ownership só podem ser alterados pelo dono (`403 Forbidden` se não for dono).
- Campos enum devem respeitar exatamente os valores documentados no Swagger.

## 7. Checklist de integração local

1. Backend rodando (`npm run start:dev`)
2. Banco MySQL ativo no Docker
3. Migrações aplicadas (`npx prisma migrate dev`)
4. Token JWT configurado no Swagger (Authorize)
5. Teste manual da rota no Swagger antes de integrar no Front

## 8. Erros comuns

- **Cannot GET /docs**: backend não está na branch correta ou Swagger não foi configurado.
- **401 Unauthorized**: token ausente/expirado/formato incorreto.
- **403 Forbidden**: usuário logado não é dono do recurso.
- **400 Bad Request**: payload inválido para os DTOs.
