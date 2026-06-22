# 🐾 AdotaPet — Monorepo

![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> Plataforma de **adoção responsável de animais**, conectando **adotantes** e **ONGs/abrigos**.
> Projeto acadêmico da disciplina **S204 — INATEL (2026/1)**.

Este repositório é um **monorepo** que reúne a API (backend), a aplicação web (frontend) e a orquestração de containers em um único lugar.

---

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Modelo de dados](#modelo-de-dados)
- [Arquitetura e stack](#arquitetura-e-stack)
- [Estrutura do monorepo](#estrutura-do-monorepo)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Principais endpoints da API](#principais-endpoints-da-api)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Documentação complementar](#documentação-complementar)
- [Equipe](#equipe)
- [Licença](#licença)

---

## Sobre o projeto

O **AdotaPet** estrutura e centraliza o processo de adoção responsável de animais, oferecendo uma base tecnológica para conectar pessoas, ONGs/abrigos e demandas de proteção animal.

A plataforma atende dois perfis principais:

- **Adotante** — navega pelos pets disponíveis (com filtros), envia solicitações de adoção e assina o termo de responsabilidade.
- **ONG/Abrigo** — cadastra e gerencia seus pets, recebe e aprova/recusa solicitações de adoção.

Além disso, há papéis administrativos e fluxos de apoio (resgate e denúncia), governados por um controle de acesso baseado em papéis (RBAC): `ADOPTER`, `VOLUNTEER`, `ONG_ADMIN` e `ADMIN`.

---

## Funcionalidades

- 🔎 **Catálogo de pets** com filtros (espécie, porte, sexo, status, cidade/estado, ONG).
- 📝 **Solicitações de adoção** com mensagem de apresentação e fluxo de aprovação (`PENDING → APPROVED/REJECTED/CANCELED`).
- ✍️ **Termo de responsabilidade** com assinatura digital e rastro de auditoria (IP + User-Agent).
- 🏠 **Cadastro de ONG** que cria, em uma única transação, a organização + o usuário `ONG_ADMIN` vinculado.
- 🔐 **Autenticação JWT** com senhas protegidas por Bcrypt e **RBAC** por papel.
- 🖼️ **Upload de fotos** de pets (Multer).
- 🆘 **Resgate e denúncia** — solicitações de resgate com geolocalização e denúncias contra usuários/pets/ONGs *(em evolução)*.
- 📚 **Documentação interativa** da API via Swagger em `/docs`.

---

## Modelo de dados

Diagrama de entidades e relacionamentos (fonte: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)).

```mermaid
erDiagram
    Organization ||--o{ User : "possui"
    Organization ||--o{ Pet : "abriga"
    User ||--o{ Pet : "cadastra"
    User ||--o{ AdoptionRequest : "solicita"
    Pet  ||--o{ AdoptionRequest : "recebe"
    AdoptionRequest ||--o| ResponsibilityTerm : "gera"
    User ||--o{ ResponsibilityTermSignature : "assina"
    Pet  ||--o{ ResponsibilityTermSignature : "consta em"
    AdoptionRequest ||--o{ ResponsibilityTermSignature : "vincula"
    User ||--o{ RescueHelpRequest : "abre"
    Pet  ||--o{ RescueHelpRequest : "envolve"
    User ||--o{ Report : "registra"
    Pet  ||--o{ Report : "pode ser alvo"
    Organization ||--o{ Report : "pode ser alvo"

    User {
        string id PK
        string fullName
        string email UK
        UserRole role
        string organizationId FK
        boolean isActive
    }
    Organization {
        string id PK
        string legalName
        string email UK
        string cnpj UK
        boolean isVerified
    }
    Pet {
        string id PK
        string name
        Species species
        Sex sex
        PetStatus status
        string registeredById FK
        string organizationId FK
    }
    AdoptionRequest {
        string id PK
        AdoptionRequestStatus status
        string petId FK
        string requesterId FK
        datetime reviewedAt
    }
    ResponsibilityTerm {
        string id PK
        string adoptionRequestId FK
        string adopterIp
        datetime acceptedAt
    }
    ResponsibilityTermSignature {
        string id PK
        string termVersion
        string userId FK
        string petId FK
        string adoptionRequestId FK
    }
    RescueHelpRequest {
        string id PK
        string title
        RescueHelpRequestStatus status
        string requestedById FK
        string petId FK
    }
    Report {
        string id PK
        ReportTargetType targetType
        ReportStatus status
        string reportedById FK
    }
```

> Diagrama de classes mais detalhado em [`backend/docs/diagrama-de-classes.md`](backend/docs/diagrama-de-classes.md).

---

## Arquitetura e stack

O frontend conversa com o backend via um **rewrite** (`/api-backend/*` → `http://localhost:3000/*`, configurado em [`frontend/next.config.ts`](frontend/next.config.ts)); o backend persiste os dados no MySQL via Prisma.

```
Navegador ──▶ Frontend (Next.js :3001) ──/api-backend──▶ Backend (NestJS :3000) ──▶ MySQL (:3306)
```

| Camada | Tecnologias |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, React Hook Form + Zod, lucide-react |
| **Backend** | NestJS 11, Prisma 6, JWT + Passport, Bcrypt, class-validator, Swagger |
| **Banco** | MySQL 8 |
| **Infra** | Docker / Docker Compose, GitHub Actions (CI), Node 22 |

> ⚠️ O frontend usa uma **versão modificada do Next.js** — antes de alterar o código do front, leia [`frontend/AGENTS.md`](frontend/AGENTS.md).

---

## Estrutura do monorepo

```
adotapet-monorepo/
├── backend/             # API REST — NestJS + Prisma + MySQL
│   ├── src/             #   módulos: auth, users, organizations, pets, adoptions, responsibility-terms
│   ├── prisma/          #   schema, migrations e seed
│   ├── test/            #   testes de integração e e2e
│   ├── docs/            #   diagrama de classes, fluxo de adoção, histórias, matriz de permissões
│   └── Dockerfile
├── frontend/            # Aplicação web — Next.js (App Router) + React + Tailwind
│   ├── src/app/         #   rotas/páginas
│   ├── src/components/  #   componentes (layout, home, ui, pets)
│   ├── src/services/    #   cliente HTTP da API + normalização
│   ├── src/contexts/    #   AuthContext (JWT)
│   └── Dockerfile
├── .github/workflows/   # Pipelines de CI (unit + e2e, back e front)
└── docker-compose.yml   # Orquestração: mysql + backend + frontend
```

---

## Como rodar

### Pré-requisitos

- **Docker** + **Docker Compose** (caminho recomendado).
- Para rodar localmente sem containers: **Node.js 22**.

### Opção A — Docker Compose (recomendado)

Na raiz do projeto:

```bash
# Subir tudo de uma vez (banco + backend + frontend)
docker compose up -d --build
```

Ou subir **serviço a serviço**, na ordem de dependência:

```bash
docker compose up -d mysql                # 1) banco de dados
docker compose up -d --build backend      # 2) API (aplica as migrations do Prisma na subida)
docker compose up -d --build frontend     # 3) aplicação web
```

Comandos úteis:

```bash
docker compose ps                 # status dos containers
docker compose logs -f backend    # acompanhar logs de um serviço
docker compose down               # derrubar tudo (mantém os dados do banco)
docker compose down -v            # derrubar tudo e apagar o volume do MySQL
```

### Opção B — Local (sem Docker)

**Backend:**

```bash
cd backend
npm install
# crie um arquivo .env (veja a seção "Variáveis de ambiente")
npx prisma generate
npx prisma migrate dev
npm run seed          # opcional: popula um admin + pets de exemplo
npm run start:dev     # API em http://localhost:3000
```

**Frontend** (em outro terminal):

```bash
cd frontend
npm install
npm run dev -- -p 3001   # web em http://localhost:3001
```

> O frontend roda em **:3001** para não conflitar com a API (**:3000**) e casar com o rewrite `/api-backend → localhost:3000`.

### Portas e URLs

| Serviço | URL | Porta (host → container) |
|---|---|---|
| Frontend (web) | http://localhost:3001 | 3001 → 3000 |
| Backend (API) | http://localhost:3000 | 3000 → 3000 |
| Swagger (docs da API) | http://localhost:3000/docs | — |
| MySQL | localhost:3306 | 3306 → 3306 |

### Acesso de teste

Após rodar o seed (`npm run seed`), há um usuário administrador:

- **E-mail:** `admin@adotapet.com`
- **Senha:** `senha123`

### Troubleshooting

- **Porta 3306 ocupada / MySQL não sobe (`bind: address already in use`):** você provavelmente tem um **MySQL instalado localmente** usando a 3306. Solução: no `docker-compose.yml`, mapeie o serviço `mysql` para outra porta no **host** — por exemplo `"3307:3306"` (host:container) — e aponte suas ferramentas para essa porta. A comunicação **entre containers** continua em `mysql:3306`, então **não** altere a porta na `DATABASE_URL` do `docker-compose.yml`.
- **Backend reiniciando com `P1001: Can't reach database server`:** confirme que a `DATABASE_URL` do Compose aponta para `mysql:3306` (host interno do Docker), e não para `3307`.
- **DBeaver: `Public Key Retrieval is not allowed`:** nas *Driver properties* da conexão, defina `allowPublicKeyRetrieval=true` e `useSSL=false`. Conecte em `localhost:3306` (ou na porta que você mapeou no host), usuário `root`, senha `root`, database `adotapet`.

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Conexão MySQL para o Prisma | Local: `mysql://root:root@localhost:3306/adotapet`<br>Docker: `mysql://root:root@mysql:3306/adotapet` |
| `JWT_SECRET` | Segredo para assinar os tokens JWT | `troque_em_producao` |
| `PORT` | Porta da API | `3000` |
| `FRONTEND_URL` | URL usada no link de recuperação de senha | `http://localhost:3001` |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Validade do token de recuperação | `30` |
| `SMTP_HOST` | Servidor SMTP responsável pelo envio | `smtp.gmail.com` |
| `SMTP_PORT` | Porta do servidor SMTP | `587` |
| `SMTP_SECURE` | Usa TLS direto, normalmente na porta 465 | `false` |
| `SMTP_USER` | Usuário da conta SMTP | `seu-email@gmail.com` |
| `SMTP_PASS` | Senha de aplicativo ou credencial SMTP | `sua-senha-de-aplicativo` |
| `SMTP_FROM` | Remetente exibido no e-mail | `AdotaPet <seu-email@gmail.com>` |

No Docker Compose essas variáveis já vêm definidas no serviço `backend`.

### Frontend

Atualmente o frontend **não depende de `.env`**: a URL da API é resolvida pelo rewrite em [`frontend/next.config.ts`](frontend/next.config.ts) (`/api-backend` → `http://localhost:3000`).

Use [`backend/.env.example`](backend/.env.example) como modelo, sem versionar credenciais reais.

---

## Principais endpoints da API

Documentação interativa completa no **Swagger**: http://localhost:3000/docs
(passo a passo de autenticação em [`backend/GUIA_SWAGGER_FRONTEND.md`](backend/GUIA_SWAGGER_FRONTEND.md)).

| Módulo | Método | Rota | Proteção |
|---|---|---|---|
| **Auth** | POST | `/auth/login` | Pública |
| **Users** | POST | `/users` | Pública |
| | GET | `/users` | JWT · `ADMIN` |
| | GET / PATCH / DELETE | `/users/:id` | JWT |
| **Organizations** | POST | `/organizations/register` | Pública |
| | GET | `/organizations` · `/organizations/:id` | Pública |
| | GET / PATCH | `/organizations/me` | JWT |
| | POST / PATCH / DELETE | `/organizations(/:id)` | JWT · `ADMIN`/`ONG_ADMIN` |
| **Pets** | GET | `/pets` · `/pets/:id` | Pública |
| | POST / PATCH / DELETE | `/pets(/:id)` | JWT (dono ou ONG) |
| | POST | `/pets/:id/photo` | JWT |
| **Adoptions** | POST | `/adoptions` | JWT |
| | GET | `/adoptions/my-requests` · `/adoptions/received` | JWT |
| | PATCH | `/adoptions/:id/status` | JWT |
| **Responsibility Terms** | POST | `/responsibility-terms/:adoptionRequestId/sign` | JWT · `ADOPTER` |

---

## Testes

**Backend** (em `backend/`):

```bash
npm run test              # unitários
npm run test:integration  # integração
npm run test:e2e          # ponta a ponta
npm run test:cov          # cobertura
```

**Frontend** (em `frontend/`):

```bash
npm run test           # unitários (Jest + Testing Library)
npm run test:coverage  # cobertura
npm run cypress:open   # E2E (Cypress)
```

---

## CI/CD

Pipelines em [`.github/workflows/`](.github/workflows) (GitHub Actions). Cada pipeline dispara apenas quando há mudanças na sua área (`backend/**` ou `frontend/**`):

| Workflow | Dispara em | O que faz |
|---|---|---|
| `pipeline_unit_backend` | `backend/**` | Build + testes unitários (com cobertura) |
| `pipeline_e2e_backend` | `backend/**` | Sobe um MySQL de serviço, aplica migrations e roda os testes e2e |
| `pipeline_front_unit_frontend` | `frontend/**` | Build + testes unitários (Jest) |
| `pipeline_front_e2e_frontend` | `frontend/**` | Build, sobe a aplicação e roda os testes Cypress |

---

## Documentação complementar

- [`backend/README.md`](backend/README.md) — visão detalhada do backend.
- [`backend/GUIA_INTERNO_BACKEND.md`](backend/GUIA_INTERNO_BACKEND.md) — arquitetura, tratamento de erros e padrões de módulos.
- [`backend/GUIA_SWAGGER_FRONTEND.md`](backend/GUIA_SWAGGER_FRONTEND.md) — como o frontend testa a API pelo Swagger.
- [`backend/docs/diagrama-de-classes.md`](backend/docs/diagrama-de-classes.md) · [`fluxo-adocao.md`](backend/docs/fluxo-adocao.md) · [`historias-de-usuario.md`](backend/docs/historias-de-usuario.md) · [`matriz-permissoes.md`](backend/docs/matriz-permissoes.md)
- [`frontend/AGENTS.md`](frontend/AGENTS.md) — aviso sobre a versão modificada do Next.js.

---

## Equipe

| Área | Responsáveis |
|---|---|
| Backend | Roger · Rodrigo |
| Frontend | Lucas · Lilyan |
| DevOps | Breno |

Gestão de tarefas via Trello (sprints).

---

## Licença

Projeto acadêmico para fins educacionais — **S204 / INATEL (2026/1)**.
