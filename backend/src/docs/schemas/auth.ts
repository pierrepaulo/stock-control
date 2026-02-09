export const authSchemas = {
  LoginRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "usuario@email.com",
      },
      password: {
        type: "string",
        minLength: 6,
        example: "senha123",
      },
    },
    required: ["email", "password"],
  },
  AuthUser: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/UuidParam" },
      name: { type: "string", example: "Nome do Usuario" },
      email: { type: "string", format: "email", example: "usuario@email.com" },
      avatar: {
        oneOf: [
          { type: "string", format: "uri" },
          { type: "null", nullable: true },
        ],
        example: null,
      },
      isAdmin: { type: "boolean", example: false },
    },
    required: ["id", "name", "email", "avatar", "isAdmin"],
  },
  LoginResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        allOf: [
          { $ref: "#/components/schemas/AuthUser" },
          {
            type: "object",
            properties: {
              token: {
                type: "string",
                pattern: "^[a-f0-9]{64}$",
                example:
                  "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
              },
            },
            required: ["token"],
          },
        ],
      },
    },
    required: ["error", "data"],
  },
  LogoutResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Logout realizado com sucesso",
          },
        },
        required: ["message"],
      },
    },
    required: ["error", "data"],
  },
  MeResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: { $ref: "#/components/schemas/AuthUser" },
    },
    required: ["error", "data"],
  },
};

export const authPaths = {
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Realiza login do usuario",
      description: "Valida email/senha e retorna token Bearer de 64 caracteres.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Login realizado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
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
          description: "Credenciais invalidas",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Credenciais invalidas", data: null },
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
  "/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Realiza logout",
      description:
        "Invalida o token enviado no header Authorization. Se nenhum token for enviado, retorna sucesso do mesmo jeito.",
      parameters: [
        {
          name: "Authorization",
          in: "header",
          required: false,
          schema: {
            type: "string",
            example:
              "Bearer a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
          },
        },
      ],
      responses: {
        200: {
          description: "Logout realizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutResponse" },
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
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Retorna o usuario autenticado",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Dados do usuario autenticado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MeResponse" },
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
          description: "Usuario nao encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Usuario nao encontrado", data: null },
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
