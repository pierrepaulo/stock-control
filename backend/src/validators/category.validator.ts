import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
});

export const listCategoriesSchema = z.object({
  includeProductCount: z.coerce.boolean().optional().default(false),
});

export const getCategoryByIdSchema = z.object({
  id: z.uuid("ID inválido"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Nome é obrigatório").optional(),
});
