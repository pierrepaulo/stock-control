import { moves, products, users, NewMove } from "../db/schema";
import { db } from "../db/connection";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { AppError } from "../utils/apperror";
import { ListMovesInput } from "../validators/move.validator";

export const createMove = async (data: Omit<NewMove, "unitPrice">) => {
  return await db.transaction(async (tx) => {
    const productResults = await tx
      .select({
        quantity: products.quantity,
        unitPrice: products.unitPrice,
      })
      .from(products)
      .where(eq(products.id, data.productId))
      .for("update");

    if (productResults.length === 0) {
      throw new AppError("Produto não encontrado", 404);
    }

    const currentQuantity = parseFloat(productResults[0].quantity);
    const moveQuantity = parseFloat(data.quantity);

    if (data.type === "out") {
      if (currentQuantity < moveQuantity) {
        throw new AppError("Quantidade insuficiente", 400);
      }
    }

    const unitPrice = productResults[0].unitPrice;
    const result = await tx
      .insert(moves)
      .values({
        ...data,
        unitPrice,
      })
      .returning();

    const move = result[0];

    const newQuantity =
      data.type === "in"
        ? currentQuantity + moveQuantity
        : currentQuantity - moveQuantity;

    await tx
      .update(products)
      .set({ quantity: newQuantity.toString(), updatedAt: new Date() })
      .where(eq(products.id, data.productId));

    return move;
  });
};

export const listMoves = async (filters: ListMovesInput) => {
  const conditions = [];

  if (filters.productId) {
    conditions.push(eq(moves.productId, filters.productId));
  }

  const moveList = await db
    .select({
      id: moves.id,
      productId: moves.productId,
      productName: products.name,
      userId: moves.userId,
      type: moves.type,
      quantity: moves.quantity,
      unitPrice: moves.unitPrice,
      createdAt: moves.createdAt,
    })
    .from(moves)
    .leftJoin(products, eq(moves.productId, products.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${moves.createdAt} DESC`)
    .limit(filters.limit)
    .offset(filters.offset);

  return moveList;
};
