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

let testDb: TestDatabase;

vi.mock("../../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

const dashboardService = await import(
  "../../../src/services/dashboard.service.js"
);

describe("dashboard.service (integration)", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("getInventoryValue", () => {
    it("SUM(qty * price) correto para produtos ativos", async () => {
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id, {
        quantity: "10",
        unitPrice: 1000,
      });
      await insertProduct(testDb.db, category.id, {
        quantity: "5",
        unitPrice: 2000,
      });

      const result = await dashboardService.getInventoryValue();

      // 10 * 1000 + 5 * 2000 = 10000 + 10000 = 20000
      expect(Number(result)).toBe(20000);
    });

    it("retorna 0 sem produtos", async () => {
      const result = await dashboardService.getInventoryValue();

      expect(result).toBe(0);
    });
  });

  describe("getMovesSummary", () => {
    it("retorna summary agrupado por type com value e count", async () => {
      const user = await insertUser(testDb.db);
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
        type: "in",
        quantity: "5",
        unitPrice: 1000,
      });
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "3",
        unitPrice: 1000,
      });

      const result = await dashboardService.getMovesSummary({});

      expect(Number(result.in.count)).toBe(2);
      expect(Number(result.in.value)).toBe(15000); // (10 + 5) * 1000
      expect(Number(result.out.count)).toBe(1);
      expect(Number(result.out.value)).toBe(3000); // 3 * 1000
    });

    it("filtra por date range", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        unitPrice: 500,
        quantity: "100",
      });

      // Move inside the range
      await insertMove(testDb.db, product.id, user.id, {
        type: "in",
        quantity: "10",
        unitPrice: 500,
      });

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);

      const result = await dashboardService.getMovesSummary({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      expect(Number(result.in.count)).toBe(1);
      expect(Number(result.in.value)).toBe(5000); // 10 * 500
    });
  });

  describe("getMovesGraph", () => {
    it("retorna apenas moves 'out' agrupados por data", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        unitPrice: 1000,
        quantity: "100",
      });

      await insertMove(testDb.db, product.id, user.id, {
        type: "in",
        quantity: "20",
        unitPrice: 1000,
      });
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "5",
        unitPrice: 1000,
      });

      const result = await dashboardService.getMovesGraph({});

      // Only "out" moves should be present
      expect(result.length).toBeGreaterThanOrEqual(1);
      const totalValue = result.reduce(
        (sum: number, r: any) => sum + Number(r.totalValue),
        0,
      );
      expect(totalValue).toBe(5000); // 5 * 1000
    });

    it("filtra por date range", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        unitPrice: 200,
        quantity: "100",
      });

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Move inside the range (yesterday)
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "4",
        unitPrice: 200,
        createdAt: yesterday,
      });

      // Move outside the range (2 days ago)
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "10",
        unitPrice: 200,
        createdAt: twoDaysAgo,
      });

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(now);

      const result = await dashboardService.getMovesGraph({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      const totalValue = result.reduce(
        (sum: number, r: any) => sum + Number(r.totalValue),
        0,
      );
      // Only the yesterday move (4 * 200 = 800) should be included
      expect(totalValue).toBe(800);
    });

    it("ordena por data ASC", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        unitPrice: 100,
        quantity: "100",
      });

      // Insert moves with different dates using raw SQL
      const now = new Date();
      const day1 = new Date(now);
      day1.setDate(day1.getDate() - 2);
      const day2 = new Date(now);
      day2.setDate(day2.getDate() - 1);
      const day3 = new Date(now);

      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "3",
        unitPrice: 100,
        createdAt: day3,
      });
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "1",
        unitPrice: 100,
        createdAt: day1,
      });
      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "2",
        unitPrice: 100,
        createdAt: day2,
      });

      const result = await dashboardService.getMovesGraph({});

      expect(result.length).toBe(3);
      // Verify ASC order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].date >= result[i - 1].date).toBe(true);
      }
    });
  });

  describe("getLowStockProducts", () => {
    it("retorna produtos onde qty <= min * 1.1", async () => {
      const category = await insertCategory(testDb.db);
      // qty=11, min=10 → 11 <= 10*1.1=11 → included
      await insertProduct(testDb.db, category.id, {
        name: "Low Stock",
        quantity: "11",
        minimumQuantity: "10",
      });

      const result = await dashboardService.getLowStockProducts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Low Stock");
    });

    it("nao retorna produtos acima do threshold", async () => {
      const category = await insertCategory(testDb.db);
      // qty=12, min=10 → 12 > 10*1.1=11 → excluded
      await insertProduct(testDb.db, category.id, {
        name: "OK Stock",
        quantity: "12",
        minimumQuantity: "10",
      });

      const result = await dashboardService.getLowStockProducts();

      expect(result).toHaveLength(0);
    });
  });

  describe("getStagnantProducts", () => {
    it("retorna todos produtos sem moves 'out' quando sem date range", async () => {
      const category = await insertCategory(testDb.db);
      await insertProduct(testDb.db, category.id, {
        name: "Parado",
        quantity: "20",
      });

      const result = await dashboardService.getStagnantProducts({});

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Parado");
    });

    it("retorna produtos sem moves 'out' no periodo", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const productWithMove = await insertProduct(testDb.db, category.id, {
        name: "Com Saida",
        quantity: "50",
      });
      const productWithoutMove = await insertProduct(testDb.db, category.id, {
        name: "Sem Saida",
        quantity: "30",
      });

      await insertMove(testDb.db, productWithMove.id, user.id, {
        type: "out",
        quantity: "5",
        unitPrice: 100,
      });

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);

      const result = await dashboardService.getStagnantProducts({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Sem Saida");
    });

    it("exclui produtos com moves 'out' no periodo", async () => {
      const user = await insertUser(testDb.db);
      const category = await insertCategory(testDb.db);
      const product = await insertProduct(testDb.db, category.id, {
        name: "Ativo",
        quantity: "50",
      });

      await insertMove(testDb.db, product.id, user.id, {
        type: "out",
        quantity: "5",
        unitPrice: 100,
      });

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);

      const result = await dashboardService.getStagnantProducts({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      const names = result.map((p) => p.name);
      expect(names).not.toContain("Ativo");
    });
  });
});
