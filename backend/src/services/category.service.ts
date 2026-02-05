import { NewCategory, categories, products } from "../db/schema";
import { db } from "../db/connection";
import { and, eq, isNull, sql } from "drizzle-orm";
import { AppError } from "../utils/apperror";

export const createCategory = async (data: NewCategory) => {
  const existingCategory = await getCategoryByName(data.name);
  if (existingCategory) {
    throw new AppError("Categoria já existe", 400);
  }

  const result = await db.insert(categories).values(data).returning();
  return result[0];
};

export const listCategories = async (includeProductCount: boolean = false) => {
  if (includeProductCount) {
    const categoriesWithCount = await db
      .select({
        id: categories.id,
        name: categories.name,
        createdAt: categories.createdAt,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(isNull(categories.deletedAt))
      .groupBy(categories.id);

    return categoriesWithCount;
  }

  const categoryList = await db
    .select()
    .from(categories)
    .where(isNull(categories.deletedAt));

  return categoryList;
};

export const getCategoryById = async (id: string) => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  const category = result[0];
  if (!category || category.deletedAt) return null;
  return category;
};

export const getCategoryByName = async (name: string) => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);

  const category = result[0];
  if (!category || category.deletedAt) return null;
  return category;
};

export const updateCategory = async (
  id: string,
  data: Partial<NewCategory>,
) => {
  const updatedData = { ...data, updatedAt: new Date() };
  const result = await db
    .update(categories)
    .set(updatedData)
    .where(eq(categories.id, id))
    .returning();

  if (!result[0]) return null;
  return result[0];
};

export const deleteCategory = async (id: string) => {
  const existingProduct = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, id), isNull(products.deletedAt)))
    .limit(1);

  if (existingProduct[0]) {
    throw new AppError(
      "Não é possivel excluir uma categoria com produtos",
      404,
    );
  }

  const result = await db
    .update(categories)
    .set({ deletedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();

  if (!result) return null;
  return result[0];
};
