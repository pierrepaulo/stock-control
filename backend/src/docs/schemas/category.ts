export const categorySchemas = {
  CreateCategoryRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Bebidas" },
    },
    required: ["name"],
  },
  UpdateCategoryRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Bebidas Geladas" },
    },
  },
  CategoryResponse: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      name: { type: "string", example: "Bebidas" },
      deletedAt: {
        oneOf: [
          { $ref: "#/components/schemas/DateTimeString" },
          { type: "null", nullable: true },
        ],
        example: null,
      },
      createdAt: { $ref: "#/components/schemas/DateTimeString" },
      updatedAt: { $ref: "#/components/schemas/DateTimeString" },
    },
    required: ["id", "name", "deletedAt", "createdAt", "updatedAt"],
  },
  CategoryWithCountResponse: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      name: { type: "string", example: "Bebidas" },
      createdAt: { $ref: "#/components/schemas/DateTimeString" },
      productCount: { type: "integer", minimum: 0, example: 5 },
    },
    required: ["id", "name", "createdAt", "productCount"],
  },
  CategorySingleResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: { $ref: "#/components/schemas/CategoryResponse" },
    },
    required: ["error", "data"],
  },
  CategoryListResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "array",
        items: {
          oneOf: [
            { $ref: "#/components/schemas/CategoryResponse" },
            { $ref: "#/components/schemas/CategoryWithCountResponse" },
          ],
        },
      },
    },
    required: ["error", "data"],
  },
};

export const categoryPaths = {
  "/categories": {
    post: {
      tags: ["Categories"],
      summary: "Cria categoria",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateCategoryRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Categoria criada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategorySingleResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao ou categoria duplicada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Categoria ja existe", data: null },
            },
          },
        },
        401: {
          description: "Nao autorizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedError" },
            },
          },
        },
        500: {
          description: "Erro interno",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InternalError" },
            },
          },
        },
      },
    },
    get: {
      tags: ["Categories"],
      summary: "Lista categorias",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "includeProductCount",
          in: "query",
          required: false,
          schema: { type: "boolean", default: false },
          description: "Quando true, retorna productCount por categoria.",
        },
      ],
      responses: {
        200: {
          description: "Lista de categorias",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryListResponse" },
            },
          },
        },
        401: {
          description: "Nao autorizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedError" },
            },
          },
        },
        500: {
          description: "Erro interno",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InternalError" },
            },
          },
        },
      },
    },
  },
  "/categories/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Busca categoria por ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UuidParam" },
        },
      ],
      responses: {
        200: {
          description: "Categoria encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategorySingleResponse" },
            },
          },
        },
        401: {
          description: "Nao autorizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedError" },
            },
          },
        },
        404: {
          description: "Categoria nao encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Categoria nao encontrada", data: null },
            },
          },
        },
        500: {
          description: "Erro interno",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InternalError" },
            },
          },
        },
      },
    },
    put: {
      tags: ["Categories"],
      summary: "Atualiza categoria",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UuidParam" },
        },
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCategoryRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Categoria atualizada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategorySingleResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
            },
          },
        },
        401: {
          description: "Nao autorizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedError" },
            },
          },
        },
        404: {
          description: "Categoria nao encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Categoria nao encontrada", data: null },
            },
          },
        },
        500: {
          description: "Erro interno",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InternalError" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Categories"],
      summary: "Deleta categoria (soft delete)",
      description:
        "Falha se a categoria possuir produtos ativos vinculados.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { $ref: "#/components/schemas/UuidParam" },
        },
      ],
      responses: {
        200: {
          description: "Categoria deletada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiSuccessNull" },
            },
          },
        },
        401: {
          description: "Nao autorizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnauthorizedError" },
            },
          },
        },
        404: {
          description: "Categoria nao encontrada ou com produtos associados",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                error: "Nao e possivel excluir uma categoria com produtos",
                data: null,
              },
            },
          },
        },
        500: {
          description: "Erro interno",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InternalError" },
            },
          },
        },
      },
    },
  },
};
