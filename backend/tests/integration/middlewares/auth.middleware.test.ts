import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../../helpers/db.helper.js";
import { createAuthenticatedUser } from "../../helpers/auth.helper.js";
import { AppError } from "../../../src/utils/apperror.js";

let testDb: TestDatabase;

vi.mock("../../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const { authMiddleware } = await import(
  "../../../src/middlewares/auth.middleware.js"
);

function createMockReq(headers: Record<string, string> = {}): any {
  return { headers, user: undefined };
}

function createMockRes(): any {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("authMiddleware (integration)", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  it("next() + req.user para token valido", async () => {
    const { token } = await createAuthenticatedUser(testDb.db);
    const req = createMockReq({ authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user.token).toBe(token);
  });

  it("401 sem header Authorization", async () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it("401 para scheme diferente de Bearer", async () => {
    const req = createMockReq({ authorization: "Basic some_token" });
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it("401 para token invalido/desconhecido", async () => {
    const req = createMockReq({
      authorization: "Bearer token_invalido_123456",
    });
    const res = createMockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });
});
