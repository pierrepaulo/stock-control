import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import supertest from "supertest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../helpers/db.helper.js";
import { insertUser } from "../helpers/factories.js";
import { createAuthenticatedUser, getAuthHeader } from "../helpers/auth.helper.js";

let testDb: TestDatabase;

vi.mock("../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const { default: app } = await import("../../src/app.js");

describe("Auth E2E", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("POST /api/auth/login", () => {
    it("200 com user data e token", async () => {
      await insertUser(testDb.db, {
        email: "login@test.com",
        password: "senha123",
      });

      const res = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "login@test.com", password: "senha123" });

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("email", "login@test.com");
      expect(res.body.data).toHaveProperty("isAdmin");
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.token).toHaveLength(64);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("401 para credenciais invalidas", async () => {
      await insertUser(testDb.db, {
        email: "login@test.com",
        password: "senha123",
      });

      const res = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "login@test.com", password: "errada" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Credenciais inválidas");
      expect(res.body.data).toBeNull();
    });
  });

  describe("GET /api/auth/me", () => {
    it("200 com dados do user autenticado", async () => {
      const { user, token } = await createAuthenticatedUser(testDb.db);

      const res = await supertest(app)
        .get("/api/auth/me")
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("email");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("401 sem auth header", async () => {
      const res = await supertest(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.data).toBeNull();
    });
  });
});
