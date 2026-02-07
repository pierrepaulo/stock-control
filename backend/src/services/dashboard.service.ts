import { isNull, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { products } from "../db/schema";

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
