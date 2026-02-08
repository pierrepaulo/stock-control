import { describe, it, expect } from "vitest";
import {
  createCategorySchema,
  listCategoriesSchema,
  getCategoryByIdSchema,
} from "../../../src/validators/category.validator.js";

describe("createCategorySchema", () => {
  it("aceita nome 2+ chars", () => {
    const result = createCategorySchema.parse({ name: "Bebidas" });
    expect(result.name).toBe("Bebidas");
  });

  it("rejeita nome 1 char", () => {
    expect(() => createCategorySchema.parse({ name: "A" })).toThrow();
  });
});

describe("listCategoriesSchema", () => {
  it("default includeProductCount=false e coerce 'true'", () => {
    const defaultResult = listCategoriesSchema.parse({});
    expect(defaultResult.includeProductCount).toBe(false);

    const coerced = listCategoriesSchema.parse({
      includeProductCount: "true",
    });
    expect(coerced.includeProductCount).toBe(true);
  });
});

describe("getCategoryByIdSchema", () => {
  it("aceita UUID e rejeita non-UUID", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const result = getCategoryByIdSchema.parse({ id: validUUID });
    expect(result.id).toBe(validUUID);

    expect(() =>
      getCategoryByIdSchema.parse({ id: "nao-e-uuid" }),
    ).toThrow();
  });
});
