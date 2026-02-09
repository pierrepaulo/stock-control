import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import supertest from "supertest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../helpers/db.helper.js";
import { insertCategory, insertProduct } from "../helpers/factories.js";
import { createAuthenticatedUser, getAuthHeader } from "../helpers/auth.helper.js";

let testDb: TestDatabase;

vi.mock("../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const { default: app } = await import("../../src/app.js");

describe("Categories E2E", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("POST /api/categories", () => {
    it("201 com categoria criada", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);

      const res = await supertest(app)
        .post("/api/categories")
        .set("Authorization", getAuthHeader(token))
        .send({ name: "Bebidas" });

      expect(res.status).toBe(201);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe("Bebidas");
      expect(res.body.data).toHaveProperty("createdAt");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("404 com produtos associados", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db, { name: "Com Produtos" });
      await insertProduct(testDb.db, category.id);

      const res = await supertest(app)
        .delete(`/api/categories/${category.id}`)
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(
        "Não é possivel excluir uma categoria com produtos",
      );
      expect(res.body.data).toBeNull();
    });
  });
});
