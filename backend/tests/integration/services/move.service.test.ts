import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../../helpers/db.helper.js";
import {
  insertUser,
  insertCategory,
  insertProduct,
  insertMove,
} from "../../helpers/factories.js";
import { products } from "../../../src/db/schema/index.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { AppError } from "../../../src/utils/apperror.js";

let testDb: TestDatabase;

vi.mock("../../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const moveService = await import("../../../src/services/move.service.js");

describe("move.service (integration)", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("createMove", () => {
    it("move 'in' aumenta quantity do produto", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "10",
      });

      await moveService.createMove({
        productId: product.id,
        userId: user.id,
        type: "in",
        quantity: "5",
      });

      const dbProduct = await testDb.db
        .select()
        .from(products)
        .where(eq(products.id, product.id))
        .limit(1);

      expect(dbProduct[0].quantity).toBe("15");
    });

    it("move 'out' diminui quantity do produto", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "10",
      });

      await moveService.createMove({
        productId: product.id,
        userId: user.id,
        type: "out",
        quantity: "3",
      });

      const dbProduct = await testDb.db
        .select()
        .from(products)
        .where(eq(products.id, product.id))
        .limit(1);

      expect(dbProduct[0].quantity).toBe("7");
    });

    it("snapshot unitPrice do produto no move", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        unitPrice: 1500,
        quantity: "10",
      });

      const move = await moveService.createMove({
        productId: product.id,
        userId: user.id,
        type: "in",
        quantity: "5",
      });

      expect(move.unitPrice).toBe(1500);
    });

    it("throw 404 para produto inexistente", async () => {
      const user = await insertUser(testDb.db);

      await expect(
        moveService.createMove({
          productId: randomUUID(),
          userId: user.id,
          type: "in",
          quantity: "5",
        }),
      ).rejects.toThrow("Produto não encontrado");
    });

    it("throw 400 quando out > estoque", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "5",
      });

      await expect(
        moveService.createMove({
          productId: product.id,
          userId: user.id,
          type: "out",
          quantity: "10",
        }),
      ).rejects.toThrow("Quantidade insuficiente");
    });

    it("permite 'out' quando quantity == estoque (boundary)", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        quantity: "5",
      });

      await moveService.createMove({
        productId: product.id,
        userId: user.id,
        type: "out",
        quantity: "5",
      });

      const dbProduct = await testDb.db
        .select()
        .from(products)
        .where(eq(products.id, product.id))
        .limit(1);

      expect(dbProduct[0].quantity).toBe("0");
    });
  });

  describe("listMoves", () => {
    it("retorna moves com productName via JOIN", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        name: "Coca-Cola",
      });
      await insertMove(testDb.db, product.id, user.id);

      const result = await moveService.listMoves({
        offset: 0,
        limit: 10,
      });

      expect(result).toHaveLength(1);
      expect(result[0].productName).toBe("Coca-Cola");
    });

    it("filtra por productId", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product1 = await insertProduct(testDb.db, category.id, {
        name: "Produto A",
      });
      const product2 = await insertProduct(testDb.db, category.id, {
        name: "Produto B",
      });

      await insertMove(testDb.db, product1.id, user.id);
      await insertMove(testDb.db, product2.id, user.id);

      const result = await moveService.listMoves({
        productId: product1.id,
        offset: 0,
        limit: 10,
      });

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(product1.id);
    });
  });
});
