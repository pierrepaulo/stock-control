import z from "zod";

const unitTypeEnum = z.enum(["kg", "g", "l", "ml", "un"]);
export const createProductSchema = z
  .object({
    name: z.string().min(2, "Nome é obrigatório"),
    categoryId: z.uuid("ID da categoria inválido"),
    unitPrice: z.number().int().min(0, "Preço deve ser maior ou igual a zero"),
    unitType: unitTypeEnum,
    quantity: z.coerce
      .number()
      .min(0, "Quantidade deve ser maior ou igual a zero")
      .default(0)
      .transform(String),
    minimumQuantity: z.coerce
      .number()
      .min(0, "Quantidade mínima deve ser maior ou igual a zero")
      .default(0)
      .transform(String),
    maximumQuantity: z.coerce
      .number()
      .min(0, "Quantidade máxima deve ser maior ou igual a zero")
      .default(0)
      .transform(String),
  })
  .refine(
    (data) =>
      parseFloat(data.maximumQuantity) >= parseFloat(data.minimumQuantity),
    {
      message: "Quantidade máxima deve ser maior ou igual a quantidade mínima",
      path: ["maximumQuantity"],
    },
  );

export const listProductsSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
  limit: z.coerce.number().int().min(1).default(10).optional(),
});

export const getProductByIdSchema = z.object({
  id: z.uuid("ID inválido"),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório").optional(),
  categoryId: z.uuid("ID da categoria inválido").optional(),
  unitPrice: z
    .number()
    .int()
    .min(0, "Preço deve ser maior ou igual a zero")
    .optional(),
  unitType: z.enum(["kg", "g", "l", "ml", "un"]).optional(),
  quantity: z.coerce
    .number()
    .min(0, "Quantidade deve ser positiva")
    .optional()
    .transform((val) => (val !== undefined ? String(val) : undefined)),
  minimumQuantity: z.coerce
    .number()
    .min(0)
    .optional()
    .transform((val) => (val !== undefined ? String(val) : undefined)),
  maximumQuantity: z.coerce
    .number()
    .min(0)
    .optional()
    .transform((val) => (val !== undefined ? String(val) : undefined)),
});
