import { describe, it, expect } from "vitest";
import {
  createMoveSchema,
  listMovesSchema,
} from "../../../src/validators/move.validator.js";

const validUUID = "550e8400-e29b-41d4-a716-446655440000";

describe("createMoveSchema", () => {
  it("aceita type 'in' e 'out'", () => {
    const moveIn = createMoveSchema.parse({
      productId: validUUID,
      type: "in",
      quantity: 10,
    });
    expect(moveIn.type).toBe("in");

    const moveOut = createMoveSchema.parse({
      productId: validUUID,
      type: "out",
      quantity: 5,
    });
    expect(moveOut.type).toBe("out");
  });

  it("rejeita type invalido", () => {
    expect(() =>
      createMoveSchema.parse({
        productId: validUUID,
        type: "transfer",
        quantity: 10,
      }),
    ).toThrow();
  });

  it("rejeita quantity zero e negativa", () => {
    expect(() =>
      createMoveSchema.parse({
        productId: validUUID,
        type: "in",
        quantity: 0,
      }),
    ).toThrow();

    expect(() =>
      createMoveSchema.parse({
        productId: validUUID,
        type: "in",
        quantity: -5,
      }),
    ).toThrow();
  });

  it("transforma quantity para string e unitPrice e opcional", () => {
    const withPrice = createMoveSchema.parse({
      productId: validUUID,
      type: "in",
      quantity: 10,
      unitPrice: 500,
    });
    expect(withPrice.quantity).toBe("10");
    expect(withPrice.unitPrice).toBe(500);

    const withoutPrice = createMoveSchema.parse({
      productId: validUUID,
      type: "in",
      quantity: 3,
    });
    expect(withoutPrice.quantity).toBe("3");
    expect(withoutPrice.unitPrice).toBeUndefined();
  });
});

describe("listMovesSchema", () => {
  it("aplica defaults e productId e opcional", () => {
    const defaults = listMovesSchema.parse({});
    expect(defaults.offset).toBe(0);
    expect(defaults.limit).toBe(10);
    expect(defaults.productId).toBeUndefined();

    const withProduct = listMovesSchema.parse({ productId: validUUID });
    expect(withProduct.productId).toBe(validUUID);
  });
});
