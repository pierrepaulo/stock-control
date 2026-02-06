import z from "zod";

const moveTypeEnum = z.enum(["in", "out"]);

export const createMoveSchema = z.object({
  productId: z.uuid("ID do produto inválido"),
  type: moveTypeEnum,
  quantity: z.coerce
    .number()
    .positive("Quantidade deve ser maior que zero")
    .transform(String),
  unitPrice: z.coerce
    .number()
    .int()
    .min(0, "Preço deve ser maior ou igual a zero")
    .optional(),
});

export const listMovesSchema = z.object({
  productId: z.uuid("ID do produto inválido").optional(),
  offset: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).optional().default(10),
});
export type ListMovesInput = z.infer<typeof listMovesSchema>;
