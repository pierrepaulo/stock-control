import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { moves, products } from "../db/schema";
import { DateRangeInput } from "../validators/dashboard.validator";

export const getInventoryValue = async () => {
  const result = await db
    .select({
      totalValue: sql<number>`sum(${products.quantity} * ${products.unitPrice})`,
    })
    .from(products)
    .where(isNull(products.deletedAt));

  if (result[0]?.totalValue) return result[0].totalValue;
  return 0;
};

export const getMovesSummary = async (range: DateRangeInput) => {
  const conditions = [];

  if (range.startDate) {
    const startDate = new Date(range.startDate + "T00:00:00");
    conditions.push(gte(moves.createdAt, startDate));
  }

  if (range.endDate) {
    const endDate = new Date(range.endDate + "T23:59:59.999");
    conditions.push(lte(moves.createdAt, endDate));
  }

  const result = await db
    .select({
      type: moves.type,
      totalValue: sql<number>`sum(${moves.quantity} * ${moves.unitPrice})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(moves)
    .where(and(...conditions))
    .groupBy(moves.type);

  const summary = {
    in: { value: 0, count: 0 },
    out: { value: 0, count: 0 },
  };

  result.forEach((row) => {
    summary[row.type] = {
      value: row.totalValue,
      count: row.count,
    };
  });

  return summary;
};

export const getMovesGraph = async (range: DateRangeInput) => {
  const conditions = [eq(moves.type, "out")];

  if (range.startDate) {
    const startDate = new Date(range.startDate + "T00:00:00");
    conditions.push(gte(moves.createdAt, startDate));
  }

  if (range.endDate) {
    const endDate = new Date(range.endDate + "T23:59:59.999");
    conditions.push(lte(moves.createdAt, endDate));
  }

  const dateFormatted = sql<string>`TO_CHAR(${moves.createdAt}, 'YYYY-MM-DD')`;
  const results = await db
    .select({
      date: dateFormatted,
      totalValue: sql<number>`sum(${moves.quantity} * ${moves.unitPrice})`,
    })
    .from(moves)
    .where(and(...conditions))
    .groupBy(dateFormatted)
    .orderBy(dateFormatted);

  return results;
};

export const getLowStockProducts = async () => {
  const results = await db
    .select()
    .from(products)
    .where(
      and(
        isNull(products.deletedAt),
        sql`(${products.quantity} <= ${products.minimumQuantity} * 1.1)`,
      ),
    )
    .orderBy(products.quantity);

  return results;
};

export const getStagnantProducts = async (range: DateRangeInput) => {
  const conditions = [eq(moves.type, "out")];

  if (range.startDate) {
    const startDate = new Date(range.startDate + "T00:00:00");
    conditions.push(gte(moves.createdAt, startDate));
  }

  if (range.endDate) {
    const endDate = new Date(range.endDate + "T23:59:59.999");
    conditions.push(lte(moves.createdAt, endDate));
  }

  const results = await db
    .select()
    .from(products)
    .where(
      and(
        isNull(products.deletedAt),
        sql`${products.id} NOT IN (
          SELECT ${moves.productId} FROM ${moves} WHERE ${and(...conditions)})`,
      ),
    )
    .orderBy(products.quantity);

  return results;
};
