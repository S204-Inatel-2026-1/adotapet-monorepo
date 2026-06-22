# Recuperacao de Senha

Este documento explica como a recuperacao de senha funciona no AdotaPet e como executar e testar o fluxo localmente.

## Visao Geral

O fluxo atende tanto contas de usuarios comuns quanto contas de ONG. Nos dois casos, a autenticacao pertence a um registro da tabela `User`. A conta de ONG usa o papel `ONG_ADMIN` e possui uma organizacao associada, mas recupera a senha pelo mesmo processo.

As partes envolvidas sao:

- frontend Next.js nas telas `/esqueceu-senha` e `/recuperar-senha`;
- endpoints `POST /auth/forgot-password` e `POST /auth/reset-password`;
- backend NestJS para validar o usuario e controlar o token;
- tabela `PasswordResetToken` no MySQL;
- Nodemailer e um servidor SMTP para entregar o e-mail.

## Como O Fluxo Funciona

1. O usuario informa seu e-mail na tela `/esqueceu-senha`.
2. O frontend envia o e-mail para `POST /auth/forgot-password`.
3. O backend normaliza o e-mail e procura um usuario ativo na tabela `User`.
4. Um token aleatorio de 32 bytes e criado.
5. Somente o hash SHA-256 do token e salvo em `PasswordResetToken`.
6. Tokens anteriores daquele usuario sao removidos.
7. O backend envia um link no formato `http://localhost:3001/recuperar-senha?token=...`.
8. O usuario abre o link, informa e confirma a nova senha.
9. O frontend envia o token e a senha para `POST /auth/reset-password`.
10. O backend confere se o token existe, nao expirou, ainda nao foi usado e pertence a um usuario ativo.
11. A nova senha e protegida com bcrypt e salva na tabela `User`.
12. O token e marcado como utilizado e os outros tokens ativos do usuario sao invalidados.

O link pode ser usado uma unica vez. Por padrao, ele expira em 30 minutos.

```mermaid
sequenceDiagram
  actor Usuario
  participant Frontend as Frontend Next.js
  participant API as Backend NestJS
  participant DB as MySQL/Prisma
  participant SMTP as Servidor SMTP

  Usuario->>Frontend: Informa o e-mail
  Frontend->>API: POST /auth/forgot-password
  API->>DB: Localiza User e salva hash do token
  API->>SMTP: Envia link de recuperacao
  SMTP-->>Usuario: E-mail com token no link
  Usuario->>Frontend: Abre /recuperar-senha?token=...
  Usuario->>Frontend: Informa a nova senha
  Frontend->>API: POST /auth/reset-password
  API->>DB: Valida token e atualiza senha em transacao
  API-->>Frontend: 200 OK
```

## Requisitos Locais

- Docker Desktop em execucao;
- Node.js 22;
- npm;
- uma conta SMTP capaz de enviar e-mails;
- portas `3000`, `3001`, `3306` e `5555` livres.

Para confirmar a versao do Node:

```powershell
node --version
```

O resultado deve comecar com `v22`. Caso o projeto use NVM for Windows:

```powershell
nvm use 22
```

## Configuracao Inicial

Na raiz do repositorio, atualize o codigo e inicie o MySQL:

```powershell
git pull
docker compose up -d mysql
docker compose ps
```

O container `adotapet_mysql` deve aparecer com o status `Up`.

### Backend

Abra um terminal na raiz do repositorio:

```powershell
cd backend
npm ci
```

Se `backend/.env` ainda nao existir, crie-o a partir do modelo:

```powershell
Copy-Item .env.example .env
```

Nao execute esse comando se ja houver um `.env` configurado, pois ele substituiria as configuracoes locais.

Preencha `backend/.env`:

```dotenv
DATABASE_URL=mysql://root:root@localhost:3306/adotapet
JWT_SECRET=trocar_em_producao
PORT=3000

FRONTEND_URL=http://localhost:3001
PASSWORD_RESET_TOKEN_TTL_MINUTES=30

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=conta-remetente@gmail.com
SMTP_PASS=senha-de-aplicativo-do-google
SMTP_FROM="AdotaPet <conta-remetente@gmail.com>"
```

Nunca coloque a senha SMTP em `.env.example`, no codigo ou no Git. O arquivo real deve permanecer somente em `backend/.env`.

Gere o Prisma Client e aplique as migracoes:

```powershell
npx prisma generate
npx prisma migrate deploy
```

Inicie o backend:

```powershell
npm run start:dev
```

O backend ficara em `http://localhost:3000` e o Swagger em `http://localhost:3000/docs`.

### Frontend

Abra outro terminal na raiz do repositorio:

```powershell
cd frontend
npm ci
npm run dev -- -p 3001
```

O frontend ficara em `http://localhost:3001`.

## Configurando Gmail Como SMTP

Para usar uma conta Gmail como remetente:

1. Ative a verificacao em duas etapas na conta Google do sistema.
2. Na seguranca da Conta Google, abra `Senhas de app`.
3. Crie uma senha de aplicativo para o AdotaPet.
4. Coloque os 16 caracteres gerados somente em `SMTP_PASS` no `backend/.env`.
5. Use o endereco da conta em `SMTP_USER` e `SMTP_FROM`.

A senha de aplicativo pertence ao sistema remetente. Os usuarios que solicitarem recuperacao nao precisam criar senha de aplicativo; eles apenas recebem o e-mail normalmente.

Se uma senha SMTP for exposta no Git, em documentacao ou em uma conversa, revogue-a na Conta Google e gere outra.

## Teste Pela Interface

1. Confirme que MySQL, backend e frontend estao ativos.
2. Acesse `http://localhost:3001/login`.
3. Clique em `Esqueci a senha`.
4. Informe o e-mail de uma conta cadastrada e ativa.
5. Verifique a caixa de entrada e a pasta de spam.
6. Abra o link recebido.
7. Informe uma senha com pelo menos 8 caracteres, incluindo letra maiuscula, letra minuscula, numero e caractere especial.
8. Apos a confirmacao, volte ao login e entre com a nova senha.
9. Confirme que a senha antiga nao funciona mais.

O mesmo teste pode ser feito com um usuario comum ou com o e-mail usado para entrar como administrador de uma ONG.

## Teste Pelo Swagger

Acesse `http://localhost:3000/docs`.

### Solicitar o link

Use `POST /auth/forgot-password`:

```json
{
  "email": "usuario@exemplo.com"
}
```

Quando o e-mail e enviado, a API responde `200 OK`:

```json
{
  "message": "E-mail de recuperacao enviado."
}
```

### Definir a nova senha

Copie o valor do parametro `token` presente no link recebido e use `POST /auth/reset-password`:

```json
{
  "token": "token-recebido-no-link",
  "password": "NovaSenha@123"
}
```

Quando a alteracao e concluida, a API responde `200 OK`:

```json
{
  "message": "Senha alterada com sucesso."
}
```

## Conferencia No Banco

Dentro de `backend`, execute:

```powershell
npx prisma studio
```

Abra `http://localhost:5555` e confira:

- `User`: a conta continua ativa e a senha aparece somente como hash;
- `PasswordResetToken`: o token possui `expiresAt` e, apos o uso, `usedAt` preenchido.

O token original enviado por e-mail nao e armazenado no banco, apenas seu hash.

## Respostas E Erros Esperados

| Situacao | Resposta |
| --- | --- |
| Link enviado | `200 OK` |
| Senha alterada | `200 OK` |
| E-mail inexistente ou usuario inativo | `404 Not Found` |
| Token invalido, expirado ou ja utilizado | `400 Bad Request` |
| SMTP ausente ou indisponivel | `503 Service Unavailable` |
| Dados fora do formato exigido | `400 Bad Request` |

### Observacao De Seguranca

Atualmente, o endpoint responde `404 Not Found` quando o e-mail nao esta cadastrado. Em uma futura preparacao para producao, e recomendavel retornar a mesma mensagem generica para e-mails existentes e inexistentes. Isso evita que terceiros usem o endpoint para descobrir quais enderecos possuem conta no sistema.

## Solucao De Problemas

### `535 Authentication failed`

- confirme `SMTP_USER` e `SMTP_PASS`;
- use uma senha de aplicativo, nao a senha normal da conta Google;
- remova espacos extras da senha de aplicativo;
- reinicie o backend depois de alterar o `.env`.

### O e-mail nao chegou

- verifique a pasta de spam;
- confira o terminal do backend;
- confirme que a conta informada existe em `User` e esta ativa;
- confira se `SMTP_FROM` utiliza um remetente permitido pela conta SMTP.

### `Token invalido ou expirado`

- solicite um novo link;
- utilize apenas o link mais recente;
- confirme `PASSWORD_RESET_TOKEN_TTL_MINUTES`;
- nao reutilize um link que ja alterou a senha.

### `No database URL found`

Execute os comandos do Prisma dentro de `backend`, onde estao `prisma/schema.prisma` e `.env`:

```powershell
cd backend
npx prisma studio
```

### O frontend abriu na porta errada

Inicie-o explicitamente na porta esperada pelo link de recuperacao:

```powershell
npm run dev -- -p 3001
```

Confirme tambem:

```dotenv
FRONTEND_URL=http://localhost:3001
```

## Arquivos Relacionados

| Responsabilidade | Arquivo |
| --- | --- |
| Endpoints da API | `src/modules/auth/auth.controller.ts` |
| Regras, token e troca da senha | `src/modules/auth/auth.service.ts` |
| Envio SMTP | `src/modules/auth/mail.service.ts` |
| Validacao do e-mail | `src/modules/auth/dto/forgot-password.dto.ts` |
| Validacao do token e nova senha | `src/modules/auth/dto/reset-password.dto.ts` |
| Modelo do token | `prisma/schema.prisma` |
| Migracao do banco | `prisma/migrations/20260621000100_add_password_reset_tokens/migration.sql` |
| Tela de solicitacao | `../frontend/src/app/esqueceu-senha/page.tsx` |
| Tela de nova senha | `../frontend/src/app/recuperar-senha/page.tsx` |
| Integracao HTTP do frontend | `../frontend/src/services/api.ts` |

## Validacao Tecnica

Antes de enviar alteracoes, os principais comandos de verificacao sao:

```powershell
cd backend
npx prisma generate
npm run build
npm test -- --runInBand

cd ..\frontend
npm run build
npm test -- --watchAll=false --runInBand
```
