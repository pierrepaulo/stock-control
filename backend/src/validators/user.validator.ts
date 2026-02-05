import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome é obrigatorio"),
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const listUsersSchema = z.object({
  offset: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).optional().default(10),
});

export const getUserByIdSchema = z.object({
  id: z.uuid("ID inválido"),
});
