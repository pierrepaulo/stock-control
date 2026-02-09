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

describe("Moves E2E", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("POST /api/moves", () => {
    it("'in' 201 + GET product confirma estoque aumentado", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "10",
        unitPrice: 500,
      });

      const moveRes = await supertest(app)
        .post("/api/moves")
        .set("Authorization", getAuthHeader(token))
        .send({
          productId: product.id,
          type: "in",
          quantity: 5,
        });

      expect(moveRes.status).toBe(201);
      expect(moveRes.body.error).toBeNull();
      expect(moveRes.body.data).toHaveProperty("id");

      const productRes = await supertest(app)
        .get(`/api/products/${product.id}`)
        .set("Authorization", getAuthHeader(token));

      expect(productRes.body.data.quantity).toBe("15");
    });

    it("'out' 201 + GET product confirma estoque diminuido", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "10",
        unitPrice: 500,
      });

      const moveRes = await supertest(app)
        .post("/api/moves")
        .set("Authorization", getAuthHeader(token))
        .send({
          productId: product.id,
          type: "out",
          quantity: 3,
        });

      expect(moveRes.status).toBe(201);
      expect(moveRes.body.error).toBeNull();

      const productRes = await supertest(app)
        .get(`/api/products/${product.id}`)
        .set("Authorization", getAuthHeader(token));

      expect(productRes.body.data.quantity).toBe("7");
    });

    it("400 'Quantidade insuficiente'", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "5",
      });

      const res = await supertest(app)
        .post("/api/moves")
        .set("Authorization", getAuthHeader(token))
        .send({
          productId: product.id,
          type: "out",
          quantity: 10,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Quantidade insuficiente");
      expect(res.body.data).toBeNull();
    });
  });
});
