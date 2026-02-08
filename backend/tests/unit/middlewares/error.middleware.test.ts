import { describe, it, expect, vi } from "vitest";
import { ZodError } from "zod";
import { globalErrorHandler } from "../../../src/middlewares/error.middleware.js";
import { AppError } from "../../../src/utils/apperror.js";

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const mockReq = {} as any;
const mockNext = vi.fn();

describe("globalErrorHandler", () => {
  it("trata AppError com statusCode e message corretos", () => {
    const res = createMockRes();
    const error = new AppError("Email ja esta em uso", 400);

    globalErrorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email ja esta em uso",
      data: null,
    });
  });

  it("trata ZodError com 400 e messages unidas", () => {
    const res = createMockRes();
    const error = new ZodError([
      {
        code: "too_small",
        origin: "string",
        minimum: 2,
        inclusive: true,
        exact: false,
        message: "Nome é obrigatorio",
        path: ["name"],
      },
      {
        code: "invalid_format",
        format: "email",
        message: "E-mail inválido",
        path: ["email"],
      },
    ]);

    globalErrorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Nome é obrigatorio, E-mail inválido",
      data: null,
    });
  });

  it("trata Error generico com 500 e 'Erro interno do servidor'", () => {
    const res = createMockRes();
    const error = new Error("Algo inesperado");

    globalErrorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Erro interno do servidor",
      data: null,
    });
  });
});
