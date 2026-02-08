import { describe, it, expect } from "vitest";
import { dateRangeSchema } from "../../../src/validators/dashboard.validator.js";

describe("dateRangeSchema", () => {
  it("aceita objeto vazio (ambos opcionais)", () => {
    const result = dateRangeSchema.parse({});
    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
  });

  it("aceita startDate e endDate validas", () => {
    const result = dateRangeSchema.parse({
      startDate: "2026-01-01",
      endDate: "2026-02-08",
    });
    expect(result.startDate).toBe("2026-01-01");
    expect(result.endDate).toBe("2026-02-08");
  });

  it("rejeita data invalida", () => {
    expect(() =>
      dateRangeSchema.parse({
        startDate: "nao-e-data",
      }),
    ).toThrow();

    expect(() =>
      dateRangeSchema.parse({
        endDate: "32/13/2026",
      }),
    ).toThrow();
  });
});
