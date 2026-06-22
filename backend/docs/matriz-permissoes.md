# Matriz de Permissoes

Este documento descreve o nivel de acesso das rotas atuais do backend AdotaPet.

## Legenda

| Termo | Significado |
| --- | --- |
| Publica | Nao exige token JWT |
| JWT | Exige usuario autenticado |
| RBAC | Exige papel especifico do usuario |
| Ownership | Exige que o usuario seja dono/responsavel pelo recurso |

## Rotas Gerais

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| GET | `/` | Publica | Rota de prova de vida da aplicacao |
| GET | `/docs` | Publica | Swagger da API |
| GET | `/uploads/*` | Publica | Arquivos estaticos publicados pela aplicacao |

## Auth

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| POST | `/auth/login` | Publica | Autentica email e senha e retorna JWT com `organizationId` quando existir |
| POST | `/auth/forgot-password` | Publica | Valida o email cadastrado e envia um link temporario de recuperacao |
| POST | `/auth/reset-password` | Publica | Consome token de uso unico e grava a nova senha com hash |

## Users

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| POST | `/users` | Publica | Cria novo usuario |
| GET | `/users` | JWT + RBAC | Apenas `ADMIN` |
| GET | `/users/:id` | Publica | Busca usuario por id sem retornar senha |
| PATCH | `/users/:id` | Publica | Atualiza usuario por id |
| DELETE | `/users/:id` | JWT | Remove usuario por id |

## Pets

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| POST | `/pets` | JWT | Cria pet vinculado ao usuario autenticado e, se for `ONG_ADMIN`, a organizacao do usuario |
| POST | `/pets/:id/photo` | JWT + Ownership | Apenas quem cadastrou o pet pode enviar foto |
| GET | `/pets` | Publica | Lista pets com filtros opcionais |
| GET | `/pets/:id` | Publica | Busca pet por id |
| PATCH | `/pets/:id` | JWT + Ownership | Apenas quem cadastrou o pet pode alterar |
| DELETE | `/pets/:id` | JWT + Ownership | Apenas quem cadastrou o pet pode remover |

## Organizations

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| POST | `/organizations/register` | Publica | Cria usuario `ONG_ADMIN`, organizacao e vinculo entre eles |
| POST | `/organizations` | JWT + RBAC | Apenas `ADMIN` ou `ONG_ADMIN` |
| GET | `/organizations` | Publica | Lista organizacoes |
| GET | `/organizations/me` | JWT | Busca a organizacao vinculada ao usuario autenticado |
| GET | `/organizations/:id` | Publica | Busca organizacao por id |
| PATCH | `/organizations/me` | JWT | Atualiza a organizacao vinculada ao usuario autenticado |
| PATCH | `/organizations/:id` | JWT + RBAC | Apenas `ADMIN` ou `ONG_ADMIN` |
| DELETE | `/organizations/:id` | JWT + RBAC | Apenas `ADMIN` ou `ONG_ADMIN` |

## Adoptions

Todas as rotas de adocao exigem JWT.

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| POST | `/adoptions` | JWT | Cria solicitacao para pet disponivel |
| GET | `/adoptions/my-requests` | JWT | Lista solicitacoes criadas pelo usuario autenticado |
| GET | `/adoptions/received` | JWT | Lista solicitacoes recebidas em pets cadastrados pelo usuario autenticado |
| PATCH | `/adoptions/:id/status` | JWT + Ownership | Apenas o responsavel pelo pet pode alterar status da solicitacao |

## Responsibility Terms

| Metodo | Rota | Acesso | Regra |
| --- | --- | --- | --- |
| POST | `/responsibility-terms/:adoptionRequestId/sign` | JWT + RBAC | Apenas usuario `ADOPTER` |
