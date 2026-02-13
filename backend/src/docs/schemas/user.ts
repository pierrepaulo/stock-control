export const userSchemas = {
  CreateUserRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Novo Usuario" },
      email: {
        type: "string",
        format: "email",
        example: "novo@email.com",
      },
      password: { type: "string", minLength: 6, example: "senha123" },
    },
    required: ["name", "email", "password"],
  },
  UpdateUserJsonRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Nome Atualizado" },
      email: {
        type: "string",
        format: "email",
        example: "atualizado@email.com",
      },
      password: { type: "string", minLength: 6, example: "novaSenha123" },
      isAdmin: { type: "boolean", example: true },
    },
  },
  UpdateUserMultipartRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Nome Atualizado" },
      email: {
        type: "string",
        format: "email",
        example: "atualizado@email.com",
      },
      password: { type: "string", minLength: 6, example: "novaSenha123" },
      isAdmin: { type: "boolean", example: true },
      avatar: {
        type: "string",
        format: "binary",
        description: "Arquivo JPEG/PNG/JPG com limite de 5MB.",
      },
    },
  },
  UpdateProfileJsonRequest: {
    type: "object",
    description:
      "Schema restrito para edicao do proprio perfil (non-admin). Apenas name e avatar sao permitidos.",
    properties: {
      name: { type: "string", minLength: 2, example: "Meu Novo Nome" },
    },
  },
  UpdateProfileMultipartRequest: {
    type: "object",
    description:
      "Schema restrito para edicao do proprio perfil via multipart (non-admin). Apenas name e avatar sao permitidos.",
    properties: {
      name: { type: "string", minLength: 2, example: "Meu Novo Nome" },
      avatar: {
        type: "string",
        format: "binary",
        description: "Arquivo JPEG/PNG/JPG com limite de 5MB.",
      },
    },
  },
  UserResponse: {
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
  UserSingleResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: { $ref: "#/components/schemas/UserResponse" },
    },
    required: ["error", "data"],
  },
  UserListResponse: {
    type: "object",
    properties: {
      error: { type: "null", nullable: true, example: null },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/UserResponse" },
      },
    },
    required: ["error", "data"],
  },
};

export const userPaths = {
  "/users": {
    post: {
      tags: ["Users"],
      summary: "Cria um usuario",
      description: "Apenas administradores podem criar usuarios.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateUserRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Usuario criado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserSingleResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao ou email em uso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Email ja esta em uso", data: null },
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
        403: {
          description: "Permissao insuficiente (apenas admin)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                error: "Apenas administradores podem gerenciar usuarios",
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
    get: {
      tags: ["Users"],
      summary: "Lista usuarios",
      security: [{ bearerAuth: [] }],
      parameters: [
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
          description: "Lista de usuarios",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserListResponse" },
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
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Busca usuario por ID",
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
          description: "Usuario encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserSingleResponse" },
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
    put: {
      tags: ["Users"],
      summary: "Atualiza usuario",
      description:
        "Aceita JSON para atualizacao padrao e multipart/form-data para upload de avatar. " +
        "Administradores podem atualizar qualquer usuario com todos os campos (name, email, password, isAdmin, avatar). " +
        "Usuarios non-admin podem editar apenas o proprio perfil, restrito aos campos name e avatar. " +
        "Retorna 403 quando non-admin tenta editar outro usuario.",
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
        description:
          "Admin: todos os campos (UpdateUserJsonRequest / UpdateUserMultipartRequest). " +
          "Non-admin editando proprio perfil: apenas name e avatar (UpdateProfileJsonRequest / UpdateProfileMultipartRequest).",
        content: {
          "application/json": {
            schema: {
              oneOf: [
                { $ref: "#/components/schemas/UpdateUserJsonRequest" },
                { $ref: "#/components/schemas/UpdateProfileJsonRequest" },
              ],
            },
          },
          "multipart/form-data": {
            schema: {
              oneOf: [
                { $ref: "#/components/schemas/UpdateUserMultipartRequest" },
                { $ref: "#/components/schemas/UpdateProfileMultipartRequest" },
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Usuario atualizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserSingleResponse" },
            },
          },
        },
        400: {
          description: "Erro de validacao ou email em uso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { error: "Email ja esta em uso", data: null },
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
        403: {
          description:
            "Non-admin tentando editar outro usuario",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                error: "Apenas administradores podem gerenciar usuarios",
                data: null,
              },
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
    delete: {
      tags: ["Users"],
      summary: "Deleta usuario (soft delete)",
      description: "Apenas administradores podem deletar usuarios.",
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
          description: "Usuario deletado",
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
        403: {
          description: "Permissao insuficiente (apenas admin)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                error: "Apenas administradores podem gerenciar usuarios",
                data: null,
              },
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
