import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../../helpers/db.helper.js";
import { insertCategory, insertProduct } from "../../helpers/factories.js";
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

const productService = await import("../../../src/services/product.service.js");

describe("product.service (integration)", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("createProduct", () => {
    it("cria produto com categoria valida", async () => {
      const category = await insertCategory(testDb.db);

      const result = await productService.createProduct({
        name: "Coca-Cola 2L",
        categoryId: category.id,
        unitPrice: 899,
        unitType: "un",
        quantity: "50",
        minimumQuantity: "10",
        maximumQuantity: "100",
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBeDefined();
      expect(result!.name).toBe("Coca-Cola 2L");
      expect(result!.categoryId).toBe(category.id);
      expect(result!.unitPrice).toBe(899);
    });

    it("throw 404 para categoria inexistente", async () => {
      await expect(
        productService.createProduct({
          name: "Produto Orfao",
          categoryId: randomUUID(),
          unitPrice: 100,
          unitType: "un",
          quantity: "0",
          minimumQuantity: "0",
          maximumQuantity: "0",
        }),
      ).rejects.toThrow("Categoria não encontrada");
    });
  });

  describe("listProducts", () => {
    it("retorna produtos com categoryName via JOIN", async () => {
      const category = await insertCategory(testDb.db, { name: "Bebidas" });
      await insertProduct(testDb.db, category.id, { name: "Suco" });

      const result = await productService.listProducts();

      expect(result).toHaveLength(1);
      expect(result[0].categoryName).toBe("Bebidas");
      expect(result[0].name).toBe("Suco");
    });

    it("filtro por nome case-insensitive (ilike)", async () => {
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id, { name: "Arroz Integral" });
      await insertProduct(testDb.db, category.id, { name: "Feijao Preto" });

      const result = await productService.listProducts(0, 10, "arroz");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Arroz Integral");
    });
  });

  describe("getProductById", () => {
    it("retorna produto com categoryName, null para soft-deleted", async () => {
      const category = await insertCategory(testDb.db, { name: "Limpeza" });
      const product = await insertProduct(testDb.db, category.id, {
        name: "Detergente",
      });

      const result = await productService.getProductById(product.id);
      expect(result).not.toBeNull();
      expect(result!.categoryName).toBe("Limpeza");
      expect(result!.name).toBe("Detergente");

      // Soft-delete the product
      await testDb.db
        .update(products)
        .set({ deletedAt: new Date() })
        .where(eq(products.id, product.id));

      const deletedResult = await productService.getProductById(product.id);
      expect(deletedResult).toBeNull();
    });
  });

  describe("updateProduct", () => {
    it("atualiza campos e valida nova categoryId se fornecida", async () => {
      const category1 = await insertCategory(testDb.db, { name: "Cat 1" });
      const category2 = await insertCategory(testDb.db, { name: "Cat 2" });
      const product = await insertProduct(testDb.db, category1.id, {
        name: "Original",
      });

      const result = await productService.updateProduct(product.id, {
        name: "Atualizado",
        categoryId: category2.id,
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Atualizado");
      expect(result!.categoryId).toBe(category2.id);
    });
  });

  describe("deleteProduct", () => {
    it("soft-delete seta deletedAt", async () => {
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id);

      const result = await productService.deleteProduct(product.id);

      expect(result).not.toBeNull();
      expect(result!.deletedAt).not.toBeNull();
    });
  });
});
