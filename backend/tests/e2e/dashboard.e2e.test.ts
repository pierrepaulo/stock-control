import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import supertest from "supertest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../helpers/db.helper.js";
import {
  insertUser,
  insertCategory,
  insertProduct,
  insertMove,
} from "../helpers/factories.js";
import { createAuthenticatedUser, getAuthHeader } from "../helpers/auth.helper.js";

let testDb: TestDatabase;

vi.mock("../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const { default: app } = await import("../../src/app.js");

describe("Dashboard E2E", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("GET /api/dashboard/inventory-value", () => {
    it("200 com totalValue", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id, {
        quantity: "10",
        unitPrice: 1000,
      });

      const res = await supertest(app)
        .get("/api/dashboard/inventory-value")
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveProperty("totalValue");
      expect(Number(res.body.data.totalValue)).toBe(10000);
    });
  });

  describe("GET /api/dashboard/low-stock", () => {
    it("200 com array de produtos", async () => {
      const { token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id, {
        name: "Estoque Baixo",
        quantity: "5",
        minimumQuantity: "10",
      });

      const res = await supertest(app)
        .get("/api/dashboard/low-stock")
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Estoque Baixo");
    });
  });

  describe("GET /api/dashboard/moves-summary", () => {
    it("200 com in/out", async () => {
      const { user, token } = await createAuthenticatedUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        unitPrice: 1000,
        quantity: "100",
      });

      await insertMove(testDb.db, product.id, user.id, {
        type: "in",
        quantity: "10",
        unitPrice: 1000,
      });
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "3",
        unitPrice: 1000,
      });

      const res = await supertest(app)
        .get("/api/dashboard/moves-summary")
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveProperty("in");
      expect(res.body.data).toHaveProperty("out");
      expect(res.body.data.in).toHaveProperty("value");
      expect(res.body.data.in).toHaveProperty("count");
      expect(res.body.data.out).toHaveProperty("value");
      expect(res.body.data.out).toHaveProperty("count");
    });
  });
});
