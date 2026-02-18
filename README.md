# Stock Control

Sistema completo de gerenciamento de estoque com controle de produtos, categorias, movimentações e dashboard analítico.

## Funcionalidades

- **Dashboard analítico** — valor total do estoque, resumo de movimentações, gráfico de entradas/saídas, alertas de estoque baixo e produtos estagnados
- **Gestão de produtos** — CRUD completo com busca, tipos de unidade (kg, g, l, ml, un) e limites de quantidade (mínimo/máximo)
- **Gestão de categorias** — CRUD com contagem de produtos por categoria
- **Movimentações de estoque** — entradas e saídas com atualização automática de quantidades (transação segura)
- **Gestão de usuários** — CRUD com papéis (admin/usuário), upload de avatar com redimensionamento
- **Autenticação** — login/logout com token Bearer armazenado no banco
- **Dark mode** e design responsivo
- **Documentação Swagger** — disponível em `/api/docs`
- **103 testes automatizados** — unitários, integração e E2E
- **CI/CD** com GitHub Actions

## Tech Stack

| Backend | Frontend |
|---|---|
| Node.js 20+ | Next.js 16 (App Router) |
| Express 5 | React 19 |
| TypeScript 5 | TypeScript 5 |
| Drizzle ORM | TanStack React Query 5 |
| PostgreSQL 16 | React Hook Form 7 + Zod 4 |
| Zod 4 | Tailwind CSS 4 |
| Vitest 4 + Testcontainers | shadcn/ui + Radix UI |
| Swagger UI | Recharts 3 |
| Sharp + Multer | Axios |
| Bcrypt | date-fns |

## Arquitetura

Monorepo com dois diretórios principais:

```
stock-control/
├── backend/    → API REST (Express 5)
└── frontend/   → Interface web (Next.js 16)
```

**Backend:** Routes → Controllers → Services → Drizzle ORM → PostgreSQL

**Frontend:** Pages (App Router) → Hooks (React Query) → Services (Axios) → API

**Autenticação:** Token Bearer gerado no login, armazenado na tabela `users` e no `localStorage` do cliente. Enviado via header `Authorization: Bearer <token>`.

**Soft-delete:** Todas as entidades (usuários, categorias, produtos) usam o campo `deletedAt` em vez de exclusão física.

## Começando

### Pré-requisitos

- Node.js 20+
- Docker (para o PostgreSQL)
- npm

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd stock-control

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### Configuração

```bash
# Backend - copiar e editar variáveis de ambiente
cp backend/.env.example backend/.env

# Frontend - copiar e editar variáveis de ambiente
cp frontend/.env.example frontend/.env.local
```

### Executando

```bash
# 1. Subir o banco de dados
cd backend
docker compose up -d

# 2. Aplicar o schema no banco
npm run db:push

# 3. Iniciar o backend (porta 3001)
npm run dev

# 4. Em outro terminal, iniciar o frontend (porta 3000)
cd frontend
npm run dev
```

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor | `3001` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:postgres@localhost:5432/stockcontrol` |
| `BASE_URL` | URL base do servidor | `http://localhost:3001` |

### Frontend (`frontend/.env.local`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:3001/api` |

## Scripts

### Backend

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (com hot reload) |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia o servidor compilado em produção |
| `npm run db:generate` | Gera migrations do Drizzle |
| `npm run db:migrate` | Executa migrations pendentes |
| `npm run db:push` | Sincroniza o schema diretamente no banco |
| `npm run db:studio` | Abre o Drizzle Studio (interface visual do banco) |
| `npm test` | Executa todos os testes |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:unit` | Executa apenas testes unitários |
| `npm run test:integration` | Executa apenas testes de integração |
| `npm run test:e2e` | Executa apenas testes E2E |
| `npm run test:coverage` | Executa testes com relatório de cobertura |

### Frontend

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o Next.js em modo desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |

## Estrutura do Projeto

### Backend (`backend/src/`)

```
src/
├── app.ts                    # Configuração do Express
├── server.ts                 # Ponto de entrada
├── controllers/
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── dashboard.controller.ts
│   ├── move.controller.ts
│   ├── product.controller.ts
│   └── user.controller.ts
├── db/
│   ├── connection.ts
│   └── schema/
│       ├── index.ts
│       ├── categories.ts
│       ├── moves.ts
│       ├── products.ts
│       └── users.ts
├── docs/
│   ├── swagger.ts
│   └── schemas/
│       ├── auth.ts
│       ├── category.ts
│       ├── common.ts
│       ├── dashboard.ts
│       ├── move.ts
│       ├── product.ts
│       └── user.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── upload.middleware.ts
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── category.routes.ts
│   ├── dashboard.routes.ts
│   ├── move.routes.ts
│   ├── product.routes.ts
│   └── user.routes.ts
├── services/
│   ├── category.service.ts
│   ├── dashboard.service.ts
│   ├── file.service.ts
│   ├── move.service.ts
│   ├── product.service.ts
│   └── user.service.ts
├── types/
│   └── express.d.ts
├── utils/
│   └── apperror.ts
└── validators/
    ├── auth.validator.ts
    ├── category.validator.ts
    ├── dashboard.validator.ts
    ├── move.validator.ts
    ├── product.validator.ts
    └── user.validator.ts
```

### Frontend (`frontend/src/`)

```
src/
├── app/
│   ├── layout.tsx            # Layout raiz
│   ├── (auth)/               # Grupo de autenticação
│   │   └── login/            # Página de login
│   └── (dashboard)/          # Grupo protegido (com sidebar)
│       ├── categorias/
│       ├── movimentacoes/
│       ├── produtos/
│       └── usuarios/
├── components/
│   ├── ui/                   # Componentes shadcn/ui
│   ├── layout/               # Sidebar, Header, User Nav
│   ├── dashboard/            # Cards, gráficos, alertas
│   ├── shared/               # Componentes reutilizáveis
│   ├── categories/           # CRUD de categorias
│   ├── products/             # CRUD de produtos
│   ├── users/                # CRUD de usuários
│   └── moves/                # Listagem de movimentações
├── contexts/                 # AuthContext
├── hooks/                    # Hooks React Query por recurso
├── lib/                      # API client, formatação, utils
├── services/                 # Camada de serviço (Axios)
└── types/                    # Definições TypeScript
```

## API

Todos os endpoints (exceto Auth e Health) requerem o header `Authorization: Bearer <token>`.

Base URL: `http://localhost:3001/api`

### Auth

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autenticação do usuário |
| `POST` | `/auth/logout` | Encerrar sessão |
| `GET` | `/auth/me` | Dados do usuário autenticado |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/users` | Criar usuário |
| `GET` | `/users` | Listar usuários |
| `GET` | `/users/:id` | Buscar usuário por ID |
| `PUT` | `/users/:id` | Atualizar usuário (com avatar) |
| `DELETE` | `/users/:id` | Remover usuário (soft-delete) |

### Categorias

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/categories` | Criar categoria |
| `GET` | `/categories` | Listar categorias |
| `GET` | `/categories/:id` | Buscar categoria por ID |
| `PUT` | `/categories/:id` | Atualizar categoria |
| `DELETE` | `/categories/:id` | Remover categoria (soft-delete) |

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/products` | Criar produto |
| `GET` | `/products` | Listar produtos |
| `GET` | `/products/:id` | Buscar produto por ID |
| `PUT` | `/products/:id` | Atualizar produto |
| `DELETE` | `/products/:id` | Remover produto (soft-delete) |

### Movimentações

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/moves` | Registrar movimentação (entrada/saída) |
| `GET` | `/moves` | Listar movimentações |

### Dashboard

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/dashboard/inventory-value` | Valor total do estoque |
| `GET` | `/dashboard/moves-summary` | Resumo de movimentações |
| `GET` | `/dashboard/moves-graph` | Dados para gráfico de movimentações |
| `GET` | `/dashboard/low-stock` | Produtos com estoque baixo |
| `GET` | `/dashboard/stagnant-products` | Produtos sem movimentação recente |

### Health Check

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/ping` | Verificação de saúde do servidor |

## Banco de Dados

### Schema

O banco possui 4 tabelas principais:

#### `users`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária (auto-gerado) |
| `name` | TEXT | Nome do usuário |
| `email` | TEXT | Email (único) |
| `password` | TEXT | Senha (hash bcrypt) |
| `avatar` | TEXT | Caminho do avatar (opcional) |
| `isAdmin` | BOOLEAN | Papel de administrador (default: false) |
| `token` | TEXT | Token de autenticação (opcional) |
| `deletedAt` | TIMESTAMP | Soft-delete |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

#### `categories`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária (auto-gerado) |
| `name` | TEXT | Nome da categoria |
| `deletedAt` | TIMESTAMP | Soft-delete |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

#### `products`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária (auto-gerado) |
| `name` | TEXT | Nome do produto |
| `categoryId` | UUID | FK → categories.id |
| `unitPrice` | INTEGER | Preço unitário (em centavos) |
| `unitType` | ENUM | Tipo de unidade (kg, g, l, ml, un) |
| `quantity` | NUMERIC | Quantidade atual (default: 0) |
| `minimumQuantity` | NUMERIC | Quantidade mínima (default: 0) |
| `maximumQuantity` | NUMERIC | Quantidade máxima (default: 0) |
| `deletedAt` | TIMESTAMP | Soft-delete |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

#### `moves`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária (auto-gerado) |
| `productId` | UUID | FK → products.id |
| `userId` | UUID | FK → users.id |
| `type` | ENUM | Tipo (in = entrada, out = saída) |
| `quantity` | NUMERIC | Quantidade movimentada |
| `unitPrice` | INTEGER | Preço unitário no momento (em centavos) |
| `createdAt` | TIMESTAMP | Data da movimentação |

### Relacionamentos

```
users ─────────┐
               │ userId
categories     ▼
  │         moves
  │ categoryId ▲
  │            │ productId
  ▼            │
products ──────┘
```

- Um **usuário** pode registrar várias **movimentações**
- Uma **categoria** possui vários **produtos**
- Um **produto** possui várias **movimentações**
- **Soft-delete** em users, categories e products (campo `deletedAt`)

## Testes

### Visão Geral

| Tipo | Quantidade | Descrição |
|---|---|---|
| Unitários | 37 | Validators, middlewares, utils, file service |
| Integração | 48 | Services com banco real (Testcontainers) |
| E2E | 18 | Fluxos completos via HTTP (Supertest) |
| **Total** | **103** | |

### Ferramentas

- **Vitest 4** — framework de testes
- **Testcontainers** — PostgreSQL 16-alpine em container Docker para testes de integração e E2E
- **Supertest** — requisições HTTP para testes E2E
- **Cobertura** — threshold mínimo de 80% (provider v8)

### Executando

```bash
cd backend

# Todos os testes
npm test

# Por tipo
npm run test:unit
npm run test:integration
npm run test:e2e

# Com cobertura
npm run test:coverage
```

### CI/CD

O pipeline do GitHub Actions (`.github/workflows/test.yml`) possui 3 jobs:

1. **unit-tests** — executa testes unitários
2. **integration-and-e2e** — executa testes de integração e E2E (requer Docker)
3. **coverage** — gera relatório de cobertura e valida threshold de 80%
