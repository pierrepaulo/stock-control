import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  listUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  updateProfileSchema,
} from "../../../src/validators/user.validator.js";

describe("createUserSchema", () => {
  it("aceita dados validos", () => {
    const result = createUserSchema.parse({
      name: "John Doe",
      email: "john@test.com",
      password: "senha123",
    });

    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@test.com");
    expect(result.password).toBe("senha123");
  });

  it("rejeita dados invalidos (nome < 2, email invalido, password curta)", () => {
    expect(() =>
      createUserSchema.parse({
        name: "J",
        email: "invalido",
        password: "123",
      }),
    ).toThrow();
  });
});

describe("listUsersSchema", () => {
  it("aplica defaults e coerce string -> number", () => {
    const result = listUsersSchema.parse({});
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(10);

    const result2 = listUsersSchema.parse({ offset: "5", limit: "20" });
    expect(result2.offset).toBe(5);
    expect(result2.limit).toBe(20);
  });
});

describe("getUserByIdSchema", () => {
  it("aceita UUID e rejeita non-UUID", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const result = getUserByIdSchema.parse({ id: validUUID });
    expect(result.id).toBe(validUUID);

    expect(() => getUserByIdSchema.parse({ id: "nao-e-uuid" })).toThrow();
  });
});

describe("updateUserSchema", () => {
  it("aceita objeto vazio (todos opcionais)", () => {
    const result = updateUserSchema.parse({});
    expect(result).toEqual({});
  });

  it("aceita avatar nullable e isAdmin boolean", () => {
    const result = updateUserSchema.parse({
      avatar: null,
      isAdmin: true,
    });

    expect(result.avatar).toBeNull();
    expect(result.isAdmin).toBe(true);
  });

  it("aceita isAdmin string de multipart e converte para boolean", () => {
    const resultTrue = updateUserSchema.parse({ isAdmin: "true" });
    const resultFalse = updateUserSchema.parse({ isAdmin: "false" });

    expect(resultTrue.isAdmin).toBe(true);
    expect(resultFalse.isAdmin).toBe(false);
  });

  it("rejeita isAdmin string invalida", () => {
    expect(() => updateUserSchema.parse({ isAdmin: "yes" })).toThrow();
  });
});

describe("updateProfileSchema", () => {
  it("aceita name e avatar opcionais", () => {
    const result = updateProfileSchema.parse({
      name: "Novo Nome",
      avatar: "avatar.jpg",
    });

    expect(result.name).toBe("Novo Nome");
    expect(result.avatar).toBe("avatar.jpg");
  });

  it("aceita objeto vazio (todos opcionais)", () => {
    const result = updateProfileSchema.parse({});
    expect(result).toEqual({});
  });

  it("aceita avatar nullable", () => {
    const result = updateProfileSchema.parse({ avatar: null });
    expect(result.avatar).toBeNull();
  });

  it("rejeita name com menos de 2 caracteres", () => {
    expect(() => updateProfileSchema.parse({ name: "A" })).toThrow();
  });
});
