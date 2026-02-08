import { describe, it, expect } from "vitest";
import { AppError } from "../../../src/utils/apperror.js";

describe("AppError", () => {
  it("cria AppError com message e statusCode default 400", () => {
    const error = new AppError("Algo deu errado");

    expect(error.message).toBe("Algo deu errado");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });

  it("cria AppError com statusCode customizado e e instanceof Error", () => {
    const error = new AppError("Nao encontrado", 404);

    expect(error.message).toBe("Nao encontrado");
    expect(error.statusCode).toBe(404);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});
