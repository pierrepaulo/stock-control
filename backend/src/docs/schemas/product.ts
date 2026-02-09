export const productSchemas = {
  UnitType: {
    type: "string",
    enum: ["kg", "g", "l", "ml", "un"],
    example: "un",
  },
  CreateProductRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Coca-Cola 2L" },
      categoryId: { $ref: "#/components/schemas/UuidParam" },
      unitPrice: {
        type: "integer",
        minimum: 0,
        example: 899,
        description: "Preco unitario em centavos.",
      },
      unitType: { $ref: "#/components/schemas/UnitType" },
      quantity: {
        type: "number",
        minimum: 0,
        default: 0,
        example: 50,
      },
      minimumQuantity: {
        type: "number",
        minimum: 0,
        default: 0,
        example: 10,
      },
      maximumQuantity: {
        type: "number",
        minimum: 0,
        default: 0,
        example: 100,
      },
    },
    required: ["name", "categoryId", "unitPrice", "unitType"],
    description:
      "Regra: maximumQuantity precisa ser maior ou igual a minimumQuantity.",
  },
  UpdateProductRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Coca-Cola Zero 2L" },
      categoryId: { $ref: "#/components/schemas/UuidParam" },
      unitPrice: { type: "integer", minimum: 0, example: 950 },
      unitType: { $ref: "#/components/schemas/UnitType" },
      quantity: { type: "number", minimum: 0, example: 40 },
      minimumQuantity: { type: "number", minimum: 0, example: 8 },
      maximumQuantity: { type: "number", minimum: 0, example: 120 },
    },
  },
  ProductResponse: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      name: { type: "string", example: "Coca-Cola 2L" },
      categoryId: { $ref: "#/components/schemas/UuidParam" },
      unitPrice: { type: "integer", example: 899 },
      unitType: { $ref: "#/components/schemas/UnitType" },
      quantity: { $ref: "#/components/schemas/NumericString" },
      minimumQuantity: { $ref: "#/components/schemas/NumericString" },
      maximumQuantity: { $ref: "#/components/schemas/NumericString" },
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
    required: [
      "id",
      "name",
      "categoryId",
      "unitPrice",
      "unitType",
      "quantity",
      "minimumQuantity",
      "maximumQuantity",
      "deletedAt",
      "createdAt",
      "updatedAt",
    ],
  },
  ProductListItem: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      name: { type: "string", example: "Coca-Cola 2L" },
      categoryId: { $ref: "#/components/schemas/UuidParam" },
      categoryName: { type: "string", example: "Bebidas" },
      unitPrice: { type: "integer", example: 899 },
      unitType: { $ref: "#/components/schemas/UnitType" },
      quantity: { $ref: "#/components/schemas/NumericString" },
      minimumQuantity: { $ref: "#/components/schemas/NumericString" },
      maximumQuantity: { $ref: "#/components/schemas/NumericString" },
      createdAt: { $ref: "#/components/schemas/DateTimeString" },
      updatedAt: { $ref: "#/components/schemas/DateTimeString" },
    },
    required: [
      "id",
      "name",
      "categoryId",
      "categoryName",
      "unitPrice",
      "unitType",
      "quantity",
      "minimumQuantity",
      "maximumQuantity",
      "createdAt",
      "updatedAt",
    ],
  },
  ProductSingleResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        oneOf: [
          { $ref: "#/components/schemas/ProductResponse" },
          { $ref: "#/components/schemas/ProductListItem" },
        ],
      },
    },
    required: ["error", "data"],
  },
  ProductListResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductListItem" },
      },
    },
    required: ["error", "data"],
  },
};

export const productPaths = {
  "/products": {
    post: {
      tags: ["Products"],
      summary: "Cria produto",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateProductRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Produto criado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSingleResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
              example: {
                error:
                  "Quantidade maxima deve ser maior ou igual a quantidade minima",
                data: null,
              },
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
    get: {
      tags: ["Products"],
      summary: "Lista produtos",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "name",
          in: "query",
          required: false,
          schema: { type: "string", minLength: 2 },
          description: "Filtro por nome (busca case-insensitive).",
          example: "coca",
        },
        {
          name: "offset",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 0, default: 0 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, default: 10 },
        },
      ],
      responses: {
        200: {
          description: "Lista de produtos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductListResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao em query params",
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
  "/products/{id}": {
    get: {
      tags: ["Products"],
      summary: "Busca produto por ID",
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
          description: "Produto encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSingleResponse" },
            },
          },
        },
        400: {
          description: "ID invalido",
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
          description: "Produto nao encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Produto nao encontrado", data: null },
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
      tags: ["Products"],
      summary: "Atualiza produto",
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
            schema: { $ref: "#/components/schemas/UpdateProductRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Produto atualizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductSingleResponse" },
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
          description: "Produto ou categoria nao encontrados",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Produto nao encontrado", data: null },
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
      tags: ["Products"],
      summary: "Deleta produto (soft delete)",
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
          description: "Produto deletado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiSuccessNull" },
            },
          },
        },
        400: {
          description: "ID invalido",
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
          description: "Produto nao encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Produto nao encontrado", data: null },
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
