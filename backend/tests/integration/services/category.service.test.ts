import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../../helpers/db.helper.js";
import { insertCategory, insertProduct } from "../../helpers/factories.js";
import { categories } from "../../../src/db/schema/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../../src/utils/apperror.js";

let testDb: TestDatabase;

vi.mock("../../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const categoryService = await import("../../../src/services/category.service.js");

describe("category.service (integration)", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("createCategory", () => {
    it("cria categoria com UUID", async () => {
      const result = await categoryService.createCategory({ name: "Bebidas" });

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(result.name).toBe("Bebidas");
    });

    it("throw AppError 400 para nome duplicado", async () => {
      await insertCategory(testDb.db, { name: "Bebidas" });

      await expect(
        categoryService.createCategory({ name: "Bebidas" }),
      ).rejects.toThrow(AppError);

      await expect(
        categoryService.createCategory({ name: "Bebidas" }),
      ).rejects.toThrow("Categoria já existe");
    });
  });

  describe("listCategories", () => {
    it("retorna categorias com productCount quando solicitado", async () => {
      const category = await insertCategory(testDb.db, { name: "Alimentos" });
      await insertProduct(testDb.db, category.id, { name: "Arroz" });
      await insertProduct(testDb.db, category.id, { name: "Feijao" });

      const result = await categoryService.listCategories(true);

      expect(result).toHaveLength(1);
      expect((result[0] as any).productCount).toBe(2);
    });

    it("exclui categorias soft-deleted", async () => {
      await insertCategory(testDb.db, { name: "Ativa" });
      await insertCategory(testDb.db, {
        name: "Deletada",
        deletedAt: new Date(),
      });

      const result = await categoryService.listCategories();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Ativa");
    });
  });

  describe("getCategoryById", () => {
    it("retorna categoria por ID", async () => {
      const category = await insertCategory(testDb.db, { name: "Limpeza" });

      const result = await categoryService.getCategoryById(category.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(category.id);
      expect(result!.name).toBe("Limpeza");
    });
  });

  describe("updateCategory", () => {
    it("atualiza nome da categoria", async () => {
      const category = await insertCategory(testDb.db, { name: "Antigo" });

      const result = await categoryService.updateCategory(category.id, {
        name: "Novo",
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Novo");
    });
  });

  describe("deleteCategory", () => {
    it("soft-delete seta deletedAt", async () => {
      const category = await insertCategory(testDb.db);

      const result = await categoryService.deleteCategory(category.id);

      expect(result).not.toBeNull();
      expect(result!.deletedAt).not.toBeNull();
    });

    it("throw quando tem produtos associados", async () => {
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id);

      await expect(
        categoryService.deleteCategory(category.id),
      ).rejects.toThrow("Não é possivel excluir uma categoria com produtos");
    });
  });
});
