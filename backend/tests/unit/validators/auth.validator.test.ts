import { describe, it, expect } from "vitest";
import { authLoginSchema } from "../../../src/validators/auth.validator.js";

describe("authLoginSchema", () => {
  it("aceita email e password validos", () => {
    const result = authLoginSchema.parse({
      email: "user@test.com",
      password: "senha123",
    });

    expect(result.email).toBe("user@test.com");
    expect(result.password).toBe("senha123");
  });

  it("rejeita email invalido", () => {
    expect(() =>
      authLoginSchema.parse({
        email: "invalido",
        password: "senha123",
      }),
    ).toThrow();
  });

  it("rejeita password < 6 chars", () => {
    expect(() =>
      authLoginSchema.parse({
        email: "user@test.com",
        password: "12345",
      }),
    ).toThrow();
  });
});
