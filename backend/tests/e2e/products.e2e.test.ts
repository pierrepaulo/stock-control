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

describe("Products E2E", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("POST /api/products", () => {
    it("201 com produto criado", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);

      const res = await supertest(app)
        .post("/api/products")
        .set("Authorization", getAuthHeader(token))
        .send({
          name: "Coca-Cola 2L",
          categoryId: category.id,
          unitPrice: 899,
          unitType: "un",
          quantity: 50,
          minimumQuantity: 10,
          maximumQuantity: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe("Coca-Cola 2L");
      expect(res.body.data.categoryId).toBe(category.id);
      expect(res.body.data.unitPrice).toBe(899);
    });

    it("400 quando maxQty < minQty", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);

      const res = await supertest(app)
        .post("/api/products")
        .set("Authorization", getAuthHeader(token))
        .send({
          name: "Produto Invalido",
          categoryId: category.id,
          unitPrice: 100,
          unitType: "un",
          quantity: 0,
          minimumQuantity: 50,
          maximumQuantity: 10,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.data).toBeNull();
    });
  });

  describe("GET /api/products", () => {
    it("200 com filtro por nome", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id, { name: "Arroz Integral" });
      await insertProduct(testDb.db, category.id, { name: "Feijao Preto" });

      const res = await supertest(app)
        .get("/api/products?name=arroz")
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Arroz Integral");
    });
  });
});
