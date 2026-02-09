export const commonSchemas = {
  PingResponse: {
    type: "object",
    properties: {
      pong: { type: "boolean", example: true },
    },
    required: ["pong"],
  },
  ApiSuccessNull: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: { type: "null", nullable: true, example: null },
    },
    required: ["error", "data"],
  },
  ErrorResponse: {
    type: "object",
    properties: {
      error: { type: "string", example: "Mensagem de erro" },
      data: { type: "null", nullable: true, example: null },
    },
    required: ["error", "data"],
  },
  ValidationError: {
    type: "object",
    properties: {
      error: {
        type: "string",
        example: "Nome e obrigatorio, Formato de e-mail invalido",
        description: "Mensagens de validacao concatenadas por virgula.",
      },
      data: { type: "null", nullable: true, example: null },
    },
    required: ["error", "data"],
  },
  UnauthorizedError: {
    type: "object",
    properties: {
      error: { type: "string", example: "Nao autorizado" },
      data: { type: "null", nullable: true, example: null },
    },
    required: ["error", "data"],
  },
  InternalError: {
    type: "object",
    properties: {
      error: { type: "string", example: "Erro interno do servidor" },
      data: { type: "null", nullable: true, example: null },
    },
    required: ["error", "data"],
  },
  UuidParam: {
    type: "string",
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  },
  NumericString: {
    type: "string",
    pattern: "^\\d+(\\.\\d+)?$",
    example: "50",
    description: "Valor numerico retornado pelo PostgreSQL como string.",
  },
  DateTimeString: {
    type: "string",
    format: "date-time",
    example: "2026-02-09T12:00:00.000Z",
  },
};
