export const moveSchemas = {
  MoveType: {
    type: "string",
    enum: ["in", "out"],
    example: "in",
  },
  CreateMoveRequest: {
    type: "object",
    properties: {
      productId: { $ref: "#/components/schemas/UuidParam" },
      type: { $ref: "#/components/schemas/MoveType" },
      quantity: {
        type: "number",
        exclusiveMinimum: 0,
        example: 5,
      },
      unitPrice: {
        type: "integer",
        minimum: 0,
        example: 899,
        description:
          "Campo aceito no payload, mas o backend persiste o preco atual do produto.",
      },
    },
    required: ["productId", "type", "quantity"],
  },
  MoveResponse: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      productId: { $ref: "#/components/schemas/UuidParam" },
      userId: { $ref: "#/components/schemas/UuidParam" },
      type: { $ref: "#/components/schemas/MoveType" },
      quantity: { $ref: "#/components/schemas/NumericString" },
      unitPrice: { type: "integer", example: 899 },
      createdAt: { $ref: "#/components/schemas/DateTimeString" },
    },
    required: [
      "id",
      "productId",
      "userId",
      "type",
      "quantity",
      "unitPrice",
      "createdAt",
    ],
  },
  MoveListItem: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      productId: { $ref: "#/components/schemas/UuidParam" },
      productName: { type: "string", example: "Coca-Cola 2L" },
      userId: { $ref: "#/components/schemas/UuidParam" },
      type: { $ref: "#/components/schemas/MoveType" },
      quantity: { $ref: "#/components/schemas/NumericString" },
      unitPrice: { type: "integer", example: 899 },
      createdAt: { $ref: "#/components/schemas/DateTimeString" },
    },
    required: [
      "id",
      "productId",
      "productName",
      "userId",
      "type",
      "quantity",
      "unitPrice",
      "createdAt",
    ],
  },
  MoveSingleResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: { $ref: "#/components/schemas/MoveResponse" },
    },
    required: ["error", "data"],
  },
  MoveListResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/MoveListItem" },
      },
    },
    required: ["error", "data"],
  },
};

export const movePaths = {
  "/moves": {
    post: {
      tags: ["Moves"],
      summary: "Cria movimentacao de estoque",
      description:
        "Movimentacoes do tipo in aumentam estoque, out diminuem estoque e validam saldo disponivel.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateMoveRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Movimentacao criada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MoveSingleResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao ou estoque insuficiente",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Quantidade insuficiente", data: null },
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
    get: {
      tags: ["Moves"],
      summary: "Lista movimentacoes",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "query",
          required: false,
          schema: { $ref: "#/components/schemas/UuidParam" },
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
          description: "Lista de movimentacoes",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MoveListResponse" },
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
};
