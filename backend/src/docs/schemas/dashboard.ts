export const dashboardSchemas = {
  DateRangeQuery: {
    type: "object",
    properties: {
      startDate: {
        type: "string",
        format: "date-time",
        example: "2026-02-01T00:00:00.000Z",
        description: "Data inicial em formato ISO 8601.",
      },
      endDate: {
        type: "string",
        format: "date-time",
        example: "2026-02-09T23:59:59.999Z",
        description: "Data final em formato ISO 8601.",
      },
    },
  },
  InventoryValueResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "object",
        properties: {
          totalValue: {
            type: "number",
            example: 1500000,
            description: "Valor total do inventario em centavos.",
          },
        },
        required: ["totalValue"],
      },
    },
    required: ["error", "data"],
  },
  MovesSummaryBucket: {
    type: "object",
    properties: {
      value: { type: "number", example: 500000 },
      count: { type: "number", example: 25 },
    },
    required: ["value", "count"],
  },
  MovesSummaryResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "object",
        properties: {
          in: { $ref: "#/components/schemas/MovesSummaryBucket" },
          out: { $ref: "#/components/schemas/MovesSummaryBucket" },
        },
        required: ["in", "out"],
      },
    },
    required: ["error", "data"],
  },
  MovesGraphItem: {
    type: "object",
    properties: {
      date: { type: "string", example: "2026-02-03" },
      totalValue: { type: "number", example: 58000 },
    },
    required: ["date", "totalValue"],
  },
  MovesGraphResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/MovesGraphItem" },
      },
    },
    required: ["error", "data"],
  },
  StockProduct: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      name: { type: "string", example: "Produto sem saida" },
      categoryId: { $ref: "#/components/schemas/UuidParam" },
      unitPrice: { type: "integer", example: 1500 },
      unitType: { type: "string", enum: ["kg", "g", "l", "ml", "un"] },
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
  StockProductListResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/StockProduct" },
      },
    },
    required: ["error", "data"],
  },
};

export const dashboardPaths = {
  "/dashboard/inventory-value": {
    get: {
      tags: ["Dashboard"],
      summary: "Retorna valor total do inventario",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Valor total calculado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventoryValueResponse" },
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
  "/dashboard/moves-summary": {
    get: {
      tags: ["Dashboard"],
      summary: "Resumo de entradas e saidas",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "startDate",
          in: "query",
          required: false,
          schema: { type: "string", format: "date-time" },
          example: "2026-02-01T00:00:00.000Z",
        },
        {
          name: "endDate",
          in: "query",
          required: false,
          schema: { type: "string", format: "date-time" },
          example: "2026-02-09T23:59:59.999Z",
        },
      ],
      responses: {
        200: {
          description: "Resumo de movimentacoes",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MovesSummaryResponse" },
            },
          },
        },
        400: {
          description: "Datas invalidas",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
              example: { error: "Data invalida", data: null },
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
  "/dashboard/moves-graph": {
    get: {
      tags: ["Dashboard"],
      summary: "Dados de saida para grafico",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "startDate",
          in: "query",
          required: false,
          schema: { type: "string", format: "date-time" },
          example: "2026-02-01T00:00:00.000Z",
        },
        {
          name: "endDate",
          in: "query",
          required: false,
          schema: { type: "string", format: "date-time" },
          example: "2026-02-09T23:59:59.999Z",
        },
      ],
      responses: {
        200: {
          description: "Serie temporal de saidas",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MovesGraphResponse" },
            },
          },
        },
        400: {
          description: "Datas invalidas",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
              example: { error: "Data invalida", data: null },
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
  "/dashboard/low-stock": {
    get: {
      tags: ["Dashboard"],
      summary: "Produtos com estoque baixo",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Produtos com estoque baixo",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockProductListResponse" },
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
  "/dashboard/stagnant-products": {
    get: {
      tags: ["Dashboard"],
      summary: "Produtos sem saida no periodo",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "startDate",
          in: "query",
          required: false,
          schema: { type: "string", format: "date-time" },
          example: "2026-02-01T00:00:00.000Z",
        },
        {
          name: "endDate",
          in: "query",
          required: false,
          schema: { type: "string", format: "date-time" },
          example: "2026-02-09T23:59:59.999Z",
        },
      ],
      responses: {
        200: {
          description: "Produtos sem movimentacao de saida",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockProductListResponse" },
            },
          },
        },
        400: {
          description: "Datas invalidas",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
              example: { error: "Data invalida", data: null },
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
};
