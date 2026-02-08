import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} from "../../../src/validators/product.validator.js";

const validUUID = "550e8400-e29b-41d4-a716-446655440000";

describe("createProductSchema", () => {
  it("aceita dados validos e transforma quantities para string", () => {
    const result = createProductSchema.parse({
      name: "Coca-Cola 2L",
      categoryId: validUUID,
      unitPrice: 899,
      unitType: "un",
      quantity: 50,
      minimumQuantity: 10,
      maximumQuantity: 100,
    });

    expect(result.name).toBe("Coca-Cola 2L");
    expect(result.categoryId).toBe(validUUID);
    expect(result.unitPrice).toBe(899);
    expect(result.unitType).toBe("un");
    expect(result.quantity).toBe("50");
    expect(result.minimumQuantity).toBe("10");
    expect(result.maximumQuantity).toBe("100");
  });

  it("rejeita unitType invalido", () => {
    expect(() =>
      createProductSchema.parse({
        name: "Produto",
        categoryId: validUUID,
        unitPrice: 100,
        unitType: "invalid",
        quantity: 0,
        minimumQuantity: 0,
        maximumQuantity: 0,
      }),
    ).toThrow();
  });

  it("aceita todos unitType validos (kg, g, l, ml, un)", () => {
    const unitTypes = ["kg", "g", "l", "ml", "un"] as const;

    for (const unitType of unitTypes) {
      const result = createProductSchema.parse({
        name: "Produto",
        categoryId: validUUID,
        unitPrice: 100,
        unitType,
        quantity: 0,
        minimumQuantity: 0,
        maximumQuantity: 0,
      });
      expect(result.unitType).toBe(unitType);
    }
  });

  it("aplica defaults de quantities = '0'", () => {
    const result = createProductSchema.parse({
      name: "Produto",
      categoryId: validUUID,
      unitPrice: 100,
      unitType: "un",
    });

    expect(result.quantity).toBe("0");
    expect(result.minimumQuantity).toBe("0");
    expect(result.maximumQuantity).toBe("0");
  });

  it("rejeita maximumQuantity < minimumQuantity", () => {
    expect(() =>
      createProductSchema.parse({
        name: "Produto",
        categoryId: validUUID,
        unitPrice: 100,
        unitType: "un",
        quantity: 0,
        minimumQuantity: 50,
        maximumQuantity: 10,
      }),
    ).toThrow();
  });
});

describe("listProductsSchema", () => {
  it("aceita query vazia com defaults", () => {
    const result = listProductsSchema.parse({});
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(10);
    expect(result.name).toBeUndefined();
  });
});

describe("updateProductSchema", () => {
  it("aceita objeto vazio e transforma quantities", () => {
    const empty = updateProductSchema.parse({});
    expect(empty).toEqual({});

    const withQty = updateProductSchema.parse({
      quantity: 25,
      minimumQuantity: 5,
      maximumQuantity: 100,
    });
    expect(withQty.quantity).toBe("25");
    expect(withQty.minimumQuantity).toBe("5");
    expect(withQty.maximumQuantity).toBe("100");
  });
});
