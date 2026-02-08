import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  users,
  categories,
  products,
  moves,
  type NewUser,
  type NewCategory,
  type NewProduct,
  type NewMove,
  type User,
  type Category,
  type Product,
  type Move,
} from "../../src/db/schema/index.js";

// --- Data Builders ---

export function buildUserData(overrides: Partial<NewUser> = {}): NewUser {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Test User ${id}`,
    email: `user-${id}@test.com`,
    password: "password123",
    ...overrides,
  };
}

export function buildCategoryData(overrides: Partial<NewCategory> = {}): NewCategory {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Category ${id}`,
    ...overrides,
  };
}

export function buildProductData(
  categoryId: string,
  overrides: Partial<NewProduct> = {},
): NewProduct {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Product ${id}`,
    categoryId,
    unitPrice: 1000,
    unitType: "un",
    quantity: "10",
    minimumQuantity: "1",
    maximumQuantity: "100",
    ...overrides,
  };
}

export function buildMoveData(
  productId: string,
  userId: string,
  overrides: Partial<NewMove> = {},
): NewMove {
  return {
    productId,
    userId,
    type: "in",
    quantity: "5",
    unitPrice: 1000,
    ...overrides,
  };
}

// --- Database Inserters ---

export async function insertUser(
  db: PostgresJsDatabase,
  overrides: Partial<NewUser> = {},
): Promise<User> {
  const data = buildUserData(overrides);
  data.password = await bcrypt.hash(data.password, 10);

  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function insertCategory(
  db: PostgresJsDatabase,
  overrides: Partial<NewCategory> = {},
): Promise<Category> {
  const data = buildCategoryData(overrides);
  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

export async function insertProduct(
  db: PostgresJsDatabase,
  categoryId: string,
  overrides: Partial<NewProduct> = {},
): Promise<Product> {
  const data = buildProductData(categoryId, overrides);
  const result = await db.insert(products).values(data).returning();
  return result[0];
}

export async function insertMove(
  db: PostgresJsDatabase,
  productId: string,
  userId: string,
  overrides: Partial<NewMove> = {},
): Promise<Move> {
  const data = buildMoveData(productId, userId, overrides);
  const result = await db.insert(moves).values(data).returning();
  return result[0];
}
