import { NewProduct, products, categories } from "../db/schema";
import { db } from "../db/connection";
import { and, eq, ilike, isNull, sql } from "drizzle-orm";
import { AppError } from "../utils/apperror";
import * as categoryService from "./category.service";

export const createProduct = async (data: NewProduct) => {
  const category = await categoryService.getCategoryById(data.categoryId);
  if (!category) {
    throw new AppError("Categoria não encontrada", 404);
  }
  const result = await db.insert(products).values(data).returning();
  if (!result[0]) return null;
  return result[0];
};

export const listProducts = async (
  offset: number = 0,
  limit: number = 10,
  name?: string,
) => {
  const whereConditions = name
    ? sql`${products.deletedAt} IS NULL AND ${ilike(products.name, `%${name}%`)}`
    : isNull(products.deletedAt);

  const productsList = await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      unitPrice: products.unitPrice,
      unitType: products.unitType,
      quantity: products.quantity,
      minimumQuantity: products.minimumQuantity,
      maximumQuantity: products.maximumQuantity,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(whereConditions)
    .limit(limit)
    .offset(offset);

  return productsList;
};

export const getProductById = async (id: string) => {
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      unitPrice: products.unitPrice,
      unitType: products.unitType,
      quantity: products.quantity,
      minimumQuantity: products.minimumQuantity,
      maximumQuantity: products.maximumQuantity,
      deletedAt: products.deletedAt,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.id, id), isNull(products.deletedAt)))
    .limit(1);

  if (!result[0]) return null;
  return result[0];
};

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
  if (data.categoryId) {
    const category = await categoryService.getCategoryById(data.categoryId);
    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }
  }

  const updatedData = { ...data, updatedAt: new Date() };
  const result = await db
    .update(products)
    .set(updatedData)
    .where(eq(products.id, id))
    .returning();

  if (!result[0]) return null;
  return result[0];
};

export const deleteProduct = async (id: string) => {
  const result = await db
    .update(products)
    .set({ deletedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  if (!result[0]) return null;
  return result[0];
};
