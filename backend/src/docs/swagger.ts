import swaggerUi from "swagger-ui-express";
import { commonSchemas } from "./schemas/common";
import { authPaths, authSchemas } from "./schemas/auth";
import { userPaths, userSchemas } from "./schemas/user";
import { categoryPaths, categorySchemas } from "./schemas/category";
import { productPaths, productSchemas } from "./schemas/product";
import { movePaths, moveSchemas } from "./schemas/move";
import { dashboardPaths, dashboardSchemas } from "./schemas/dashboard";

const port = process.env.PORT ?? "3000";
const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;
const apiServerUrl = `${baseUrl.replace(/\/+$/, "")}/api`;

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Stock Control API",
    version: "0.1.0",
    description:
      "API REST para controle de estoque com autenticacao, CRUD de entidades, movimentacoes e dashboard.",
    contact: {
      name: "Stock Control Team",
    },
  },
  servers: [
    {
      url: apiServerUrl,
      description:
        process.env.NODE_ENV === "production"
          ? "Servidor de producao"
          : "Servidor de desenvolvimento",
    },
  ],
  tags: [
    { name: "Health", description: "Health check da API" },
    { name: "Auth", description: "Autenticacao e sessao" },
    { name: "Users", description: "Gestao de usuarios" },
    { name: "Categories", description: "Gestao de categorias" },
    { name: "Products", description: "Gestao de produtos" },
    { name: "Moves", description: "Movimentacoes de estoque" },
    { name: "Dashboard", description: "Relatorios e indicadores" },
  ],
  paths: {
    "/ping": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "API online",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PingResponse" },
              },
            },
          },
        },
      },
    },
    ...authPaths,
    ...userPaths,
    ...categoryPaths,
    ...productPaths,
    ...movePaths,
    ...dashboardPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "token",
        description: "Use o token retornado em /auth/login no formato Bearer <token>",
      },
    },
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...userSchemas,
      ...categorySchemas,
      ...productSchemas,
      ...moveSchemas,
      ...dashboardSchemas,
    },
  },
};

export { swaggerUi };
